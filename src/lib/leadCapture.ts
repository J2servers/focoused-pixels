/**
 * Sistema unificado e à prova de falhas para captura de leads.
 * Salva lead na tabela `leads` E atualiza contato do carrinho abandonado.
 * Tudo é fire-and-forget: nunca quebra o fluxo do usuário.
 */
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail, sanitizePhone } from '@/lib/sanitize';
import { saveAbandonedCartContact } from '@/lib/abandoned-cart';
import { logger } from '@/lib/logger';

export interface LeadCaptureInput {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  tags?: string[];
}

/**
 * Captura lead de forma resiliente. Nunca lança erro.
 * - Persiste no banco se houver email
 * - Atualiza contato local do carrinho abandonado (para reminders)
 */
export async function captureLead(input: LeadCaptureInput): Promise<void> {
  try {
    const name = input.name?.trim() || '';
    const email = input.email ? sanitizeEmail(input.email) : '';
    const phone = input.phone ? sanitizePhone(input.phone) : '';

    // Atualiza contato do carrinho abandonado SEMPRE (mesmo sem email)
    if (name || email || phone) {
      try {
        saveAbandonedCartContact({
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        });
      } catch (e) {
        logger.error('leadCapture', 'saveAbandonedCartContact failed', e);
      }
    }

    // Lead só vai pro banco se tem email válido (chave única)
    if (!email || !email.includes('@')) return;

    const payload = {
      name: name || email.split('@')[0],
      email,
      phone: phone || null,
      source: input.source || 'checkout',
      tags: input.tags || ['checkout'],
      is_subscribed: true,
      subscribed_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('leads')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      logger.error('leadCapture', 'lead upsert failed', error);
    }
  } catch (e) {
    logger.error('leadCapture', 'captureLead unexpected', e);
  }
}
