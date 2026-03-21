import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailCredentials {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string | null;
  smtp_password: string | null;
  reply_to: string | null;
  test_email: string | null;
  test_mode: boolean;
  is_active: boolean;
  updated_at: string;
}

export const useEmailCredentials = () => {
  return useQuery({
    queryKey: ['email-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hostinger_email_credentials')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as EmailCredentials;
    },
  });
};

export const useUpdateEmailCredentials = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<EmailCredentials>) => {
      const { data, error } = await supabase
        .from('hostinger_email_credentials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', updates.id!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-credentials'] });
      toast.success('Credenciais SMTP salvas!');
    },
    onError: () => toast.error('Erro ao salvar credenciais'),
  });
};
