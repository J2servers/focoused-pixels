import { calculateSimplesTax } from './taxCalculations';
import {
  useFinancialOrders,
  useOrderItems,
  useQuotesApproved,
  useTaxSettings,
} from './queries';
import type { FinancialOrder, FinancialOrderItem, SimplesAnexo } from './types';

const MONTHS_WINDOW = 12;

const isWithinLast12Months = (createdAt: string, reference: Date): boolean => {
  const cutoff = new Date(reference.getFullYear(), reference.getMonth() - MONTHS_WINDOW, 1);
  return new Date(createdAt) >= cutoff;
};

const sumGrossRevenue = (orders: FinancialOrder[]): number =>
  orders.reduce((acc, o) => acc + (o.total ?? 0), 0);

const sumTotalCost = (items: FinancialOrderItem[]): number =>
  items.reduce(
    (acc, i) => acc + (i.cost_material ?? 0) + (i.cost_labor ?? 0) + (i.cost_shipping ?? 0),
    0,
  );

export function useFinancialSummary() {
  const { data: orders } = useFinancialOrders();
  const { data: orderItems } = useOrderItems();
  const { data: quotesApproved } = useQuotesApproved();
  const { data: taxSettings } = useTaxSettings();

  const ordersLast12Months = (orders ?? []).filter(
    (o) => isWithinLast12Months(o.created_at, new Date()) && o.order_status !== 'cancelled',
  );

  const receitaBruta = sumGrossRevenue(ordersLast12Months);
  const custoTotal = sumTotalCost(orderItems ?? []);
  const anexo = (taxSettings?.simples_anexo ?? 'III') as SimplesAnexo;
  const tax = calculateSimplesTax(receitaBruta, anexo);
  const receitaLiquida = receitaBruta - custoTotal - tax.valorImposto;

  return {
    receitaBruta,
    custoTotal,
    impostos: tax.valorImposto,
    aliquotaEfetiva: tax.aliquotaEfetiva,
    faixaSimples: tax.faixa,
    receitaLiquida,
    margemLiquida: receitaBruta > 0 ? (receitaLiquida / receitaBruta) * 100 : 0,
    totalPedidos: orders?.length ?? 0,
    totalOrcamentosAprovados: quotesApproved?.length ?? 0,
    taxSettings,
  };
}
