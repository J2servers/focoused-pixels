import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutProfileData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cep: string;
  company?: string;
  cnpj?: string;
  shippingMethod?: string;
  updatedAt?: string;
}

function makeStorageKey(userId?: string) {
  return userId ? `pdl_checkout_profile_${userId}` : 'pdl_checkout_profile_guest';
}

function parseStorage(value: string | null): CheckoutProfileData | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as CheckoutProfileData;
    if (!parsed || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useCheckoutProfile(userId?: string) {
  const storageKey = useMemo(() => makeStorageKey(userId), [userId]);
  const [savedProfile, setSavedProfile] = useState<CheckoutProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLocalProfile = useCallback(() => {
    const local = parseStorage(localStorage.getItem(storageKey));
    setSavedProfile(local);
    return local;
  }, [storageKey]);

  const loadRemoteProfile = useCallback(async () => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('customer_checkout_profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      const mapped: CheckoutProfileData = {
        fullName: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        cep: data.cep || '',
        company: data.company || '',
        cnpj: data.cnpj || '',
        shippingMethod: data.shipping_method || 'sedex',
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(mapped));
      setSavedProfile(mapped);
      return mapped;
    } catch {
      return null;
    }
  }, [storageKey, userId]);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      loadLocalProfile();
      await loadRemoteProfile();
      if (mounted) setIsLoading(false);
    };
    boot();
    return () => {
      mounted = false;
    };
  }, [loadLocalProfile, loadRemoteProfile]);

  const saveProfile = useCallback(
    async (profile: CheckoutProfileData) => {
      const normalized: CheckoutProfileData = {
        fullName: profile.fullName?.trim() || '',
        email: profile.email?.trim().toLowerCase() || '',
        phone: profile.phone?.trim() || '',
        address: profile.address?.trim() || '',
        cep: profile.cep?.trim() || '',
        company: profile.company?.trim() || '',
        cnpj: profile.cnpj?.trim() || '',
        shippingMethod: profile.shippingMethod || 'sedex',
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(storageKey, JSON.stringify(normalized));
      setSavedProfile(normalized);

      if (userId) {
        try {
          await supabase
            .from('customer_checkout_profiles' as any)
            .upsert(
              {
                user_id: userId,
                email: normalized.email,
                full_name: normalized.fullName,
                phone: normalized.phone,
                address: normalized.address,
                cep: normalized.cep,
                company: normalized.company || null,
                cnpj: normalized.cnpj || null,
                shipping_method: normalized.shippingMethod || 'sedex',
                updated_at: normalized.updatedAt,
              },
              { onConflict: 'user_id' }
            );
        } catch {
          // silent fail: local one-click checkout still works
        }
      }
    },
    [storageKey, userId]
  );

  const clearProfile = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSavedProfile(null);
  }, [storageKey]);

  return {
    savedProfile,
    hasProfile: !!savedProfile?.email,
    isLoading,
    saveProfile,
    clearProfile,
    reloadProfile: loadRemoteProfile,
  };
}

