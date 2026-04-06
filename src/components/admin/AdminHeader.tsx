import { useState, useEffect } from 'react';
import { Search, Bell, User, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UniversalSearch } from './UniversalSearch';
import { useCompanyInfo, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { toast } from 'sonner';

interface AdminHeaderProps { title: string; }

export const AdminHeader = ({ title }: AdminHeaderProps) => {
  const { profile, role, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: companyInfo } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();
  const isDarkMode = companyInfo?.dark_mode_enabled ?? true;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  const handleLogout = async () => { await signOut(); navigate('/gateway-x7k9m2'); };

  const roleBadgeStyle = (() => {
    switch (role) {
      case 'admin': return 'bg-violet-500/15 text-violet-300 border border-violet-500/25';
      case 'editor': return 'bg-blue-500/15 text-blue-300 border border-blue-500/25';
      case 'support': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25';
      default: return 'bg-white/5 text-white/40 border border-white/10';
    }
  })();

  return (
    <>
      <header className="h-16 liquid-glass-header flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-white/35 mt-0.5">Gerencie seu catálogo e configurações</p>
          </div>

          <button onClick={() => setSearchOpen(true)}
            className="relative hidden lg:flex items-center gap-2 w-80 h-9 px-3 rounded-lg liquid-glass-lighter text-white/40 hover:border-[hsl(280_80%_60%/0.4)] transition-colors cursor-pointer">
            <Search className="h-4 w-4" />
            <span className="text-sm">Buscar produtos, vendas...</span>
            <kbd className="ml-auto text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/30">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"
            onClick={() => {
              if (!companyInfo?.id) return;
              updateCompany.mutate(
                { id: companyInfo.id, data: { dark_mode_enabled: !isDarkMode } as any },
                { onSuccess: () => toast.success(isDarkMode ? 'Tema claro ativado' : 'Tema escuro ativado') }
              );
            }}
            className="relative text-white/35 hover:text-white hover:bg-white/[0.06]"
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon"
            className="relative text-white/35 hover:text-white hover:bg-white/[0.06]">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-black/30"
              style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(340 90% 55%))' }} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 gap-3 pl-2 pr-4 rounded-full hover:bg-white/[0.06]">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, hsl(280 80% 50%), hsl(340 90% 55%), hsl(210 100% 55%))' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold leading-none text-white">
                    {profile?.full_name?.split(' ')[0] || 'Usuário'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-sm ${roleBadgeStyle}`}>
                    {role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 liquid-glass text-white">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{profile?.full_name || 'Usuário'}</span>
                  <span className="text-xs text-white/40 mt-0.5">Administrador do sistema</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem onClick={() => navigate('/admin/configuracoes')}
                className="cursor-pointer hover:bg-white/[0.06] focus:bg-white/[0.06]">
                <User className="h-4 w-4 mr-2" /> Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem onClick={handleLogout}
                className="text-red-400 cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400">
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
