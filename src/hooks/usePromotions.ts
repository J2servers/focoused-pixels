import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
}
