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
  ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useState } from 'react';
import logoGoat from '@/assets/logo-goat.png';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, end: true },
  { title: 'Produtos', url: '/admin/produtos', icon: Package },
  { title: 'Categorias', url: '/admin/categorias', icon: FolderTree },
  { title: 'Promoções', url: '/admin/promocoes', icon: Percent },
  { title: 'Banner Hero', url: '/admin/hero', icon: Image },
  { title: 'Avaliações', url: '/admin/avaliacoes', icon: Star },
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

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <img src={logoGoat} alt="Goat" className="h-8" />
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.url
              : location.pathname.startsWith(item.url);

            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-4">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {role || 'Sem função'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={handleLogout}
          className={cn("w-full text-muted-foreground hover:text-destructive", collapsed && "justify-center")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </aside>
  );
};
