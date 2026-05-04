import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Order, ProductionStatus } from './types';

const baseOrdersQuery = () =>
  supabase.from('orders').select('*').order('created_at', { ascending: false });

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await baseOrdersQuery();
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

export function useOrdersByStatus(status?: string) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: async (): Promise<Order[]> => {
      const query = status ? baseOrdersQuery().eq('order_status', status) : baseOrdersQuery();
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

export function useOrdersByProductionStatus(productionStatus?: ProductionStatus) {
  return useQuery({
    queryKey: ['orders', 'production', productionStatus],
    queryFn: async (): Promise<Order[]> => {
      const query = productionStatus
        ? baseOrdersQuery().eq('production_status', productionStatus)
        : baseOrdersQuery();
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}
