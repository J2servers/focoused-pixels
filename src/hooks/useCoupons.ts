import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  category_ids: string[] | null;
  product_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, orderValue }: { code: string; orderValue: number }) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Cupom inválido ou expirado');
      }

      const coupon = data as Coupon;
      const now = new Date();

      // Check date validity
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        throw new Error('Cupom ainda não está ativo');
      }
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        throw new Error('Cupom expirado');
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        throw new Error('Cupom esgotado');
      }

      // Check minimum order value
      if (coupon.min_order_value && orderValue < coupon.min_order_value) {
        throw new Error(`Valor mínimo: R$ ${coupon.min_order_value.toFixed(2)}`);
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (orderValue * coupon.value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = coupon.value;
      }

      return { coupon, discount };
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Omit<Partial<Coupon>, 'id' | 'created_at' | 'updated_at'> & { code: string; type: 'percentage' | 'fixed'; value: number }) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: coupon.code.toUpperCase(),
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
          min_order_value: coupon.min_order_value,
          max_discount: coupon.max_discount,
          usage_limit: coupon.usage_limit,
          is_active: coupon.is_active ?? true,
          start_date: coupon.start_date,
          end_date: coupon.end_date,
          category_ids: coupon.category_ids,
          product_ids: coupon.product_ids,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar cupom');
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar cupom');
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Cupom removido!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover cupom');
    },
  });
}
