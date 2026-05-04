import { MetricCard as M, ChartCard, SectionLabel as Sec, CustomTooltip } from '@/components/admin/dashboard';
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, Tooltip,
} from 'recharts';
import {
  Wrench, Clock, CheckCircle, Users, UserPlus, Target, Eye, Activity,
  Package, AlertTriangle, DollarSign, FileText, TrendingUp, Star, MessageSquare,
  Zap, Globe, Wallet, Tag, Percent, Boxes,
} from 'lucide-react';
import type { DashboardMetricsData } from './types';

interface PieEntry { fill: string }

const renderPieCells = (arr: unknown[]) =>
  arr.map((e, i: number) => <Cell key={i} fill={(e as PieEntry).fill} />);

export function DashboardSections({ m }: { m: DashboardMetricsData }) {
  const productionDistribution = m.productionDistribution || [];
  const leadsPorDia = m.leadsPorDia || [];
  const visitasPorDia = m.visitasPorDia || [];
  const productsDistribution = m.productsDistribution || [];
  const quotesDistribution = m.quotesDistribution || [];
  const reviewsDistribution = m.reviewsDistribution || [];
  const whatsappDistribution = m.whatsappDistribution || [];
  const caixaPorDia = m.caixaPorDia || [];

  return (
    <>
      <div className="col-span-3">
        <Sec icon={Wrench} color="bg-blue-600">Produção</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {productionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={productionDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{renderPieCells(productionDistribution)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-white/40 text-center pt-4">Sem dados</p>}
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
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
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
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
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
              <PieChart><Pie data={productsDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{renderPieCells(productsDistribution)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-white/40 text-center pt-4">Sem dados</p>}
        </ChartCard>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <M label="Total" value={m.totalProdutos} icon={Package} color="bg-orange-600" href="/admin/produtos" />
          <M label="Sem Estoque" value={m.produtosSemEstoque} icon={AlertTriangle} color="bg-red-600" />
          <M label="Estoque Baixo" value={m.produtosEstoqueBaixo} icon={AlertTriangle} color="bg-yellow-600" />
          <M label="Valor Estoque" value={m.valorEstoqueProdutos} icon={DollarSign} color="bg-emerald-600" format="currency" />
        </div>
      </div>

      <div className="col-span-3">
        <Sec icon={FileText} color="bg-violet-600">Orçamentos</Sec>
        <ChartCard title="" className="mt-1" height="h-24">
          {quotesDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={quotesDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{renderPieCells(quotesDistribution)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-white/40 text-center pt-4">Sem dados</p>}
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
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Avaliações" radius={[3,3,0,0]}>{renderPieCells(reviewsDistribution)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-white/40 text-center pt-4">Sem dados</p>}
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
              <PieChart><Pie data={whatsappDistribution} cx="50%" cy="50%" innerRadius="35%" outerRadius="70%" paddingAngle={3} dataKey="value">{renderPieCells(whatsappDistribution)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[10px] text-white/40 text-center pt-4">Sem dados</p>}
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
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
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
          <M label="Mat. Baixos" value={m.materiaisEstoqueBaixo} icon={Boxes} color={m.materiaisEstoqueBaixo > 0 ? 'bg-red-600' : 'bg-green-600'} />
        </div>
      </div>
    </>
  );
}
