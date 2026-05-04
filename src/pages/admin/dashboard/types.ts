import type { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import type { AbandonedCartInsights } from '@/hooks/useAbandonedCartInsights';

export type DashboardMetricsData = NonNullable<ReturnType<typeof useDashboardMetrics>['data']>;

export type AbandonedSummary = AbandonedCartInsights;

export const EMPTY_ABANDONED: AbandonedSummary = {
  sessionsAbandoned: 0,
  sessionsRecovered: 0,
  remindersSent: 0,
  recoveryRate: 0,
  totalAbandonedValue: 0,
  topProductName: 'N/A',
  topProducts: [],
};

export interface DashboardViewProps {
  m: DashboardMetricsData;
  abandoned: AbandonedSummary;
}
