import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export const useEmailGateway = () => {
  const sendEmail = async (params: SendEmailParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params,
      });

      if (error) {
        console.error('Email send error:', error);
        toast.error('Erro ao enviar e-mail');
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Email gateway error:', err);
      toast.error('Falha na conexão com o serviço de e-mail');
      return { success: false, error: err };
    }
  };

  const sendTestEmail = async (testEmail: string) => {
    return sendEmail({
      to: testEmail,
      subject: 'Teste de E-mail — Pincel de Luz',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #7c3aed;">✅ Teste de E-mail</h2>
          <p>Este é um e-mail de teste enviado pelo sistema da Pincel de Luz.</p>
          <p>Se você recebeu esta mensagem, a configuração SMTP está funcionando corretamente.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">Pincel de Luz — Sistema de Gestão Comercial</p>
        </div>
      `,
    });
  };

  return { sendEmail, sendTestEmail };
};
