import { sum } from '../useDashboardMetricsHelpers';
import { byDate, byDateRange, DashboardSources, DateBoundaries, OrderRecord } from './types';

export function computeSales(all: DashboardSources, dates: DateBoundaries) {
  const { todayStart, weekStart, monthStart, yearStart, lastMonthStart, lastMonthEnd } = dates;
  const activeOrders = all.orders.filter(o => o.order_status !== 'cancelled');
  const paidOrders = activeOrders.filter(o => o.payment_status === 'paid');
  const pendingPaymentOrders = activeOrders.filter(o => o.payment_status === 'pending');
  const failedPaymentOrders = activeOrders.filter(o => ['failed', 'rejected'].includes(o.payment_status || ''));
  const cancelledOrders = all.orders.filter(o => o.order_status === 'cancelled');

  const ordersToday = byDate(activeOrders, todayStart);
  const ordersWeek = byDate(activeOrders, weekStart);
  const ordersMonth = byDate(activeOrders, monthStart);
  const ordersYear = byDate(activeOrders, yearStart);
  const paidOrdersToday = byDate(paidOrders, todayStart);
  const paidOrdersWeek = byDate(paidOrders, weekStart);
  const paidOrdersMonth = byDate(paidOrders, monthStart);
  const paidOrdersYear = byDate(paidOrders, yearStart);
  const ordersLastMonth = byDateRange(activeOrders, lastMonthStart, lastMonthEnd);
  const paidOrdersLastMonth = byDateRange(paidOrders, lastMonthStart, lastMonthEnd);

  const receitaHoje = sum(paidOrdersToday), receitaSemana = sum(paidOrdersWeek);
  const receitaMes = sum(paidOrdersMonth), receitaAno = sum(paidOrdersYear);
  const receitaMesAnterior = sum(paidOrdersLastMonth), receitaTotal = sum(paidOrders);
  const receitaPendente = sum(pendingPaymentOrders), receitaFalhada = sum(failedPaymentOrders);

  const ticketMedio = paidOrders.length > 0 ? receitaTotal / paidOrders.length : 0;
  const ticketMedioHoje = paidOrdersToday.length > 0 ? receitaHoje / paidOrdersToday.length : 0;
  const positives = paidOrders.filter(o => (o.total || 0) > 0);
  const maiorVenda = paidOrders.length > 0 ? Math.max(...paidOrders.map(o => o.total || 0)) : 0;
  const menorVenda = positives.length > 0 ? Math.min(...positives.map(o => o.total)) : 0;

  const statusCounts = {
    vendasPendentes: all.orders.filter(o => o.order_status === 'pending').length,
    vendasConfirmadas: all.orders.filter(o => o.order_status === 'confirmed').length,
    vendasProcessando: all.orders.filter(o => o.order_status === 'processing').length,
    vendasEnviadas: all.orders.filter(o => o.order_status === 'shipped').length,
    vendasEntregues: all.orders.filter(o => o.order_status === 'delivered').length,
    vendasCanceladas: cancelledOrders.length,
  };

  const vendasMes = ordersMonth.length;
  const vendasMesAnterior = ordersLastMonth.length;
  const crescimentoVendas = vendasMesAnterior > 0 ? ((vendasMes - vendasMesAnterior) / vendasMesAnterior * 100) : vendasMes > 0 ? 100 : 0;
  const crescimentoReceita = receitaMesAnterior > 0 ? ((receitaMes - receitaMesAnterior) / receitaMesAnterior * 100) : receitaMes > 0 ? 100 : 0;

  const byPayment = (m: string) => paidOrders.filter(o => o.payment_method === m);
  const pixOrders = byPayment('pix'), cardOrders = byPayment('credit_card'), boletoOrders = byPayment('boleto');

  return {
    activeOrders, paidOrders, pendingPaymentOrders, failedPaymentOrders,
    paidOrdersMonth, ordersMonth, ordersToday,
    pixOrders, cardOrders, boletoOrders,
    metrics: {
      vendasHoje: ordersToday.length, vendasSemana: ordersWeek.length, vendasMes,
      vendasAno: ordersYear.length, vendasTotal: activeOrders.length, vendasMesAnterior,
      ...statusCounts,
      receitaHoje, receitaSemana, receitaMes, receitaAno, receitaTotal,
      receitaMesAnterior, receitaPendente, receitaFalhada,
      ticketMedio, ticketMedioHoje, maiorVenda, menorVenda,
      crescimentoVendas, crescimentoReceita,
      pixCount: pixOrders.length, pixTotal: sum(pixOrders),
      cardCount: cardOrders.length, cardTotal: sum(cardOrders),
      boletoCount: boletoOrders.length, boletoTotal: sum(boletoOrders),
      pagamentosPagos: all.orders.filter(o => o.payment_status === 'paid').length,
      pagamentosPendentes: all.orders.filter(o => o.payment_status === 'pending').length,
      pagamentosFalhados: all.orders.filter(o => o.payment_status === 'failed').length,
    },
  };
}

export type SalesContext = ReturnType<typeof computeSales>;
export type { OrderRecord };
