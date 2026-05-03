import { sum, startOfDay, daysAgo, buildDistribution } from '../useDashboardMetricsHelpers';
import { DashboardSources, DateBoundaries } from './types';
import type { SalesContext } from './computeSales';
import type { OperationsContext } from './computeOperations';

export function computeCharts(all: DashboardSources, dates: DateBoundaries, sales: SalesContext, ops: OperationsContext) {
  const { now, monthStart } = dates;
  const { activeOrders, paidOrders, pendingPaymentOrders, failedPaymentOrders, paidOrdersMonth, pixOrders, cardOrders, boletoOrders, metrics: sm } = sales;
  const { paidOrdersById, paidOrderItems, sortedProducts, reviewsByRating, leadsMes, orcamentosMes, visitasMes } = ops;

  const vendasPorDia: { date: string; vendas: number; receita: number; aguardando: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(daysAgo(i));
    const nextDay = new Date(day.getTime() + 86400000);
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= day && d < nextDay; };
    vendasPorDia.push({
      date: day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      vendas: activeOrders.filter(inRange).length,
      receita: sum(paidOrders.filter(inRange)),
      aguardando: sum(pendingPaymentOrders.filter(inRange)),
    });
  }

  const receitaPorMes: { mes: string; receita: number; vendas: number; custos: number }[] = [];
  const ticketPorMes: { mes: string; ticket: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= mStart && d <= mEnd; };
    const mOrders = paidOrders.filter(inRange);
    const mItems = paidOrderItems.filter(item => {
      const order = item.order_id ? paidOrdersById.get(item.order_id) : null;
      return order ? inRange(order) : false;
    });
    receitaPorMes.push({
      mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: sum(mOrders), vendas: mOrders.length,
      custos: mItems.reduce((s, it) => s + (it.cost_material || 0) + (it.cost_labor || 0) + (it.cost_shipping || 0), 0),
    });
    ticketPorMes.push({ mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }), ticket: mOrders.length > 0 ? sum(mOrders) / mOrders.length : 0 });
  }

  const makeDailySeries = <T extends Record<string, number>>(fn: (day: Date, nextDay: Date) => T) => {
    const result: (T & { date: string })[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(daysAgo(i));
      const nextDay = new Date(day.getTime() + 86400000);
      result.push({ date: day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }), ...fn(day, nextDay) } as T & { date: string });
    }
    return result;
  };

  const leadsPorDia = makeDailySeries((day, nextDay) => ({
    leads: all.leads.filter(l => { const d = new Date(l.created_at); return d >= day && d < nextDay; }).length,
  }));
  const visitasPorDia = makeDailySeries((day, nextDay) => ({
    visitas: all.pageViews.filter(p => { const d = new Date(p.created_at); return d >= day && d < nextDay; }).length,
  }));
  const receitaComparativa7d = makeDailySeries((day, nextDay) => {
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= day && d < nextDay; };
    const dayPaid = paidOrders.filter(inRange);
    const dayPending = pendingPaymentOrders.filter(inRange);
    return { recebido: sum(dayPaid), aguardando: sum(dayPending), pedidosPagos: dayPaid.length, pedidosPendentes: dayPending.length };
  });
  const conversaoPorDia = makeDailySeries((day, nextDay) => {
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= day && d < nextDay; };
    const dV = all.pageViews.filter(inRange).length;
    const dP = activeOrders.filter(inRange).length;
    return { visitas: dV, pedidos: dP, taxa: dV > 0 ? (dP / dV * 100) : 0 };
  });

  const productionDistribution = buildDistribution([
    { name: 'Aguardando', value: ops.metrics.prodPending, fill: 'hsl(220,15%,50%)' },
    { name: 'Ag. Material', value: ops.metrics.prodAwaitingMaterial, fill: 'hsl(45,93%,47%)' },
    { name: 'Em Produção', value: ops.metrics.prodInProduction, fill: 'hsl(210,80%,55%)' },
    { name: 'Qualidade', value: ops.metrics.prodQualityCheck, fill: 'hsl(270,70%,55%)' },
    { name: 'Prontos', value: ops.metrics.prodReady, fill: 'hsl(145,63%,42%)' },
    { name: 'Enviados', value: ops.metrics.prodShipped, fill: 'hsl(170,70%,45%)' },
  ]);
  const reviewsDistribution = buildDistribution([
    { name: '5★', value: reviewsByRating[0], fill: 'hsl(145,63%,42%)' },
    { name: '4★', value: reviewsByRating[1], fill: 'hsl(170,70%,45%)' },
    { name: '3★', value: reviewsByRating[2], fill: 'hsl(45,93%,47%)' },
    { name: '2★', value: reviewsByRating[3], fill: 'hsl(25,90%,50%)' },
    { name: '1★', value: reviewsByRating[4], fill: 'hsl(0,72%,51%)' },
  ]);

  const funnelPaidCount = all.orders.filter(o => o.payment_status === 'paid' && new Date(o.created_at) >= monthStart).length;
  const funnelData = [
    { stage: 'Visitas', value: visitasMes, color: 'hsl(210,80%,55%)' },
    { stage: 'Leads', value: leadsMes, color: 'hsl(270,70%,55%)' },
    { stage: 'Orçamentos', value: orcamentosMes, color: 'hsl(45,93%,47%)' },
    { stage: 'Pedidos', value: sm.vendasMes, color: 'hsl(170,70%,45%)' },
    { stage: 'Pagos', value: funnelPaidCount, color: 'hsl(145,63%,42%)' },
  ];

  const oneHourAgo = new Date(Date.now() - 3600000);
  const isAbandoned = (o: { payment_status: string; order_status: string; created_at: string }) =>
    o.payment_status === 'pending' && o.order_status === 'pending' && new Date(o.created_at) < oneHourAgo;
  const abandonedCarts = all.orders.filter(isAbandoned).length;

  return {
    vendasPorDia, receitaPorMes, ticketPorMes,
    leadsPorDia, visitasPorDia, receitaComparativa7d, conversaoPorDia,
    funnelData,
    visitToLead: visitasMes > 0 ? (leadsMes / visitasMes * 100) : 0,
    leadToQuote: leadsMes > 0 ? (orcamentosMes / leadsMes * 100) : 0,
    quoteToOrder: orcamentosMes > 0 ? (sm.vendasMes / orcamentosMes * 100) : 0,
    orderToPaid: sm.vendasMes > 0 ? (funnelPaidCount / sm.vendasMes * 100) : 0,
    overallConversion: visitasMes > 0 ? (funnelPaidCount / visitasMes * 100) : 0,
    abandonedCarts,
    abandonedCartsMonth: all.orders.filter(o => new Date(o.created_at) >= monthStart && isAbandoned(o)).length,
    abandonedValue: all.orders.filter(isAbandoned).reduce((s, o) => s + (o.total || 0), 0),
    topProducts: sortedProducts.slice(0, 5),
    paymentDistribution: buildDistribution([
      { name: 'PIX', value: pixOrders.length, fill: 'hsl(170, 70%, 45%)' },
      { name: 'Cartão', value: cardOrders.length, fill: 'hsl(210, 80%, 55%)' },
      { name: 'Boleto', value: boletoOrders.length, fill: 'hsl(220, 15%, 50%)' },
    ]),
    statusDistribution: buildDistribution([
      { name: 'Pendentes', value: sm.vendasPendentes, fill: 'hsl(45, 93%, 47%)' },
      { name: 'Confirmadas', value: sm.vendasConfirmadas, fill: 'hsl(210, 80%, 55%)' },
      { name: 'Processando', value: sm.vendasProcessando, fill: 'hsl(270, 70%, 55%)' },
      { name: 'Enviadas', value: sm.vendasEnviadas, fill: 'hsl(170, 70%, 45%)' },
      { name: 'Entregues', value: sm.vendasEntregues, fill: 'hsl(145, 63%, 42%)' },
      { name: 'Canceladas', value: sm.vendasCanceladas, fill: 'hsl(0, 72%, 51%)' },
    ]),
    receitaStatusResumoMes: buildDistribution([
      { name: 'Recebido', value: sum(paidOrdersMonth), fill: 'hsl(145, 63%, 42%)' },
      { name: 'Aguardando', value: sum(pendingPaymentOrders.filter(o => new Date(o.created_at) >= monthStart)), fill: 'hsl(45, 93%, 47%)' },
      { name: 'Falhou', value: sum(failedPaymentOrders.filter(o => new Date(o.created_at) >= monthStart)), fill: 'hsl(0, 72%, 51%)' },
    ]),
    quotesDistribution: buildDistribution([
      { name: 'Pendentes', value: ops.metrics.orcamentosPendentes, fill: 'hsl(45,93%,47%)' },
      { name: 'Aprovados', value: ops.metrics.orcamentosAprovados, fill: 'hsl(210,80%,55%)' },
      { name: 'Convertidos', value: ops.metrics.orcamentosConvertidos, fill: 'hsl(145,63%,42%)' },
      { name: 'Rejeitados', value: ops.metrics.orcamentosRejeitados, fill: 'hsl(0,72%,51%)' },
    ]),
    productsDistribution: buildDistribution([
      { name: 'Ativos', value: ops.metrics.produtosAtivos, fill: 'hsl(145,63%,42%)' },
      { name: 'Inativos', value: ops.metrics.produtosInativos, fill: 'hsl(220,15%,50%)' },
      { name: 'Rascunho', value: ops.metrics.produtosRascunho, fill: 'hsl(45,93%,47%)' },
      { name: 'Sem Estoque', value: ops.metrics.produtosSemEstoque, fill: 'hsl(0,72%,51%)' },
    ]),
    whatsappDistribution: buildDistribution([
      { name: 'Enviadas', value: ops.metrics.whatsappEnviadas, fill: 'hsl(145,63%,42%)' },
      { name: 'Pendentes', value: ops.metrics.whatsappPendentes, fill: 'hsl(45,93%,47%)' },
      { name: 'Erros', value: ops.metrics.whatsappErros, fill: 'hsl(0,72%,51%)' },
    ]),
    productionDistribution, reviewsDistribution,
  };
}
