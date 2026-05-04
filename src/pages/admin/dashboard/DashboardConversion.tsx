import { MetricCard as M, ChartCard, CustomTooltip } from '@/components/admin/dashboard';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, BarChart, Bar, Line,
} from 'recharts';
import {
  Target, UserPlus, FileText, ShoppingCart, XCircle, DollarSign, Repeat,
  CheckCircle, TrendingUp, ShoppingBag,
} from 'lucide-react';
import type { DashboardViewProps } from './types';

export function DashboardConversion({ m, abandoned }: DashboardViewProps) {
  const funnelData = m.funnelData || [];
  const conversaoPorDia = m.conversaoPorDia || [];
  const ticketPorMes = m.ticketPorMes || [];

  return (
    <>
      <ChartCard title="Funil de Vendas (Mês)" className="col-span-4" height="h-44">
        <div className="h-full flex items-center">
          <div className="w-full space-y-1.5">
            {funnelData.map((stage, i: number) => {
              const s = stage as { stage: string; value: number; color: string };
              const maxVal = (funnelData[0] as { value: number } | undefined)?.value || 1;
              const pct = maxVal > 0 ? (s.value / maxVal * 100) : 0;
              const next = funnelData[i + 1] as { value: number } | undefined;
              const convRate = next && s.value > 0 ? (next.value / s.value * 100) : null;
              return (
                <div key={s.stage} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-16 text-right shrink-0">{s.stage}</span>
                  <div className="flex-1 h-5 bg-white/[0.06] rounded-md overflow-hidden relative">
                    <div className="h-full rounded-md transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, background: s.color }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{s.value.toLocaleString('pt-BR')}</span>
                  </div>
                  {convRate !== null && (
                    <span className="text-[9px] text-white/40 w-10 shrink-0">→{convRate.toFixed(0)}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Conversão Diária (7 dias)" className="col-span-4" height="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={conversaoPorDia}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} width={30} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} width={30} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="left" dataKey="visitas" fill="hsl(210,80%,55%)" radius={[3,3,0,0]} name="Visitas" opacity={0.6} />
            <Bar yAxisId="left" dataKey="pedidos" fill="hsl(145,63%,42%)" radius={[3,3,0,0]} name="Pedidos" />
            <Line yAxisId="right" type="monotone" dataKey="taxa" stroke="hsl(45,93%,47%)" strokeWidth={2} dot={{ r: 3 }} name="Taxa %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <ChartCard title="Ticket Médio (6 meses)" className="col-span-2" height="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ticketPorMes}>
              <defs><linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(145,63%,42%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(145,63%,42%)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="mes" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} width={35} tickFormatter={(v: number) => `R$${v.toFixed(0)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ticket" stroke="hsl(145,63%,42%)" fill="url(#ticketGrad)" strokeWidth={2} name="Ticket Médio (R$)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <M label="Conv. Geral" value={m.overallConversion} icon={Target} color="bg-emerald-600" format="percent" />
        <M label="Visita→Lead" value={m.visitToLead} icon={UserPlus} color="bg-blue-600" format="percent" />
        <M label="Lead→Orç." value={m.leadToQuote} icon={FileText} color="bg-violet-600" format="percent" />
        <M label="Orç.→Pedido" value={m.quoteToOrder} icon={ShoppingCart} color="bg-teal-600" format="percent" />
        <M label="Abandonos" value={m.abandonedCarts} icon={XCircle} color="bg-red-600" />
        <M label="R$ Abandonado" value={m.abandonedValue} icon={DollarSign} color="bg-red-700" format="currency" />
        <M label="Recorrentes" value={m.repeatCustomers} icon={Repeat} color="bg-purple-600" />
        <M label="Taxa Recorr." value={m.repeatRate} icon={Repeat} color="bg-purple-700" format="percent" />
        <M label="Sessoes Aband." value={abandoned.sessionsAbandoned} icon={ShoppingBag} color="bg-rose-600" />
        <M label="Recuperadas" value={abandoned.sessionsRecovered} icon={CheckCircle} color="bg-emerald-600" />
        <M label="Tx Recuperacao" value={abandoned.recoveryRate} icon={TrendingUp} color="bg-emerald-700" format="percent" />
        <M label="Top Abandono" value={abandoned.topProductName} icon={ShoppingBag} color="bg-rose-700" format="text" />
      </div>
    </>
  );
}
