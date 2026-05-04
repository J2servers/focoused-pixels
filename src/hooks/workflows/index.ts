import { useMemo } from 'react';
import { useWorkflowsData } from './useWorkflowsData';
import { useWorkflowsMutations } from './useWorkflowsMutations';

export * from './types';
export * from './presets';
export * from './flowConverters';
export * from './validation';

export function useWorkflows() {
  const data = useWorkflowsData();
  const mutations = useWorkflowsMutations({
    emailTemplates: data.emailTemplates,
    whatsTemplates: data.whatsTemplates,
    reload: data.reload,
    loadExecutions: data.loadExecutions,
  });

  const metrics = useMemo(() => ({
    total: data.workflows.length,
    active: data.workflows.filter((w) => w.is_active).length,
    totalExecs: data.workflows.reduce((sum, w) => sum + (w.run_count || 0), 0),
  }), [data.workflows]);

  return { ...data, ...mutations, metrics };
}
