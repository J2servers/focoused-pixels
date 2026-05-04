import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { replaceVariables, type Channel } from '@/components/admin/templates/TemplateConstants';
import {
  SUGGESTED_EMAIL_TEMPLATES, SUGGESTED_WHATSAPP_TEMPLATES,
} from '@/components/admin/templates/SuggestedTemplates';
import type { EmailTemplate, WhatsAppTemplate } from './types';

function normalizePhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function plainToHtmlEmail(plain: string): string {
  const paragraphs = plain.split('\n').map(line => `<p>${line}</p>`).join('');
  return `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">${paragraphs}</div></div>`;
}

function downloadJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function pickFile(accept: string): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = e => resolve((e.target as HTMLInputElement).files?.[0] ?? null);
    input.click();
  });
}

interface ImportPayload {
  email_templates?: Array<Partial<EmailTemplate>>;
  whatsapp_templates?: Array<Partial<WhatsAppTemplate> & { message_text?: string }>;
}

/** Test sends, suggested-template installation, JSON import/export, channel cloning. */
export function useTemplatesActions(
  emailTemplates: EmailTemplate[],
  whatsTemplates: WhatsAppTemplate[],
  reload: () => void,
) {
  const sendTest = useCallback(async (channel: Channel, templateId: string, to: string): Promise<boolean> => {
    if (!to.trim()) { toast.error('Informe o destinatário'); return false; }
    try {
      if (channel === 'email') {
        const tpl = emailTemplates.find(t => t.id === templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            action: 'send',
            to: to.trim(),
            subject: `[TESTE] ${replaceVariables(tpl.subject)}`,
            html: replaceVariables(tpl.body),
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error ?? 'Falha');
        toast.success(`E-mail de teste enviado para ${to}`);
      } else {
        const tpl = whatsTemplates.find(t => t.id === templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const { data, error } = await supabase.functions.invoke('whatsapp-evolution', {
          body: {
            action: 'sendText',
            number: normalizePhoneDigits(to),
            text: `[TESTE] ${replaceVariables(tpl.content)}`,
            recipientName: 'Teste',
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error ?? 'Falha');
        toast.success('WhatsApp de teste enviado');
      }
      return true;
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
      return false;
    }
  }, [emailTemplates, whatsTemplates]);

  const installSuggestedEmails = useCallback(async () => {
    let installed = 0;
    for (const t of SUGGESTED_EMAIL_TEMPLATES) {
      if (emailTemplates.some(e => e.name === t.name)) continue;
      const { error } = await supabase.from('email_templates').insert({
        name: t.name, subject: t.subject, body: t.body, variables: t.variables, is_active: true,
      });
      if (!error) installed++;
    }
    toast.success(`${installed} e-mails instalados`);
    reload();
  }, [emailTemplates, reload]);

  const installSuggestedWhats = useCallback(async () => {
    const rows = SUGGESTED_WHATSAPP_TEMPLATES.map(t => ({
      name: t.name, category: t.category, message_text: t.content, variables: t.variables, is_active: true,
    }));
    await supabase.from('whatsapp_templates').upsert(rows, { onConflict: 'name', ignoreDuplicates: true });
    toast.success('WhatsApp sugeridos instalados');
    reload();
  }, [reload]);

  const exportTemplates = useCallback(() => {
    const stripId = <T extends { id: string }>(row: T) => {
      const { id: _omit, ...rest } = row;
      return rest;
    };
    downloadJsonFile({
      email_templates: emailTemplates.map(stripId),
      whatsapp_templates: whatsTemplates.map(stripId),
      exported_at: new Date().toISOString(),
    }, `templates-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success('Exportado');
  }, [emailTemplates, whatsTemplates]);

  const importTemplates = useCallback(async () => {
    const file = await pickFile('.json');
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as ImportPayload;
      let imported = 0;
      for (const t of data.email_templates ?? []) {
        const { error } = await supabase.from('email_templates').insert({
          name: t.name ?? '', subject: t.subject ?? '', body: t.body ?? '',
          variables: t.variables ?? [], is_active: t.is_active ?? true,
        });
        if (!error) imported++;
      }
      for (const t of data.whatsapp_templates ?? []) {
        const { error } = await supabase.from('whatsapp_templates').insert({
          name: t.name ?? '', category: t.category ?? 'custom',
          message_text: t.content ?? t.message_text ?? '',
          variables: t.variables ?? [], is_active: t.is_active ?? true,
        });
        if (!error) imported++;
      }
      toast.success(`${imported} importados`);
      reload();
    } catch {
      toast.error('Arquivo inválido');
    }
  }, [reload]);

  const cloneEmailToWhats = useCallback((t: EmailTemplate): Partial<WhatsAppTemplate> => ({
    name: t.name,
    category: 'transacional',
    content: htmlToPlainText(t.body).slice(0, 1600),
    variables: t.variables,
    is_active: false,
  }), []);

  const cloneWhatsToEmail = useCallback((t: WhatsAppTemplate): Partial<EmailTemplate> => ({
    name: t.name,
    subject: `${t.name} — {{order_number}}`,
    body: plainToHtmlEmail(t.content),
    variables: t.variables,
    is_active: false,
  }), []);

  return {
    sendTest,
    installSuggestedEmails,
    installSuggestedWhats,
    exportTemplates,
    importTemplates,
    cloneEmailToWhats,
    cloneWhatsToEmail,
  };
}
