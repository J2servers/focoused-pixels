import { DashboardFinancials } from './DashboardFinancials';
import { DashboardConversion } from './DashboardConversion';
import { DashboardSalesGrid } from './DashboardSalesGrid';
import { DashboardSections } from './DashboardSections';
import { DashboardExtras } from './DashboardExtras';
import type { DashboardViewProps } from './types';

export function DesktopDashboard({ m, abandoned }: DashboardViewProps) {
  return (
    <div className="grid grid-cols-12 gap-3 auto-rows-min">
      <DashboardFinancials m={m} />
      <DashboardConversion m={m} abandoned={abandoned} />
      <DashboardSalesGrid m={m} />
      <DashboardSections m={m} />
      <DashboardExtras m={m} />
    </div>
  );
}
