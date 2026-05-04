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
  const [state, setState] = useState<AuthState>(initial);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
      ]);
      const role = pickHighestRole((roleRows ?? []) as { role: AppRole }[]);
      loadedUserIdRef.current = userId;
      setState(prev => ({ ...prev, profile: profile || null, role, isLoading: false }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      loadedUserIdRef.current = null;
      setState(prev => ({ ...prev, profile: null, role: null, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    let lastFetchedUserId: string | null = null;

    const safeFetch = (uid: string) => {
      if (loadedUserIdRef.current === uid) return;
      if (lastFetchedUserId === uid) return;
      lastFetchedUserId = uid;
      setTimeout(() => fetchUserData(uid), 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
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
        setState(prev => ({ ...prev, profile: null, role: null, isLoading: false }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: session?.user ? loadedUserIdRef.current !== session.user.id : false,
      }));
      if (session?.user) safeFetch(session.user.id);
      else setState(prev => ({ ...prev, isLoading: false }));
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  return state;
}
