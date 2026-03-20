import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { RealActivityFeed } from '@/components/admin/dashboard/RealActivityFeed';
import {
  DollarSign, ShoppingCart, TrendingUp, TrendingDown, Users, Package,
  Star, Eye, CreditCard, QrCode, Landmark, Clock, Truck, CheckCircle,
  AlertTriangle, Wrench, Shield, FileText, Tag, Percent, MessageSquare,
  Boxes, ArrowUpRight, ArrowDownRight, Wallet, BarChart3, Activity,
  Globe, UserPlus, Heart, Image, Webhook, Layers, Target, Zap,
  PieChart, Award, RefreshCw
} from 'lucide-react';

// ===== HELPER COMPONENTS =====

function MetricCard({ label, value, icon: Icon, color, href, subtitle, trend, format = 'number', small }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
  subtitle?: string;
  trend?: number | null;
  format?: 'number' | 'currency' | 'percent' | 'text' | 'days';
  small?: boolean;
}) {
  const formatted = typeof value === 'string' ? value :
    format === 'currency' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
    format === 'percent' ? `${value.toFixed(1)}%` :
    format === 'days' ? `${value.toFixed(1)}d` :
    value.toLocaleString('pt-BR');

  const content = (
    <Card className={cn(
      "overflow-hidden border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg transition-all duration-300",
      href && "hover:shadow-2xl hover:-translate-y-0.5 hover:border-[hsl(var(--admin-accent-purple)/0.3)] cursor-pointer group"
    )}>
      <CardContent className={cn("flex items-center gap-3", small ? "p-3" : "p-4")}>
        <div className={cn("rounded-xl flex items-center justify-center shrink-0 shadow-lg", color, small ? "p-2" : "p-2.5")}>
          <Icon className={cn("text-white", small ? "h-4 w-4" : "h-5 w-5")} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold text-white truncate", small ? "text-lg" : "text-xl")}>{formatted}</p>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">{label}</p>
          {subtitle && <p className="text-[10px] text-[hsl(var(--admin-text-muted)/0.7)] truncate">{subtitle}</p>}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full shrink-0",
            trend >= 0
              ? "bg-[hsl(var(--admin-accent-green)/0.15)] text-[hsl(var(--admin-accent-green))]"
              : "bg-red-500/15 text-red-400"
          )}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}

function SectionTitle({ children, icon: Icon, color }: { children: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <div className={cn("p-2 rounded-xl shadow-lg", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h2 className="text-lg font-bold text-white tracking-wide">{children}</h2>
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[hsl(var(--admin-text-muted))] w-24 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[hsl(var(--admin-card-border))] overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-white w-8 text-right">{value}</span>
    </div>
  );
}

// ===== MAIN DASHBOARD =====

const AdminDashboardPage = () => {
  const { data: m, isLoading } = useDashboardMetrics();

  if (isLoading || !m) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-[hsl(var(--admin-sidebar))]" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">

        {/* ========== HERO KPIs - Os 4 mais importantes ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Receita Hoje', value: m.receitaHoje, icon: DollarSign, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', format: 'currency' as const, subtitle: `${m.vendasHoje} vendas` },
            { label: 'Receita do Mês', value: m.receitaMes, icon: TrendingUp, color: 'bg-gradient-to-br from-blue-500 to-blue-600', format: 'currency' as const, trend: m.crescimentoReceita, subtitle: `${m.vendasMes} vendas` },
            { label: 'Vendas Pendentes', value: m.vendasPendentes, icon: Clock, color: 'bg-gradient-to-br from-amber-500 to-amber-600', subtitle: 'Aguardando ação' },
            { label: 'Ticket Médio', value: m.ticketMedio, icon: Target, color: 'bg-gradient-to-br from-purple-500 to-purple-600', format: 'currency' as const, subtitle: `Hoje: R$ ${m.ticketMedioHoje.toFixed(2)}` },
          ].map((item) => (
            <Card key={item.label} className="overflow-hidden border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-3 rounded-xl shadow-lg", item.color)}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  {item.trend !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full",
                      item.trend >= 0
                        ? "bg-[hsl(var(--admin-accent-green)/0.15)] text-[hsl(var(--admin-accent-green))]"
                        : "bg-red-500/15 text-red-400"
                    )}>
                      {item.trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {Math.abs(item.trend).toFixed(0)}%
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-white">
                  {item.format === 'currency' ? `R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : item.value.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mt-1">{item.label}</p>
                {item.subtitle && <p className="text-xs text-[hsl(var(--admin-text-muted)/0.6)] mt-0.5">{item.subtitle}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ========== VENDAS & RECEITA ========== */}
        <SectionTitle icon={ShoppingCart} color="bg-gradient-to-br from-emerald-500 to-emerald-600">Vendas & Receita</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard label="Vendas Hoje" value={m.vendasHoje} icon={ShoppingCart} color="bg-gradient-to-br from-emerald-500 to-emerald-600" href="/admin/pedidos" small />
          <MetricCard label="Vendas Semana" value={m.vendasSemana} icon={ShoppingCart} color="bg-gradient-to-br from-emerald-500 to-teal-600" small />
          <MetricCard label="Vendas Mês" value={m.vendasMes} icon={ShoppingCart} color="bg-gradient-to-br from-teal-500 to-teal-600" trend={m.crescimentoVendas} small />
          <MetricCard label="Vendas Ano" value={m.vendasAno} icon={ShoppingCart} color="bg-gradient-to-br from-teal-600 to-cyan-600" small />
          <MetricCard label="Total Geral" value={m.vendasTotal} icon={ShoppingCart} color="bg-gradient-to-br from-cyan-600 to-blue-600" small />

          <MetricCard label="Receita Hoje" value={m.receitaHoje} icon={DollarSign} color="bg-gradient-to-br from-green-500 to-green-600" format="currency" small />
          <MetricCard label="Receita Semana" value={m.receitaSemana} icon={DollarSign} color="bg-gradient-to-br from-green-500 to-emerald-600" format="currency" small />
          <MetricCard label="Receita Mês" value={m.receitaMes} icon={DollarSign} color="bg-gradient-to-br from-emerald-600 to-teal-600" format="currency" trend={m.crescimentoReceita} small />
          <MetricCard label="Receita Ano" value={m.receitaAno} icon={DollarSign} color="bg-gradient-to-br from-teal-600 to-cyan-600" format="currency" small />
          <MetricCard label="Receita Total" value={m.receitaTotal} icon={DollarSign} color="bg-gradient-to-br from-cyan-600 to-blue-600" format="currency" small />

          <MetricCard label="Ticket Médio Hoje" value={m.ticketMedioHoje} icon={Target} color="bg-gradient-to-br from-violet-500 to-violet-600" format="currency" small />
          <MetricCard label="Ticket Médio Geral" value={m.ticketMedio} icon={Target} color="bg-gradient-to-br from-violet-600 to-purple-600" format="currency" small />
          <MetricCard label="Maior Venda" value={m.maiorVenda} icon={Award} color="bg-gradient-to-br from-amber-500 to-amber-600" format="currency" small />
          <MetricCard label="Menor Venda" value={m.menorVenda} icon={DollarSign} color="bg-gradient-to-br from-slate-500 to-slate-600" format="currency" small />
          <MetricCard label="Mês Anterior" value={m.vendasMesAnterior} icon={RefreshCw} color="bg-gradient-to-br from-slate-600 to-gray-600" subtitle={`R$ ${m.receitaMesAnterior.toFixed(2)}`} small />
        </div>

        {/* Status de Vendas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Pendentes" value={m.vendasPendentes} icon={Clock} color="bg-yellow-500" href="/admin/pedidos" small />
          <MetricCard label="Confirmadas" value={m.vendasConfirmadas} icon={CheckCircle} color="bg-blue-500" small />
          <MetricCard label="Processando" value={m.vendasProcessando} icon={Wrench} color="bg-purple-500" small />
          <MetricCard label="Enviadas" value={m.vendasEnviadas} icon={Truck} color="bg-teal-500" small />
          <MetricCard label="Entregues" value={m.vendasEntregues} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Canceladas" value={m.vendasCanceladas} icon={AlertTriangle} color="bg-red-500" small />
        </div>

        {/* ========== MINI GRÁFICO 7 DIAS ========== */}
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[hsl(var(--admin-text-muted))]">Vendas dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {m.vendasPorDia.map((day, i) => {
                const maxReceita = Math.max(...m.vendasPorDia.map(d => d.receita), 1);
                const height = (day.receita / maxReceita) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                      {day.vendas > 0 && `${day.vendas}`}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] transition-all duration-500 min-h-[2px]"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ========== PAGAMENTOS ========== */}
        <SectionTitle icon={CreditCard} color="bg-gradient-to-br from-indigo-500 to-indigo-600">Pagamentos</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="PIX (qtd)" value={m.pixCount} icon={QrCode} color="bg-gradient-to-br from-teal-500 to-teal-600" small />
          <MetricCard label="PIX (R$)" value={m.pixTotal} icon={QrCode} color="bg-gradient-to-br from-teal-600 to-cyan-600" format="currency" small />
          <MetricCard label="Cartão (qtd)" value={m.cardCount} icon={CreditCard} color="bg-gradient-to-br from-blue-500 to-blue-600" small />
          <MetricCard label="Cartão (R$)" value={m.cardTotal} icon={CreditCard} color="bg-gradient-to-br from-blue-600 to-indigo-600" format="currency" small />
          <MetricCard label="Boleto (qtd)" value={m.boletoCount} icon={Landmark} color="bg-gradient-to-br from-slate-500 to-slate-600" small />
          <MetricCard label="Boleto (R$)" value={m.boletoTotal} icon={Landmark} color="bg-gradient-to-br from-slate-600 to-gray-600" format="currency" small />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Pgtos Confirmados" value={m.pagamentosPagos} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Pgtos Pendentes" value={m.pagamentosPendentes} icon={Clock} color="bg-yellow-500" small />
          <MetricCard label="Pgtos Falhados" value={m.pagamentosFalhados} icon={AlertTriangle} color="bg-red-500" small />
        </div>

        {/* ========== PRODUÇÃO ========== */}
        <SectionTitle icon={Wrench} color="bg-gradient-to-br from-blue-500 to-blue-600">Produção</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          <MetricCard label="Aguardando" value={m.prodPending} icon={Clock} color="bg-gray-500" href="/admin/kanban" small />
          <MetricCard label="Aguard. Material" value={m.prodAwaitingMaterial} icon={AlertTriangle} color="bg-yellow-500" href="/admin/kanban" small />
          <MetricCard label="Em Produção" value={m.prodInProduction} icon={Wrench} color="bg-blue-500" href="/admin/kanban" small />
          <MetricCard label="Qualidade" value={m.prodQualityCheck} icon={Shield} color="bg-purple-500" href="/admin/kanban" small />
          <MetricCard label="Prontos" value={m.prodReady} icon={CheckCircle} color="bg-green-500" href="/admin/kanban" small />
          <MetricCard label="Enviados" value={m.prodShipped} icon={Truck} color="bg-teal-500" small />
          <MetricCard label="Tempo Médio" value={m.tempoMedioProdDias} icon={Clock} color="bg-gradient-to-br from-indigo-500 to-indigo-600" format="days" subtitle="dias para produzir" small />
        </div>

        {/* ========== CLIENTES & LEADS ========== */}
        <SectionTitle icon={Users} color="bg-gradient-to-br from-pink-500 to-pink-600">Clientes & Leads</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard label="Clientes Únicos" value={m.uniqueCustomers} icon={Users} color="bg-gradient-to-br from-pink-500 to-pink-600" small />
          <MetricCard label="Clientes Hoje" value={m.newCustomersToday} icon={UserPlus} color="bg-gradient-to-br from-pink-600 to-rose-600" small />
          <MetricCard label="Clientes no Mês" value={m.newCustomersMonth} icon={UserPlus} color="bg-gradient-to-br from-rose-500 to-rose-600" small />
          <MetricCard label="Total Leads" value={m.totalLeads} icon={Users} color="bg-gradient-to-br from-violet-500 to-violet-600" href="/admin/leads" small />
          <MetricCard label="Leads Hoje" value={m.leadsHoje} icon={UserPlus} color="bg-gradient-to-br from-violet-600 to-purple-600" small />
          <MetricCard label="Leads Semana" value={m.leadsSemana} icon={UserPlus} color="bg-gradient-to-br from-purple-500 to-purple-600" small />
          <MetricCard label="Leads Mês" value={m.leadsMes} icon={UserPlus} color="bg-gradient-to-br from-purple-600 to-fuchsia-600" small />
          <MetricCard label="Inscritos" value={m.leadsInscritos} icon={Heart} color="bg-gradient-to-br from-green-500 to-green-600" small />
          <MetricCard label="Desinscritos" value={m.leadsDesinscritos} icon={Users} color="bg-gradient-to-br from-gray-500 to-gray-600" small />
          <MetricCard label="Taxa Conversão" value={m.taxaConversao} icon={Target} color="bg-gradient-to-br from-amber-500 to-amber-600" format="percent" subtitle="visitas → vendas" small />
        </div>

        {/* ========== TRÁFEGO ========== */}
        <SectionTitle icon={Globe} color="bg-gradient-to-br from-cyan-500 to-cyan-600">Tráfego do Site</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Visitas Hoje" value={m.visitasHoje} icon={Eye} color="bg-gradient-to-br from-cyan-500 to-cyan-600" small />
          <MetricCard label="Visitas Semana" value={m.visitasSemana} icon={Eye} color="bg-gradient-to-br from-cyan-600 to-blue-600" small />
          <MetricCard label="Visitas Mês" value={m.visitasMes} icon={Eye} color="bg-gradient-to-br from-blue-500 to-blue-600" small />
          <MetricCard label="Sessões Únicas" value={m.sessoesUnicas} icon={Users} color="bg-gradient-to-br from-blue-600 to-indigo-600" small />
        </div>
        {m.topPages.length > 0 && (
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] mb-3">Páginas Mais Visitadas</p>
              <div className="space-y-2">
                {m.topPages.map((page, i) => (
                  <MiniBar key={page.path} label={page.path === '/' ? 'Home' : page.path} value={page.views} max={m.topPages[0]?.views || 1} color="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== PRODUTOS ========== */}
        <SectionTitle icon={Package} color="bg-gradient-to-br from-orange-500 to-orange-600">Produtos</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard label="Total Produtos" value={m.totalProdutos} icon={Package} color="bg-gradient-to-br from-orange-500 to-orange-600" href="/admin/produtos" small />
          <MetricCard label="Ativos" value={m.produtosAtivos} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Inativos" value={m.produtosInativos} icon={AlertTriangle} color="bg-gray-500" small />
          <MetricCard label="Rascunhos" value={m.produtosRascunho} icon={FileText} color="bg-slate-500" small />
          <MetricCard label="Destaque" value={m.produtosDestaque} icon={Star} color="bg-amber-500" small />
          <MetricCard label="Sem Estoque" value={m.produtosSemEstoque} icon={AlertTriangle} color="bg-red-500" small />
          <MetricCard label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-500" small />
          <MetricCard label="Valor Estoque" value={m.valorEstoqueProdutos} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" format="currency" small />
          <MetricCard label="Mais Vendido" value={m.produtoMaisVendido} icon={Award} color="bg-gradient-to-br from-amber-500 to-amber-600" format="text" small />
          <MetricCard label="Maior Receita" value={m.produtoMaiorReceita} icon={DollarSign} color="bg-gradient-to-br from-green-500 to-green-600" format="text" small />
        </div>

        {/* Top Products Bar */}
        {m.topProducts.length > 0 && (
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-[hsl(var(--admin-text-muted))] mb-3">Ranking de Produtos por Vendas</p>
              <div className="space-y-2">
                {m.topProducts.map((p, i) => (
                  <MiniBar key={p.name} label={`${i + 1}. ${p.name}`} value={p.qty} max={m.topProducts[0]?.qty || 1} color="bg-gradient-to-r from-orange-500 to-amber-500" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========== CATEGORIAS ========== */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard label="Total Categorias" value={m.totalCategorias} icon={Layers} color="bg-gradient-to-br from-indigo-500 to-indigo-600" href="/admin/categorias" small />
          <MetricCard label="Ativas" value={m.categoriasAtivas} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Inativas" value={m.categoriasInativas} icon={AlertTriangle} color="bg-gray-500" small />
        </div>

        {/* ========== ORÇAMENTOS ========== */}
        <SectionTitle icon={FileText} color="bg-gradient-to-br from-violet-500 to-violet-600">Orçamentos</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Orçamentos" value={m.totalOrcamentos} icon={FileText} color="bg-gradient-to-br from-violet-500 to-violet-600" href="/admin/orcamentos" small />
          <MetricCard label="Pendentes" value={m.orcamentosPendentes} icon={Clock} color="bg-yellow-500" small />
          <MetricCard label="Aprovados" value={m.orcamentosAprovados} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Convertidos" value={m.orcamentosConvertidos} icon={TrendingUp} color="bg-blue-500" small />
          <MetricCard label="Rejeitados" value={m.orcamentosRejeitados} icon={AlertTriangle} color="bg-red-500" small />
          <MetricCard label="Hoje" value={m.orcamentosHoje} icon={FileText} color="bg-gradient-to-br from-violet-600 to-purple-600" small />
          <MetricCard label="No Mês" value={m.orcamentosMes} icon={FileText} color="bg-gradient-to-br from-purple-500 to-purple-600" small />
          <MetricCard label="Taxa Conversão" value={m.taxaConversaoOrcamento} icon={Target} color="bg-gradient-to-br from-emerald-500 to-emerald-600" format="percent" small />
        </div>

        {/* ========== AVALIAÇÕES ========== */}
        <SectionTitle icon={Star} color="bg-gradient-to-br from-amber-500 to-amber-600">Avaliações</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <MetricCard label="Total Avaliações" value={m.totalReviews} icon={Star} color="bg-gradient-to-br from-amber-500 to-amber-600" href="/admin/avaliacoes" small />
          <MetricCard label="Pendentes" value={m.reviewsPendentes} icon={Clock} color="bg-yellow-500" small />
          <MetricCard label="Aprovadas" value={m.reviewsAprovadas} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Média Geral" value={m.mediaGeral} icon={Star} color="bg-gradient-to-br from-amber-600 to-orange-600" format="percent" subtitle="de 5.0" small />
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
            <CardContent className="p-3 space-y-1">
              {[
                { stars: 5, count: m.reviews5, color: 'bg-green-500' },
                { stars: 4, count: m.reviews4, color: 'bg-emerald-500' },
                { stars: 3, count: m.reviews3, color: 'bg-yellow-500' },
                { stars: 2, count: m.reviews2, color: 'bg-orange-500' },
                { stars: 1, count: m.reviews1, color: 'bg-red-500' },
              ].map(r => (
                <MiniBar key={r.stars} label={`${'★'.repeat(r.stars)}`} value={r.count} max={Math.max(m.reviews5, m.reviews4, m.reviews3, m.reviews2, m.reviews1, 1)} color={r.color} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ========== FINANCEIRO ========== */}
        <SectionTitle icon={BarChart3} color="bg-gradient-to-br from-emerald-500 to-emerald-600">Financeiro (12 meses)</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard label="Receita Bruta" value={m.receitaBruta12m} icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-emerald-600" format="currency" small />
          <MetricCard label="Custo Material" value={m.custoMaterial} icon={Boxes} color="bg-gradient-to-br from-red-500 to-red-600" format="currency" small />
          <MetricCard label="Custo Mão de Obra" value={m.custoMaoDeObra} icon={Wrench} color="bg-gradient-to-br from-red-600 to-orange-600" format="currency" small />
          <MetricCard label="Custo Frete" value={m.custoFrete} icon={Truck} color="bg-gradient-to-br from-orange-500 to-orange-600" format="currency" small />
          <MetricCard label="Custos Totais" value={m.custoTotal} icon={TrendingDown} color="bg-gradient-to-br from-red-500 to-red-600" format="currency" small />
          <MetricCard label="Impostos (Simples)" value={m.impostos} icon={Landmark} color="bg-gradient-to-br from-amber-500 to-amber-600" format="currency" subtitle={`Faixa ${m.faixaSimples} - ${m.aliquotaEfetiva.toFixed(2)}%`} small />
          <MetricCard label="Receita Líquida" value={m.receitaLiquida} icon={TrendingUp} color="bg-gradient-to-br from-blue-500 to-blue-600" format="currency" small />
          <MetricCard label="Margem Líquida" value={m.margemLiquida} icon={PieChart} color="bg-gradient-to-br from-blue-600 to-indigo-600" format="percent" small />
          <MetricCard label="Alíquota Efetiva" value={m.aliquotaEfetiva} icon={Percent} color="bg-gradient-to-br from-amber-600 to-orange-600" format="percent" small />
          <MetricCard label="Faixa Simples" value={m.faixaSimples} icon={Layers} color="bg-gradient-to-br from-slate-500 to-slate-600" subtitle={`Anexo ${m.faixaSimples <= 3 ? 'II/III' : 'IV/V'}`} small />
        </div>

        {/* ========== CAIXA ========== */}
        <SectionTitle icon={Wallet} color="bg-gradient-to-br from-green-500 to-green-600">Caixa</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Entradas Hoje" value={m.entradasHoje} icon={ArrowUpRight} color="bg-green-500" format="currency" small />
          <MetricCard label="Saídas Hoje" value={m.saidasHoje} icon={ArrowDownRight} color="bg-red-500" format="currency" small />
          <MetricCard label="Saldo do Dia" value={m.saldoDia} icon={Wallet} color={m.saldoDia >= 0 ? "bg-green-600" : "bg-red-600"} format="currency" small />
          <MetricCard label="Entradas Mês" value={m.entradasMes} icon={ArrowUpRight} color="bg-gradient-to-br from-green-500 to-emerald-600" format="currency" small />
          <MetricCard label="Saídas Mês" value={m.saidasMes} icon={ArrowDownRight} color="bg-gradient-to-br from-red-500 to-rose-600" format="currency" small />
          <MetricCard label="Saldo Mês" value={m.saldoMes} icon={Wallet} color={m.saldoMes >= 0 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-red-600 to-red-700"} format="currency" small />
        </div>

        {/* ========== CUPONS & PROMOÇÕES ========== */}
        <SectionTitle icon={Tag} color="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600">Cupons & Promoções</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Total Cupons" value={m.totalCupons} icon={Tag} color="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600" href="/admin/cupons" small />
          <MetricCard label="Cupons Ativos" value={m.cuponsAtivos} icon={CheckCircle} color="bg-green-500" small />
          <MetricCard label="Cupons Inativos" value={m.cuponsInativos} icon={AlertTriangle} color="bg-gray-500" small />
          <MetricCard label="Usos de Cupons" value={m.totalUsoCupons} icon={Zap} color="bg-gradient-to-br from-purple-500 to-purple-600" small />
          <MetricCard label="Promoções Ativas" value={m.promocoesAtivas} icon={Percent} color="bg-gradient-to-br from-orange-500 to-orange-600" href="/admin/promocoes" small />
          <MetricCard label="Promoções Inativas" value={m.promocoesInativas} icon={Percent} color="bg-gray-500" small />
        </div>

        {/* ========== WHATSAPP ========== */}
        <SectionTitle icon={MessageSquare} color="bg-gradient-to-br from-green-500 to-green-600">WhatsApp</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Mensagens Enviadas" value={m.whatsappEnviadas} icon={MessageSquare} color="bg-gradient-to-br from-green-500 to-green-600" href="/admin/whatsapp" small />
          <MetricCard label="Pendentes" value={m.whatsappPendentes} icon={Clock} color="bg-yellow-500" small />
          <MetricCard label="Com Erros" value={m.whatsappErros} icon={AlertTriangle} color="bg-red-500" small />
          <MetricCard label="Instâncias Online" value={m.whatsappConectadas} icon={Zap} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subtitle={`de ${m.whatsappConectadas} total`} small />
        </div>

        {/* ========== ESTOQUE MATÉRIAS-PRIMAS ========== */}
        <SectionTitle icon={Boxes} color="bg-gradient-to-br from-amber-500 to-amber-600">Estoque de Matérias-Primas</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Materiais" value={m.totalMateriais} icon={Boxes} color="bg-gradient-to-br from-amber-500 to-amber-600" small />
          <MetricCard label="Estoque Baixo" value={m.materiaisEstoqueBaixo} icon={AlertTriangle} color={m.materiaisEstoqueBaixo > 0 ? "bg-red-500" : "bg-green-500"} small />
          <MetricCard label="Valor em Estoque" value={m.valorEstoqueMateriais} icon={DollarSign} color="bg-gradient-to-br from-amber-600 to-orange-600" format="currency" small />
          <MetricCard label="Movim. Hoje" value={m.movimentacoesHoje} icon={RefreshCw} color="bg-gradient-to-br from-blue-500 to-blue-600" small />
        </div>

        {/* ========== SISTEMA & SEGURANÇA ========== */}
        <SectionTitle icon={Shield} color="bg-gradient-to-br from-slate-500 to-slate-600">Sistema & Segurança</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Ações Admin Hoje" value={m.auditoriaHoje} icon={Activity} color="bg-gradient-to-br from-slate-500 to-slate-600" href="/admin/logs" small />
          <MetricCard label="Webhooks Recebidos" value={m.webhooksRecebidos} icon={Webhook} color="bg-gradient-to-br from-indigo-500 to-indigo-600" small />
          <MetricCard label="Webhooks com Erro" value={m.webhooksErro} icon={AlertTriangle} color={m.webhooksErro > 0 ? "bg-red-500" : "bg-green-500"} small />
          <MetricCard label="Banners Ativos" value={m.bannersAtivos} icon={Image} color="bg-gradient-to-br from-pink-500 to-pink-600" href="/admin/hero" small />
        </div>

        {/* ========== ATIVIDADE RECENTE ========== */}
        <SectionTitle icon={Activity} color="bg-gradient-to-br from-pink-500 to-pink-600">Atividade Recente</SectionTitle>
        <RealActivityFeed />

      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
