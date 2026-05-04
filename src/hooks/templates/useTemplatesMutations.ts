import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { detectVariables, type Channel } from '@/components/admin/templates/TemplateConstants';
import { logTemplateAudit } from './audit';
import type { EmailTemplate, WhatsAppTemplate } from './types';

const TABLE_BY_CHANNEL = {
  email: 'email_templates',
  whatsapp: 'whatsapp_templates',
} as const;

/** CRUD mutations for email/whatsapp templates with audit log. */
export function useTemplatesMutations(reload: () => void) {
  const saveEmail = useCallback(async (template: Partial<EmailTemplate>): Promise<boolean> => {
    if (!template.name?.trim() || !template.subject?.trim() || !template.body?.trim()) {
      toast.error('Preencha nome, assunto e corpo');
      return false;
    }
    const payload = {
      name: template.name.trim(),
      subject: template.subject.trim(),
      body: template.body.trim(),
      variables: detectVariables(`${template.body} ${template.subject}`),
      is_active: template.is_active ?? true,
    };
    const isUpdate = Boolean(template.id);
    const oldData = isUpdate
      ? (await supabase.from('email_templates').select('*').eq('id', template.id!).single()).data
      : null;
    const result = isUpdate
      ? await supabase.from('email_templates').update(payload).eq('id', template.id!).select().single()
      : await supabase.from('email_templates').insert(payload).select().single();
    if (result.error) { toast.error('Erro ao salvar template'); return false; }
    await logTemplateAudit(isUpdate ? 'UPDATE' : 'INSERT', 'email_templates', result.data?.id ?? template.id, oldData, payload);
    toast.success('Template de e-mail salvo');
    reload();
    return true;
  }, [reload]);

  const saveWhats = useCallback(async (template: Partial<WhatsAppTemplate>): Promise<boolean> => {
    if (!template.name?.trim() || !template.content?.trim()) {
      toast.error('Preencha nome e mensagem');
      return false;
    }
    const payload = {
      name: template.name.trim(),
      category: template.category ?? 'transacional',
      message_text: template.content.trim(),
      variables: detectVariables(template.content),
      is_active: template.is_active ?? true,
    };
    const isUpdate = Boolean(template.id);
    const oldData = isUpdate
      ? (await supabase.from('whatsapp_templates').select('*').eq('id', template.id!).single()).data
      : null;
    const result = isUpdate
      ? await supabase.from('whatsapp_templates').update(payload).eq('id', template.id!).select().single()
      : await supabase.from('whatsapp_templates').insert(payload).select().single();
    if (result.error) { toast.error('Erro ao salvar template'); return false; }
    await logTemplateAudit(isUpdate ? 'UPDATE' : 'INSERT', 'whatsapp_templates', result.data?.id ?? template.id, oldData, payload);
    toast.success('Template WhatsApp salvo');
    reload();
    return true;
  }, [reload]);

  const toggleTemplate = useCallback(async (channel: Channel, id: string, isActive: boolean) => {
    const table = TABLE_BY_CHANNEL[channel];
    const { error } = await supabase.from(table).update({ is_active: isActive }).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    await logTemplateAudit('UPDATE', table, id, { is_active: !isActive }, { is_active: isActive });
    reload();
  }, [reload]);

  const deleteTemplate = useCallback(async (channel: Channel, id: string, name: string) => {
    const table = TABLE_BY_CHANNEL[channel];
    const { data: old } = await supabase.from(table).select('*').eq('id', id).single();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    await logTemplateAudit('DELETE', table, id, old, null);
    toast.success(`"${name}" excluído`);
    reload();
  }, [reload]);

  const bulkAction = useCallback(async (channel: Channel, ids: string[], action: 'activate' | 'deactivate' | 'delete') => {
    if (ids.length === 0) { toast.error('Selecione pelo menos um'); return; }
    const table = TABLE_BY_CHANNEL[channel];
    if (action === 'delete') {
      await supabase.from(table).delete().in('id', ids);
      toast.success(`${ids.length} excluídos`);
    } else {
      const isActive = action === 'activate';
      await supabase.from(table).update({ is_active: isActive }).in('id', ids);
      toast.success(`${ids.length} ${isActive ? 'ativados' : 'desativados'}`);
    }
    reload();
  }, [reload]);

  return { saveEmail, saveWhats, toggleTemplate, deleteTemplate, bulkAction };
}
