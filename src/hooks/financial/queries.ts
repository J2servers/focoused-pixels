import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  FinancialOrder,
  FinancialOrderItem,
  ProductWithCosts,
  ProductWithMargin,
  TaxSettings,
} from './types';

const PRODUCT_COST_FIELDS =
  'id, name, price, promotional_price, stock, min_stock, cost_material, cost_labor, cost_shipping, cover_image, status';

export function useLowStockProducts(limit = 10) {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async (): Promise<ProductWithCosts[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, min_stock, cover_image, status, price, promotional_price, cost_material, cost_labor, cost_shipping')
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('stock', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).filter((p) => (p.stock ?? 0) <= (p.min_stock ?? 5)) as ProductWithCosts[];
    },
  });
}

export function useProductsWithMargins() {
  return useQuery({
    queryKey: ['products-with-margins'],
    queryFn: async (): Promise<ProductWithMargin[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_COST_FIELDS)
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;

      return (data ?? []).map((p): ProductWithMargin => {
        const sellPrice = p.promotional_price ?? p.price;
        const totalCost = (p.cost_material ?? 0) + (p.cost_labor ?? 0) + (p.cost_shipping ?? 0);
        const margin = sellPrice - totalCost;
        return {
          ...(p as ProductWithCosts),
          sellPrice,
          totalCost,
          margin,
          marginPercent: sellPrice > 0 ? (margin / sellPrice) * 100 : 0,
        };
      });
    },
  });
}

export function useFinancialOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<FinancialOrder[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as FinancialOrder[];
    },
  });
}

export function useOrderItems() {
  return useQuery({
    queryKey: ['order-items'],
    queryFn: async (): Promise<FinancialOrderItem[]> => {
      const { data, error } = await supabase.from('order_items').select('*');
      if (error) throw error;
      return (data ?? []) as FinancialOrderItem[];
    },
  });
}

export function useTaxSettings() {
  return useQuery({
    queryKey: ['tax-settings'],
    queryFn: async (): Promise<TaxSettings | null> => {
      const { data, error } = await supabase.from('company_tax_settings').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      return (data as TaxSettings) ?? null;
    },
  });
}

export function useQuotesApproved() {
  return useQuery({
    queryKey: ['quotes-approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .in('status', ['approved', 'completed'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
