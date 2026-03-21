import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendEmailRequest {
  action: 'test_connection' | 'send_test_email';
  to?: string;
  subject?: string;
  html?: string;
  from_name?: string;
}

export function useTestEmailConnection() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { action: 'test_connection' satisfies SendEmailRequest['action'] },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Falha ao testar conexao de email');
      return data;
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async (request: Omit<SendEmailRequest, 'action'>) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { action: 'send_test_email', ...request },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Falha ao enviar email de teste');
      return data;
    },
  });
}
