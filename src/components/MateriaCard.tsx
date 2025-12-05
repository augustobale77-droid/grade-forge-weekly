import { Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/ui/badge';
import { CycleMateriaWithDetails } from '@/types/database';
import { cn } from '@/lib/utils';

interface MateriaCardProps {
  cycleMateria: CycleMateriaWithDetails;
  onAddHour: (id: string) => void;
  onRemoveHour: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  'Muito fácil': 'bg-success/20 text-success border-success/30',
  'Fácil': 'bg-success/15 text-success/90 border-success/25',
  'Médio': 'bg-primary/20 text-primary border-primary/30',
  'Difícil': 'bg-destructive/15 text-destructive/90 border-destructive/25',
  'Muito difícil': 'bg-destructive/20 text-destructive border-destructive/30',
};

const weightColors: Record<string, string> = {
  'Baixa': 'bg-muted text-muted-foreground border-border',
  'Média': 'bg-secondary/50 text-secondary-foreground border-secondary',
  'Alta': 'bg-primary/30 text-primary-foreground border-primary/50',
};

export function MateriaCard({ cycleMateria, onAddHour, onRemoveHour }: MateriaCardProps) {
  const { materia, hours_assigned, hours_completed } = cycleMateria;
  const isComplete = hours_completed >= hours_assigned;

  return (
    <Card className={cn(
      "card-hover",
      isComplete && "border-success/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2">{materia.name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={cn("text-xs", difficultyColors[materia.difficulty])}>
            {materia.difficulty}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", weightColors[materia.weight])}>
            Peso: {materia.weight}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar current={hours_completed} total={hours_assigned} />
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Marcar horas
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onRemoveHour(cycleMateria.id)}
              disabled={hours_completed <= 0}
              className="h-9 w-9"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">
              {hours_completed.toFixed(1)}h
            </span>
            <Button
              variant={isComplete ? "success" : "default"}
              size="icon"
              onClick={() => onAddHour(cycleMateria.id)}
              className="h-9 w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
