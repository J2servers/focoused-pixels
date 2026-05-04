import {
  MetricCard as M, HeroKPI, ChartCard, CustomTooltip,
} from '@/components/admin/dashboard';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip,
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, Clock, Eye, UserPlus, Package,
  AlertTriangle, ShoppingBag,
} from 'lucide-react';
import type { DashboardViewProps } from './types';

export function MobileDashboard({ m, abandoned }: DashboardViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <HeroKPI label="Receita Hoje" value={m.receitaHoje as number} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} />
        <HeroKPI label="Receita Mês" value={m.receitaMes as number} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita as number} />
        <HeroKPI label="Ticket Médio" value={m.ticketMedio as number} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <HeroKPI label="Vendas Pendentes" value={m.vendasPendentes as number} icon={Clock} color="bg-gradient-to-br from-amber-500 to-amber-600" format="number" />
      </div>
      <ChartCard title="Receita 7 dias" height="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={(m.vendasPorDia as unknown[]) || []}>
            <defs><linearGradient id="mRecGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#mRecGrad)" strokeWidth={2} name="Receita" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="grid grid-cols-2 gap-2">
        <M label="Receita Real" value={m.receitaTotal as number} icon={DollarSign} color="bg-emerald-700" format="currency" />
        <M label="A Receber" value={m.receitaPendente as number} icon={Clock} color="bg-amber-600" format="currency" />
        <M label="Visitas Hoje" value={m.visitasHoje as number} icon={Eye} color="bg-cyan-600" />
        <M label="Leads Hoje" value={m.leadsHoje as number} icon={UserPlus} color="bg-pink-600" />
        <M label="Produtos Ativos" value={m.produtosAtivos as number} icon={Package} color="bg-orange-600" href="/admin/produtos" />
        <M label="Estoque Baixo" value={m.produtosEstoqueBaixo as number} icon={AlertTriangle} color="bg-yellow-600" />
        <M label="Sessoes Aband." value={abandoned.sessionsAbandoned as number} icon={ShoppingBag} color="bg-rose-600" />
        <M label="Top Abandono" value={abandoned.topProductName as string} icon={ShoppingBag} color="bg-rose-700" format="text" />
      </div>
    </div>
  );
}
