import type { EmailTemplate, WhatsAppTemplate } from '@/components/admin/templates/TemplateConstants';

export type FilterStatus = 'all' | 'active' | 'inactive';
export type SortField = 'name' | 'created_at' | 'updated_at';
export type ViewMode = 'grid' | 'list';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface TemplateMetrics {
  emailTotal: number;
  whatsTotal: number;
  emailActive: number;
  whatsActive: number;
  totalSends: number;
  coveredCount: number;
  uncoveredEvents: ReadonlyArray<{ value: string; label: string }>;
}

export type { EmailTemplate, WhatsAppTemplate };
