import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Order } from './useOrders';

export function useCustomerOrders(email: string | undefined) {
  return useQuery({
    queryKey: ['customer-orders', email],
    queryFn: async () => {
      if (!email) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!email,
  });
}

export function useCustomerOrderByNumber(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ['customer-order', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderNumber,
  });
}
