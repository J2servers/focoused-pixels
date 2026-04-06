import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useAbandonedCartInsights, useTriggerAbandonedCartRecovery } from '@/hooks/useAbandonedCartInsights';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  MetricCard as M, HeroKPI, SectionLabel as Sec, ChartCard, PieCard, CustomTooltip, PIE_COLORS,
} from '@/components/admin/dashboard';
import {
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area,
  BarChart, Bar,
} from 'recharts';
import {
  DollarSign, ShoppingCart, TrendingUp, TrendingDown, Users, Package,
  Star, Eye, CreditCard, QrCode, Landmark, Clock, Truck, CheckCircle,
  AlertTriangle, Wrench, Shield, FileText, Tag, Percent, MessageSquare,
  Boxes, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Activity,
  Globe, UserPlus, Heart, Webhook, Layers, Target, Zap, Filter,
  PieChart as PieChartIcon, Award, RefreshCw, ShoppingBag, Repeat, XCircle
} from 'lucide-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

// ===== MOBILE DASHBOARD =====
function MobileDashboard({ m, abandoned }: { m: any; abandoned: any }) {
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
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
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


// ===== DESKTOP DASHBOARD =====
function DesktopDashboard({ m, abandoned }: { m: any; abandoned: any }) {
  const funnelData = m.funnelData || [];
  const conversaoPorDia = m.conversaoPorDia || [];
  const ticketPorMes = m.ticketPorMes || [];
  const paymentDistribution = m.paymentDistribution || [];
  const receitaStatusResumoMes = m.receitaStatusResumoMes || [];
  const receitaComparativa7d = m.receitaComparativa7d || [];
  const statusDistribution = m.statusDistribution || [];
  const vendasPorDia = m.vendasPorDia || [];
  const receitaPorMes = m.receitaPorMes || [];
  const productionDistribution = m.productionDistribution || [];
  const leadsPorDia = m.leadsPorDia || [];
  const visitasPorDia = m.visitasPorDia || [];
  const productsDistribution = m.productsDistribution || [];
  const quotesDistribution = m.quotesDistribution || [];
  const reviewsDistribution = m.reviewsDistribution || [];
  const whatsappDistribution = m.whatsappDistribution || [];
  const caixaPorDia = m.caixaPorDia || [];

  return (
    <div className="grid grid-cols-12 gap-3 auto-rows-min">
      {/* ROW 1: Hero KPIs */}
      <div className="col-span-3"><HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita do Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} subtitle={`${m.vendasMes} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" subtitle={`Hoje: R$ ${m.ticketMedioHoje.toFixed(2)}`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita Líquida 12m" value={m.receitaLiquida} icon={TrendingUp} color="bg-gradient-to-br from-teal-500 to-teal-600" subtitle={`Margem: ${m.margemLiquida.toFixed(1)}%`} /></div>

      {/* ROW 2: Financial overview cards */}
      <Card className="col-span-4 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-white">Leitura financeira rápida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
            Receita considera apenas pedidos com pagamento confirmado. Pedidos aguardando boleto, PIX pendente ou pagamentos falhados ficam fora do faturamento.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <M label="Receita Real" value={m.receitaTotal} icon={DollarSign} color="bg-emerald-600" format="currency" />
            <M label="A Receber" value={m.receitaPendente} icon={Clock} color="bg-amber-600" format="currency" />
            <M label="Falhou" value={m.receitaFalhada} icon={AlertTriangle} color="bg-red-600" format="currency" />
            <M label="Pagos" value={m.pagamentosPagos} icon={CheckCircle} color="bg-blue-600" />
          </div>
        </CardContent>
      </Card>

      <ChartCard title="Status financeiro do mês" className="col-span-4" height="h-40">
        {receitaStatusResumoMes.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={receitaStatusResumoMes} cx="50%" cy="50%" innerRadius="42%" outerRadius="76%" paddingAngle={4} dataKey="value">
                {receitaStatusResumoMes.map((entry: any, index: number) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-8">Sem movimentação financeira no período</p>
        )}
      </ChartCard>

      <ChartCard title="Recebido x aguardando (7 dias)" className="col-span-4" height="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={receitaComparativa7d}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="recebido" fill="hsl(145,63%,42%)" radius={[3, 3, 0, 0]} name="Recebido" />
            <Bar dataKey="aguardando" fill="hsl(45,93%,47%)" radius={[3, 3, 0, 0]} name="Aguardando" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ROW 2.5: Conversion + Funnel */}
      <ChartCard title="Funil de Vendas (Mês)" className="col-span-4" height="h-44">
        <div className="h-full flex items-center">
          <div className="w-full space-y-1.5">
            {funnelData.map((stage: any, i: number) => {
              const maxVal = funnelData[0]?.value || 1;
              const pct = maxVal > 0 ? (stage.value / maxVal * 100) : 0;
              const nextStage = funnelData[i + 1];
              const convRate = nextStage && stage.value > 0 ? (nextStage.value / stage.value * 100) : null;
              return (
                <div key={stage.stage} className="flex items-center gap-2">
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))] w-16 text-right shrink-0">{stage.stage}</span>
                  <div className="flex-1 h-5 bg-[hsl(var(--admin-sidebar))] rounded-md overflow-hidden relative">
                    <div className="h-full rounded-md transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, background: stage.color }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{stage.value.toLocaleString('pt-BR')}</span>
                  </div>
                  {convRate !== null && (
                    <span className="text-[9px] text-[hsl(var(--admin-text-muted))] w-10 shrink-0">→{convRate.toFixed(0)}%</span>
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={30} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={30} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
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
              <XAxis dataKey="mes" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={35} tickFormatter={(v: number) => `R$${v.toFixed(0)}`} />
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

      {/* ROW 3: Charts */}
      <ChartCard title="Receita vs Custos (6 meses)" className="col-span-5" height="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={receitaPorMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} width={35} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#recGrad)" strokeWidth={2.5} name="Receita recebida" />
            <Area type="monotone" dataKey="aguardando" stroke="hsl(45,93%,47%)" fillOpacity={0} strokeWidth={2} name="Aguardando pagamento" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie charts */}
      <div className="col-span-3 grid grid-rows-2 gap-3">
        <PieCard title="Pagamentos" data={paymentDistribution} />
        <PieCard title="Status Pedidos" data={statusDistribution.slice(0, 5)} />
      </div>

      {/* ROW 4: Vendas + Financeiro */}
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
        <M label="Saldo Dia" value={m.saldoDia} icon={Wallet} color={m.saldoDia >= 0 ? "bg-emerald-600" : "bg-red-700"} format="currency" />
        <M label="Entradas Mês" value={m.entradasMes} icon={ArrowUpRight} color="bg-green-700" format="currency" />
        <M label="Saídas Mês" value={m.saidasMes} icon={ArrowDownRight} color="bg-red-700" format="currency" />
        <M label="Saldo Mês" value={m.saldoMes} icon={Wallet} color={m.saldoMes >= 0 ? "bg-emerald-700" : "bg-red-800"} format="currency" />
        <M label="PIX (R$)" value={m.pixTotal} icon={QrCode} color="bg-teal-600" format="currency" />
        <M label="Cartão (R$)" value={m.cardTotal} icon={CreditCard} color="bg-blue-600" format="currency" />
      </div>

      {/* ROW 5: Produção + Leads + Tráfego + Produtos */}
      <div className="col-span-3">
        <Sec icon={Wrench} color="bg-blue-600">Produção</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {productionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={productionDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{productionDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Aguardando" value={m.prodPending} icon={Clock} color="bg-gray-600" href="/admin/kanban" />
          <M label="Em Produção" value={m.prodInProduction} icon={Wrench} color="bg-blue-600" href="/admin/kanban" />
          <M label="Prontos" value={m.prodReady} icon={CheckCircle} color="bg-green-600" />
          <M label="Tempo Médio" value={m.tempoMedioProdDias} icon={Clock} color="bg-indigo-600" format="days" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Users} color="bg-pink-600">Clientes & Leads</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={leadsPorDia}>
              <defs><linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(330,70%,55%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(330,70%,55%)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="hsl(330,70%,55%)" fill="url(#leadsGrad)" strokeWidth={2} name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Total Leads" value={m.totalLeads} icon={Users} color="bg-violet-600" href="/admin/leads" />
          <M label="Leads Hoje" value={m.leadsHoje} icon={UserPlus} color="bg-violet-700" />
          <M label="Clientes Únicos" value={m.uniqueCustomers} icon={Users} color="bg-pink-600" />
          <M label="Taxa Conv." value={m.taxaConversao} icon={Target} color="bg-amber-600" format="percent" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Eye} color="bg-cyan-600">Tráfego</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitasPorDia}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visitas" fill="hsl(190,70%,50%)" radius={[3,3,0,0]} name="Visitas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Visitas Hoje" value={m.visitasHoje} icon={Eye} color="bg-cyan-600" />
          <M label="Visitas Mês" value={m.visitasMes} icon={Eye} color="bg-blue-600" />
          <M label="Sessões Únicas" value={m.sessoesUnicas} icon={Users} color="bg-blue-700" />
          <M label="Auditoria Hoje" value={m.auditoriaHoje} icon={Activity} color="bg-slate-600" href="/admin/logs" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Package} color="bg-orange-600">Produtos & Estoque</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {productsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={productsDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{productsDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Total" value={m.totalProdutos} icon={Package} color="bg-orange-600" href="/admin/produtos" />
          <M label="Sem Estoque" value={m.produtosSemEstoque} icon={AlertTriangle} color="bg-red-600" />
          <M label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-600" />
          <M label="Valor Estoque" value={m.valorEstoqueProdutos} icon={DollarSign} color="bg-emerald-600" format="currency" />
        </div>
      </div>

      {/* ROW 6: Orçamentos + Avaliações + WhatsApp + Caixa */}
      <div className="col-span-3">
        <Sec icon={FileText} color="bg-violet-600">Orçamentos</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {quotesDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={quotesDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{quotesDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Total" value={m.totalOrcamentos} icon={FileText} color="bg-violet-600" href="/admin/orcamentos" />
          <M label="Pendentes" value={m.orcamentosPendentes} icon={Clock} color="bg-yellow-600" />
          <M label="Convertidos" value={m.orcamentosConvertidos} icon={TrendingUp} color="bg-blue-600" />
          <M label="Conv. %" value={m.taxaConversaoOrcamento} icon={Target} color="bg-emerald-600" format="percent" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Star} color="bg-amber-600">Avaliações</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {reviewsDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewsDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Avaliações" radius={[3,3,0,0]}>{reviewsDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Total" value={m.totalReviews} icon={Star} color="bg-amber-600" href="/admin/avaliacoes" />
          <M label="Média" value={m.mediaGeral.toFixed(1)} icon={Star} color="bg-amber-700" format="text" />
          <M label="Pendentes" value={m.reviewsPendentes} icon={Clock} color="bg-yellow-600" />
          <M label="Aprovadas" value={m.reviewsAprovadas} icon={CheckCircle} color="bg-green-600" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={MessageSquare} color="bg-green-600">WhatsApp</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {whatsappDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={whatsappDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{whatsappDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Enviadas" value={m.whatsappEnviadas} icon={MessageSquare} color="bg-green-600" href="/admin/whatsapp" />
          <M label="Erros" value={m.whatsappErros} icon={AlertTriangle} color="bg-red-600" />
          <M label="Online" value={m.whatsappConectadas} icon={Zap} color="bg-emerald-600" />
          <M label="Banners" value={m.bannersAtivos} icon={Globe} color="bg-pink-600" href="/admin/hero" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Wallet} color="bg-fuchsia-600">Fluxo de Caixa</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={caixaPorDia}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="entradas" fill="hsl(145,63%,42%)" radius={[3,3,0,0]} name="Entradas" />
              <Bar dataKey="saidas" fill="hsl(0,72%,51%)" radius={[3,3,0,0]} name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Cupons Ativos" value={m.cuponsAtivos} icon={Tag} color="bg-fuchsia-600" href="/admin/cupons" />
          <M label="Promoções" value={m.promocoesAtivas} icon={Percent} color="bg-orange-600" href="/admin/promocoes" />
          <M label="Val. Est. MP" value={m.valorEstoqueMateriais} icon={DollarSign} color="bg-amber-700" format="currency" />
          <M label="Mat. Baixos" value={m.materiaisEstoqueBaixo} icon={Boxes} color={m.materiaisEstoqueBaixo > 0 ? "bg-red-600" : "bg-green-600"} />
        </div>
      </div>

      {/* ROW 7: extras */}
      <div className="col-span-12 grid grid-cols-12 gap-2">
        <M label="Boleto (R$)" value={m.boletoTotal} icon={Landmark} color="bg-slate-600" format="currency" />
        <M label="Leads Semana" value={m.leadsSemana} icon={UserPlus} color="bg-violet-600" />
        <M label="Leads Mês" value={m.leadsMes} icon={UserPlus} color="bg-purple-600" />
        <M label="Desinscritos" value={m.leadsDesinscritos} icon={Users} color="bg-gray-600" />
        <M label="Clientes Mês" value={m.newCustomersMonth} icon={UserPlus} color="bg-rose-600" />
        <M label="Orç. Hoje" value={m.orcamentosHoje} icon={FileText} color="bg-violet-700" />
        <M label="Orç. Mês" value={m.orcamentosMes} icon={FileText} color="bg-purple-700" />
        <M label="Mov. Hoje" value={m.movimentacoesHoje} icon={RefreshCw} color="bg-blue-600" />
        <M label="Webhooks" value={m.webhooksRecebidos} icon={Webhook} color="bg-indigo-600" />
        <M label="WH Erros" value={m.webhooksErro} icon={AlertTriangle} color={m.webhooksErro > 0 ? "bg-red-600" : "bg-green-600"} />
        <M label="Inscritos" value={m.leadsInscritos} icon={Heart} color="bg-green-600" />
        <M label="Categorias" value={m.totalCategorias} icon={Layers} color="bg-indigo-600" href="/admin/categorias" />
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
const AdminDashboardPage = () => {
  const { data: m, isLoading } = useDashboardMetrics();
  const { data: abandonedInsights } = useAbandonedCartInsights();
  const triggerRecovery = useTriggerAbandonedCartRecovery();
  const isMobile = useIsMobile();
  const abandoned = abandonedInsights || {
    sessionsAbandoned: 0, sessionsRecovered: 0, remindersSent: 0,
    recoveryRate: 0, totalAbandonedValue: 0, topProductName: 'N/A', topProducts: [],
  };

  if (isLoading || !m) {
    return (
      <AdminLayout title="Dashboard">
      <div className="space-y-5">
        <AdminPageGuide
          title="📊 Guia do Dashboard"
          description="Visão geral de vendas, pedidos, leads e métricas do negócio em tempo real."
          steps={[
            { title: "Resumo financeiro", description: "Veja receita total, ticket médio e comparação com período anterior nos cards do topo." },
            { title: "Gráficos de vendas", description: "Analise tendências de faturamento por dia, semana ou mês nos gráficos interativos." },
            { title: "Alertas de estoque", description: "Produtos com estoque baixo aparecem em destaque para reposição imediata." },
            { title: "Atividade recente", description: "Acompanhe pedidos, cadastros e ações recentes no feed de atividades." },
            { title: "Ranking de produtos", description: "Identifique os produtos mais vendidos e com melhor margem de lucro." },
            { title: "Visitas ao site", description: "Monitore o tráfego de visitantes e páginas mais acessadas." },
          ]}
        />

        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-[hsl(var(--admin-sidebar))]" />
          ))}
        </div>
      </div>
    </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-3 flex justify-end">
        <Button
          variant="outline" size="sm"
          onClick={() => triggerRecovery.mutate()}
          disabled={triggerRecovery.isPending}
          className="gap-2 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))]"
        >
          <RefreshCw className={cn("h-4 w-4", triggerRecovery.isPending && "animate-spin")} />
          {triggerRecovery.isPending ? 'Executando recuperação...' : 'Executar recuperação de carrinhos'}
        </Button>
      </div>
      {isMobile ? <MobileDashboard m={m} abandoned={abandoned} /> : <DesktopDashboard m={m} abandoned={abandoned} />}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
