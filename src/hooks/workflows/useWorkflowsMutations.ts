import { useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { flowToSteps } from './flowConverters';
import { validateWorkflow } from './validation';
import type { TemplateLite, ValidationIssue, WorkflowMeta } from './types';

interface SaveResult {
  success: boolean;
  issues: ValidationIssue[];
  id?: string;
}

interface UseWorkflowsMutationsArgs {
  emailTemplates: TemplateLite[];
  whatsTemplates: TemplateLite[];
  reload: () => Promise<void> | void;
  loadExecutions: (workflowId?: string) => Promise<void> | void;
}

export function useWorkflowsMutations({
  emailTemplates, whatsTemplates, reload, loadExecutions,
}: UseWorkflowsMutationsArgs) {
  const saveWorkflow = useCallback(async (
    meta: WorkflowMeta,
    nodes: Node[],
    edges: Edge[],
  ): Promise<SaveResult> => {
    const issues = validateWorkflow(nodes, edges, meta, emailTemplates, whatsTemplates);
    const errors = issues.filter((i) => i.type === 'error');
    if (errors.length > 0) return { success: false, issues };

    const steps = flowToSteps(nodes, edges);
    const triggerNode = nodes.find((n) => n.type === 'trigger');
    const triggerEvent =
      ((triggerNode?.data as Record<string, unknown> | undefined)?.trigger_event as string | undefined) ??
      meta.trigger_event;

    const payload = {
      name: meta.name,
      description: meta.description || null,
      trigger_event: triggerEvent,
      trigger_delay_minutes: meta.trigger_delay_minutes,
      steps: steps as unknown as Json,
      is_active: meta.is_active,
    };

    const { data, error } = meta.id
      ? await supabase.from('automation_workflows').update(payload).eq('id', meta.id).select().single()
      : await supabase.from('automation_workflows').insert(payload).select().single();

    if (error) {
      toast.error('Erro ao salvar: ' + error.message);
      return { success: false, issues };
    }

    const warnings = issues.filter((i) => i.type === 'warning');
    if (warnings.length > 0) toast.warning(`Salvo com ${warnings.length} aviso(s)`);
    else toast.success('Workflow salvo com sucesso!');

    await reload();
    const savedId = (data as { id?: string } | null)?.id ?? meta.id;
    return { success: true, issues, id: savedId };
  }, [emailTemplates, whatsTemplates, reload]);

  const deleteWorkflow = useCallback(async (id: string) => {
    await supabase.from('automation_workflows').delete().eq('id', id);
    toast.success('Workflow excluído');
    await reload();
  }, [reload]);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await supabase.from('automation_workflows').update({ is_active: active }).eq('id', id);
    toast.success(active ? 'Workflow ativado' : 'Workflow desativado');
    await reload();
  }, [reload]);

  const testWorkflow = useCallback(async (meta: WorkflowMeta): Promise<boolean> => {
    if (!meta.id) {
      toast.error('Salve o workflow antes de testar');
      return false;
    }
    try {
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: {
          action: 'trigger',
          trigger_event: meta.trigger_event,
          trigger_data: {
            customer_name: 'Teste Workflow',
            customer_email: 'teste@exemplo.com',
            customer_phone: '11999999999',
            order_number: 'TEST-' + Date.now(),
            amount: '99.90',
            is_test: true,
          },
        },
      });
      if (error) throw error;
      const count = (data as { count?: number } | null)?.count ?? 0;
      toast.success(`Teste disparado! ${count} workflow(s) acionado(s)`);
      await loadExecutions(meta.id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Desconhecido';
      toast.error('Erro no teste: ' + message);
      return false;
    }
  }, [loadExecutions]);

  return { saveWorkflow, deleteWorkflow, toggleActive, testWorkflow };
}
