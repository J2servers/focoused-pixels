import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useNotifyWhenAvailable() {
  const [loading, setLoading] = useState(false);

  const subscribe = async (email: string, productId: string): Promise<boolean> => {
    if (!email || !productId) return false;
    setLoading(true);
    try {
      const { error } = await supabase.from('leads').upsert(
        {
          email,
          name: email.split('@')[0],
          source: 'back_in_stock',
          tags: [`notify:${productId}`],
        },
        { onConflict: 'email' },
      );
      return !error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, subscribe };
}
