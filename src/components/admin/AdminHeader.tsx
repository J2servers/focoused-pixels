import { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UniversalSearch } from './UniversalSearch';

interface AdminHeaderProps {
  title: string;
}

export const AdminHeader = ({ title }: AdminHeaderProps) => {
  const { profile, role, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-[hsl(var(--admin-accent-purple)/0.2)] to-[hsl(var(--admin-accent-pink)/0.2)] text-[hsl(var(--admin-accent-pink))] border border-[hsl(var(--admin-accent-pink)/0.3)]';
      case 'editor':
        return 'bg-[hsl(var(--admin-accent-blue)/0.2)] text-[hsl(var(--admin-accent-blue))] border border-[hsl(var(--admin-accent-blue)/0.3)]';
      case 'support':
        return 'bg-[hsl(var(--admin-accent-green)/0.2)] text-[hsl(var(--admin-accent-green))] border border-[hsl(var(--admin-accent-green)/0.3)]';
      default:
        return 'bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))]';
    }
  };

  return (
    <>
      <header className="h-16 admin-glass border-b border-[hsl(var(--admin-card-border)/0.5)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">Gerencie seu catálogo e configurações</p>
          </div>
          
          <button
            onClick={() => setSearchOpen(true)}
            className="relative hidden lg:flex items-center gap-2 w-80 h-9 px-3 rounded-md bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent-purple))] transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Buscar produtos, vendas...</span>
            <kbd className="ml-auto text-[10px] bg-[hsl(var(--admin-bg))] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] rounded-full ring-2 ring-[hsl(var(--admin-header))] animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-3 pl-2 pr-4 rounded-full hover:bg-[hsl(var(--admin-sidebar-hover))]">
                <Avatar className="h-8 w-8 ring-2 ring-[hsl(var(--admin-accent-purple)/0.5)]">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-none text-white">
                    {profile?.full_name?.split(' ')[0] || 'Usuário'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-sm ${getRoleBadgeClass()}`}>
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{profile?.full_name || 'Usuário'}</span>
                  <span className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">Administrador do sistema</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[hsl(var(--admin-card-border))]" />
              <DropdownMenuItem 
                onClick={() => navigate('/admin/configuracoes')} 
                className="cursor-pointer hover:bg-[hsl(var(--admin-sidebar-hover))] focus:bg-[hsl(var(--admin-sidebar-hover))]"
              >
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[hsl(var(--admin-card-border))]" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-400 cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
              >
                Sair da conta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <UniversalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
