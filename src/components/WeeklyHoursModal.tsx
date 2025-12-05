import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WeeklyHoursModalProps {
  isOpen: boolean;
  onSubmit: (hours: number) => void;
  onClose?: () => void;
}

export function WeeklyHoursModal({ isOpen, onSubmit, onClose }: WeeklyHoursModalProps) {
  const [hours, setHours] = useState('20');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numHours = parseFloat(hours);
    if (isNaN(numHours) || numHours < 1 || numHours > 168) {
      setError('Digite um valor entre 1 e 168 horas');
      return;
    }
    setError('');
    onSubmit(numHours);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose ? () => onClose() : undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Configurar Ciclo de Estudos</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Quantas horas por semana você tem disponíveis para estudar?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Horas semanais</Label>
            <Input
              id="hours"
              type="number"
              min="1"
              max="168"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ex: 20"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <p className="text-sm text-muted-foreground">
            Com base nas suas matérias e suas configurações de dificuldade e peso, 
            calcularemos automaticamente quantas horas dedicar a cada uma.
          </p>
        </div>

        <DialogFooter>
          <Button variant="gradient" onClick={handleSubmit} className="w-full sm:w-auto">
            Criar Ciclo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
