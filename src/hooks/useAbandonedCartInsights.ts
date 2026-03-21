import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AbandonedCartInsights {
  totalSessions: number;
  recoveredSessions: number;
  recoveryRate: number;
  totalAbandonedValue: number;
  remindersSent: number;
  topAbandonedProducts: Array<{ name: string; count: number }>;
}

export const useAbandonedCartInsights = () => {
  return useQuery({
    queryKey: ['abandoned-cart-insights'],
    queryFn: async (): Promise<AbandonedCartInsights> => {
      const { data: sessions } = await supabase
        .from('abandoned_cart_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!sessions) {
        return {
          totalSessions: 0,
          recoveredSessions: 0,
          recoveryRate: 0,
          totalAbandonedValue: 0,
          remindersSent: 0,
          topAbandonedProducts: [],
        };
      }

      const total = sessions.length;
      const recovered = sessions.filter(s => s.recovered).length;
      const abandonedValue = sessions
        .filter(s => !s.recovered)
        .reduce((sum, s) => sum + (Number(s.cart_total) || 0), 0);
      const remindersSent = sessions.filter(s => s.reminder_sent).length;

      // Aggregate top abandoned products
      const productCounts: Record<string, number> = {};
      sessions
        .filter(s => !s.recovered)
        .forEach(s => {
          const items = (s.cart_items as any[]) || [];
          items.forEach(item => {
            const name = item.name || 'Desconhecido';
            productCounts[name] = (productCounts[name] || 0) + 1;
          });
        });

      const topAbandonedProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalSessions: total,
        recoveredSessions: recovered,
        recoveryRate: total > 0 ? (recovered / total) * 100 : 0,
        totalAbandonedValue: abandonedValue,
        remindersSent,
        topAbandonedProducts,
      };
    },
  });
};
