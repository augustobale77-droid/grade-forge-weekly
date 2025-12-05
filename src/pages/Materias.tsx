import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyData } from '@/hooks/useStudyData';
import { DifficultyLevel, WeightLevel } from '@/types/database';
import { cn } from '@/lib/utils';

const difficultyOptions: DifficultyLevel[] = [
  'Muito fácil',
  'Fácil',
  'Médio',
  'Difícil',
  'Muito difícil',
];

const weightOptions: WeightLevel[] = ['Baixa', 'Média', 'Alta'];

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

export default function Materias() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { materias, loading, addMateria, deleteMateria } = useStudyData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'Médio' as DifficultyLevel,
    weight: 'Média' as WeightLevel,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await addMateria(formData.name.trim(), formData.difficulty, formData.weight);
    setFormData({ name: '', difficulty: 'Médio', weight: 'Média' });
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMateria(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />

      <main className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Matérias</h1>
            <p className="text-muted-foreground">
              Gerencie suas matérias de estudo
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Matéria</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova matéria
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Matéria</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Matemática"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        difficulty: value as DifficultyLevel,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (Importância)</Label>
                  <Select
                    value={formData.weight}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        weight: value as WeightLevel,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o peso" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit" variant="gradient" className="w-full sm:w-auto">
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Materias List */}
        {materias.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma matéria cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão acima para adicionar sua primeira matéria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materias.map((materia) => (
              <Card key={materia.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">
                      {materia.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(materia.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', difficultyColors[materia.difficulty])}
                    >
                      {materia.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', weightColors[materia.weight])}
                    >
                      Peso: {materia.weight}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Excluir Matéria"
        description="Tem certeza que deseja excluir esta matéria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
}
