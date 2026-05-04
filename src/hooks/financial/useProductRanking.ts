import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductRankingEntry } from './types';

interface RankingRow {
  product_id: string | null;
  product_name: string;
  quantity: number | null;
  total_price: number | null;
  cost_material: number | null;
  cost_labor: number | null;
  cost_shipping: number | null;
}

const aggregateByProduct = (rows: RankingRow[]): ProductRankingEntry[] => {
  const map = new Map<string, ProductRankingEntry>();
  for (const item of rows) {
    const key = item.product_id || item.product_name;
    const cost = (item.cost_material ?? 0) + (item.cost_labor ?? 0) + (item.cost_shipping ?? 0);
    const revenue = item.total_price ?? 0;
    const profit = revenue - cost;
    const existing = map.get(key);
    if (existing) {
      existing.totalQuantity += item.quantity ?? 0;
      existing.totalRevenue += revenue;
      existing.totalCost += cost;
      existing.totalProfit += profit;
    } else {
      map.set(key, {
        product_id: item.product_id ?? '',
        product_name: item.product_name,
        totalQuantity: item.quantity ?? 0,
        totalRevenue: revenue,
        totalCost: cost,
        totalProfit: profit,
      });
    }
  }
  return Array.from(map.values());
};

export function useProductRanking(limit = 10) {
  return useQuery({
    queryKey: ['product-ranking', limit],
    queryFn: async (): Promise<ProductRankingEntry[]> => {
      const { data, error } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, total_price, cost_material, cost_labor, cost_shipping');
      if (error) throw error;
      return aggregateByProduct((data ?? []) as RankingRow[])
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    },
  });
}
