import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
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


// ===== METRIC CARD - fluid sizing =====
function M({ label, value, icon: Icon, color, href, format = 'number', trend }: {
  label: string; value: number | string; icon: React.ElementType; color: string;
  href?: string; format?: 'number' | 'currency' | 'percent' | 'text' | 'days'; trend?: number | null;
}) {
  const fmt = typeof value === 'string' ? value :
    format === 'currency' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
    format === 'percent' ? `${value.toFixed(1)}%` :
    format === 'days' ? `${value.toFixed(1)}d` :
    value.toLocaleString('pt-BR');

  const inner = (
    <div className={cn(
      "flex items-center gap-[0.4vw] px-[0.5vw] py-[0.4vh] rounded-lg border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] transition-all h-full min-h-[3.5vh]",
      href && "hover:border-[hsl(var(--admin-accent-purple)/0.4)] cursor-pointer"
    )}>
      <div className={cn("p-[0.3vw] rounded-md shrink-0", color)}>
        <Icon className="h-[1.2vw] w-[1.2vw] min-h-3 min-w-3 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[clamp(10px,0.85vw,14px)] font-bold text-white truncate leading-tight">{fmt}</p>
        <p className="text-[clamp(8px,0.6vw,11px)] text-[hsl(var(--admin-text-muted))] truncate leading-tight">{label}</p>
      </div>
      {trend !== undefined && trend !== null && (
        <span className={cn("text-[clamp(8px,0.55vw,10px)] font-bold shrink-0", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(0)}%
        </span>
      )}
    </div>
  );
  if (href) return <Link to={href} className="h-full">{inner}</Link>;
  return inner;
}

// ===== HERO KPI - fluid =====
function HeroKPI({ label, value, icon: Icon, color, format = 'currency', subtitle, trend }: {
  label: string; value: number; icon: React.ElementType; color: string;
  format?: 'currency' | 'number'; subtitle?: string; trend?: number;
}) {
  const fmt = format === 'currency'
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : value.toLocaleString('pt-BR');
  return (
    <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-xl overflow-hidden h-full">
      <CardContent className="p-[0.8vw]">
        <div className="flex items-start justify-between mb-[0.3vh]">
          <div className={cn("p-[0.5vw] rounded-lg shadow-lg", color)}>
            <Icon className="h-[1.5vw] w-[1.5vw] min-h-4 min-w-4 text-white" />
          </div>
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-[clamp(9px,0.65vw,12px)] font-bold px-[0.4vw] py-[0.2vh] rounded-full",
              trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            )}>
              {trend >= 0 ? <ArrowUpRight className="h-[0.8vw] w-[0.8vw] min-h-2.5 min-w-2.5" /> : <ArrowDownRight className="h-[0.8vw] w-[0.8vw] min-h-2.5 min-w-2.5" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
        <p className="text-[clamp(16px,1.6vw,28px)] font-bold text-white leading-tight">{fmt}</p>
        <p className="text-[clamp(9px,0.7vw,13px)] text-[hsl(var(--admin-text-muted))]">{label}</p>
        {subtitle && <p className="text-[clamp(8px,0.55vw,11px)] text-[hsl(var(--admin-text-muted)/0.6)]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ===== SECTION LABEL =====
function Sec({ children, icon: Icon, color }: { children: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-[0.4vw] col-span-full py-[0.3vh]">
      <div className={cn("p-[0.3vw] rounded-md", color)}><Icon className="h-[1vw] w-[1vw] min-h-3 min-w-3 text-white" /></div>
      <h2 className="text-[clamp(10px,0.75vw,14px)] font-bold text-white tracking-wide">{children}</h2>
    </div>
  );
}

const PIE_COLORS = ['hsl(170,70%,45%)', 'hsl(210,80%,55%)', 'hsl(220,15%,50%)', 'hsl(45,93%,47%)', 'hsl(270,70%,55%)', 'hsl(145,63%,42%)', 'hsl(0,72%,51%)'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : p.value}
        </p>
      ))}
    </div>
  );
};

// ===== MOBILE DASHBOARD =====
function MobileDashboard({ m }: { m: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} />
        <HeroKPI label="Receita Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} />
        <HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <HeroKPI label="Vendas Pendentes" value={m.vendasPendentes} icon={Clock} color="bg-gradient-to-br from-amber-500 to-amber-600" format="number" />
      </div>
      <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))]">
        <CardHeader className="pb-1 pt-3 px-3"><CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Receita 7 dias</CardTitle></CardHeader>
        <CardContent className="p-2 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.vendasPorDia || []}>
              <defs><linearGradient id="mRecGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#mRecGrad)" strokeWidth={2} name="Receita" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <M label="Saldo do Dia" value={m.saldoDia} icon={Wallet} color={m.saldoDia >= 0 ? "bg-emerald-600" : "bg-red-600"} format="currency" />
        <M label="Visitas Hoje" value={m.visitasHoje} icon={Eye} color="bg-cyan-600" />
        <M label="Leads Hoje" value={m.leadsHoje} icon={UserPlus} color="bg-pink-600" />
        <M label="Produtos Ativos" value={m.produtosAtivos} icon={Package} color="bg-orange-600" href="/admin/produtos" />
        <M label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-600" />
        <M label="Orçamentos Pend." value={m.orcamentosPendentes} icon={FileText} color="bg-violet-600" href="/admin/orcamentos" />
      </div>
    </div>
  );
}

// ===== DESKTOP DASHBOARD - fully fluid =====
function DesktopDashboard({ m }: { m: any }) {
  const funnelData = m.funnelData || [];
  const conversaoPorDia = m.conversaoPorDia || [];
  const ticketPorMes = m.ticketPorMes || [];
  const paymentDistribution = m.paymentDistribution || [];
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
  const topProducts = m.topProducts || [];
  return (
    <div className="grid grid-cols-12 gap-[0.4vw] auto-rows-min">
      {/* ROW 1: Hero KPIs */}
      <div className="col-span-3"><HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita do Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} subtitle={`${m.vendasMes} vendas`} /></div>
      <div className="col-span-3"><HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" subtitle={`Hoje: R$ ${m.ticketMedioHoje.toFixed(2)}`} /></div>
      <div className="col-span-3"><HeroKPI label="Receita Líquida 12m" value={m.receitaLiquida} icon={TrendingUp} color="bg-gradient-to-br from-teal-500 to-teal-600" subtitle={`Margem: ${m.margemLiquida.toFixed(1)}%`} /></div>

      {/* ROW 1.5: Conversion Analytics & Sales Funnel */}
      <Card className="col-span-4 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-[0.5vh] px-[0.6vw]"><CardTitle className="text-[clamp(9px,0.65vw,12px)] text-[hsl(var(--admin-text-muted))]">Funil de Vendas (Mês)</CardTitle></CardHeader>
        <CardContent className="p-[0.3vw] h-[22vh] min-h-[140px]">
          <div className="h-full flex items-center">
            <div className="w-full space-y-[0.4vh]">
              {funnelData.map((stage: any, i: number) => {
                const maxVal = funnelData[0]?.value || 1;
                const pct = maxVal > 0 ? (stage.value / maxVal * 100) : 0;
                const nextStage = funnelData[i + 1];
                const convRate = nextStage && stage.value > 0 ? (nextStage.value / stage.value * 100) : null;
                return (
                  <div key={stage.stage} className="flex items-center gap-[0.4vw]">
                    <span className="text-[clamp(8px,0.6vw,11px)] text-[hsl(var(--admin-text-muted))] w-[4vw] text-right shrink-0">{stage.stage}</span>
                    <div className="flex-1 h-[2vh] min-h-[14px] bg-[hsl(var(--admin-sidebar))] rounded-md overflow-hidden relative">
                      <div className="h-full rounded-md transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, background: stage.color }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[clamp(8px,0.55vw,10px)] font-bold text-white">{stage.value.toLocaleString('pt-BR')}</span>
                    </div>
                    {convRate !== null && (
                      <span className="text-[clamp(7px,0.5vw,9px)] text-[hsl(var(--admin-text-muted))] w-[2.5vw] shrink-0">→{convRate.toFixed(0)}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-4 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-[0.5vh] px-[0.6vw]"><CardTitle className="text-[clamp(9px,0.65vw,12px)] text-[hsl(var(--admin-text-muted))]">Conversão Diária (7 dias)</CardTitle></CardHeader>
        <CardContent className="p-[0.3vw] h-[22vh] min-h-[140px]">
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
        </CardContent>
      </Card>

      <div className="col-span-4 grid grid-cols-2 gap-[0.3vw]">
        <Card className="col-span-2 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardHeader className="pb-0 pt-[0.5vh] px-[0.6vw]"><CardTitle className="text-[clamp(9px,0.65vw,12px)] text-[hsl(var(--admin-text-muted))]">Ticket Médio (6 meses)</CardTitle></CardHeader>
          <CardContent className="p-[0.3vw] h-[12vh] min-h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketPorMes}>
                <defs><linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(145,63%,42%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(145,63%,42%)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="mes" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={35} tickFormatter={(v: number) => `R$${v.toFixed(0)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ticket" stroke="hsl(145,63%,42%)" fill="url(#ticketGrad)" strokeWidth={2} name="Ticket Médio (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <M label="Conv. Geral" value={m.overallConversion} icon={Target} color="bg-emerald-600" format="percent" />
        <M label="Visita→Lead" value={m.visitToLead} icon={UserPlus} color="bg-blue-600" format="percent" />
        <M label="Lead→Orç." value={m.leadToQuote} icon={FileText} color="bg-violet-600" format="percent" />
        <M label="Orç.→Pedido" value={m.quoteToOrder} icon={ShoppingCart} color="bg-teal-600" format="percent" />
        <M label="Abandonos" value={m.abandonedCarts} icon={XCircle} color="bg-red-600" />
        <M label="R$ Abandonado" value={m.abandonedValue} icon={DollarSign} color="bg-red-700" format="currency" />
        <M label="Recorrentes" value={m.repeatCustomers} icon={Repeat} color="bg-purple-600" />
        <M label="Taxa Recorr." value={m.repeatRate} icon={Repeat} color="bg-purple-700" format="percent" />
      </div>

      <Card className="col-span-5 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-[0.5vh] px-[0.6vw]"><CardTitle className="text-[clamp(9px,0.65vw,12px)] text-[hsl(var(--admin-text-muted))]">Receita vs Custos (6 meses)</CardTitle></CardHeader>
        <CardContent className="p-[0.3vw] h-[22vh] min-h-[140px]">
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
        </CardContent>
      </Card>

      <Card className="col-span-4 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-[0.5vh] px-[0.6vw]"><CardTitle className="text-[clamp(9px,0.65vw,12px)] text-[hsl(var(--admin-text-muted))]">Vendas & Receita (7 dias)</CardTitle></CardHeader>
        <CardContent className="p-[0.3vw] h-[22vh] min-h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vendasPorDia}>
              <defs><linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#recGrad)" strokeWidth={2.5} name="Receita (R$)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie charts - fluid */}
      <div className="col-span-3 grid grid-rows-2 gap-[0.4vw]">
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardContent className="p-[0.4vw] flex items-center h-full min-h-[10vh]">
            <div className="w-[6vw] min-w-[60px] h-full shrink-0">
              {paymentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={paymentDistribution} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={3} dataKey="value">{paymentDistribution.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i]} />)}</Pie></PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex-1 min-w-0 pl-[0.3vw]">
              <p className="text-[clamp(8px,0.6vw,11px)] font-bold text-[hsl(var(--admin-text-muted))] mb-1">Pagamentos</p>
              {paymentDistribution.map((p: any, i: number) => (
                <div key={p.name} className="flex items-center gap-1 mb-0.5"><div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} /><span className="text-[clamp(8px,0.55vw,11px)] text-white truncate">{p.name}: {p.value}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardContent className="p-[0.4vw] flex items-center h-full min-h-[10vh]">
            <div className="w-[6vw] min-w-[60px] h-full shrink-0">
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={statusDistribution} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={3} dataKey="value">{statusDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie></PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex-1 min-w-0 pl-[0.3vw]">
              <p className="text-[clamp(8px,0.6vw,11px)] font-bold text-[hsl(var(--admin-text-muted))] mb-1">Status Pedidos</p>
              {statusDistribution.slice(0, 5).map((s: any) => (
                <div key={s.name} className="flex items-center gap-1 mb-0.5"><div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} /><span className="text-[clamp(8px,0.55vw,11px)] text-white truncate">{s.name}: {s.value}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: Vendas + Financeiro */}
      <div className="col-span-6 grid grid-cols-5 gap-[0.3vw]">
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

      <div className="col-span-6 grid grid-cols-5 gap-[0.3vw]">
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

      {/* ROW 4: Produção + Leads com gráficos */}
      <div className="col-span-3">
        <Sec icon={Wrench} color="bg-blue-600">Produção</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            {productionDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={productionDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{productionDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Aguardando" value={m.prodPending} icon={Clock} color="bg-gray-600" href="/admin/kanban" />
          <M label="Em Produção" value={m.prodInProduction} icon={Wrench} color="bg-blue-600" href="/admin/kanban" />
          <M label="Prontos" value={m.prodReady} icon={CheckCircle} color="bg-green-600" />
          <M label="Tempo Médio" value={m.tempoMedioProdDias} icon={Clock} color="bg-indigo-600" format="days" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Users} color="bg-pink-600">Clientes & Leads</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsPorDia}>
                <defs><linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(330,70%,55%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(330,70%,55%)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="hsl(330,70%,55%)" fill="url(#leadsGrad)" strokeWidth={2} name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Total Leads" value={m.totalLeads} icon={Users} color="bg-violet-600" href="/admin/leads" />
          <M label="Leads Hoje" value={m.leadsHoje} icon={UserPlus} color="bg-violet-700" />
          <M label="Clientes Únicos" value={m.uniqueCustomers} icon={Users} color="bg-pink-600" />
          <M label="Taxa Conv." value={m.taxaConversao} icon={Target} color="bg-amber-600" format="percent" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Eye} color="bg-cyan-600">Tráfego</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitasPorDia}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visitas" fill="hsl(190,70%,50%)" radius={[3,3,0,0]} name="Visitas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Visitas Hoje" value={m.visitasHoje} icon={Eye} color="bg-cyan-600" />
          <M label="Visitas Mês" value={m.visitasMes} icon={Eye} color="bg-blue-600" />
          <M label="Sessões Únicas" value={m.sessoesUnicas} icon={Users} color="bg-blue-700" />
          <M label="Auditoria Hoje" value={m.auditoriaHoje} icon={Activity} color="bg-slate-600" href="/admin/logs" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Package} color="bg-orange-600">Produtos & Estoque</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            {productsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={productsDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{productsDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Total" value={m.totalProdutos} icon={Package} color="bg-orange-600" href="/admin/produtos" />
          <M label="Sem Estoque" value={m.produtosSemEstoque} icon={AlertTriangle} color="bg-red-600" />
          <M label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-600" />
          <M label="Valor Estoque" value={m.valorEstoqueProdutos} icon={DollarSign} color="bg-emerald-600" format="currency" />
        </div>
      </div>

      {/* ROW 5: Orçamentos + Avaliações + WhatsApp + Caixa com gráficos */}
      <div className="col-span-3">
        <Sec icon={FileText} color="bg-violet-600">Orçamentos</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            {quotesDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={quotesDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{quotesDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Total" value={m.totalOrcamentos} icon={FileText} color="bg-violet-600" href="/admin/orcamentos" />
          <M label="Pendentes" value={m.orcamentosPendentes} icon={Clock} color="bg-yellow-600" />
          <M label="Convertidos" value={m.orcamentosConvertidos} icon={TrendingUp} color="bg-blue-600" />
          <M label="Conv. %" value={m.taxaConversaoOrcamento} icon={Target} color="bg-emerald-600" format="percent" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Star} color="bg-amber-600">Avaliações</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            {reviewsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reviewsDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Avaliações" radius={[3,3,0,0]}>{reviewsDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Total" value={m.totalReviews} icon={Star} color="bg-amber-600" href="/admin/avaliacoes" />
          <M label="Média" value={m.mediaGeral.toFixed(1)} icon={Star} color="bg-amber-700" format="text" />
          <M label="Pendentes" value={m.reviewsPendentes} icon={Clock} color="bg-yellow-600" />
          <M label="Aprovadas" value={m.reviewsAprovadas} icon={CheckCircle} color="bg-green-600" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={MessageSquare} color="bg-green-600">WhatsApp</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            {whatsappDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={whatsappDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{whatsappDistribution.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-[10px] text-[hsl(var(--admin-text-muted))] text-center pt-4">Sem dados</p>}
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Enviadas" value={m.whatsappEnviadas} icon={MessageSquare} color="bg-green-600" href="/admin/whatsapp" />
          <M label="Erros" value={m.whatsappErros} icon={AlertTriangle} color="bg-red-600" />
          <M label="Online" value={m.whatsappConectadas} icon={Zap} color="bg-emerald-600" />
          <M label="Banners" value={m.bannersAtivos} icon={Globe} color="bg-pink-600" href="/admin/hero" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={Wallet} color="bg-fuchsia-600">Fluxo de Caixa</Sec>
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mt-[0.3vw]">
          <CardContent className="p-[0.4vw] h-[12vh] min-h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caixaPorDia}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="entradas" fill="hsl(145,63%,42%)" radius={[3,3,0,0]} name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(0,72%,51%)" radius={[3,3,0,0]} name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-[0.3vw] mt-[0.3vw]">
          <M label="Cupons Ativos" value={m.cuponsAtivos} icon={Tag} color="bg-fuchsia-600" href="/admin/cupons" />
          <M label="Promoções" value={m.promocoesAtivas} icon={Percent} color="bg-orange-600" href="/admin/promocoes" />
          <M label="Val. Est. MP" value={m.valorEstoqueMateriais} icon={DollarSign} color="bg-amber-700" format="currency" />
          <M label="Mat. Baixos" value={m.materiaisEstoqueBaixo} icon={Boxes} color={m.materiaisEstoqueBaixo > 0 ? "bg-red-600" : "bg-green-600"} />
        </div>
      </div>

      {/* ROW 6: extras */}
      <div className="col-span-12 grid grid-cols-12 gap-[0.3vw]">
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
  const isMobile = useIsMobile();

  if (isLoading || !m) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-4 gap-[0.4vw]">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="h-[8vh] rounded-lg bg-[hsl(var(--admin-sidebar))]" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {isMobile ? <MobileDashboard m={m} /> : <DesktopDashboard m={m} />}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
