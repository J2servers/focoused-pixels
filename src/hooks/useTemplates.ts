import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  EmailTemplate, WhatsAppTemplate, Channel,
  SYSTEM_EVENTS, detectVariables, replaceVariables,
} from '@/components/admin/templates/TemplateConstants';
import { SUGGESTED_EMAIL_TEMPLATES, SUGGESTED_WHATSAPP_TEMPLATES } from '@/components/admin/templates/SuggestedTemplates';

export type FilterStatus = 'all' | 'active' | 'inactive';
export type SortField = 'name' | 'created_at' | 'updated_at';
export type ViewMode = 'grid' | 'list';

export function useTemplates() {
  const [loading, setLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<WhatsAppTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [templateStats, setTemplateStats] = useState<Record<string, number>>({});
  const [workflowLinks, setWorkflowLinks] = useState<Record<string, string[]>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: emails }, { data: whats }] = await Promise.all([
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: false }),
      ]);
      setEmailTemplates((emails || []) as EmailTemplate[]);
      setWhatsTemplates(
        (whats || []).map((w: any) => ({
          ...w,
          content: w.message_text || w.content || '',
        })) as WhatsAppTemplate[]
      );
    } catch (e) {
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('webhook_logs')
        .select('event_type')
        .eq('direction', 'outbound')
        .eq('endpoint', 'notify-customer')
        .eq('processed', true);
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((log: any) => {
          const key = log.event_type || '';
          counts[key] = (counts[key] || 0) + 1;
        });
        setTemplateStats(counts);
      }
    } catch { /* silent */ }
  }, []);

  const loadWorkflowLinks = useCallback(async () => {
    try {
      const { data } = await supabase.from('automation_workflows').select('id, name, steps');
      if (data) {
        const links: Record<string, string[]> = {};
        data.forEach((wf: any) => {
          ((wf.steps || []) as any[]).forEach((s: any) => {
            const tplId = s.template_id || s.template_name;
            if (tplId) {
              if (!links[tplId]) links[tplId] = [];
              links[tplId].push(wf.name);
            }
          });
        });
        setWorkflowLinks(links);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadData();
    loadStats();
    loadWorkflowLinks();
  }, [loadData, loadStats, loadWorkflowLinks]);

  // Filtering & Sorting
  const applyFilters = useCallback(
    <T extends { name: string; is_active: boolean }>(
      list: T[],
      extraSearch?: (t: T) => string
    ): T[] => {
      let filtered = list;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          t => t.name.toLowerCase().includes(q) || (extraSearch?.(t) || '').toLowerCase().includes(q)
        );
      }
      if (filterStatus === 'active') filtered = filtered.filter(t => t.is_active);
      if (filterStatus === 'inactive') filtered = filtered.filter(t => !t.is_active);
      return [...filtered].sort((a, b) => {
        const va = String((a as any)[sortField] || '');
        const vb = String((b as any)[sortField] || '');
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    },
    [searchQuery, filterStatus, sortField, sortAsc]
  );

  const filteredEmails = useMemo(
    () => applyFilters(emailTemplates, t => t.subject),
    [emailTemplates, applyFilters]
  );

  const filteredWhats = useMemo(
    () => applyFilters(whatsTemplates, t => t.content),
    [whatsTemplates, applyFilters]
  );

  // Metrics
  const metrics = useMemo(() => {
    const emailActive = emailTemplates.filter(t => t.is_active).length;
    const whatsActive = whatsTemplates.filter(t => t.is_active).length;
    const totalSends = Object.values(templateStats).reduce((a, b) => a + b, 0);
    const coveredEvents = SYSTEM_EVENTS.filter(
      ev => emailTemplates.some(t => t.name === ev.value) || whatsTemplates.some(t => t.name === ev.value)
    );
    const uncoveredEvents = SYSTEM_EVENTS.filter(
      ev => !emailTemplates.some(t => t.name === ev.value) && !whatsTemplates.some(t => t.name === ev.value)
    );
    return {
      emailTotal: emailTemplates.length,
      whatsTotal: whatsTemplates.length,
      emailActive,
      whatsActive,
      totalSends,
      coveredCount: coveredEvents.length,
      uncoveredEvents,
    };
  }, [emailTemplates, whatsTemplates, templateStats]);

  // CRUD
  const saveEmail = useCallback(async (template: Partial<EmailTemplate>) => {
    if (!template.name?.trim() || !template.subject?.trim() || !template.body?.trim()) {
      toast.error('Preencha nome, assunto e corpo');
      return false;
    }
    const autoVars = detectVariables(template.body + ' ' + template.subject);
    const payload = {
      name: template.name.trim(),
      subject: template.subject.trim(),
      body: template.body.trim(),
      variables: autoVars,
      is_active: template.is_active ?? true,
    };
    const { error } = template.id
      ? await supabase.from('email_templates').update(payload).eq('id', template.id)
      : await supabase.from('email_templates').insert(payload);
    if (error) { toast.error('Erro ao salvar template'); return false; }
    toast.success('Template de e-mail salvo');
    loadData();
    return true;
  }, [loadData]);

  const saveWhats = useCallback(async (template: Partial<WhatsAppTemplate>) => {
    if (!template.name?.trim() || !template.content?.trim()) {
      toast.error('Preencha nome e mensagem');
      return false;
    }
    const autoVars = detectVariables(template.content);
    const payload = {
      name: template.name.trim(),
      category: template.category || 'transacional',
      message_text: template.content.trim(),
      variables: autoVars,
      is_active: template.is_active ?? true,
    };
    const { error } = template.id
      ? await supabase.from('whatsapp_templates').update(payload).eq('id', template.id)
      : await supabase.from('whatsapp_templates').insert(payload as any);
    if (error) { toast.error('Erro ao salvar template'); return false; }
    toast.success('Template WhatsApp salvo');
    loadData();
    return true;
  }, [loadData]);

  const toggleTemplate = useCallback(async (channel: Channel, id: string, isActive: boolean) => {
    const { error } = channel === 'email'
      ? await supabase.from('email_templates').update({ is_active: isActive }).eq('id', id)
      : await supabase.from('whatsapp_templates').update({ is_active: isActive }).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    loadData();
  }, [loadData]);

  const deleteTemplate = useCallback(async (channel: Channel, id: string, name: string) => {
    const { error } = channel === 'email'
      ? await supabase.from('email_templates').delete().eq('id', id)
      : await supabase.from('whatsapp_templates').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    toast.success(`"${name}" excluído`);
    loadData();
  }, [loadData]);

  const bulkAction = useCallback(async (channel: Channel, ids: string[], action: 'activate' | 'deactivate' | 'delete') => {
    if (ids.length === 0) { toast.error('Selecione pelo menos um'); return; }
    const table = channel === 'email' ? 'email_templates' : 'whatsapp_templates';
    if (action === 'delete') {
      await supabase.from(table).delete().in('id', ids);
      toast.success(`${ids.length} excluídos`);
    } else {
      const isActive = action === 'activate';
      await supabase.from(table).update({ is_active: isActive }).in('id', ids);
      toast.success(`${ids.length} ${isActive ? 'ativados' : 'desativados'}`);
    }
    loadData();
  }, [loadData]);

  // Test send
  const sendTest = useCallback(async (channel: Channel, templateId: string, to: string) => {
    if (!to.trim()) { toast.error('Informe o destinatário'); return false; }
    try {
      if (channel === 'email') {
        const tpl = emailTemplates.find(t => t.id === templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: { action: 'send', to: to.trim(), subject: `[TESTE] ${replaceVariables(tpl.subject)}`, html: replaceVariables(tpl.body) },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Falha');
        toast.success(`E-mail de teste enviado para ${to}`);
      } else {
        const tpl = whatsTemplates.find(t => t.id === templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const phone = to.replace(/\D/g, '');
        const { data, error } = await supabase.functions.invoke('whatsapp-evolution', {
          body: { action: 'sendText', number: phone.startsWith('55') ? phone : `55${phone}`, text: `[TESTE] ${replaceVariables(tpl.content)}`, recipientName: 'Teste' },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Falha');
        toast.success(`WhatsApp de teste enviado`);
      }
      return true;
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
      return false;
    }
  }, [emailTemplates, whatsTemplates]);

  // Install suggested
  const installSuggestedEmails = useCallback(async () => {
    let n = 0;
    for (const t of SUGGESTED_EMAIL_TEMPLATES) {
      if (!emailTemplates.some(e => e.name === t.name)) {
        const { error } = await supabase.from('email_templates').insert({
          name: t.name, subject: t.subject, body: t.body, variables: t.variables, is_active: true,
        });
        if (!error) n++;
      }
    }
    toast.success(`${n} e-mails instalados`);
    loadData();
  }, [emailTemplates, loadData]);

  const installSuggestedWhats = useCallback(async () => {
    const mapped = SUGGESTED_WHATSAPP_TEMPLATES.map(t => ({
      name: t.name, category: t.category, message_text: t.content, variables: t.variables, is_active: true,
    }));
    await supabase.from('whatsapp_templates').upsert(mapped as any, { onConflict: 'name', ignoreDuplicates: true });
    toast.success('WhatsApp sugeridos instalados');
    loadData();
  }, [loadData]);

  // Export / Import
  const exportTemplates = useCallback(() => {
    const blob = new Blob([
      JSON.stringify({
        email_templates: emailTemplates.map(({ id, ...r }) => r),
        whatsapp_templates: whatsTemplates.map(({ id, ...r }) => r),
        exported_at: new Date().toISOString(),
      }, null, 2),
    ], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `templates-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Exportado');
  }, [emailTemplates, whatsTemplates]);

  const importTemplates = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        let imported = 0;
        if (data.email_templates?.length) {
          for (const t of data.email_templates) {
            const { error } = await supabase.from('email_templates').insert({
              name: t.name, subject: t.subject, body: t.body, variables: t.variables || [], is_active: t.is_active ?? true,
            });
            if (!error) imported++;
          }
        }
        if (data.whatsapp_templates?.length) {
          for (const t of data.whatsapp_templates) {
            const { error } = await supabase.from('whatsapp_templates').insert({
              name: t.name, category: t.category || 'custom', message_text: t.content || t.message_text || '', variables: t.variables || [], is_active: t.is_active ?? true,
            } as any);
            if (!error) imported++;
          }
        }
        toast.success(`${imported} importados`);
        loadData();
      } catch {
        toast.error('Arquivo inválido');
      }
    };
    input.click();
  }, [loadData]);

  // Clone helpers
  const cloneEmailToWhats = useCallback((t: EmailTemplate): Partial<WhatsAppTemplate> => {
    return {
      name: t.name,
      category: 'transacional',
      content: t.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 1600),
      variables: t.variables,
      is_active: false,
    };
  }, []);

  const cloneWhatsToEmail = useCallback((t: WhatsAppTemplate): Partial<EmailTemplate> => {
    return {
      name: t.name,
      subject: `${t.name} — {{order_number}}`,
      body: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">${t.content.split('\n').map(l => `<p>${l}</p>`).join('')}</div></div>`,
      variables: t.variables,
      is_active: false,
    };
  }, []);

  return {
    loading,
    emailTemplates,
    whatsTemplates,
    filteredEmails,
    filteredWhats,
    metrics,
    templateStats,
    workflowLinks,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    sortField, setSortField,
    sortAsc, setSortAsc,
    viewMode, setViewMode,
    saveEmail,
    saveWhats,
    toggleTemplate,
    deleteTemplate,
    bulkAction,
    sendTest,
    installSuggestedEmails,
    installSuggestedWhats,
    exportTemplates,
    importTemplates,
    cloneEmailToWhats,
    cloneWhatsToEmail,
    reload: loadData,
  };
}
