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
} from 'recharts';
import {
  DollarSign, ShoppingCart, TrendingUp, TrendingDown, Users, Package,
  Star, Eye, CreditCard, QrCode, Landmark, Clock, Truck, CheckCircle,
  AlertTriangle, Wrench, Shield, FileText, Tag, Percent, MessageSquare,
  Boxes, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Activity,
  Globe, UserPlus, Heart, Webhook, Layers, Target, Zap,
  PieChart as PieChartIcon, Award, RefreshCw
} from 'lucide-react';

// ===== COMPACT METRIC =====
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
      "flex items-center gap-2 p-2.5 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] transition-all",
      href && "hover:border-[hsl(var(--admin-accent-purple)/0.4)] cursor-pointer"
    )}>
      <div className={cn("p-1.5 rounded-lg shrink-0", color)}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate leading-tight">{fmt}</p>
        <p className="text-[10px] text-[hsl(var(--admin-text-muted))] truncate leading-tight">{label}</p>
      </div>
      {trend !== undefined && trend !== null && (
        <span className={cn("text-[10px] font-bold shrink-0", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(0)}%
        </span>
      )}
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

// ===== HERO KPI =====
function HeroKPI({ label, value, icon: Icon, color, format = 'currency', subtitle, trend }: {
  label: string; value: number; icon: React.ElementType; color: string;
  format?: 'currency' | 'number'; subtitle?: string; trend?: number;
}) {
  const fmt = format === 'currency'
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : value.toLocaleString('pt-BR');
  return (
    <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("p-2.5 rounded-xl shadow-lg", color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full",
              trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            )}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend).toFixed(0)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white">{fmt}</p>
        <p className="text-xs text-[hsl(var(--admin-text-muted))]">{label}</p>
        {subtitle && <p className="text-[10px] text-[hsl(var(--admin-text-muted)/0.6)]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ===== SECTION LABEL =====
function Sec({ children, icon: Icon, color }: { children: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-2 col-span-full">
      <div className={cn("p-1.5 rounded-lg", color)}><Icon className="h-4 w-4 text-white" /></div>
      <h2 className="text-sm font-bold text-white tracking-wide">{children}</h2>
    </div>
  );
}

// ===== PIE COLORS =====
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
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} />
        <HeroKPI label="Receita Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} />
        <HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <HeroKPI label="Vendas Pendentes" value={m.vendasPendentes} icon={Clock} color="bg-gradient-to-br from-amber-500 to-amber-600" format="number" />
      </div>

      {/* Mini chart */}
      <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))]">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Receita 7 dias</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.vendasPorDia}>
              <defs>
                <linearGradient id="mRecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#mRecGrad)" strokeWidth={2} name="Receita" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key metrics */}
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

// ===== DESKTOP DASHBOARD =====
function DesktopDashboard({ m }: { m: any }) {
  return (
    <div className="grid grid-cols-12 gap-3 auto-rows-min">
      {/* ===== ROW 1: Hero KPIs ===== */}
      <div className="col-span-3">
        <HeroKPI label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`${m.vendasHoje} vendas`} />
      </div>
      <div className="col-span-3">
        <HeroKPI label="Receita do Mês" value={m.receitaMes} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" trend={m.crescimentoReceita} subtitle={`${m.vendasMes} vendas`} />
      </div>
      <div className="col-span-3">
        <HeroKPI label="Ticket Médio" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-purple-500 to-purple-600" subtitle={`Hoje: R$ ${m.ticketMedioHoje.toFixed(2)}`} />
      </div>
      <div className="col-span-3">
        <HeroKPI label="Receita Líquida 12m" value={m.receitaLiquida} icon={TrendingUp} color="bg-gradient-to-br from-teal-500 to-teal-600" subtitle={`Margem: ${m.margemLiquida.toFixed(1)}%`} />
      </div>

      {/* ===== ROW 2: Line Chart + Pie Charts ===== */}
      <Card className="col-span-6 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Receita vs Custos (6 meses)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={m.receitaPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,10%,50%)' }} axisLine={false} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="receita" stroke="hsl(145,63%,42%)" strokeWidth={2.5} dot={{ r: 3 }} name="Receita" />
              <Line type="monotone" dataKey="custos" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} name="Custos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-3 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-3 px-4">
          <CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-52 flex items-center justify-center">
          {m.paymentDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={m.paymentDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {m.paymentDistribution.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">Sem dados</p>}
        </CardContent>
      </Card>

      <Card className="col-span-3 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-0 pt-3 px-4">
          <CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Status Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-52 flex items-center justify-center">
          {m.statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={m.statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {m.statusDistribution.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">Sem dados</p>}
        </CardContent>
      </Card>

      {/* ===== ROW 3: Vendas 7 dias (area) + Vendas metrics ===== */}
      <Card className="col-span-5 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-[hsl(var(--admin-text-muted))]">Vendas & Receita (7 dias)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.vendasPorDia}>
              <defs>
                <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,70%,55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(270,70%,55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,20%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(220,10%,50%)' }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receita" stroke="hsl(270,70%,55%)" fill="url(#recGrad)" strokeWidth={2} name="Receita (R$)" />
              <Line type="monotone" dataKey="vendas" stroke="hsl(45,93%,47%)" strokeWidth={2} dot={{ r: 2 }} name="Qtd Vendas" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vendas metrics grid */}
      <div className="col-span-7 grid grid-cols-4 gap-2">
        <M label="Vendas Hoje" value={m.vendasHoje} icon={ShoppingCart} color="bg-emerald-600" href="/admin/pedidos" />
        <M label="Vendas Semana" value={m.vendasSemana} icon={ShoppingCart} color="bg-emerald-700" />
        <M label="Vendas Mês" value={m.vendasMes} icon={ShoppingCart} color="bg-teal-600" trend={m.crescimentoVendas} />
        <M label="Vendas Ano" value={m.vendasAno} icon={ShoppingCart} color="bg-teal-700" />
        <M label="Receita Semana" value={m.receitaSemana} icon={DollarSign} color="bg-green-600" format="currency" />
        <M label="Receita Ano" value={m.receitaAno} icon={DollarSign} color="bg-green-700" format="currency" />
        <M label="Maior Venda" value={m.maiorVenda} icon={Award} color="bg-amber-600" format="currency" />
        <M label="Total Geral" value={m.vendasTotal} icon={ShoppingCart} color="bg-cyan-700" />
        <M label="Pendentes" value={m.vendasPendentes} icon={Clock} color="bg-yellow-600" href="/admin/pedidos" />
        <M label="Confirmadas" value={m.vendasConfirmadas} icon={CheckCircle} color="bg-blue-600" />
        <M label="Enviadas" value={m.vendasEnviadas} icon={Truck} color="bg-teal-600" />
        <M label="Entregues" value={m.vendasEntregues} icon={CheckCircle} color="bg-green-600" />
        <M label="Canceladas" value={m.vendasCanceladas} icon={AlertTriangle} color="bg-red-600" />
        <M label="Pgtos Pagos" value={m.pagamentosPagos} icon={CheckCircle} color="bg-green-700" />
        <M label="Pgtos Pendentes" value={m.pagamentosPendentes} icon={Clock} color="bg-yellow-700" />
        <M label="Pgtos Falhados" value={m.pagamentosFalhados} icon={AlertTriangle} color="bg-red-700" />
      </div>

      {/* ===== ROW 4: Financeiro + Caixa + Produção ===== */}
      <Sec icon={BarChart3} color="bg-emerald-600">Financeiro & Caixa</Sec>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <M label="Receita Bruta 12m" value={m.receitaBruta12m} icon={DollarSign} color="bg-emerald-600" format="currency" />
        <M label="Custos Totais" value={m.custoTotal} icon={TrendingDown} color="bg-red-600" format="currency" />
        <M label="Custo Material" value={m.custoMaterial} icon={Boxes} color="bg-red-700" format="currency" />
        <M label="Custo Mão de Obra" value={m.custoMaoDeObra} icon={Wrench} color="bg-orange-600" format="currency" />
        <M label="Impostos" value={m.impostos} icon={Landmark} color="bg-amber-600" format="currency" />
        <M label="Alíquota Efetiva" value={m.aliquotaEfetiva} icon={Percent} color="bg-amber-700" format="percent" />
        <M label="Margem Líquida" value={m.margemLiquida} icon={PieChartIcon} color="bg-blue-700" format="percent" />
        <M label="PIX (R$)" value={m.pixTotal} icon={QrCode} color="bg-teal-600" format="currency" />
      </div>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <M label="Entradas Hoje" value={m.entradasHoje} icon={ArrowUpRight} color="bg-green-600" format="currency" />
        <M label="Saídas Hoje" value={m.saidasHoje} icon={ArrowDownRight} color="bg-red-600" format="currency" />
        <M label="Saldo do Dia" value={m.saldoDia} icon={Wallet} color={m.saldoDia >= 0 ? "bg-emerald-600" : "bg-red-700"} format="currency" />
        <M label="Entradas Mês" value={m.entradasMes} icon={ArrowUpRight} color="bg-green-700" format="currency" />
        <M label="Saídas Mês" value={m.saidasMes} icon={ArrowDownRight} color="bg-red-700" format="currency" />
        <M label="Saldo Mês" value={m.saldoMes} icon={Wallet} color={m.saldoMes >= 0 ? "bg-emerald-700" : "bg-red-800"} format="currency" />
        <M label="Cartão (R$)" value={m.cardTotal} icon={CreditCard} color="bg-blue-600" format="currency" />
        <M label="Boleto (R$)" value={m.boletoTotal} icon={Landmark} color="bg-slate-600" format="currency" />
      </div>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <Sec icon={Wrench} color="bg-blue-600">Produção</Sec>
        <span />
        <M label="Aguardando" value={m.prodPending} icon={Clock} color="bg-gray-600" href="/admin/kanban" />
        <M label="Aguard. Material" value={m.prodAwaitingMaterial} icon={AlertTriangle} color="bg-yellow-600" href="/admin/kanban" />
        <M label="Em Produção" value={m.prodInProduction} icon={Wrench} color="bg-blue-600" href="/admin/kanban" />
        <M label="Qualidade" value={m.prodQualityCheck} icon={Shield} color="bg-purple-600" />
        <M label="Prontos" value={m.prodReady} icon={CheckCircle} color="bg-green-600" />
        <M label="Tempo Médio" value={m.tempoMedioProdDias} icon={Clock} color="bg-indigo-600" format="days" />
      </div>

      {/* ===== ROW 5: Clientes + Tráfego + Produtos ===== */}
      <Sec icon={Users} color="bg-pink-600">Clientes, Tráfego & Produtos</Sec>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <M label="Clientes Únicos" value={m.uniqueCustomers} icon={Users} color="bg-pink-600" />
        <M label="Clientes Hoje" value={m.newCustomersToday} icon={UserPlus} color="bg-pink-700" />
        <M label="Clientes Mês" value={m.newCustomersMonth} icon={UserPlus} color="bg-rose-600" />
        <M label="Total Leads" value={m.totalLeads} icon={Users} color="bg-violet-600" href="/admin/leads" />
        <M label="Leads Hoje" value={m.leadsHoje} icon={UserPlus} color="bg-violet-700" />
        <M label="Leads Mês" value={m.leadsMes} icon={UserPlus} color="bg-purple-600" />
        <M label="Inscritos" value={m.leadsInscritos} icon={Heart} color="bg-green-600" />
        <M label="Taxa Conversão" value={m.taxaConversao} icon={Target} color="bg-amber-600" format="percent" />
      </div>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <M label="Visitas Hoje" value={m.visitasHoje} icon={Eye} color="bg-cyan-600" />
        <M label="Visitas Semana" value={m.visitasSemana} icon={Eye} color="bg-cyan-700" />
        <M label="Visitas Mês" value={m.visitasMes} icon={Eye} color="bg-blue-600" />
        <M label="Sessões Únicas" value={m.sessoesUnicas} icon={Users} color="bg-blue-700" />
        <M label="Ações Admin Hoje" value={m.auditoriaHoje} icon={Activity} color="bg-slate-600" href="/admin/logs" />
        <M label="Webhooks" value={m.webhooksRecebidos} icon={Webhook} color="bg-indigo-600" />
        <M label="Webhooks Erro" value={m.webhooksErro} icon={AlertTriangle} color={m.webhooksErro > 0 ? "bg-red-600" : "bg-green-600"} />
        <M label="Banners Ativos" value={m.bannersAtivos} icon={Globe} color="bg-pink-600" href="/admin/hero" />
      </div>

      <div className="col-span-4 grid grid-cols-2 gap-2">
        <M label="Total Produtos" value={m.totalProdutos} icon={Package} color="bg-orange-600" href="/admin/produtos" />
        <M label="Ativos" value={m.produtosAtivos} icon={CheckCircle} color="bg-green-600" />
        <M label="Sem Estoque" value={m.produtosSemEstoque} icon={AlertTriangle} color="bg-red-600" />
        <M label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-600" />
        <M label="Valor Estoque" value={m.valorEstoqueProdutos} icon={DollarSign} color="bg-emerald-600" format="currency" />
        <M label="Destaque" value={m.produtosDestaque} icon={Star} color="bg-amber-600" />
        <M label="Categorias" value={m.totalCategorias} icon={Layers} color="bg-indigo-600" href="/admin/categorias" />
        <M label="Materiais Baixos" value={m.materiaisEstoqueBaixo} icon={Boxes} color={m.materiaisEstoqueBaixo > 0 ? "bg-red-600" : "bg-green-600"} />
      </div>

      {/* ===== ROW 6: Orçamentos + Avaliações + WhatsApp + Cupons ===== */}
      <Sec icon={FileText} color="bg-violet-600">Orçamentos, Avaliações & Marketing</Sec>

      <div className="col-span-3 grid grid-cols-2 gap-2">
        <M label="Total Orçamentos" value={m.totalOrcamentos} icon={FileText} color="bg-violet-600" href="/admin/orcamentos" />
        <M label="Pendentes" value={m.orcamentosPendentes} icon={Clock} color="bg-yellow-600" />
        <M label="Aprovados" value={m.orcamentosAprovados} icon={CheckCircle} color="bg-green-600" />
        <M label="Convertidos" value={m.orcamentosConvertidos} icon={TrendingUp} color="bg-blue-600" />
        <M label="Rejeitados" value={m.orcamentosRejeitados} icon={AlertTriangle} color="bg-red-600" />
        <M label="Conv. %" value={m.taxaConversaoOrcamento} icon={Target} color="bg-emerald-600" format="percent" />
      </div>

      <div className="col-span-3 grid grid-cols-2 gap-2">
        <M label="Total Avaliações" value={m.totalReviews} icon={Star} color="bg-amber-600" href="/admin/avaliacoes" />
        <M label="Av. Pendentes" value={m.reviewsPendentes} icon={Clock} color="bg-yellow-600" />
        <M label="Av. Aprovadas" value={m.reviewsAprovadas} icon={CheckCircle} color="bg-green-600" />
        <M label="Média Geral" value={m.mediaGeral.toFixed(1)} icon={Star} color="bg-amber-700" format="text" />
        <M label="5 Estrelas" value={m.reviews5} icon={Star} color="bg-green-600" />
        <M label="1 Estrela" value={m.reviews1} icon={Star} color="bg-red-600" />
      </div>

      <div className="col-span-3 grid grid-cols-2 gap-2">
        <M label="WA Enviadas" value={m.whatsappEnviadas} icon={MessageSquare} color="bg-green-600" href="/admin/whatsapp" />
        <M label="WA Pendentes" value={m.whatsappPendentes} icon={Clock} color="bg-yellow-600" />
        <M label="WA Erros" value={m.whatsappErros} icon={AlertTriangle} color="bg-red-600" />
        <M label="WA Online" value={m.whatsappConectadas} icon={Zap} color="bg-emerald-600" />
      </div>

      <div className="col-span-3 grid grid-cols-2 gap-2">
        <M label="Cupons Ativos" value={m.cuponsAtivos} icon={Tag} color="bg-fuchsia-600" href="/admin/cupons" />
        <M label="Usos Cupons" value={m.totalUsoCupons} icon={Zap} color="bg-purple-600" />
        <M label="Promoções Ativas" value={m.promocoesAtivas} icon={Percent} color="bg-orange-600" href="/admin/promocoes" />
        <M label="Valor Estoque MP" value={m.valorEstoqueMateriais} icon={DollarSign} color="bg-amber-700" format="currency" />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-[hsl(var(--admin-sidebar))]" />
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
