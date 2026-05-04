import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ProductionStatus } from './types';

const invalidateOrders = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: ['orders'] });

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateOrders(qc);
      toast.success('Venda atualizada!');
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao atualizar venda'),
  });
}

const productionStatusUpdates = (status: ProductionStatus, notes?: string) => {
  const updates: Record<string, unknown> = { production_status: status, production_notes: notes };
  const now = new Date().toISOString();
  if (status === 'in_production') updates.production_started_at = now;
  if (status === 'ready' || status === 'shipped') updates.production_completed_at = now;
  if (status === 'shipped') updates.order_status = 'shipped';
  return updates;
};

export function useUpdateProductionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ProductionStatus; notes?: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(productionStatusUpdates(status, notes))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateOrders(qc);
      toast.success('Status de produção atualizado!');
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao atualizar status'),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Best-effort cascade: remove related order_items first
      await supabase.from('order_items').delete().eq('order_id', id);
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateOrders(qc);
      toast.success('Pedido excluído!');
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao excluir pedido'),
  });
}

export function useCreateOrderFromQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      if (quoteError || !quote) throw new Error('Orçamento não encontrado');

      const orderNumber = `PED-${Date.now().toString(36).toUpperCase()}`;
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

      await supabase.from('quotes').update({ status: 'converted' }).eq('id', quoteId);
      return order;
    },
    onSuccess: () => {
      invalidateOrders(qc);
      qc.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Pedido criado a partir do orçamento!');
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao converter orçamento'),
  });
}
