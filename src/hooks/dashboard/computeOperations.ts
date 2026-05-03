import { calculateSimplesTax } from '@/hooks/useFinancialData';
import { sum, buildCashDailyTimeSeries } from '../useDashboardMetricsHelpers';
import { byDate, DashboardSources, DateBoundaries, TaxSettings } from './types';
import type { SalesContext } from './computeSales';

export function computeOperations(
  all: DashboardSources,
  dates: DateBoundaries,
  taxSettings: TaxSettings | null,
  sales: SalesContext,
) {
  const { todayStart, weekStart, monthStart, twelveMonthsAgo } = dates;
  const { paidOrders, ordersToday, ordersMonth } = sales;

  // PRODUÇÃO
  const prodCounts = {
    prodPending: all.orders.filter(o => o.production_status === 'pending').length,
    prodAwaitingMaterial: all.orders.filter(o => o.production_status === 'awaiting_material').length,
    prodInProduction: all.orders.filter(o => o.production_status === 'in_production').length,
    prodQualityCheck: all.orders.filter(o => o.production_status === 'quality_check').length,
    prodReady: all.orders.filter(o => o.production_status === 'ready').length,
    prodShipped: all.orders.filter(o => o.production_status === 'shipped').length,
  };
  const completedProd = all.orders.filter(o => o.production_started_at && o.production_completed_at);
  const tempoMedioProdDias = completedProd.length > 0
    ? completedProd.reduce((s, o) => s + (new Date(o.production_completed_at!).getTime() - new Date(o.production_started_at!).getTime()), 0) / completedProd.length / 86400000
    : 0;

  // LEADS
  const leadsHoje = byDate(all.leads, todayStart).length;
  const leadsSemana = byDate(all.leads, weekStart).length;
  const leadsMes = byDate(all.leads, monthStart).length;
  const leadsInscritos = all.leads.filter(l => l.is_subscribed).length;

  // CLIENTES
  const uniqueCustomers = new Set(all.orders.map(o => o.customer_email?.toLowerCase()).filter(Boolean)).size;
  const newCustomersToday = new Set(ordersToday.map(o => o.customer_email?.toLowerCase()).filter(Boolean)).size;
  const newCustomersMonth = new Set(ordersMonth.map(o => o.customer_email?.toLowerCase()).filter(Boolean)).size;
  const customerOrderCount = new Map<string, number>();
  all.orders.forEach(o => {
    const e = o.customer_email?.toLowerCase();
    if (e) customerOrderCount.set(e, (customerOrderCount.get(e) || 0) + 1);
  });
  const repeatCustomers = Array.from(customerOrderCount.values()).filter(c => c > 1).length;
  const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100) : 0;

  // PRODUTOS
  const produtosAtivos = all.products.filter(p => p.status === 'active').length;
  const produtosInativos = all.products.filter(p => p.status === 'inactive').length;
  const produtosRascunho = all.products.filter(p => p.status === 'draft').length;
  const produtosSemEstoque = all.products.filter(p => (p.stock || 0) <= 0 && p.status === 'active').length;
  const produtosEstoqueBaixo = all.products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5) && p.status === 'active').length;
  const produtosDestaque = all.products.filter(p => p.is_featured).length;

  const paidOrderIds = new Set(paidOrders.map(o => o.id));
  const paidOrdersById = new Map(paidOrders.map(o => [o.id, o]));
  const paidOrderItems = all.orderItems.filter(item => item.order_id && paidOrderIds.has(item.order_id));
  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  paidOrderItems.forEach(item => {
    const key = item.product_name || item.product_id || 'unknown';
    const existing = productSales.get(key);
    if (existing) { existing.qty += item.quantity || 0; existing.revenue += item.total_price || 0; }
    else { productSales.set(key, { name: item.product_name || 'Produto', qty: item.quantity || 0, revenue: item.total_price || 0 }); }
  });
  const sortedProducts = Array.from(productSales.values()).sort((a, b) => b.qty - a.qty);
  const valorEstoqueProdutos = all.products.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

  // ORÇAMENTOS
  const orcamentosPendentes = all.quotes.filter(q => q.status === 'pending').length;
  const orcamentosAprovados = all.quotes.filter(q => q.status === 'approved').length;
  const orcamentosConvertidos = all.quotes.filter(q => q.status === 'converted').length;
  const orcamentosRejeitados = all.quotes.filter(q => q.status === 'rejected').length;
  const orcamentosHoje = byDate(all.quotes, todayStart).length;
  const orcamentosMes = byDate(all.quotes, monthStart).length;

  // REVIEWS
  const reviewsPendentes = all.reviews.filter(r => !r.is_approved).length;
  const reviewsAprovadas = all.reviews.filter(r => r.is_approved).length;
  const mediaGeral = all.reviews.length > 0 ? all.reviews.reduce((s, r) => s + r.rating, 0) / all.reviews.length : 0;
  const reviewsByRating = [5, 4, 3, 2, 1].map(n => all.reviews.filter(r => r.rating === n).length);

  // TRÁFEGO
  const visitasHoje = byDate(all.pageViews, todayStart).length;
  const visitasSemana = byDate(all.pageViews, weekStart).length;
  const visitasMes = all.pageViews.length;
  const sessoesUnicas = new Set(all.pageViews.map(p => p.session_id).filter(Boolean)).size;
  const taxaConversao = visitasMes > 0 ? (ordersMonth.length / visitasMes * 100) : 0;
  const pageCounts = new Map<string, number>();
  all.pageViews.forEach(p => pageCounts.set(p.page_path, (pageCounts.get(p.page_path) || 0) + 1));
  const topPages = Array.from(pageCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, views]) => ({ path, views }));

  // FINANCEIRO
  const orders12m = paidOrders.filter(o => new Date(o.created_at) >= twelveMonthsAgo);
  const receitaBruta12m = sum(orders12m);
  const orderItems12m = paidOrderItems.filter(item => {
    const order = item.order_id ? paidOrdersById.get(item.order_id) : null;
    return order ? new Date(order.created_at) >= twelveMonthsAgo : false;
  });
  const custoMaterial = orderItems12m.reduce((s, i) => s + (i.cost_material || 0), 0);
  const custoMaoDeObra = orderItems12m.reduce((s, i) => s + (i.cost_labor || 0), 0);
  const custoFrete = orderItems12m.reduce((s, i) => s + (i.cost_shipping || 0), 0);
  const custoTotal = custoMaterial + custoMaoDeObra + custoFrete;
  const anexo: 'II' | 'III' = (taxSettings?.simples_anexo || 'III') as 'II' | 'III';
  const taxCalc = calculateSimplesTax(receitaBruta12m, anexo);
  const receitaLiquida = receitaBruta12m - custoTotal - taxCalc.valorImposto;
  const margemLiquida = receitaBruta12m > 0 ? (receitaLiquida / receitaBruta12m * 100) : 0;

  // CUPONS / PROMOÇÕES
  const cuponsAtivos = all.coupons.filter(c => c.is_active).length;
  const totalUsoCupons = all.coupons.reduce((s, c) => s + (c.usage_count || 0), 0);
  const promocoesAtivas = all.promotions.filter(p => p.status === 'active').length;

  // WHATSAPP
  const whatsappEnviadas = all.whatsappMsgs.filter(m => m.status === 'sent').length;
  const whatsappPendentes = all.whatsappMsgs.filter(m => m.status === 'pending').length;
  const whatsappErros = all.whatsappMsgs.filter(m => m.status === 'error' || m.status === 'failed').length;
  const whatsappConectadas = all.whatsappInstances.filter(i => i.status === 'connected' || i.status === 'open').length;

  // ESTOQUE
  const materiaisEstoqueBaixo = all.rawMaterials.filter(m => (m.quantity || 0) <= (m.min_quantity || 0)).length;
  const valorEstoqueMateriais = all.rawMaterials.reduce((s, m) => s + ((m.quantity || 0) * (m.cost_per_unit || 0)), 0);
  const movimentacoesHoje = byDate(all.stockMovements, todayStart).length;

  // CAIXA
  const entradas = all.cashTx.filter(t => t.type === 'income');
  const saidas = all.cashTx.filter(t => t.type === 'expense');
  const sumIfAfter = (arr: typeof entradas, ref: Date) =>
    arr.filter(t => new Date(t.transaction_date) >= ref).reduce((s, t) => s + (t.amount || 0), 0);
  const entradasHoje = sumIfAfter(entradas, todayStart);
  const saidasHoje = sumIfAfter(saidas, todayStart);
  const entradasMes = sumIfAfter(entradas, monthStart);
  const saidasMes = sumIfAfter(saidas, monthStart);
  const caixaPorDia = buildCashDailyTimeSeries(entradas, saidas, 7);

  return {
    paidOrdersById, paidOrderItems, sortedProducts, productSales,
    reviewsByRating, leadsMes, orcamentosMes, visitasMes, entradas, saidas,
    metrics: {
      ...prodCounts, tempoMedioProdDias,
      totalLeads: all.leads.length, leadsHoje, leadsSemana, leadsMes, leadsInscritos,
      leadsDesinscritos: all.leads.filter(l => !l.is_subscribed).length,
      uniqueCustomers, newCustomersToday, newCustomersMonth, repeatCustomers, repeatRate,
      totalProdutos: all.products.length, produtosAtivos, produtosInativos,
      produtosRascunho, produtosSemEstoque, produtosEstoqueBaixo, produtosDestaque,
      produtoMaisVendido: sortedProducts[0]?.name || 'N/A',
      produtoMaiorReceita: Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue)[0]?.name || 'N/A',
      valorEstoqueProdutos,
      totalCategorias: all.categories.length,
      categoriasAtivas: all.categories.filter(c => c.status === 'active').length,
      categoriasInativas: all.categories.filter(c => c.status !== 'active').length,
      totalOrcamentos: all.quotes.length, orcamentosPendentes, orcamentosAprovados,
      orcamentosConvertidos, orcamentosRejeitados, orcamentosHoje, orcamentosMes,
      taxaConversaoOrcamento: all.quotes.length > 0 ? (orcamentosConvertidos / all.quotes.length * 100) : 0,
      totalReviews: all.reviews.length, reviewsPendentes, reviewsAprovadas, mediaGeral,
      reviews5: reviewsByRating[0], reviews4: reviewsByRating[1], reviews3: reviewsByRating[2],
      reviews2: reviewsByRating[3], reviews1: reviewsByRating[4],
      visitasHoje, visitasSemana, visitasMes, sessoesUnicas, taxaConversao, topPages,
      receitaBruta12m, custoMaterial, custoMaoDeObra, custoFrete, custoTotal,
      impostos: taxCalc.valorImposto, aliquotaEfetiva: taxCalc.aliquotaEfetiva,
      faixaSimples: taxCalc.faixa, receitaLiquida, margemLiquida,
      totalCupons: all.coupons.length, cuponsAtivos,
      cuponsInativos: all.coupons.filter(c => !c.is_active).length, totalUsoCupons,
      totalPromocoes: all.promotions.length, promocoesAtivas,
      promocoesInativas: all.promotions.filter(p => p.status !== 'active').length,
      totalWhatsappMsgs: all.whatsappMsgs.length,
      whatsappEnviadas, whatsappPendentes, whatsappErros, whatsappConectadas,
      totalMateriais: all.rawMaterials.length, materiaisEstoqueBaixo,
      valorEstoqueMateriais, movimentacoesHoje,
      entradasHoje, saidasHoje, saldoDia: entradasHoje - saidasHoje,
      entradasMes, saidasMes, saldoMes: entradasMes - saidasMes,
      auditoriaHoje: byDate(all.auditLogs, todayStart).length,
      webhooksRecebidos: all.webhookLogs.length,
      webhooksErro: all.webhookLogs.filter(w => !!w.error_message).length,
      bannersAtivos: all.heroSlides.filter(h => h.status === 'active').length,
      caixaPorDia,
    },
  };
}

export type OperationsContext = ReturnType<typeof computeOperations>;
