import { Search, Bell, User, Moon, Sun } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
}

export const AdminHeader = ({ title }: AdminHeaderProps) => {
  const { profile, role, signOut } = useAuthContext();
  const navigate = useNavigate();

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
        return 'bg-primary/10 text-primary border-primary/20';
      case 'editor':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'support':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <header className="h-16 bg-card/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gerencie seu catálogo e configurações</p>
        </div>
        
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produtos, categorias..."
            className="w-80 pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-3 pl-2 pr-4 rounded-full hover:bg-muted">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold leading-none">
                  {profile?.full_name?.split(' ')[0] || 'Usuário'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-sm ${getRoleBadgeClass()}`}>
                  {role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{profile?.full_name || 'Usuário'}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Administrador do sistema</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/configuracoes')} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
