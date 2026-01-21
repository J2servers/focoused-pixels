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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
