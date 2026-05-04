import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CashTransaction } from './types';

export function useCashTransactions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['cash-transactions', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('cash_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('transaction_date', startDate);
      if (endDate) query = query.lte('transaction_date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as CashTransaction[];
    },
  });
}
