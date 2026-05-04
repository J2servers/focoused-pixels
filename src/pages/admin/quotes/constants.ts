import type { Quote } from '@/hooks/useAdminQuotes';

export const QUOTE_STATUS_MAP: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'info'; color: string }> = {
  pending: { label: 'Pendente', variant: 'warning', color: 'amber' },
  approved: { label: 'Aprovado', variant: 'success', color: 'green' },
  rejected: { label: 'Rejeitado', variant: 'danger', color: 'red' },
  converted: { label: 'Convertido', variant: 'info', color: 'blue' },
};

export const fmtBRL = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export type { Quote };
