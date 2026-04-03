import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Promotion {
  id: string;
  name: string;
  type: string;
  value: number;
  rule: string;
  product_ids: string[] | null;
  category_ids: string[] | null;
  start_date: string;
  end_date: string;
  status: string;
  priority: number;
  banner_url: string | null;
  created_at: string;
}

export interface PromotionFormData {
  name: string;
  type: string;
  value: number;
  rule: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: number;
  banner_url: string | null;
}

export function useAdminPromotions() {
  return useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PromotionFormData) => {
      const { error } = await supabase.from('promotions').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promoção criada com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PromotionFormData> }) => {
      const { error } = await supabase.from('promotions').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promoção atualizada com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promotions'] });
      toast.success('Promoção excluída com sucesso!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
