import { useState, useMemo, useCallback } from 'react';
import { SYSTEM_EVENTS } from '@/components/admin/templates/TemplateConstants';
import type {
  EmailTemplate, WhatsAppTemplate, FilterStatus, SortField, ViewMode, TemplateMetrics,
} from './types';

interface FilterableTemplate {
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** UI state for search, filter, sort, view mode + derived filtered lists & metrics. */
export function useTemplatesFilters(
  emailTemplates: EmailTemplate[],
  whatsTemplates: WhatsAppTemplate[],
  templateStats: Record<string, number>,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const applyFilters = useCallback(
    <T extends FilterableTemplate>(list: T[], extraSearch?: (item: T) => string): T[] => {
      let result = list;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(t =>
          t.name.toLowerCase().includes(q) ||
          (extraSearch?.(t) ?? '').toLowerCase().includes(q),
        );
      }
      if (filterStatus === 'active') result = result.filter(t => t.is_active);
      if (filterStatus === 'inactive') result = result.filter(t => !t.is_active);
      return [...result].sort((a, b) => {
        const va = String((a as Record<string, unknown>)[sortField] ?? '');
        const vb = String((b as Record<string, unknown>)[sortField] ?? '');
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    },
    [searchQuery, filterStatus, sortField, sortAsc],
  );

  const filteredEmails = useMemo(
    () => applyFilters(emailTemplates, t => t.subject),
    [emailTemplates, applyFilters],
  );

  const filteredWhats = useMemo(
    () => applyFilters(whatsTemplates, t => t.content),
    [whatsTemplates, applyFilters],
  );

  const metrics: TemplateMetrics = useMemo(() => {
    const matchesEvent = (eventValue: string) =>
      emailTemplates.some(t => t.name === eventValue) ||
      whatsTemplates.some(t => t.name === eventValue);
    const uncoveredEvents = SYSTEM_EVENTS.filter(ev => !matchesEvent(ev.value));
    return {
      emailTotal: emailTemplates.length,
      whatsTotal: whatsTemplates.length,
      emailActive: emailTemplates.filter(t => t.is_active).length,
      whatsActive: whatsTemplates.filter(t => t.is_active).length,
      totalSends: Object.values(templateStats).reduce((sum, n) => sum + n, 0),
      coveredCount: SYSTEM_EVENTS.length - uncoveredEvents.length,
      uncoveredEvents,
    };
  }, [emailTemplates, whatsTemplates, templateStats]);

  return {
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    sortField, setSortField,
    sortAsc, setSortAsc,
    viewMode, setViewMode,
    filteredEmails,
    filteredWhats,
    metrics,
  };
}
