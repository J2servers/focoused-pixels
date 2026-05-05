import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Dispara o evento Purchase server-side (CAPI) ao chegar na página de sucesso.
 * Usa flag em sessionStorage para garantir idempotência (evita duplo disparo no F5).
 */
export function useCapiPurchaseEvent(paymentIdOrOrderNumber: string | null) {
  const fired = useRef(false);

  useEffect(() => {
    if (!paymentIdOrOrderNumber || fired.current) return;
    const dedupeKey = `capi:purchase:${paymentIdOrOrderNumber}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    fired.current = true;

    (async () => {
      try {
        // Busca o pedido pelo order_number ou payment_id
        const { data: order } = await supabase
          .from('orders')
          .select('id, order_number, total, items, customer_email, customer_phone')
          .or(`order_number.eq.${paymentIdOrOrderNumber},payment_id.eq.${paymentIdOrOrderNumber}`)
          .maybeSingle();

        if (!order) return;

        const items = (Array.isArray(order.items) ? order.items : []) as unknown[];
        const contents = items
          .filter((it): it is Record<string, unknown> => typeof it === 'object' && it !== null)
          .map((it) => ({
            id: String(it.product_id ?? it.id ?? ''),
            quantity: Number(it.quantity ?? 1),
            price: Number(it.price ?? 0),
          }));

        await supabase.functions.invoke('ads-capi-dispatch', {
          body: {
            event_name: 'Purchase',
            event_id: order.order_number,
            order_id: order.id,
            value: Number(order.total ?? 0),
            currency: 'BRL',
            email: order.customer_email ?? undefined,
            phone: order.customer_phone ?? undefined,
            client_user_agent: navigator.userAgent,
            source_url: window.location.href,
            contents,
          },
        });

        sessionStorage.setItem(dedupeKey, '1');
      } catch (err) {
        console.warn('[CAPI] Purchase dispatch failed:', err);
      }
    })();
  }, [paymentIdOrOrderNumber]);
}
