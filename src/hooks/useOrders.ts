import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Json;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  tracking_code: string | null;
  shipping_company: string | null;
  notes: string | null;
  quote_id: string | null;
  production_status: string;
  production_notes: string | null;
  production_started_at: string | null;
  production_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductionStatus = 'pending' | 'awaiting_material' | 'in_production' | 'quality_check' | 'ready' | 'shipped';

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  pending: 'Aguardando',
  awaiting_material: 'Aguardando Material',
  in_production: 'Em Produção',
  quality_check: 'Controle de Qualidade',
  ready: 'Pronto',
  shipped: 'Enviado',
};

export const PRODUCTION_STATUS_COLORS: Record<ProductionStatus, string> = {
  pending: 'bg-gray-500',
  awaiting_material: 'bg-yellow-500',
  in_production: 'bg-blue-500',
  quality_check: 'bg-purple-500',
  ready: 'bg-green-500',
  shipped: 'bg-teal-500',
};

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrdersByStatus(status?: string) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: async () => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('order_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrdersByProductionStatus(productionStatus?: ProductionStatus) {
  return useQuery({
    queryKey: ['orders', 'production', productionStatus],
    queryFn: async () => {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (productionStatus) {
        query = query.eq('production_status', productionStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar pedido');
    },
  });
}

export function useUpdateProductionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ProductionStatus; notes?: string }) => {
      const updates: Record<string, unknown> = {
        production_status: status,
        production_notes: notes,
      };

      if (status === 'in_production') {
        updates.production_started_at = new Date().toISOString();
      }
      if (status === 'ready' || status === 'shipped') {
        updates.production_completed_at = new Date().toISOString();
      }
      if (status === 'shipped') {
        updates.order_status = 'shipped';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status de produção atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });
}

export function useCreateOrderFromQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      // Get the quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (quoteError || !quote) throw new Error('Orçamento não encontrado');

      // Generate order number
      const orderNumber = `PED-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: quote.customer_name,
          customer_email: quote.customer_email,
          customer_phone: quote.customer_phone,
          items: quote.cart_items || [],
          subtotal: quote.cart_total || 0,
          total: quote.cart_total || 0,
          quote_id: quoteId,
          order_status: 'confirmed',
          payment_status: 'pending',
          production_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update quote status
      await supabase
        .from('quotes')
        .update({ status: 'converted' })
        .eq('id', quoteId);

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Pedido criado a partir do orçamento!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao converter orçamento');
    },
  });
}
