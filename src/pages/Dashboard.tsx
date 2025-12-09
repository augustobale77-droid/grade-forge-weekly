import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCw, BookOpen, Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { MateriaCard } from '@/components/MateriaCard';
import { WeeklyHoursModal } from '@/components/WeeklyHoursModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyData } from '@/hooks/useStudyData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    materias,
    activeCycle,
    cycleMaterias,
    loading,
    needsHoursSetup,
    totalHoursAssigned,
    totalHoursCompleted,
    overallProgress,
    createCycle,
    updateHours,
    resetCycle,
  } = useStudyData();

  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (needsHoursSetup) {
      setShowHoursModal(true);
    }
  }, [needsHoursSetup]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-main">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleCreateCycle = (hours: number) => {
    createCycle(hours);
    setShowHoursModal(false);
  };

  const handleResetCycle = () => {
    resetCycle();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />

      <main className="container px-4 py-6 space-y-6">
        {/* Overall Progress */}
        {activeCycle && cycleMaterias.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Progresso da Semana</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {activeCycle.name}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ProgressBar
                current={overallProgress}
                total={100}
                showLabel={false}
              />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">
                  {totalHoursCompleted.toFixed(1)}h / {totalHoursAssigned.toFixed(1)}h
                </span>
                <span className={overallProgress >= 100 ? "text-success font-medium" : "text-primary font-medium"}>
                  {overallProgress.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No materias message */}
        {materias.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Adicione suas matérias para começar a organizar seus estudos.
              </p>
              <Button asChild variant="gradient">
                <Link to="/materias">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Matérias
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Materias Grid */}
        {cycleMaterias.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Suas Matérias</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Ciclo
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cycleMaterias.map((cm) => (
                <MateriaCard
                  key={cm.id}
                  cycleMateria={cm}
                  onAddHour={(id) => updateHours(id, 1)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Has materias but no cycle */}
        {materias.length > 0 && !activeCycle && !needsHoursSetup && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pronto para um novo ciclo?</h3>
              <p className="text-muted-foreground mb-6">
                Crie um novo ciclo de estudos para organizar sua semana.
              </p>
              <Button variant="gradient" onClick={() => setShowHoursModal(true)}>
                Criar Novo Ciclo
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <WeeklyHoursModal
        isOpen={showHoursModal}
        onSubmit={handleCreateCycle}
        onClose={activeCycle ? () => setShowHoursModal(false) : undefined}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetCycle}
        title="Resetar Ciclo"
        description="Tem certeza que deseja resetar o ciclo atual? Todo o progresso será perdido e você poderá criar um novo ciclo."
        confirmText="Resetar"
        variant="destructive"
      />
    </div>
  );
}
