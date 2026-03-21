import { useEffect, useRef, useState } from 'react';
import { useCart, type CartItem } from '@/hooks/useCart';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  ABANDONED_CONTACT_UPDATED_EVENT,
  getAbandonedCartContact,
  getOrCreateAbandonedCartToken,
} from '@/lib/abandoned-cart';

const SYNC_DEBOUNCE_MS = 1200;

function sanitizeSnapshotItems(items: CartItem[]) {
  return items.slice(0, 100).map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price.toFixed(2)),
    quantity: item.quantity,
    size: item.size || null,
    image: item.image || null,
  }));
}

export function useAbandonedCartTracker() {
  const { items, itemCount, total } = useCart();
  const { user } = useAuthContext();
  const [contactVersion, setContactVersion] = useState(0);
  const userFullName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : undefined;

  const cartTokenRef = useRef<string>('');
  const lastFingerprintRef = useRef<string>('');
  const syncTimeoutRef = useRef<number | null>(null);
  const disabledRef = useRef(false);

  useEffect(() => {
    cartTokenRef.current = getOrCreateAbandonedCartToken();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleContactUpdated = () => setContactVersion((prev) => prev + 1);
    window.addEventListener(ABANDONED_CONTACT_UPDATED_EVENT, handleContactUpdated as EventListener);

    return () => {
      window.removeEventListener(ABANDONED_CONTACT_UPDATED_EVENT, handleContactUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!cartTokenRef.current) return;
    if (disabledRef.current) return;
    if (window.location.hostname === 'localhost') return;

    if (syncTimeoutRef.current !== null) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(async () => {
      const contact = getAbandonedCartContact();

      const payload = {
        cartToken: cartTokenRef.current,
        items: sanitizeSnapshotItems(items),
        itemCount,
        total: Number(total.toFixed(2)),
        sourcePath: window.location.pathname,
        customer: {
          userId: user?.id,
          name: contact?.name || userFullName,
          email: contact?.email || user?.email,
          phone: contact?.phone,
        },
      };

      const fingerprint = JSON.stringify(payload);
      if (fingerprint === lastFingerprintRef.current) return;

      const { error } = await supabase.functions.invoke('upsert-abandoned-cart', {
        body: payload,
      });

      if (error) {
        disabledRef.current = true;
        return;
      }

      lastFingerprintRef.current = fingerprint;
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, itemCount, total, user?.id, user?.email, userFullName, contactVersion]);
}
