import { ChartCard, PieCard, CustomTooltip, MetricCard as M } from '@/components/admin/dashboard';
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from 'recharts';
import {
  ShoppingCart, DollarSign, Award, Clock, CheckCircle, Truck, AlertTriangle,
  TrendingDown, Boxes, Wrench, Landmark, Percent, PieChart as PieChartIcon,
  ArrowUpRight, ArrowDownRight, Wallet, QrCode, CreditCard,
} from 'lucide-react';
import type { DashboardMetricsData } from './types';

export function DashboardSalesGrid({ m }: { m: DashboardMetricsData }) {
  const receitaPorMes = m.receitaPorMes || [];
  const vendasPorDia = m.vendasPorDia || [];
  const paymentDistribution = m.paymentDistribution || [];
  const statusDistribution = m.statusDistribution || [];

  return (
    <>
      <ChartCard title="Receita vs Custos (6 meses)" className="col-span-5" height="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={receitaPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="receita" stroke="hsl(145,63%,42%)" strokeWidth={2.5} dot={{ r: 3 }} name="Receita" />
            <Line type="monotone" dataKey="custos" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} name="Custos" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Vendas & Receita (7 dias)" className="col-span-4" height="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={vendasPorDia}>
            <defs><linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#recGrad)" strokeWidth={2.5} name="Receita recebida" />
            <Area type="monotone" dataKey="aguardando" stroke="hsl(45,93%,47%)" fillOpacity={0} strokeWidth={2} name="Aguardando pagamento" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="col-span-3 grid grid-rows-2 gap-3">
        <PieCard title="Pagamentos" data={paymentDistribution} />
        <PieCard title="Status Pedidos" data={statusDistribution.slice(0, 5)} />
      </div>

      <div className="col-span-6 grid grid-cols-5 gap-2">
        <M label="Vendas Hoje" value={m.vendasHoje} icon={ShoppingCart} color="bg-emerald-600" href="/admin/pedidos" />
        <M label="Vendas Semana" value={m.vendasSemana} icon={ShoppingCart} color="bg-emerald-700" />
        <M label="Vendas Mês" value={m.vendasMes} icon={ShoppingCart} color="bg-teal-600" trend={m.crescimentoVendas} />
        <M label="Vendas Ano" value={m.vendasAno} icon={ShoppingCart} color="bg-teal-700" />
        <M label="Total Geral" value={m.vendasTotal} icon={ShoppingCart} color="bg-cyan-700" />
        <M label="Receita Semana" value={m.receitaSemana} icon={DollarSign} color="bg-green-600" format="currency" />
        <M label="Receita Ano" value={m.receitaAno} icon={DollarSign} color="bg-green-700" format="currency" />
        <M label="Maior Venda" value={m.maiorVenda} icon={Award} color="bg-amber-600" format="currency" />
        <M label="Pendentes" value={m.vendasPendentes} icon={Clock} color="bg-yellow-600" href="/admin/pedidos" />
        <M label="Confirmadas" value={m.vendasConfirmadas} icon={CheckCircle} color="bg-blue-600" />
        <M label="Enviadas" value={m.vendasEnviadas} icon={Truck} color="bg-teal-600" />
        <M label="Entregues" value={m.vendasEntregues} icon={CheckCircle} color="bg-green-600" />
        <M label="Canceladas" value={m.vendasCanceladas} icon={AlertTriangle} color="bg-red-600" />
        <M label="Pgtos Pagos" value={m.pagamentosPagos} icon={CheckCircle} color="bg-green-700" />
        <M label="Pgtos Falhados" value={m.pagamentosFalhados} icon={AlertTriangle} color="bg-red-700" />
      </div>

      <div className="col-span-6 grid grid-cols-5 gap-2">
        <M label="Receita Bruta 12m" value={m.receitaBruta12m} icon={DollarSign} color="bg-emerald-600" format="currency" />
        <M label="Custos Totais" value={m.custoTotal} icon={TrendingDown} color="bg-red-600" format="currency" />
        <M label="Custo Material" value={m.custoMaterial} icon={Boxes} color="bg-red-700" format="currency" />
        <M label="Custo MdO" value={m.custoMaoDeObra} icon={Wrench} color="bg-orange-600" format="currency" />
        <M label="Impostos" value={m.impostos} icon={Landmark} color="bg-amber-600" format="currency" />
        <M label="Alíquota" value={m.aliquotaEfetiva} icon={Percent} color="bg-amber-700" format="percent" />
        <M label="Margem Líq." value={m.margemLiquida} icon={PieChartIcon} color="bg-blue-700" format="percent" />
        <M label="Entradas Hoje" value={m.entradasHoje} icon={ArrowUpRight} color="bg-green-600" format="currency" />
        <M label="Saídas Hoje" value={m.saidasHoje} icon={ArrowDownRight} color="bg-red-600" format="currency" />
        <M label="Saldo Dia" value={m.saldoDia} icon={Wallet} color={m.saldoDia >= 0 ? 'bg-emerald-600' : 'bg-red-700'} format="currency" />
        <M label="Entradas Mês" value={m.entradasMes} icon={ArrowUpRight} color="bg-green-700" format="currency" />
        <M label="Saídas Mês" value={m.saidasMes} icon={ArrowDownRight} color="bg-red-700" format="currency" />
        <M label="Saldo Mês" value={m.saldoMes} icon={Wallet} color={m.saldoMes >= 0 ? 'bg-emerald-700' : 'bg-red-800'} format="currency" />
        <M label="PIX (R$)" value={m.pixTotal} icon={QrCode} color="bg-teal-600" format="currency" />
        <M label="Cartão (R$)" value={m.cardTotal} icon={CreditCard} color="bg-blue-600" format="currency" />
      </div>
    </>
  );
}
