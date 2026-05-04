import { logger } from '@/lib/logger';
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile, pickHighestRole } from './types';

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
}

const initial: AuthState = { user: null, session: null, profile: null, role: null, isLoading: true };

export function useAuthSession() {
  const loadedUserIdRef = useRef<string | null>(null);
  const inFlightUserIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const [state, setState] = useState<AuthState>(initial);

  const safeSet = useCallback((updater: (prev: AuthState) => AuthState) => {
    if (!mountedRef.current) return;
    setState(updater);
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    inFlightUserIdRef.current = userId;
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
      ]);
      // Drop result if user changed (sign-out or switch) while we were fetching.
      if (inFlightUserIdRef.current !== userId) return;
      const role = pickHighestRole((roleRows ?? []) as { role: AppRole }[]);
      loadedUserIdRef.current = userId;
      safeSet((prev) => ({ ...prev, profile: profile || null, role, isLoading: false }));
    } catch (error) {
      if (inFlightUserIdRef.current !== userId) return;
      logger.error('authSession', 'Error fetching user data:', error);
      loadedUserIdRef.current = null;
      safeSet((prev) => ({ ...prev, profile: null, role: null, isLoading: false }));
    }
  }, [safeSet]);

  useEffect(() => {
    mountedRef.current = true;
    let lastFetchedUserId: string | null = null;

    const safeFetch = (uid: string) => {
      if (loadedUserIdRef.current === uid) return;
      if (lastFetchedUserId === uid) return;
      lastFetchedUserId = uid;
      // Defer to break out of Supabase listener context.
      setTimeout(() => {
        if (mountedRef.current) void fetchUserData(uid);
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      safeSet((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: session?.user ? loadedUserIdRef.current !== session.user.id : false,
      }));
      if (session?.user) {
        safeFetch(session.user.id);
      } else {
        lastFetchedUserId = null;
        loadedUserIdRef.current = null;
        inFlightUserIdRef.current = null;
        safeSet((prev) => ({ ...prev, profile: null, role: null, isLoading: false }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      safeSet((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: session?.user ? loadedUserIdRef.current !== session.user.id : false,
      }));
      if (session?.user) safeFetch(session.user.id);
      else safeSet((prev) => ({ ...prev, isLoading: false }));
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData, safeSet]);

  return state;
}
