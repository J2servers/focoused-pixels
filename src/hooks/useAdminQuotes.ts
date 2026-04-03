import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Quote {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string | null;
  product_types: string[];
  quantity: number;
  cart_total: number | null;
  status: string;
  created_at: string;
}

export function useAdminQuotes() {
  return useQuery({
    queryKey: ['admin-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Quote[];
    },
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('quotes').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-quotes'] });
      toast.success('Status atualizado!');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
