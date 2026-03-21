import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AbandonedProductInsight {
  key: string;
  name: string;
  quantity: number;
  value: number;
  sessions: number;
}

export interface AbandonedCartInsights {
  sessionsAbandoned: number;
  sessionsRecovered: number;
  remindersSent: number;
  recoveryRate: number;
  totalAbandonedValue: number;
  topProductName: string;
  topProducts: AbandonedProductInsight[];
}

const defaultInsights: AbandonedCartInsights = {
  sessionsAbandoned: 0,
  sessionsRecovered: 0,
  remindersSent: 0,
  recoveryRate: 0,
  totalAbandonedValue: 0,
  topProductName: 'N/A',
  topProducts: [],
};

export function useAbandonedCartInsights() {
  return useQuery({
    queryKey: ['abandoned-cart-insights'],
    queryFn: async (): Promise<AbandonedCartInsights> => {
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return defaultInsights;
      }

      const { data, error } = await supabase.functions.invoke('abandoned-cart-insights', {
        body: {},
      });

      if (error) {
        return defaultInsights;
      }
      if (data?.success === false) {
        return defaultInsights;
      }

      return (data?.insights as AbandonedCartInsights) || defaultInsights;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useTriggerAbandonedCartRecovery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('trigger-abandoned-cart-recovery', {
        body: {},
      });

      if (error) throw error;
      if (data?.success === false) {
        throw new Error(data.error || 'Falha ao executar recuperação de carrinhos.');
      }

      return data;
    },
    onSuccess: (data) => {
      const sent = Number(data?.summary?.remindersSent || 0);
      toast.success(`Recuperação executada. Lembretes enviados: ${sent}`);
      queryClient.invalidateQueries({ queryKey: ['abandoned-cart-insights'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics-full'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível executar a recuperação.');
    },
  });
}

