import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmailCredentials {
  id: string;
  email_enabled: boolean | null;
  business_email: string | null;
  sender_name: string | null;
  reply_to_email: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean | null;
  smtp_username: string | null;
  smtp_password: string | null;
  test_mode: boolean | null;
  test_recipient: string | null;
  updated_at: string;
}

const defaultEmailCredentials: Omit<EmailCredentials, 'id' | 'updated_at'> = {
  email_enabled: false,
  business_email: null,
  sender_name: 'Pincel de Luz',
  reply_to_email: null,
  smtp_host: 'smtp.hostinger.com',
  smtp_port: 465,
  smtp_secure: true,
  smtp_username: null,
  smtp_password: null,
  test_mode: true,
  test_recipient: null,
};

const buildDefaultCredentials = (): EmailCredentials => ({
  id: '',
  updated_at: new Date().toISOString(),
  ...defaultEmailCredentials,
});

export function useEmailCredentials() {
  return useQuery({
    queryKey: ['email-credentials'],
    queryFn: async () => {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return buildDefaultCredentials();
      }

      const { data, error } = await supabase
        .from('email_credentials')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        const relationMissing = error.code === 'PGRST205' || error.message?.includes('email_credentials');
        if (!relationMissing) {
          console.error('Error fetching email credentials:', error);
        }
        return buildDefaultCredentials();
      }

      return { ...defaultEmailCredentials, ...data } as EmailCredentials;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateEmailCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<EmailCredentials> }) => {
      if (id) {
        const { error } = await supabase
          .from('email_credentials')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_credentials')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-credentials'] });
    },
  });
}
