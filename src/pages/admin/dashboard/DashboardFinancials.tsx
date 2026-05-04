import {
  MetricCard as M, HeroKPI, ChartCard, CustomTooltip,
} from '@/components/admin/dashboard';
import {
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, Clock, AlertTriangle, CheckCircle,
} from 'lucide-react';
import type { DashboardMetricsData } from './types';

export function DashboardFinancials({ m }: { m: DashboardMetricsData }) {
  const receitaStatusResumoMes = m.receitaStatusResumoMes || [];
  const receitaComparativa7d = m.receitaComparativa7d || [];

  return (
    <>
      <div className="col-span-3"><HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita do Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} subtitle={`${m.vendasMes} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" subtitle={`Hoje: R$ ${m.ticketMedioHoje.toFixed(2)}`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita Líquida 12m" value={m.receitaLiquida} icon={TrendingUp} color="bg-gradient-to-br from-teal-500 to-teal-600" subtitle={`Margem: ${m.margemLiquida.toFixed(1)}%`} /></div>

      <div className="col-span-4 liquid-glass rounded-2xl shadow-lg p-4 space-y-3">
        <p className="text-xs font-semibold text-white">Leitura financeira rápida</p>
        <p className="text-[10px] text-white/40">Receita considera apenas pedidos com pagamento confirmado.</p>
        <div className="grid grid-cols-2 gap-2">
          <M label="Receita Real" value={m.receitaTotal} icon={DollarSign} color="bg-emerald-600" format="currency" />
          <M label="A Receber" value={m.receitaPendente} icon={Clock} color="bg-amber-600" format="currency" />
          <M label="Falhou" value={m.receitaFalhada} icon={AlertTriangle} color="bg-red-600" format="currency" />
          <M label="Pagos" value={m.pagamentosPagos} icon={CheckCircle} color="bg-blue-600" />
        </div>
      </div>

      <ChartCard title="Status financeiro do mês" className="col-span-4" height="h-40">
        {receitaStatusResumoMes.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={receitaStatusResumoMes} cx="50%" cy="50%" innerRadius="42%" outerRadius="76%" paddingAngle={4} dataKey="value">
                {receitaStatusResumoMes.map((entry, index: number) => <Cell key={index} fill={(entry as { fill: string }).fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[10px] text-white/40 text-center pt-8">Sem movimentação financeira</p>
        )}
      </ChartCard>

      <ChartCard title="Recebido x aguardando (7 dias)" className="col-span-4" height="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={receitaComparativa7d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="recebido" fill="hsl(145,63%,42%)" radius={[3, 3, 0, 0]} name="Recebido" />
            <Bar dataKey="aguardando" fill="hsl(45,93%,47%)" radius={[3, 3, 0, 0]} name="Aguardando" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}
