import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateSimplesTax } from '@/hooks/useFinancialData';
import {
  startOfDay, startOfWeek, startOfMonth, startOfYear, daysAgo,
  sum, filterByDate, filterByDateRange, buildDistribution, buildCashDailyTimeSeries,
} from './useDashboardMetricsHelpers';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics-full'],
    queryFn: async () => {
      const [
        { data: orders }, { data: products }, { data: categories },
        { data: quotes }, { data: leads }, { data: reviews },
        { data: promotions }, { data: coupons }, { data: pageViews },
        { data: cashTx }, { data: rawMaterials }, { data: stockMovements },
        { data: whatsappMsgs }, { data: whatsappInstances },
        { data: auditLogs }, { data: webhookLogs },
        { data: orderItems }, { data: taxSettings }, { data: heroSlides },
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').is('deleted_at', null),
        supabase.from('categories').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*'),
        supabase.from('promotions').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('page_views').select('*').gte('created_at', daysAgo(30).toISOString()),
        supabase.from('cash_transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('raw_materials').select('*'),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('whatsapp_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('whatsapp_instances').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('order_items').select('*'),
        supabase.from('company_tax_settings').select('*').maybeSingle(),
        supabase.from('hero_slides').select('*'),
      ]);

      const all = {
        orders: orders || [], products: products || [], categories: categories || [],
        quotes: quotes || [], leads: leads || [], reviews: reviews || [],
        promotions: promotions || [], coupons: coupons || [],
        pageViews: pageViews || [], cashTx: cashTx || [],
        rawMaterials: rawMaterials || [], stockMovements: stockMovements || [],
        whatsappMsgs: whatsappMsgs || [], whatsappInstances: whatsappInstances || [],
        auditLogs: auditLogs || [], webhookLogs: webhookLogs || [],
        orderItems: orderItems || [], heroSlides: heroSlides || [],
      };

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfWeek(now);
      const monthStart = startOfMonth(now);
      const yearStart = startOfYear(now);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

      return computeMetrics(all, { now, todayStart, weekStart, monthStart, yearStart, lastMonthStart, lastMonthEnd, twelveMonthsAgo }, taxSettings);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeMetrics(all: any, dates: any, taxSettings: any) {
  const { todayStart, weekStart, monthStart, yearStart, lastMonthStart, lastMonthEnd, twelveMonthsAgo, now } = dates;

  // VENDAS
  const activeOrders = all.orders.filter((o: { order_status: string }) => o.order_status !== 'cancelled');
  const paidOrders = activeOrders.filter((o: { payment_status: string }) => o.payment_status === 'paid');
  const pendingPaymentOrders = activeOrders.filter((o: { payment_status: string }) => o.payment_status === 'pending');
  const failedPaymentOrders = activeOrders.filter((o: { payment_status: string }) => ['failed', 'rejected'].includes(o.payment_status || ''));
  const cancelledOrders = all.orders.filter((o: { order_status: string }) => o.order_status === 'cancelled');

  const ordersToday = filterByDate(activeOrders, todayStart);
  const ordersWeek = filterByDate(activeOrders, weekStart);
  const ordersMonth = filterByDate(activeOrders, monthStart);
  const ordersYear = filterByDate(activeOrders, yearStart);
  const paidOrdersToday = filterByDate(paidOrders, todayStart);
  const paidOrdersWeek = filterByDate(paidOrders, weekStart);
  const paidOrdersMonth = filterByDate(paidOrders, monthStart);
  const paidOrdersYear = filterByDate(paidOrders, yearStart);
  const ordersLastMonth = filterByDateRange(activeOrders, lastMonthStart, lastMonthEnd);
  const paidOrdersLastMonth = filterByDateRange(paidOrders, lastMonthStart, lastMonthEnd);

  const vendasHoje = ordersToday.length, vendasSemana = ordersWeek.length, vendasMes = ordersMonth.length;
  const vendasAno = ordersYear.length, vendasMesAnterior = ordersLastMonth.length, vendasTotal = activeOrders.length;

  const receitaHoje = sum(paidOrdersToday), receitaSemana = sum(paidOrdersWeek);
  const receitaMes = sum(paidOrdersMonth), receitaAno = sum(paidOrdersYear);
  const receitaMesAnterior = sum(paidOrdersLastMonth), receitaTotal = sum(paidOrders);
  const receitaPendente = sum(pendingPaymentOrders), receitaFalhada = sum(failedPaymentOrders);

  const ticketMedio = paidOrders.length > 0 ? receitaTotal / paidOrders.length : 0;
  const ticketMedioHoje = paidOrdersToday.length > 0 ? receitaHoje / paidOrdersToday.length : 0;
  const maiorVenda = paidOrders.length > 0 ? Math.max(...paidOrders.map((o: { total: number }) => o.total || 0)) : 0;
  const menorVenda = paidOrders.filter((o: { total: number }) => o.total > 0).length > 0 ? Math.min(...paidOrders.filter((o: { total: number }) => o.total > 0).map((o: { total: number }) => o.total)) : 0;

  const statusCounts = {
    vendasPendentes: all.orders.filter((o: { order_status: string }) => o.order_status === 'pending').length,
    vendasConfirmadas: all.orders.filter((o: { order_status: string }) => o.order_status === 'confirmed').length,
    vendasProcessando: all.orders.filter((o: { order_status: string }) => o.order_status === 'processing').length,
    vendasEnviadas: all.orders.filter((o: { order_status: string }) => o.order_status === 'shipped').length,
    vendasEntregues: all.orders.filter((o: { order_status: string }) => o.order_status === 'delivered').length,
    vendasCanceladas: cancelledOrders.length,
  };

  const crescimentoVendas = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior * 100) : vendasMes > 0 ? 100 : 0;
  const crescimentoReceita = receitaMesAnterior > 0 ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior * 100) : receitaMes > 0 ? 100 : 0;

  // PAGAMENTOS
  const byPayment = (method: string) => paidOrders.filter((o: { payment_method: string }) => o.payment_method === method);
  const pixOrders = byPayment('pix'), cardOrders = byPayment('credit_card'), boletoOrders = byPayment('boleto');

  // PRODUÇÃO
  const prodCounts = {
    prodPending: all.orders.filter((o: { production_status: string }) => o.production_status === 'pending').length,
    prodAwaitingMaterial: all.orders.filter((o: { production_status: string }) => o.production_status === 'awaiting_material').length,
    prodInProduction: all.orders.filter((o: { production_status: string }) => o.production_status === 'in_production').length,
    prodQualityCheck: all.orders.filter((o: { production_status: string }) => o.production_status === 'quality_check').length,
    prodReady: all.orders.filter((o: { production_status: string }) => o.production_status === 'ready').length,
    prodShipped: all.orders.filter((o: { production_status: string }) => o.production_status === 'shipped').length,
  };

  const completedProd = all.orders.filter((o: { production_started_at: string; production_completed_at: string }) => o.production_started_at && o.production_completed_at);
  const tempoMedioProdDias = completedProd.length > 0
    ? completedProd.reduce((s: number, o: { production_completed_at: string; production_started_at: string }) => s + (new Date(o.production_completed_at).getTime() - new Date(o.production_started_at).getTime()), 0) / completedProd.length / 86400000
    : 0;

  // LEADS
  const leadsHoje = filterByDate(all.leads, todayStart).length;
  const leadsSemana = filterByDate(all.leads, weekStart).length;
  const leadsMes = filterByDate(all.leads, monthStart).length;
  const leadsInscritos = all.leads.filter((l: { is_subscribed: boolean }) => l.is_subscribed).length;

  // CLIENTES
  const uniqueCustomers = new Set(all.orders.map((o: { customer_email: string }) => o.customer_email?.toLowerCase())).size;
  const newCustomersToday = new Set(ordersToday.map((o: { customer_email: string }) => o.customer_email?.toLowerCase())).size;
  const newCustomersMonth = new Set(ordersMonth.map((o: { customer_email: string }) => o.customer_email?.toLowerCase())).size;

  // PRODUTOS
  const produtosAtivos = all.products.filter((p: { status: string }) => p.status === 'active').length;
  const produtosInativos = all.products.filter((p: { status: string }) => p.status === 'inactive').length;
  const produtosRascunho = all.products.filter((p: { status: string }) => p.status === 'draft').length;
  const produtosSemEstoque = all.products.filter((p: { stock: number; status: string }) => (p.stock || 0) <= 0 && p.status === 'active').length;
  const produtosEstoqueBaixo = all.products.filter((p: { stock: number; min_stock: number; status: string }) => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5) && p.status === 'active').length;
  const produtosDestaque = all.products.filter((p: { is_featured: boolean }) => p.is_featured).length;

  // Top products
  const paidOrderIds = new Set(paidOrders.map((o: { id: string }) => o.id));
  const paidOrdersById = new Map(paidOrders.map((o: { id: string }) => [o.id, o]));
  const paidOrderItems = all.orderItems.filter((item: { order_id: string }) => item.order_id && paidOrderIds.has(item.order_id));

  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  paidOrderItems.forEach((item: { product_name: string; product_id: string; quantity: number; total_price: number }) => {
    const key = item.product_name || item.product_id || 'unknown';
    const existing = productSales.get(key);
    if (existing) { existing.qty += item.quantity || 0; existing.revenue += item.total_price || 0; }
    else { productSales.set(key, { name: item.product_name || 'Produto', qty: item.quantity || 0, revenue: item.total_price || 0 }); }
  });
  const sortedProducts = Array.from(productSales.values()).sort((a, b) => b.qty - a.qty);
  const valorEstoqueProdutos = all.products.reduce((s: number, p: { stock: number; price: number }) => s + ((p.stock || 0) * (p.price || 0)), 0);

  // ORÇAMENTOS
  const orcamentosPendentes = all.quotes.filter((q: { status: string }) => q.status === 'pending').length;
  const orcamentosAprovados = all.quotes.filter((q: { status: string }) => q.status === 'approved').length;
  const orcamentosConvertidos = all.quotes.filter((q: { status: string }) => q.status === 'converted').length;
  const orcamentosRejeitados = all.quotes.filter((q: { status: string }) => q.status === 'rejected').length;
  const orcamentosHoje = filterByDate(all.quotes, todayStart).length;
  const orcamentosMes = filterByDate(all.quotes, monthStart).length;

  // AVALIAÇÕES
  const reviewsPendentes = all.reviews.filter((r: { is_approved: boolean }) => !r.is_approved).length;
  const reviewsAprovadas = all.reviews.filter((r: { is_approved: boolean }) => r.is_approved).length;
  const mediaGeral = all.reviews.length > 0 ? all.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / all.reviews.length : 0;
  const reviewsByRating = [5, 4, 3, 2, 1].map(n => all.reviews.filter((r: { rating: number }) => r.rating === n).length);

  // TRÁFEGO
  const visitasHoje = filterByDate(all.pageViews, todayStart).length;
  const visitasSemana = filterByDate(all.pageViews, weekStart).length;
  const visitasMes = all.pageViews.length;
  const sessoesUnicas = new Set(all.pageViews.map((p: { session_id: string }) => p.session_id).filter(Boolean)).size;
  const taxaConversao = visitasMes > 0 ? (vendasMes / visitasMes * 100) : 0;

  const pageCounts = new Map<string, number>();
  all.pageViews.forEach((p: { page_path: string }) => pageCounts.set(p.page_path, (pageCounts.get(p.page_path) || 0) + 1));
  const topPages = Array.from(pageCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, views]) => ({ path, views }));

  // FINANCEIRO
  const orders12m = paidOrders.filter((o: { created_at: string }) => new Date(o.created_at) >= twelveMonthsAgo);
  const receitaBruta12m = sum(orders12m);
  const orderItems12m = paidOrderItems.filter((item: { order_id: string }) => {
    const order = item.order_id ? paidOrdersById.get(item.order_id) : null;
    return order ? new Date((order as { created_at: string }).created_at) >= twelveMonthsAgo : false;
  });
  const custoMaterial = orderItems12m.reduce((s: number, i: { cost_material: number }) => s + (i.cost_material || 0), 0);
  const custoMaoDeObra = orderItems12m.reduce((s: number, i: { cost_labor: number }) => s + (i.cost_labor || 0), 0);
  const custoFrete = orderItems12m.reduce((s: number, i: { cost_shipping: number }) => s + (i.cost_shipping || 0), 0);
  const custoTotal = custoMaterial + custoMaoDeObra + custoFrete;

  const anexo = (taxSettings?.simples_anexo || 'III') as 'II' | 'III';
  const taxCalc = calculateSimplesTax(receitaBruta12m, anexo);
  const receitaLiquida = receitaBruta12m - custoTotal - taxCalc.valorImposto;
  const margemLiquida = receitaBruta12m > 0 ? (receitaLiquida / receitaBruta12m * 100) : 0;

  // CUPONS
  const cuponsAtivos = all.coupons.filter((c: { is_active: boolean }) => c.is_active).length;
  const totalUsoCupons = all.coupons.reduce((s: number, c: { usage_count: number }) => s + (c.usage_count || 0), 0);
  const promocoesAtivas = all.promotions.filter((p: { status: string }) => p.status === 'active').length;

  // WHATSAPP
  const whatsappEnviadas = all.whatsappMsgs.filter((m: { status: string }) => m.status === 'sent').length;
  const whatsappPendentes = all.whatsappMsgs.filter((m: { status: string }) => m.status === 'pending').length;
  const whatsappErros = all.whatsappMsgs.filter((m: { status: string }) => m.status === 'error' || m.status === 'failed').length;
  const whatsappConectadas = all.whatsappInstances.filter((i: { status: string }) => i.status === 'connected' || i.status === 'open').length;

  // ESTOQUE
  const materiaisEstoqueBaixo = all.rawMaterials.filter((m: { quantity: number; min_quantity: number }) => (m.quantity || 0) <= (m.min_quantity || 0)).length;
  const valorEstoqueMateriais = all.rawMaterials.reduce((s: number, m: { quantity: number; cost_per_unit: number }) => s + ((m.quantity || 0) * (m.cost_per_unit || 0)), 0);
  const movimentacoesHoje = filterByDate(all.stockMovements, todayStart).length;

  // CAIXA
  const entradas = all.cashTx.filter((t: { type: string }) => t.type === 'income');
  const saidas = all.cashTx.filter((t: { type: string }) => t.type === 'expense');
  const entradasHoje = entradas.filter((t: { transaction_date: string }) => new Date(t.transaction_date) >= todayStart).reduce((s: number, t: { amount: number }) => s + (t.amount || 0), 0);
  const saidasHoje = saidas.filter((t: { transaction_date: string }) => new Date(t.transaction_date) >= todayStart).reduce((s: number, t: { amount: number }) => s + (t.amount || 0), 0);
  const entradasMes = entradas.filter((t: { transaction_date: string }) => new Date(t.transaction_date) >= monthStart).reduce((s: number, t: { amount: number }) => s + (t.amount || 0), 0);
  const saidasMes = saidas.filter((t: { transaction_date: string }) => new Date(t.transaction_date) >= monthStart).reduce((s: number, t: { amount: number }) => s + (t.amount || 0), 0);

  // GRÁFICOS - vendas por dia (7 dias)
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

  // Receita por mês (6 meses)
  const receitaPorMes: { mes: string; receita: number; vendas: number; custos: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= mStart && d <= mEnd; };
    const mOrders = paidOrders.filter(inRange);
    const mItems = paidOrderItems.filter((item: { order_id: string }) => {
      const order = item.order_id ? paidOrdersById.get(item.order_id) : null;
      return order ? inRange(order as { created_at: string }) : false;
    });
    receitaPorMes.push({
      mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: sum(mOrders), vendas: mOrders.length,
      custos: mItems.reduce((s: number, it: { cost_material: number; cost_labor: number; cost_shipping: number }) => s + (it.cost_material || 0) + (it.cost_labor || 0) + (it.cost_shipping || 0), 0),
    });
  }

  // Simple daily time series
  const makeDailySeries = <T extends Record<string, number>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: any[], days: number, fn: (items: any[], day: Date, nextDay: Date) => T
  ) => {
    const result: (T & { date: string })[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(daysAgo(i));
      const nextDay = new Date(day.getTime() + 86400000);
      result.push({ date: day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }), ...fn(source, day, nextDay) } as T & { date: string });
    }
    return result;
  };

  const leadsPorDia = makeDailySeries(all.leads, 7, (src, day, nextDay) => ({
    leads: src.filter((l: { created_at: string }) => { const d = new Date(l.created_at); return d >= day && d < nextDay; }).length,
  }));

  const visitasPorDia = makeDailySeries(all.pageViews, 7, (src, day, nextDay) => ({
    visitas: src.filter((p: { created_at: string }) => { const d = new Date(p.created_at); return d >= day && d < nextDay; }).length,
  }));

  const receitaComparativa7d = makeDailySeries([], 7, (_src, day, nextDay) => {
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= day && d < nextDay; };
    const dayPaid = paidOrders.filter(inRange);
    const dayPending = pendingPaymentOrders.filter(inRange);
    return { recebido: sum(dayPaid), aguardando: sum(dayPending), pedidosPagos: dayPaid.length, pedidosPendentes: dayPending.length };
  });

  const conversaoPorDia = makeDailySeries([], 7, (_src, day, nextDay) => {
    const inRange = (o: { created_at: string }) => { const d = new Date(o.created_at); return d >= day && d < nextDay; };
    const dVisitas = all.pageViews.filter(inRange).length;
    const dPedidos = activeOrders.filter(inRange).length;
    return { visitas: dVisitas, pedidos: dPedidos, taxa: dVisitas > 0 ? (dPedidos / dVisitas * 100) : 0 };
  });

  const caixaPorDia = buildCashDailyTimeSeries(entradas, saidas, 7);

  // Ticket por mês
  const ticketPorMes: { mes: string; ticket: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const mOrders = paidOrders.filter((o: { created_at: string }) => { const d = new Date(o.created_at); return d >= mStart && d <= mEnd; });
    ticketPorMes.push({ mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }), ticket: mOrders.length > 0 ? sum(mOrders) / mOrders.length : 0 });
  }

  // Distributions
  const productionDistribution = buildDistribution([
    { name: 'Aguardando', value: prodCounts.prodPending, fill: 'hsl(220,15%,50%)' },
    { name: 'Ag. Material', value: prodCounts.prodAwaitingMaterial, fill: 'hsl(45,93%,47%)' },
    { name: 'Em Produção', value: prodCounts.prodInProduction, fill: 'hsl(210,80%,55%)' },
    { name: 'Qualidade', value: prodCounts.prodQualityCheck, fill: 'hsl(270,70%,55%)' },
    { name: 'Prontos', value: prodCounts.prodReady, fill: 'hsl(145,63%,42%)' },
    { name: 'Enviados', value: prodCounts.prodShipped, fill: 'hsl(170,70%,45%)' },
  ]);

  const reviewsDistribution = buildDistribution([
    { name: '5★', value: reviewsByRating[0], fill: 'hsl(145,63%,42%)' },
    { name: '4★', value: reviewsByRating[1], fill: 'hsl(170,70%,45%)' },
    { name: '3★', value: reviewsByRating[2], fill: 'hsl(45,93%,47%)' },
    { name: '2★', value: reviewsByRating[3], fill: 'hsl(25,90%,50%)' },
    { name: '1★', value: reviewsByRating[4], fill: 'hsl(0,72%,51%)' },
  ]);

  // Funil
  const funnelPaidCount = all.orders.filter((o: { payment_status: string; created_at: string }) => o.payment_status === 'paid' && new Date(o.created_at) >= monthStart).length;
  const funnelData = [
    { stage: 'Visitas', value: visitasMes, color: 'hsl(210,80%,55%)' },
    { stage: 'Leads', value: leadsMes, color: 'hsl(270,70%,55%)' },
    { stage: 'Orçamentos', value: orcamentosMes, color: 'hsl(45,93%,47%)' },
    { stage: 'Pedidos', value: vendasMes, color: 'hsl(170,70%,45%)' },
    { stage: 'Pagos', value: funnelPaidCount, color: 'hsl(145,63%,42%)' },
  ];

  // Abandoned carts
  const oneHourAgo = new Date(Date.now() - 3600000);
  const isAbandoned = (o: { payment_status: string; order_status: string; created_at: string }) =>
    o.payment_status === 'pending' && o.order_status === 'pending' && new Date(o.created_at) < oneHourAgo;
  const abandonedCarts = all.orders.filter(isAbandoned).length;

  // Repeat customers
  const customerOrderCount = new Map<string, number>();
  all.orders.forEach((o: { customer_email: string }) => {
    const email = o.customer_email?.toLowerCase();
    if (email) customerOrderCount.set(email, (customerOrderCount.get(email) || 0) + 1);
  });
  const repeatCustomers = Array.from(customerOrderCount.values()).filter(c => c > 1).length;
  const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100) : 0;

  return {
    vendasHoje, vendasSemana, vendasMes, vendasAno, vendasTotal,
    vendasMesAnterior, ...statusCounts,
    receitaHoje, receitaSemana, receitaMes, receitaAno, receitaTotal,
    receitaMesAnterior, receitaPendente, receitaFalhada,
    ticketMedio, ticketMedioHoje, maiorVenda, menorVenda,
    crescimentoVendas, crescimentoReceita, vendasPorDia,
    pixCount: pixOrders.length, pixTotal: sum(pixOrders),
    cardCount: cardOrders.length, cardTotal: sum(cardOrders),
    boletoCount: boletoOrders.length, boletoTotal: sum(boletoOrders),
    pagamentosPagos: all.orders.filter((o: { payment_status: string }) => o.payment_status === 'paid').length,
    pagamentosPendentes: all.orders.filter((o: { payment_status: string }) => o.payment_status === 'pending').length,
    pagamentosFalhados: all.orders.filter((o: { payment_status: string }) => o.payment_status === 'failed').length,
    ...prodCounts, tempoMedioProdDias,
    totalLeads: all.leads.length, leadsHoje, leadsSemana, leadsMes,
    leadsInscritos, leadsDesinscritos: all.leads.filter((l: { is_subscribed: boolean }) => !l.is_subscribed).length,
    uniqueCustomers, newCustomersToday, newCustomersMonth, repeatCustomers, repeatRate,
    totalProdutos: all.products.length, produtosAtivos, produtosInativos,
    produtosRascunho, produtosSemEstoque, produtosEstoqueBaixo, produtosDestaque,
    produtoMaisVendido: sortedProducts[0]?.name || 'N/A',
    produtoMaiorReceita: Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue)[0]?.name || 'N/A',
    valorEstoqueProdutos,
    totalCategorias: all.categories.length,
    categoriasAtivas: all.categories.filter((c: { status: string }) => c.status === 'active').length,
    categoriasInativas: all.categories.filter((c: { status: string }) => c.status !== 'active').length,
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
    cuponsInativos: all.coupons.filter((c: { is_active: boolean }) => !c.is_active).length,
    totalUsoCupons,
    totalPromocoes: all.promotions.length, promocoesAtivas,
    promocoesInativas: all.promotions.filter((p: { status: string }) => p.status !== 'active').length,
    totalWhatsappMsgs: all.whatsappMsgs.length,
    whatsappEnviadas, whatsappPendentes, whatsappErros, whatsappConectadas,
    totalMateriais: all.rawMaterials.length, materiaisEstoqueBaixo,
    valorEstoqueMateriais, movimentacoesHoje,
    entradasHoje, saidasHoje, saldoDia: entradasHoje - saidasHoje,
    entradasMes, saidasMes, saldoMes: entradasMes - saidasMes,
    auditoriaHoje: filterByDate(all.auditLogs, todayStart).length,
    webhooksRecebidos: all.webhookLogs.length,
    webhooksErro: all.webhookLogs.filter((w: { error_message: string }) => w.error_message).length,
    bannersAtivos: all.heroSlides.filter((h: { status: string }) => h.status === 'active').length,
    topProducts: sortedProducts.slice(0, 5),
    funnelData,
    visitToLead: visitasMes > 0 ? (leadsMes / visitasMes * 100) : 0,
    leadToQuote: leadsMes > 0 ? (orcamentosMes / leadsMes * 100) : 0,
    quoteToOrder: orcamentosMes > 0 ? (vendasMes / orcamentosMes * 100) : 0,
    orderToPaid: vendasMes > 0 ? (funnelPaidCount / vendasMes * 100) : 0,
    overallConversion: visitasMes > 0 ? (funnelPaidCount / visitasMes * 100) : 0,
    abandonedCarts,
    abandonedCartsMonth: all.orders.filter((o: { payment_status: string; order_status: string; created_at: string }) =>
      new Date(o.created_at) >= monthStart && isAbandoned(o)
    ).length,
    abandonedValue: all.orders.filter(isAbandoned).reduce((s: number, o: { total: number }) => s + (o.total || 0), 0),
    ticketPorMes, conversaoPorDia,
    receitaPorMes,
    paymentDistribution: buildDistribution([
      { name: 'PIX', value: pixOrders.length, fill: 'hsl(170, 70%, 45%)' },
      { name: 'Cartão', value: cardOrders.length, fill: 'hsl(210, 80%, 55%)' },
      { name: 'Boleto', value: boletoOrders.length, fill: 'hsl(220, 15%, 50%)' },
    ]),
    statusDistribution: buildDistribution([
      { name: 'Pendentes', value: statusCounts.vendasPendentes, fill: 'hsl(45, 93%, 47%)' },
      { name: 'Confirmadas', value: statusCounts.vendasConfirmadas, fill: 'hsl(210, 80%, 55%)' },
      { name: 'Processando', value: statusCounts.vendasProcessando, fill: 'hsl(270, 70%, 55%)' },
      { name: 'Enviadas', value: statusCounts.vendasEnviadas, fill: 'hsl(170, 70%, 45%)' },
      { name: 'Entregues', value: statusCounts.vendasEntregues, fill: 'hsl(145, 63%, 42%)' },
      { name: 'Canceladas', value: statusCounts.vendasCanceladas, fill: 'hsl(0, 72%, 51%)' },
    ]),
    receitaStatusResumoMes: buildDistribution([
      { name: 'Recebido', value: sum(paidOrdersMonth), fill: 'hsl(145, 63%, 42%)' },
      { name: 'Aguardando', value: sum(pendingPaymentOrders.filter((o: { created_at: string }) => new Date(o.created_at) >= monthStart)), fill: 'hsl(45, 93%, 47%)' },
      { name: 'Falhou', value: sum(failedPaymentOrders.filter((o: { created_at: string }) => new Date(o.created_at) >= monthStart)), fill: 'hsl(0, 72%, 51%)' },
    ]),
    receitaComparativa7d,
    leadsPorDia, visitasPorDia, productionDistribution,
    reviewsDistribution,
    quotesDistribution: buildDistribution([
      { name: 'Pendentes', value: orcamentosPendentes, fill: 'hsl(45,93%,47%)' },
      { name: 'Aprovados', value: orcamentosAprovados, fill: 'hsl(210,80%,55%)' },
      { name: 'Convertidos', value: orcamentosConvertidos, fill: 'hsl(145,63%,42%)' },
      { name: 'Rejeitados', value: orcamentosRejeitados, fill: 'hsl(0,72%,51%)' },
    ]),
    productsDistribution: buildDistribution([
      { name: 'Ativos', value: produtosAtivos, fill: 'hsl(145,63%,42%)' },
      { name: 'Inativos', value: produtosInativos, fill: 'hsl(220,15%,50%)' },
      { name: 'Rascunho', value: produtosRascunho, fill: 'hsl(45,93%,47%)' },
      { name: 'Sem Estoque', value: produtosSemEstoque, fill: 'hsl(0,72%,51%)' },
    ]),
    caixaPorDia,
    whatsappDistribution: buildDistribution([
      { name: 'Enviadas', value: whatsappEnviadas, fill: 'hsl(145,63%,42%)' },
      { name: 'Pendentes', value: whatsappPendentes, fill: 'hsl(45,93%,47%)' },
      { name: 'Erros', value: whatsappErros, fill: 'hsl(0,72%,51%)' },
    ]),
  };
}
