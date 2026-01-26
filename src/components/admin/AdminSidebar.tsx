import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Percent, 
  Image, 
  Building2, 
  Users, 
  Settings, 
  FileText,
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Produtos', url: '/admin/produtos', icon: Package },
  { title: 'Categorias', url: '/admin/categorias', icon: FolderTree },
  { title: 'Promoções', url: '/admin/promocoes', icon: Percent },
  { title: 'Banner Hero', url: '/admin/hero', icon: Image },
  { title: 'Avaliações', url: '/admin/avaliacoes', icon: Star },
  { title: 'Leads', url: '/admin/leads', icon: UserPlus },
  { title: 'Empresa', url: '/admin/empresa', icon: Building2 },
  { title: 'Usuários', url: '/admin/usuarios', icon: Users, adminOnly: true },
  { title: 'Logs', url: '/admin/logs', icon: FileText },
  { title: 'Configurações', url: '/admin/configuracoes', icon: Settings },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { profile, role, signOut, isAdmin } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || isAdmin()
  );

  const NavItem = ({ item, isActive }: { item: typeof menuItems[0], isActive: boolean }) => {
    const content = (
      <NavLink
        to={item.url}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group/item",
          isActive 
            ? "bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.4)]" 
            : "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white"
        )}
      >
        <item.icon className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-300", 
          isActive && "drop-shadow-[0_0_8px_hsl(var(--admin-glow))]",
          !isActive && "group-hover/item:scale-110"
        )} />
        {!collapsed && (
          <span className="text-sm font-medium tracking-wide">{item.title}</span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium bg-[hsl(var(--admin-card))] text-white border-[hsl(var(--admin-card-border))]">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside 
      className={cn(
        "h-screen admin-gradient-sidebar flex flex-col transition-all duration-300 border-r border-[hsl(var(--admin-card-border)/0.5)]",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-[hsl(var(--admin-card-border)/0.5)]",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] flex items-center justify-center shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] animate-pulse">
              <Sparkles className="h-5 w-5 text-white drop-shadow-[0_0_6px_white]" />
            </div>
            <div className="flex flex-col">
              <span className="admin-gradient-text font-bold text-sm tracking-wide">Pincel de Luz</span>
              <span className="text-[hsl(var(--admin-text-muted))] text-[10px] font-semibold uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))] h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1.5">
          {filteredItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.url
              : location.pathname.startsWith(item.url) && location.pathname !== '/admin' || (item.url === '/admin' && location.pathname === '/admin');

            return (
              <li key={item.title}>
                <NavItem item={item} isActive={isActive} />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="border-t border-[hsl(var(--admin-card-border)/0.5)] p-4">
        {!collapsed && (
          <div className="mb-3 px-1">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                role === 'admin' && "bg-gradient-to-r from-[hsl(var(--admin-accent-purple)/0.3)] to-[hsl(var(--admin-accent-pink)/0.3)] text-[hsl(var(--admin-accent-pink))] border border-[hsl(var(--admin-accent-pink)/0.3)]",
                role === 'editor' && "bg-[hsl(var(--admin-accent-blue)/0.2)] text-[hsl(var(--admin-accent-blue))] border border-[hsl(var(--admin-accent-blue)/0.3)]",
                role === 'support' && "bg-[hsl(var(--admin-accent-green)/0.2)] text-[hsl(var(--admin-accent-green))] border border-[hsl(var(--admin-accent-green)/0.3)]",
              )}>
                {role || 'Sem função'}
              </span>
            </div>
          </div>
        )}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-full text-[hsl(var(--admin-text-muted))] hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[hsl(var(--admin-card))] text-white border-[hsl(var(--admin-card-border))]">
              Sair
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-[hsl(var(--admin-text-muted))] hover:text-red-400 hover:bg-red-500/10 gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        )}
      </div>
    </aside>
  );
};
