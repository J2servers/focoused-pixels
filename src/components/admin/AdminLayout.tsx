import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  requireEditor?: boolean;
  requireAdmin?: boolean;
}

export const AdminLayout = ({ 
  children, 
  title, 
  requireEditor = false,
  requireAdmin = false 
}: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { user, role, isLoading, canEdit, isAdmin } = useAuthContext();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) { navigate('/admin/login'); return; }
      if (!role) { navigate('/admin/login'); return; }
      if (requireAdmin && !isAdmin()) { navigate('/admin'); return; }
      if (requireEditor && !canEdit()) { navigate('/admin'); return; }
    }
  }, [user, role, isLoading, navigate, requireEditor, requireAdmin, canEdit, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-white/40 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) return null;

  return (
    <div className="min-h-screen admin-dark bg-[hsl(var(--admin-bg))]">
      <AdminSidebar onCollapseChange={setSidebarCollapsed} />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-[68px]" : "ml-[260px]"
      )}>
        <AdminHeader title={title} />
        <main className={cn(
          "flex-1 overflow-y-auto p-3 md:p-4",
          isMobile && "pt-16"
        )}>
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
