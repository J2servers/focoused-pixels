import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { useAuthContext } from '@/contexts/AuthContext';

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

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      if (!role) {
        navigate('/admin/login');
        return;
      }

      if (requireAdmin && !isAdmin()) {
        navigate('/admin');
        return;
      }

      if (requireEditor && !canEdit()) {
        navigate('/admin');
        return;
      }
    }
  }, [user, role, isLoading, navigate, requireEditor, requireAdmin, canEdit, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[hsl(var(--admin-bg))]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
