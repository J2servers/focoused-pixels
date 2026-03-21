import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from './useCart';

/**
 * Tracks cart activity and persists abandoned cart sessions to the database.
 * Should be mounted once in App.tsx.
 */
export const useAbandonedCartTracker = () => {
  const { items, total } = useCart();
  const sessionIdRef = useRef<string>(
    sessionStorage.getItem('cart_session_id') || crypto.randomUUID()
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    sessionStorage.setItem('cart_session_id', sessionIdRef.current);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const cartItems = items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        }));

        await (supabase as any)
          .from('abandoned_cart_sessions')
          .upsert({
            session_id: sessionIdRef.current,
            cart_items: cartItems,
            cart_total: total,
            last_activity_at: new Date().toISOString(),
          }, { onConflict: 'session_id' });
      } catch (error) {
        // Silent fail — tracking should never block UX
        console.debug('Cart tracking error:', error);
      }
    }, 5000); // Debounce 5s

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [items, total]);

  /** Call this when customer provides contact info during checkout */
  const updateContactInfo = async (name: string, email: string, phone: string) => {
    try {
      await supabase
        .from('abandoned_cart_sessions')
        .update({
          user_name: name,
          user_email: email,
          user_phone: phone,
        })
        .eq('session_id', sessionIdRef.current);
    } catch {
      // Silent fail
    }
  };

  /** Call this when the order is completed to mark session as recovered */
  const markRecovered = async () => {
    try {
      await supabase
        .from('abandoned_cart_sessions')
        .update({
          recovered: true,
          recovered_at: new Date().toISOString(),
        })
        .eq('session_id', sessionIdRef.current);
    } catch {
      // Silent fail
    }
  };

  return { sessionId: sessionIdRef.current, updateContactInfo, markRecovered };
};
