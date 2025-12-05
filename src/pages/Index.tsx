import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-main">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <header className="container px-4 py-6 flex items-center justify-between">
        <Logo size="md" />
        <Button asChild variant="outline">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Organize seus estudos de forma{' '}
            <span className="text-primary">inteligente</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            O Study Manager calcula automaticamente quanto tempo dedicar a cada matéria 
            com base na dificuldade e importância, ajudando você a estudar de forma mais eficiente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="gradient" size="xl" className="animate-pulse-glow">
              <Link to="/auth">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="bg-card/50 border border-border rounded-xl p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Gerencie Matérias</h3>
            <p className="text-sm text-muted-foreground">
              Cadastre suas matérias com dificuldade e peso personalizados
            </p>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Horas Automáticas</h3>
            <p className="text-sm text-muted-foreground">
              Sistema inteligente que distribui suas horas semanais
            </p>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Acompanhe o Progresso</h3>
            <p className="text-sm text-muted-foreground">
              Visualize seu avanço com barras de progresso visuais
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container px-4 py-8 mt-auto border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Study Manager. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
