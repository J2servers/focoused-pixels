import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'editor' | 'support';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
}

const ROLE_PRIORITY: Record<AppRole, number> = {
  admin: 3,
  editor: 2,
  support: 1,
};

const pickHighestRole = (roles: { role: AppRole }[] | null): AppRole | null => {
  if (!roles?.length) return null;
  return roles.reduce<AppRole | null>((best, item) => {
    if (!best) return item.role;
    return ROLE_PRIORITY[item.role] > ROLE_PRIORITY[best] ? item.role : best;
  }, null);
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    role: null,
    isLoading: true,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [{ data: profile }, { data: roleRows }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
      ]);

      const role = pickHighestRole((roleRows ?? []) as { role: AppRole }[]);

      setState(prev => ({
        ...prev,
        profile: profile || null,
        role,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState(prev => ({
        ...prev,
        profile: null,
        role: null,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    let lastFetchedUserId: string | null = null;

    const safeFetch = (uid: string) => {
      if (lastFetchedUserId === uid) return; // dedupe: evita 2x profile/role
      lastFetchedUserId = uid;
      setTimeout(() => fetchUserData(uid), 0);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: !!session?.user,
        }));

        if (session?.user) {
          safeFetch(session.user.id);
        } else {
          lastFetchedUserId = null;
          setState(prev => ({
            ...prev,
            profile: null,
            role: null,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: !!session?.user,
      }));

      if (session?.user) {
        safeFetch(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    // Profile is created automatically via database trigger (handle_new_user)

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!state.role) return false;
    
    return ROLE_PRIORITY[state.role] >= ROLE_PRIORITY[requiredRole];
  };

  const canEdit = (): boolean => hasRole('editor');
  const isAdmin = (): boolean => hasRole('admin');

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    hasRole,
    canEdit,
    isAdmin,
  };
};
