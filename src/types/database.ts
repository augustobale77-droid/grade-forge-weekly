export type DifficultyLevel = 'Muito fácil' | 'Fácil' | 'Médio' | 'Difícil' | 'Muito difícil';
export type WeightLevel = 'Baixa' | 'Média' | 'Alta';
export type CycleStatus = 'active' | 'paused' | 'completed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  weekly_hours: number | null;
  ask_hours: boolean;
  current_cycle_id: string | null;
  updated_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  name: string;
  weekly_hours: number;
  status: CycleStatus;
  created_at: string;
}

export interface Materia {
  id: string;
  user_id: string;
  name: string;
  difficulty: DifficultyLevel;
  weight: WeightLevel;
  created_at: string;
}

export interface CycleMateria {
  id: string;
  cycle_id: string;
  materia_id: string;
  hours_assigned: number;
  hours_completed: number;
  created_at: string;
}

export interface CycleMateriaWithDetails extends CycleMateria {
  materia: Materia;
}

// Helper function to calculate hours based on difficulty and weight
export function calculateHoursForMateria(
  difficulty: DifficultyLevel,
  weight: WeightLevel,
  totalHours: number,
  allMaterias: { difficulty: DifficultyLevel; weight: WeightLevel }[]
): number {
  // Difficulty factors
  const difficultyFactors: Record<DifficultyLevel, number> = {
    'Muito fácil': 0.8,
    'Fácil': 0.9,
    'Médio': 1.0,
    'Difícil': 1.2,
    'Muito difícil': 1.4,
  };

  // Weight factors
  const weightFactors: Record<WeightLevel, number> = {
    'Baixa': 1.0,
    'Média': 1.5,
    'Alta': 2.0,
  };

  // Calculate factor for this subject
  const thisFactor = difficultyFactors[difficulty] * weightFactors[weight];

  // Calculate total factors for all subjects
  const totalFactors = allMaterias.reduce((sum, m) => {
    return sum + difficultyFactors[m.difficulty] * weightFactors[m.weight];
  }, 0);

  // Calculate proportional hours
  const hours = (thisFactor / totalFactors) * totalHours;

  // Round to nearest 0.5
  return Math.round(hours * 2) / 2;
}
