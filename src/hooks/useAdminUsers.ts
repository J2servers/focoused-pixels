import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  profile?: { full_name: string } | null;
  role?: string;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('user_id, full_name'),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const users: AdminUser[] = [];
      roleMap.forEach((role, userId) => {
        const profile = profileMap.get(userId);
        users.push({
          id: userId,
          email: '',
          created_at: new Date().toISOString(),
          profile: profile ? { full_name: profile.full_name } : null,
          role,
        });
      });

      return users;
    },
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password, full_name, role }: {
      email: string; password: string; full_name: string; role: string;
    }) => {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: { full_name },
        },
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Usuário não foi criado');

      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name,
      });

      const { error: roleError } = await supabase.from('user_roles').insert([{
        user_id: authData.user.id,
        role: role as 'admin' | 'editor' | 'support',
      }]);
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário criado com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'editor' | 'support' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Função atualizada!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Acesso removido com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
