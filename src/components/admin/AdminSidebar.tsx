import { useState, useCallback } from 'react';
import {
  LayoutDashboard, Package, FolderTree, Percent, Image, Building2, FileText,
  Settings, Star, LogOut, ChevronLeft, ChevronRight, Sparkles, UserPlus,
  ShoppingCart, Tag, Kanban, Menu, Mail, MessageSquare, Users, ScrollText,
  ImageIcon, Workflow, Code2, ChevronDown, Store, Megaphone,
  Shield, BarChart3, Zap, Wallet, Boxes,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

/* ─── Menu Structure ─── */
interface MenuItem { title: string; url: string; icon: React.ElementType; end?: boolean; adminOnly?: boolean; }
interface MenuGroup { label: string; icon: React.ElementType; color: string; items: MenuItem[]; }

const MENU_GROUPS: MenuGroup[] = [
  { label: 'Visão Geral', icon: BarChart3, color: 'text-violet-400', items: [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  ]},
  { label: 'Vendas', icon: ShoppingCart, color: 'text-emerald-400', items: [
    { title: 'Vendas Feitas', url: '/admin/pedidos', icon: ShoppingCart },
    { title: 'Orçamentos', url: '/admin/orcamentos', icon: FileText },
    { title: 'Produção', url: '/admin/kanban', icon: Kanban },
    { title: 'Fluxo de Caixa', url: '/admin/caixa', icon: Wallet },
  ]},
  { label: 'Catálogo', icon: Package, color: 'text-blue-400', items: [
    { title: 'Produtos', url: '/admin/produtos', icon: Package },
    { title: 'Categorias', url: '/admin/categorias', icon: FolderTree },
    { title: 'Matérias-Primas', url: '/admin/materiais', icon: Boxes },
  ]},
  { label: 'Marketing', icon: Megaphone, color: 'text-pink-400', items: [
    { title: 'Cupons', url: '/admin/cupons', icon: Tag },
    { title: 'Promoções', url: '/admin/promocoes', icon: Percent },
    { title: 'Banner Hero', url: '/admin/hero', icon: Image },
    { title: 'Leads', url: '/admin/leads', icon: UserPlus },
    { title: 'Avaliações', url: '/admin/avaliacoes', icon: Star },
  ]},
  { label: 'Comunicação', icon: MessageSquare, color: 'text-green-400', items: [
    { title: 'Templates', url: '/admin/templates', icon: Mail },
    { title: 'WhatsApp', url: '/admin/whatsapp', icon: MessageSquare },
    { title: 'Workflows', url: '/admin/workflows', icon: Workflow },
  ]},
  { label: 'Conteúdo', icon: Store, color: 'text-orange-400', items: [
    { title: 'Empresa', url: '/admin/empresa', icon: Building2 },
    { title: 'Página Comercial', url: '/admin/pagina-por-que-escolher', icon: Sparkles },
    { title: 'Mídia', url: '/admin/midia', icon: ImageIcon },
  ]},
  { label: 'Sistema', icon: Shield, color: 'text-cyan-400', items: [
    { title: 'Usuários', url: '/admin/usuarios', icon: Users, adminOnly: true },
    { title: 'Tela de Login', url: '/admin/login-config', icon: Shield, adminOnly: true },
    { title: 'Logs', url: '/admin/logs', icon: ScrollText, adminOnly: true },
    { title: 'API', url: '/admin/api', icon: Code2, adminOnly: true },
    { title: 'Configurações', url: '/admin/configuracoes', icon: Settings },
  ]},
];

/* ─── Sidebar Inner ─── */
function SidebarInner({
  collapsed, setCollapsed, onItemClick,
}: { collapsed: boolean; setCollapsed: (v: boolean) => void; onItemClick?: () => void; }) {
  const location = useLocation();
  const { profile, role, signOut, isAdmin } = useAuthContext();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MENU_GROUPS.forEach(g => { initial[g.label] = g.label === 'Visão Geral'; });
    return initial;
  });

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const isActive = (item: MenuItem) => {
    if (item.end) return location.pathname === item.url;
    return location.pathname.startsWith(item.url) && (item.url !== '/admin' || location.pathname === '/admin');
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Logo ── */}
      <div className={cn(
        'h-[68px] flex items-center shrink-0 border-b border-white/[0.06]',
        collapsed ? 'justify-center px-2' : 'justify-between px-5',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg opacity-30"
                style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(210 100% 60%))' }} />
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(340 90% 55%), hsl(210 100% 55%))' }}>
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide">Pincel de Luz</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Admin Panel</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="relative">
            <div className="absolute inset-0 rounded-lg blur-sm opacity-25"
              style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(210 100% 55%))' }} />
            <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(340 90% 55%), hsl(210 100% 55%))' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon"
            onClick={() => setCollapsed(true)}
            className="shrink-0 text-white/20 hover:text-white hover:bg-white/[0.06] h-7 w-7 rounded-lg">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1">
        <nav className={cn('py-3', collapsed ? 'px-2' : 'px-3')}>
          {MENU_GROUPS.map(group => {
            const filteredItems = group.items.filter(item => !item.adminOnly || isAdmin());
            if (filteredItems.length === 0) return null;
            const hasActiveItem = filteredItems.some(isActive);
            const isOpen = openGroups[group.label] ?? true;

            if (collapsed) {
              return (
                <div key={group.label} className="mb-2">
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center py-1.5 mb-1">
                        <group.icon className={cn('h-3 w-3', hasActiveItem ? group.color : 'text-white/15')} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="liquid-glass text-white text-xs font-semibold">{group.label}</TooltipContent>
                  </Tooltip>
                  {filteredItems.map(item => {
                    const active = isActive(item);
                    return (
                      <Tooltip key={item.url} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <NavLink to={item.url} onClick={onItemClick}
                            className={cn(
                              'flex items-center justify-center h-10 w-10 mx-auto rounded-xl mb-0.5 transition-all duration-200',
                              active
                                ? 'text-white shadow-lg'
                                : 'text-white/30 hover:text-white hover:bg-white/[0.06]',
                            )}
                            style={active ? { background: 'linear-gradient(135deg, hsl(280 80% 50% / 0.8), hsl(210 90% 50% / 0.8))', boxShadow: '0 4px 16px hsl(280 80% 50% / 0.3)' } : undefined}>
                            <item.icon className="h-[18px] w-[18px]" />
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="liquid-glass text-white text-xs font-medium">{item.title}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={group.label} className="mb-1">
                <button onClick={() => toggleGroup(group.label)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 group/header',
                    hasActiveItem ? 'text-white/70' : 'text-white/25 hover:text-white/40',
                  )}>
                  <group.icon className={cn('h-3.5 w-3.5 shrink-0 transition-colors', hasActiveItem ? group.color : 'text-white/20 group-hover/header:text-white/30')} />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn('h-3 w-3 text-white/15 transition-transform duration-200', !isOpen && '-rotate-90')} />
                </button>

                <div className={cn('overflow-hidden transition-all duration-200', isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}>
                  <div className="pl-2 pr-1 pb-1 space-y-0.5">
                    {filteredItems.map(item => {
                      const active = isActive(item);
                      return (
                        <NavLink key={item.url} to={item.url} onClick={onItemClick}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group/item relative',
                            active
                              ? 'text-white shadow-lg'
                              : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]',
                          )}
                          style={active ? { background: 'linear-gradient(135deg, hsl(280 80% 50% / 0.7), hsl(210 90% 50% / 0.5))', boxShadow: '0 4px 16px hsl(280 80% 50% / 0.2)' } : undefined}>
                          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/80" />}
                          <item.icon className={cn('h-[18px] w-[18px] shrink-0 transition-all duration-200', active && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]', !active && 'group-hover/item:scale-110')} />
                          <span className="truncate">{item.title}</span>
                          {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* ── Collapse toggle ── */}
      {collapsed && (
        <div className="border-t border-white/[0.06] p-2 shrink-0">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}
                className="w-full h-9 text-white/20 hover:text-white hover:bg-white/[0.06] rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="liquid-glass text-white text-xs">Expandir menu</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* ── User footer ── */}
      <div className={cn('border-t border-white/[0.06] shrink-0', collapsed ? 'p-2' : 'p-4')}>
        {!collapsed && (
          <div className="mb-3 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg shrink-0"
                style={{ background: 'linear-gradient(135deg, hsl(280 80% 50%), hsl(340 90% 55%))' }}>
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Usuário'}</p>
                <span className={cn(
                  'inline-flex text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full mt-1',
                  role === 'admin' && 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
                  role === 'editor' && 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
                  role === 'support' && 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
                  !role && 'bg-white/5 text-white/30 border border-white/[0.06]',
                )}>
                  {role || 'Sem função'}
                </span>
              </div>
            </div>
          </div>
        )}

        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => signOut()}
                className="w-full h-9 text-white/20 hover:text-red-400 hover:bg-red-500/5 rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="liquid-glass text-white text-xs">Sair</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" onClick={() => signOut()}
            className="w-full justify-start text-white/30 hover:text-red-400 hover:bg-red-500/5 gap-2.5 rounded-xl h-10 text-[13px] font-medium">
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export const AdminSidebar = ({ onCollapseChange }: { onCollapseChange?: (collapsed: boolean) => void }) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCollapse = (v: boolean) => { setCollapsed(v); onCollapseChange?.(v); };

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 h-10 w-10 liquid-glass text-white hover:bg-white/[0.1] shadow-xl rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0 liquid-glass-sidebar">
            <SheetHeader className="sr-only"><SheetTitle>Menu de Navegação</SheetTitle></SheetHeader>
            <SidebarInner collapsed={false} setCollapsed={() => {}} onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside className={cn(
      'fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-40 liquid-glass-sidebar',
      collapsed ? 'w-[68px]' : 'w-[260px]',
    )}>
      <SidebarInner collapsed={collapsed} setCollapsed={handleCollapse} />
    </aside>
  );
};
