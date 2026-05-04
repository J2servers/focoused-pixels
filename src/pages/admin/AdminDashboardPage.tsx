import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useAbandonedCartInsights, useTriggerAbandonedCartRecovery } from '@/hooks/useAbandonedCartInsights';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { MobileDashboard } from './dashboard/MobileDashboard';
import { DesktopDashboard } from './dashboard/DesktopDashboard';
import { EMPTY_ABANDONED } from './dashboard/types';

const DASHBOARD_GUIDE_STEPS = [
  { title: 'Resumo financeiro', description: 'Veja receita total, ticket médio e comparação com período anterior nos cards do topo.' },
  { title: 'Gráficos de vendas', description: 'Analise tendências de faturamento por dia, semana ou mês nos gráficos interativos.' },
  { title: 'Alertas de estoque', description: 'Produtos com estoque baixo aparecem em destaque para reposição imediata.' },
  { title: 'Atividade recente', description: 'Acompanhe pedidos, cadastros e ações recentes no feed de atividades.' },
  { title: 'Ranking de produtos', description: 'Identifique os produtos mais vendidos e com melhor margem de lucro.' },
  { title: 'Visitas ao site', description: 'Monitore o tráfego de visitantes e páginas mais acessadas.' },
];

const AdminDashboardPage = () => {
  const { data: m, isLoading } = useDashboardMetrics();
  const { data: abandonedInsights } = useAbandonedCartInsights();
  const triggerRecovery = useTriggerAbandonedCartRecovery();
  const isMobile = useIsMobile();
  const abandoned = abandonedInsights || EMPTY_ABANDONED;

  if (isLoading || !m) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-5">
          <AdminPageGuide title="📊 Guia do Dashboard" description="Visão geral de vendas, pedidos, leads e métricas do negócio em tempo real." steps={DASHBOARD_GUIDE_STEPS} />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl liquid-glass animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-3 flex justify-end">
        <Button onClick={() => triggerRecovery.mutate()} disabled={triggerRecovery.isPending} className="admin-btn admin-btn-save gap-2">
          <RefreshCw className={cn('h-4 w-4', triggerRecovery.isPending && 'animate-spin')} />
          {triggerRecovery.isPending ? 'Executando recuperação...' : 'Executar recuperação de carrinhos'}
        </Button>
      </div>
      {isMobile ? <MobileDashboard m={m} abandoned={abandoned} /> : <DesktopDashboard m={m} abandoned={abandoned} />}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
