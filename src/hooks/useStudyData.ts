import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Materia,
  Cycle,
  CycleMateria,
  CycleMateriaWithDetails,
  UserSettings,
  DifficultyLevel,
  WeightLevel,
  calculateHoursForMateria,
} from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useStudyData() {
  const { user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [cycleMaterias, setCycleMaterias] = useState<CycleMateriaWithDetails[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        setUserSettings(settings as UserSettings);
      }

      // Fetch materias
      const { data: materiasData } = await supabase
        .from('materias')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (materiasData) {
        setMaterias(materiasData as Materia[]);
      }

      // Fetch cycles
      const { data: cyclesData } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cyclesData) {
        setCycles(cyclesData as Cycle[]);
        const active = (cyclesData as Cycle[]).find((c) => c.status === 'active');
        setActiveCycle(active || null);

        // Fetch cycle materias for active cycle
        if (active) {
          const { data: cycleMatsData } = await supabase
            .from('cycle_materias')
            .select('*, materia:materias(*)')
            .eq('cycle_id', active.id);

          if (cycleMatsData) {
            setCycleMaterias(cycleMatsData as unknown as CycleMateriaWithDetails[]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createCycle = async (weeklyHours: number) => {
    if (!user || materias.length === 0) return;

    try {
      // Create new cycle
      const { data: newCycle, error: cycleError } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          name: 'Ciclo atual',
          weekly_hours: weeklyHours,
          status: 'active',
        })
        .select()
        .single();

      if (cycleError) throw cycleError;

      // Calculate hours for each materia
      const cycleMateriaInserts = materias.map((m) => ({
        cycle_id: newCycle.id,
        materia_id: m.id,
        hours_assigned: calculateHoursForMateria(
          m.difficulty,
          m.weight,
          weeklyHours,
          materias
        ),
        hours_completed: 0,
      }));

      const { error: cmError } = await supabase
        .from('cycle_materias')
        .insert(cycleMateriaInserts);

      if (cmError) throw cmError;

      // Update user settings
      await supabase
        .from('user_settings')
        .update({
          ask_hours: false,
          current_cycle_id: newCycle.id,
          weekly_hours: weeklyHours,
        })
        .eq('user_id', user.id);

      toast({
        title: 'Ciclo criado!',
        description: 'Seu plano de estudos foi gerado com sucesso.',
      });

      await fetchData();
    } catch (error) {
      console.error('Error creating cycle:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o ciclo.',
        variant: 'destructive',
      });
    }
  };

  const updateHours = async (cycleMateriaId: string, delta: number) => {
    const cm = cycleMaterias.find((c) => c.id === cycleMateriaId);
    if (!cm) return;

    const newHours = Math.max(0, cm.hours_completed + delta);

    try {
      const { error } = await supabase
        .from('cycle_materias')
        .update({ hours_completed: newHours })
        .eq('id', cycleMateriaId);

      if (error) throw error;

      setCycleMaterias((prev) =>
        prev.map((c) =>
          c.id === cycleMateriaId ? { ...c, hours_completed: newHours } : c
        )
      );
    } catch (error) {
      console.error('Error updating hours:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as horas.',
        variant: 'destructive',
      });
    }
  };

  const resetCycle = async () => {
    if (!user) return;

    try {
      // Mark current cycle as completed
      if (activeCycle) {
        await supabase
          .from('cycles')
          .update({ status: 'completed' })
          .eq('id', activeCycle.id);
      }

      // Update user settings to ask for hours again
      await supabase
        .from('user_settings')
        .update({
          ask_hours: true,
          current_cycle_id: null,
        })
        .eq('user_id', user.id);

      toast({
        title: 'Ciclo resetado',
        description: 'Você pode criar um novo ciclo de estudos.',
      });

      await fetchData();
    } catch (error) {
      console.error('Error resetting cycle:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar o ciclo.',
        variant: 'destructive',
      });
    }
  };

  const addMateria = async (name: string, difficulty: string, weight: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('materias').insert([{
        user_id: user.id,
        name,
        difficulty: difficulty as DifficultyLevel,
        weight: weight as WeightLevel,
      }]);

      if (error) throw error;

      toast({
        title: 'Matéria adicionada!',
        description: `${name} foi adicionada com sucesso.`,
      });

      await fetchData();
    } catch (error) {
      console.error('Error adding materia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a matéria.',
        variant: 'destructive',
      });
    }
  };

  const deleteMateria = async (id: string) => {
    try {
      const { error } = await supabase.from('materias').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Matéria removida',
        description: 'A matéria foi removida com sucesso.',
      });

      await fetchData();
    } catch (error) {
      console.error('Error deleting materia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a matéria.',
        variant: 'destructive',
      });
    }
  };

  const needsHoursSetup = userSettings?.ask_hours && materias.length > 0 && !activeCycle;

  const totalHoursAssigned = cycleMaterias.reduce((sum, cm) => sum + cm.hours_assigned, 0);
  const totalHoursCompleted = cycleMaterias.reduce((sum, cm) => sum + cm.hours_completed, 0);

  // Calculate overall progress as the average of individual materia completion percentages
  // This ensures 100% only when ALL materias are complete
  const overallProgress = cycleMaterias.length > 0
    ? cycleMaterias.reduce((sum, cm) => {
        const materiaProgress = cm.hours_assigned > 0 
          ? Math.min(cm.hours_completed / cm.hours_assigned, 1) 
          : 0;
        return sum + materiaProgress;
      }, 0) / cycleMaterias.length * 100
    : 0;

  return {
    materias,
    activeCycle,
    cycleMaterias,
    userSettings,
    loading,
    needsHoursSetup,
    totalHoursAssigned,
    totalHoursCompleted,
    overallProgress,
    createCycle,
    updateHours,
    resetCycle,
    addMateria,
    deleteMateria,
    refetch: fetchData,
  };
}
