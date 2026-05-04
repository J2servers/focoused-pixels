import { useTemplatesData } from './useTemplatesData';
import { useTemplatesFilters } from './useTemplatesFilters';
import { useTemplatesMutations } from './useTemplatesMutations';
import { useTemplatesActions } from './useTemplatesActions';

export type { FilterStatus, SortField, ViewMode } from './types';

/**
 * Aggregator hook composing data, filters, mutations, and actions.
 * Public API matches the legacy `useTemplates()` 1:1 to keep callers untouched.
 */
export function useTemplates() {
  const data = useTemplatesData();
  const filters = useTemplatesFilters(data.emailTemplates, data.whatsTemplates, data.templateStats);
  const mutations = useTemplatesMutations(data.reload);
  const actions = useTemplatesActions(data.emailTemplates, data.whatsTemplates, data.reload);

  return {
    loading: data.loading,
    emailTemplates: data.emailTemplates,
    whatsTemplates: data.whatsTemplates,
    templateStats: data.templateStats,
    workflowLinks: data.workflowLinks,
    reload: data.reload,
    ...filters,
    ...mutations,
    ...actions,
  };
}
