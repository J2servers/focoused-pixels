import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EmailTemplate, WhatsAppTemplate } from './types';

interface WhatsRow {
  id: string;
  name: string;
  category: string | null;
  message_text?: string | null;
  content?: string | null;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkflowStep { template_id?: string; template_name?: string }
interface WorkflowRow { id: string; name: string; steps: WorkflowStep[] | null }
interface WebhookLogRow { event_type: string | null }

/** Loads templates, send statistics, and workflow→template mappings. */
export function useTemplatesData() {
  const [loading, setLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<WhatsAppTemplate[]>([]);
  const [templateStats, setTemplateStats] = useState<Record<string, number>>({});
  const [workflowLinks, setWorkflowLinks] = useState<Record<string, string[]>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: emails }, { data: whats }] = await Promise.all([
        supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: false }),
      ]);
      setEmailTemplates((emails ?? []) as EmailTemplate[]);
      setWhatsTemplates(((whats ?? []) as WhatsRow[]).map(w => ({
        ...w,
        content: w.message_text ?? w.content ?? '',
      } as WhatsAppTemplate)));
    } catch {
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
      if (!data) return;
      const counts: Record<string, number> = {};
      (data as WebhookLogRow[]).forEach(log => {
        const key = log.event_type ?? '';
        counts[key] = (counts[key] ?? 0) + 1;
      });
      setTemplateStats(counts);
    } catch { /* silent */ }
  }, []);

  const loadWorkflowLinks = useCallback(async () => {
    try {
      const { data } = await supabase.from('automation_workflows').select('id, name, steps');
      if (!data) return;
      const links: Record<string, string[]> = {};
      (data as unknown as WorkflowRow[]).forEach(wf => {
        (wf.steps ?? []).forEach(step => {
          const key = step.template_id ?? step.template_name;
          if (!key) return;
          (links[key] ??= []).push(wf.name);
        });
      });
      setWorkflowLinks(links);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    reload();
    loadStats();
    loadWorkflowLinks();
  }, [reload, loadStats, loadWorkflowLinks]);

  return {
    loading,
    emailTemplates,
    whatsTemplates,
    templateStats,
    workflowLinks,
    reload,
  };
}
