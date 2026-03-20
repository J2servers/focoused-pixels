import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateSimplesTax } from '@/hooks/useFinancialData';

function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function startOfWeek(d: Date) { const day = d.getDay(); return startOfDay(new Date(d.getTime() - day * 86400000)); }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1); }
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics-full'],
    queryFn: async () => {
      const [
        { data: orders },
        { data: products },
        { data: categories },
        { data: quotes },
        { data: leads },
        { data: reviews },
        { data: promotions },
        { data: coupons },
        { data: pageViews },
        { data: cashTx },
        { data: rawMaterials },
        { data: stockMovements },
        { data: whatsappMsgs },
        { data: whatsappInstances },
        { data: auditLogs },
        { data: webhookLogs },
        { data: orderItems },
        { data: taxSettings },
        { data: heroSlides },
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

      const allOrders = orders || [];
      const allProducts = products || [];
      const allCategories = categories || [];
      const allQuotes = quotes || [];
      const allLeads = leads || [];
      const allReviews = reviews || [];
      const allPromotions = promotions || [];
      const allCoupons = coupons || [];
      const allPageViews = pageViews || [];
      const allCashTx = cashTx || [];
      const allRawMaterials = rawMaterials || [];
      const allStockMovements = stockMovements || [];
      const allWhatsappMsgs = whatsappMsgs || [];
      const allWhatsappInstances = whatsappInstances || [];
      const allAuditLogs = auditLogs || [];
      const allWebhookLogs = webhookLogs || [];
      const allOrderItems = orderItems || [];
      const allHeroSlides = heroSlides || [];

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfWeek(now);
      const monthStart = startOfMonth(now);
      const yearStart = startOfYear(now);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

      // ===== VENDAS =====
      const activeOrders = allOrders.filter(o => o.order_status !== 'cancelled');
      const cancelledOrders = allOrders.filter(o => o.order_status === 'cancelled');

      const ordersToday = activeOrders.filter(o => new Date(o.created_at) >= todayStart);
      const ordersWeek = activeOrders.filter(o => new Date(o.created_at) >= weekStart);
      const ordersMonth = activeOrders.filter(o => new Date(o.created_at) >= monthStart);
      const ordersYear = activeOrders.filter(o => new Date(o.created_at) >= yearStart);
      const ordersLastMonth = activeOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= lastMonthStart && d <= lastMonthEnd;
      });

      const sum = (arr: { total: number }[]) => arr.reduce((s, o) => s + (o.total || 0), 0);

      const vendasHoje = ordersToday.length;
      const vendasSemana = ordersWeek.length;
      const vendasMes = ordersMonth.length;
      const vendasAno = ordersYear.length;
      const vendasMesAnterior = ordersLastMonth.length;
      const vendasTotal = activeOrders.length;

      const receitaHoje = sum(ordersToday);
      const receitaSemana = sum(ordersWeek);
      const receitaMes = sum(ordersMonth);
      const receitaAno = sum(ordersYear);
      const receitaMesAnterior = sum(ordersLastMonth);
      const receitaTotal = sum(activeOrders);

      const ticketMedio = vendasTotal > 0 ? receitaTotal / vendasTotal : 0;
      const ticketMedioHoje = vendasHoje > 0 ? receitaHoje / vendasHoje : 0;
      const maiorVenda = activeOrders.length > 0 ? Math.max(...activeOrders.map(o => o.total || 0)) : 0;
      const menorVenda = activeOrders.length > 0 ? Math.min(...activeOrders.filter(o => o.total > 0).map(o => o.total)) : 0;

      const vendasPendentes = allOrders.filter(o => o.order_status === 'pending').length;
      const vendasConfirmadas = allOrders.filter(o => o.order_status === 'confirmed').length;
      const vendasProcessando = allOrders.filter(o => o.order_status === 'processing').length;
      const vendasEnviadas = allOrders.filter(o => o.order_status === 'shipped').length;
      const vendasEntregues = allOrders.filter(o => o.order_status === 'delivered').length;
      const vendasCanceladas = cancelledOrders.length;

      // Comparativos
      const crescimentoVendas = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior * 100) : vendasMes > 0 ? 100 : 0;
      const crescimentoReceita = receitaMesAnterior > 0 ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior * 100) : receitaMes > 0 ? 100 : 0;

      // ===== PAGAMENTOS =====
      const byPayment = (method: string) => activeOrders.filter(o => o.payment_method === method);
      const pixOrders = byPayment('pix');
      const cardOrders = byPayment('credit_card');
      const boletoOrders = byPayment('boleto');

      const pagamentosPagos = allOrders.filter(o => o.payment_status === 'paid').length;
      const pagamentosPendentes = allOrders.filter(o => o.payment_status === 'pending').length;
      const pagamentosFalhados = allOrders.filter(o => o.payment_status === 'failed').length;

      // ===== PRODUÇÃO =====
      const prodPending = allOrders.filter(o => o.production_status === 'pending').length;
      const prodAwaitingMaterial = allOrders.filter(o => o.production_status === 'awaiting_material').length;
      const prodInProduction = allOrders.filter(o => o.production_status === 'in_production').length;
      const prodQualityCheck = allOrders.filter(o => o.production_status === 'quality_check').length;
      const prodReady = allOrders.filter(o => o.production_status === 'ready').length;
      const prodShipped = allOrders.filter(o => o.production_status === 'shipped').length;

      // Tempo médio produção (orders com started e completed)
      const completedProd = allOrders.filter(o => o.production_started_at && o.production_completed_at);
      const tempoMedioProdDias = completedProd.length > 0
        ? completedProd.reduce((s, o) => s + (new Date(o.production_completed_at!).getTime() - new Date(o.production_started_at!).getTime()), 0) / completedProd.length / 86400000
        : 0;

      // ===== CLIENTES & LEADS =====
      const leadsHoje = allLeads.filter(l => new Date(l.created_at) >= todayStart).length;
      const leadsSemana = allLeads.filter(l => new Date(l.created_at) >= weekStart).length;
      const leadsMes = allLeads.filter(l => new Date(l.created_at) >= monthStart).length;
      const leadsInscritos = allLeads.filter(l => l.is_subscribed).length;
      const leadsDesinscritos = allLeads.filter(l => !l.is_subscribed).length;

      // Clientes únicos (por email dos pedidos)
      const uniqueCustomers = new Set(allOrders.map(o => o.customer_email?.toLowerCase())).size;
      const newCustomersToday = new Set(ordersToday.map(o => o.customer_email?.toLowerCase())).size;
      const newCustomersMonth = new Set(ordersMonth.map(o => o.customer_email?.toLowerCase())).size;

      // ===== PRODUTOS =====
      const produtosAtivos = allProducts.filter(p => p.status === 'active').length;
      const produtosInativos = allProducts.filter(p => p.status === 'inactive').length;
      const produtosRascunho = allProducts.filter(p => p.status === 'draft').length;
      const produtosSemEstoque = allProducts.filter(p => (p.stock || 0) <= 0 && p.status === 'active').length;
      const produtosEstoqueBaixo = allProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5) && p.status === 'active').length;
      const produtosDestaque = allProducts.filter(p => p.is_featured).length;

      // Produto mais vendido
      const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
      allOrderItems.forEach(item => {
        const key = item.product_name || item.product_id || 'unknown';
        const existing = productSales.get(key);
        if (existing) {
          existing.qty += item.quantity || 0;
          existing.revenue += item.total_price || 0;
        } else {
          productSales.set(key, { name: item.product_name || 'Produto', qty: item.quantity || 0, revenue: item.total_price || 0 });
        }
      });
      const sortedProducts = Array.from(productSales.values()).sort((a, b) => b.qty - a.qty);
      const produtoMaisVendido = sortedProducts[0]?.name || 'N/A';
      const produtoMaiorReceita = Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue)[0]?.name || 'N/A';

      const valorEstoqueProdutos = allProducts.reduce((s, p) => s + ((p.stock || 0) * (p.price || 0)), 0);

      // ===== CATEGORIAS =====
      const categoriasAtivas = allCategories.filter(c => c.status === 'active').length;
      const categoriasInativas = allCategories.filter(c => c.status !== 'active').length;

      // ===== ORÇAMENTOS =====
      const orcamentosPendentes = allQuotes.filter(q => q.status === 'pending').length;
      const orcamentosAprovados = allQuotes.filter(q => q.status === 'approved').length;
      const orcamentosConvertidos = allQuotes.filter(q => q.status === 'converted').length;
      const orcamentosRejeitados = allQuotes.filter(q => q.status === 'rejected').length;
      const orcamentosHoje = allQuotes.filter(q => new Date(q.created_at) >= todayStart).length;
      const orcamentosMes = allQuotes.filter(q => new Date(q.created_at) >= monthStart).length;
      const taxaConversaoOrcamento = allQuotes.length > 0 ? (orcamentosConvertidos / allQuotes.length * 100) : 0;

      // ===== AVALIAÇÕES =====
      const reviewsPendentes = allReviews.filter(r => !r.is_approved).length;
      const reviewsAprovadas = allReviews.filter(r => r.is_approved).length;
      const mediaGeral = allReviews.length > 0 ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;
      const reviews5 = allReviews.filter(r => r.rating === 5).length;
      const reviews4 = allReviews.filter(r => r.rating === 4).length;
      const reviews3 = allReviews.filter(r => r.rating === 3).length;
      const reviews2 = allReviews.filter(r => r.rating === 2).length;
      const reviews1 = allReviews.filter(r => r.rating === 1).length;

      // ===== TRÁFEGO =====
      const visitasHoje = allPageViews.filter(p => new Date(p.created_at) >= todayStart).length;
      const visitasSemana = allPageViews.filter(p => new Date(p.created_at) >= weekStart).length;
      const visitasMes = allPageViews.length;
      const sessoesUnicas = new Set(allPageViews.map(p => p.session_id).filter(Boolean)).size;
      const taxaConversao = visitasMes > 0 ? (vendasMes / visitasMes * 100) : 0;

      // Top pages
      const pageCounts = new Map<string, number>();
      allPageViews.forEach(p => pageCounts.set(p.page_path, (pageCounts.get(p.page_path) || 0) + 1));
      const topPages = Array.from(pageCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, views]) => ({ path, views }));

      // ===== FINANCEIRO =====
      const orders12m = activeOrders.filter(o => new Date(o.created_at) >= twelveMonthsAgo);
      const receitaBruta12m = sum(orders12m);
      const custoMaterial = allOrderItems.reduce((s, i) => s + (i.cost_material || 0), 0);
      const custoMaoDeObra = allOrderItems.reduce((s, i) => s + (i.cost_labor || 0), 0);
      const custoFrete = allOrderItems.reduce((s, i) => s + (i.cost_shipping || 0), 0);
      const custoTotal = custoMaterial + custoMaoDeObra + custoFrete;

      const anexo = (taxSettings?.simples_anexo || 'III') as 'II' | 'III';
      const taxCalc = calculateSimplesTax(receitaBruta12m, anexo);
      const receitaLiquida = receitaBruta12m - custoTotal - taxCalc.valorImposto;
      const margemLiquida = receitaBruta12m > 0 ? (receitaLiquida / receitaBruta12m * 100) : 0;

      // ===== CUPONS & PROMOÇÕES =====
      const cuponsAtivos = allCoupons.filter(c => c.is_active).length;
      const cuponsInativos = allCoupons.filter(c => !c.is_active).length;
      const totalUsoCupons = allCoupons.reduce((s, c) => s + (c.usage_count || 0), 0);
      const promocoesAtivas = allPromotions.filter(p => p.status === 'active').length;
      const promocoesInativas = allPromotions.filter(p => p.status !== 'active').length;

      // ===== WHATSAPP =====
      const whatsappEnviadas = allWhatsappMsgs.filter(m => m.status === 'sent').length;
      const whatsappPendentes = allWhatsappMsgs.filter(m => m.status === 'pending').length;
      const whatsappErros = allWhatsappMsgs.filter(m => m.status === 'error' || m.status === 'failed').length;
      const whatsappConectadas = allWhatsappInstances.filter(i => i.status === 'connected' || i.status === 'open').length;

      // ===== ESTOQUE MATÉRIAS-PRIMAS =====
      const materiaisEstoqueBaixo = allRawMaterials.filter(m => (m.quantity || 0) <= (m.min_quantity || 0)).length;
      const valorEstoqueMateriais = allRawMaterials.reduce((s, m) => s + ((m.quantity || 0) * (m.cost_per_unit || 0)), 0);
      const movimentacoesHoje = allStockMovements.filter(m => new Date(m.created_at) >= todayStart).length;

      // ===== CAIXA =====
      const entradas = allCashTx.filter(t => t.type === 'income');
      const saidas = allCashTx.filter(t => t.type === 'expense');
      const entradasHoje = entradas.filter(t => new Date(t.transaction_date) >= todayStart).reduce((s, t) => s + (t.amount || 0), 0);
      const saidasHoje = saidas.filter(t => new Date(t.transaction_date) >= todayStart).reduce((s, t) => s + (t.amount || 0), 0);
      const entradasMes = entradas.filter(t => new Date(t.transaction_date) >= monthStart).reduce((s, t) => s + (t.amount || 0), 0);
      const saidasMes = saidas.filter(t => new Date(t.transaction_date) >= monthStart).reduce((s, t) => s + (t.amount || 0), 0);
      const saldoDia = entradasHoje - saidasHoje;
      const saldoMes = entradasMes - saidasMes;

      // ===== SISTEMA =====
      const auditoriaHoje = allAuditLogs.filter(l => new Date(l.created_at) >= todayStart).length;
      const webhooksRecebidos = allWebhookLogs.length;
      const webhooksErro = allWebhookLogs.filter(w => w.error_message).length;
      const bannersAtivos = allHeroSlides.filter(h => h.status === 'active').length;

      // ===== VENDAS POR DIA (últimos 7 dias para gráfico) =====
      const vendasPorDia: { date: string; vendas: number; receita: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = startOfDay(daysAgo(i));
        const nextDay = new Date(day.getTime() + 86400000);
        const dayOrders = activeOrders.filter(o => {
          const d = new Date(o.created_at);
          return d >= day && d < nextDay;
        });
        vendasPorDia.push({
          date: day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
          vendas: dayOrders.length,
          receita: sum(dayOrders),
        });
      }

      // ===== RECEITA POR MÊS (últimos 6 meses) =====
      const receitaPorMes: { mes: string; receita: number; vendas: number; custos: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const mOrders = activeOrders.filter(o => { const d = new Date(o.created_at); return d >= mStart && d <= mEnd; });
        const mItems = allOrderItems.filter(item => {
          const order = allOrders.find(o => o.id === item.order_id);
          if (!order) return false;
          const d = new Date(order.created_at);
          return d >= mStart && d <= mEnd;
        });
        receitaPorMes.push({
          mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
          receita: sum(mOrders),
          vendas: mOrders.length,
          custos: mItems.reduce((s, it) => s + (it.cost_material || 0) + (it.cost_labor || 0) + (it.cost_shipping || 0), 0),
        });
      }

      // ===== LEADS POR DIA (7 dias) =====
      const leadsPorDia: { date: string; leads: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = startOfDay(daysAgo(i));
        const nextDay = new Date(day.getTime() + 86400000);
        leadsPorDia.push({
          date: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
          leads: allLeads.filter(l => { const d = new Date(l.created_at); return d >= day && d < nextDay; }).length,
        });
      }

      // ===== VISITAS POR DIA (7 dias) =====
      const visitasPorDia: { date: string; visitas: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = startOfDay(daysAgo(i));
        const nextDay = new Date(day.getTime() + 86400000);
        visitasPorDia.push({
          date: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
          visitas: allPageViews.filter(p => { const d = new Date(p.created_at); return d >= day && d < nextDay; }).length,
        });
      }

      // ===== PRODUÇÃO DISTRIBUIÇÃO =====
      const productionDistribution = [
        { name: 'Aguardando', value: prodPending, fill: 'hsl(220,15%,50%)' },
        { name: 'Ag. Material', value: prodAwaitingMaterial, fill: 'hsl(45,93%,47%)' },
        { name: 'Em Produção', value: prodInProduction, fill: 'hsl(210,80%,55%)' },
        { name: 'Qualidade', value: prodQualityCheck, fill: 'hsl(270,70%,55%)' },
        { name: 'Prontos', value: prodReady, fill: 'hsl(145,63%,42%)' },
        { name: 'Enviados', value: prodShipped, fill: 'hsl(170,70%,45%)' },
      ].filter(s => s.value > 0);

      // ===== REVIEWS DISTRIBUIÇÃO =====
      const reviewsDistribution = [
        { name: '5★', value: reviews5, fill: 'hsl(145,63%,42%)' },
        { name: '4★', value: reviews4, fill: 'hsl(170,70%,45%)' },
        { name: '3★', value: reviews3, fill: 'hsl(45,93%,47%)' },
        { name: '2★', value: reviews2, fill: 'hsl(25,90%,50%)' },
        { name: '1★', value: reviews1, fill: 'hsl(0,72%,51%)' },
      ].filter(s => s.value > 0);

      // ===== ORÇAMENTOS DISTRIBUIÇÃO =====
      const quotesDistribution = [
        { name: 'Pendentes', value: orcamentosPendentes, fill: 'hsl(45,93%,47%)' },
        { name: 'Aprovados', value: orcamentosAprovados, fill: 'hsl(210,80%,55%)' },
        { name: 'Convertidos', value: orcamentosConvertidos, fill: 'hsl(145,63%,42%)' },
        { name: 'Rejeitados', value: orcamentosRejeitados, fill: 'hsl(0,72%,51%)' },
      ].filter(s => s.value > 0);

      // ===== PRODUTOS DISTRIBUIÇÃO =====
      const productsDistribution = [
        { name: 'Ativos', value: produtosAtivos, fill: 'hsl(145,63%,42%)' },
        { name: 'Inativos', value: produtosInativos, fill: 'hsl(220,15%,50%)' },
        { name: 'Rascunho', value: produtosRascunho, fill: 'hsl(45,93%,47%)' },
        { name: 'Sem Estoque', value: produtosSemEstoque, fill: 'hsl(0,72%,51%)' },
      ].filter(s => s.value > 0);

      // ===== CAIXA POR DIA (7 dias) =====
      const caixaPorDia: { date: string; entradas: number; saidas: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = startOfDay(daysAgo(i));
        const nextDay = new Date(day.getTime() + 86400000);
        const dayStr = day.toLocaleDateString('pt-BR', { weekday: 'short' });
        const ent = entradas.filter(t => { const d = new Date(t.transaction_date); return d >= day && d < nextDay; }).reduce((s, t) => s + (t.amount || 0), 0);
        const sai = saidas.filter(t => { const d = new Date(t.transaction_date); return d >= day && d < nextDay; }).reduce((s, t) => s + (t.amount || 0), 0);
        caixaPorDia.push({ date: dayStr, entradas: ent, saidas: sai });
      }

      // ===== WHATSAPP POR STATUS =====
      const whatsappDistribution = [
        { name: 'Enviadas', value: whatsappEnviadas, fill: 'hsl(145,63%,42%)' },
        { name: 'Pendentes', value: whatsappPendentes, fill: 'hsl(45,93%,47%)' },
        { name: 'Erros', value: whatsappErros, fill: 'hsl(0,72%,51%)' },
      ].filter(s => s.value > 0);

      // ===== DISTRIBUIÇÕES (para gráficos pizza) =====
      const paymentDistribution = [
        { name: 'PIX', value: pixOrders.length, total: sum(pixOrders), fill: 'hsl(170, 70%, 45%)' },
        { name: 'Cartão', value: cardOrders.length, total: sum(cardOrders), fill: 'hsl(210, 80%, 55%)' },
        { name: 'Boleto', value: boletoOrders.length, total: sum(boletoOrders), fill: 'hsl(220, 15%, 50%)' },
      ].filter(p => p.value > 0);

      const statusDistribution = [
        { name: 'Pendentes', value: vendasPendentes, fill: 'hsl(45, 93%, 47%)' },
        { name: 'Confirmadas', value: vendasConfirmadas, fill: 'hsl(210, 80%, 55%)' },
        { name: 'Processando', value: vendasProcessando, fill: 'hsl(270, 70%, 55%)' },
        { name: 'Enviadas', value: vendasEnviadas, fill: 'hsl(170, 70%, 45%)' },
        { name: 'Entregues', value: vendasEntregues, fill: 'hsl(145, 63%, 42%)' },
        { name: 'Canceladas', value: vendasCanceladas, fill: 'hsl(0, 72%, 51%)' },
      ].filter(s => s.value > 0);

      return {
        // VENDAS
        vendasHoje, vendasSemana, vendasMes, vendasAno, vendasTotal,
        vendasMesAnterior, vendasPendentes, vendasConfirmadas, vendasProcessando,
        vendasEnviadas, vendasEntregues, vendasCanceladas,
        receitaHoje, receitaSemana, receitaMes, receitaAno, receitaTotal,
        receitaMesAnterior,
        ticketMedio, ticketMedioHoje, maiorVenda, menorVenda,
        crescimentoVendas, crescimentoReceita,
        vendasPorDia,

        // PAGAMENTOS
        pixCount: pixOrders.length, pixTotal: sum(pixOrders),
        cardCount: cardOrders.length, cardTotal: sum(cardOrders),
        boletoCount: boletoOrders.length, boletoTotal: sum(boletoOrders),
        pagamentosPagos, pagamentosPendentes, pagamentosFalhados,

        // PRODUÇÃO
        prodPending, prodAwaitingMaterial, prodInProduction,
        prodQualityCheck, prodReady, prodShipped,
        tempoMedioProdDias,

        // CLIENTES & LEADS
        totalLeads: allLeads.length, leadsHoje, leadsSemana, leadsMes,
        leadsInscritos, leadsDesinscritos,
        uniqueCustomers, newCustomersToday, newCustomersMonth,

        // PRODUTOS
        totalProdutos: allProducts.length, produtosAtivos, produtosInativos,
        produtosRascunho, produtosSemEstoque, produtosEstoqueBaixo, produtosDestaque,
        produtoMaisVendido, produtoMaiorReceita, valorEstoqueProdutos,

        // CATEGORIAS
        totalCategorias: allCategories.length, categoriasAtivas, categoriasInativas,

        // ORÇAMENTOS
        totalOrcamentos: allQuotes.length, orcamentosPendentes, orcamentosAprovados,
        orcamentosConvertidos, orcamentosRejeitados, orcamentosHoje, orcamentosMes,
        taxaConversaoOrcamento,

        // AVALIAÇÕES
        totalReviews: allReviews.length, reviewsPendentes, reviewsAprovadas,
        mediaGeral, reviews5, reviews4, reviews3, reviews2, reviews1,

        // TRÁFEGO
        visitasHoje, visitasSemana, visitasMes, sessoesUnicas, taxaConversao, topPages,

        // FINANCEIRO
        receitaBruta12m, custoMaterial, custoMaoDeObra, custoFrete, custoTotal,
        impostos: taxCalc.valorImposto, aliquotaEfetiva: taxCalc.aliquotaEfetiva,
        faixaSimples: taxCalc.faixa, receitaLiquida, margemLiquida,

        // CUPONS & PROMOÇÕES
        totalCupons: allCoupons.length, cuponsAtivos, cuponsInativos, totalUsoCupons,
        totalPromocoes: allPromotions.length, promocoesAtivas, promocoesInativas,

        // WHATSAPP
        totalWhatsappMsgs: allWhatsappMsgs.length,
        whatsappEnviadas, whatsappPendentes, whatsappErros, whatsappConectadas,

        // ESTOQUE
        totalMateriais: allRawMaterials.length, materiaisEstoqueBaixo,
        valorEstoqueMateriais, movimentacoesHoje,

        // CAIXA
        entradasHoje, saidasHoje, saldoDia, entradasMes, saidasMes, saldoMes,

        // SISTEMA
        auditoriaHoje, webhooksRecebidos, webhooksErro, bannersAtivos,

        // TOP PRODUCTS
        topProducts: sortedProducts.slice(0, 5),

        // GRÁFICOS
        receitaPorMes, paymentDistribution, statusDistribution,
      };
    },
    refetchInterval: 60000, // Auto-refresh every minute
    staleTime: 30000,
  });
}
