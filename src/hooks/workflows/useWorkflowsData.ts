import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TemplateLite, WorkflowExecution, WorkflowMeta, WorkflowStep } from './types';

export type LoadedWorkflow = WorkflowMeta & { steps: WorkflowStep[] };

export function useWorkflowsData() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<LoadedWorkflow[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<TemplateLite[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<TemplateLite[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: wf }, { data: et }, { data: wt }] = await Promise.all([
      supabase.from('automation_workflows').select('*').order('created_at', { ascending: false }),
      supabase.from('email_templates').select('id, name, subject, body').eq('is_active', true),
      supabase.from('whatsapp_templates').select('id, name, message_text').eq('is_active', true),
    ]);
    setWorkflows(((wf || []) as LoadedWorkflow[]).map((w) => ({ ...w, steps: (w.steps || []) as WorkflowStep[] })));
    setEmailTemplates((et || []) as TemplateLite[]);
    setWhatsTemplates((wt || []) as TemplateLite[]);
    setLoading(false);
  }, []);

  const loadExecutions = useCallback(async (workflowId?: string) => {
    setLoadingExecs(true);
    const query = supabase.from('workflow_executions').select('*').order('created_at', { ascending: false }).limit(50);
    if (workflowId) query.eq('workflow_id', workflowId);
    const { data } = await query;
    setExecutions((data || []) as WorkflowExecution[]);
    setLoadingExecs(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return {
    loading, workflows, emailTemplates, whatsTemplates,
    executions, loadingExecs, loadExecutions, reload: loadData,
  };
}
