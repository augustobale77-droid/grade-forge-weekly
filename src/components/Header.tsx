import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { OffCanvasMenu } from '@/components/OffCanvasMenu';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              className="text-foreground hover:bg-secondary/50"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Logo size="sm" />
          </div>

          {profile && (
            <div className="text-sm text-muted-foreground">
              Olá, <span className="text-foreground font-medium">{profile.name}</span>
            </div>
          )}
        </div>
      </header>

      <OffCanvasMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
