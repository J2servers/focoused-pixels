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

function captureBrowserMetadata() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return {};
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
    };
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(k => {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 100);
    });
    return {
      userAgent: nav.userAgent,
      language: nav.language,
      languages: Array.isArray(nav.languages) ? nav.languages.slice(0, 8) : [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      screen: { width: screen.width, height: screen.height, pixelRatio: window.devicePixelRatio },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      platform: nav.platform,
      vendor: nav.vendor,
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory ?? null,
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
        saveData: nav.connection.saveData,
      } : null,
      referrer: document.referrer,
      utm: Object.keys(utm).length ? utm : null,
    };
  } catch { return {}; }
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
        browser: captureBrowserMetadata(),
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
