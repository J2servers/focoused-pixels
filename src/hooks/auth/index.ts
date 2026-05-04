import { useAuthSession } from './useAuthSession';
import { authActions } from './actions';
import { AppRole, ROLE_PRIORITY } from './types';

export type { AppRole, Profile } from './types';

export const useAuth = () => {
  const state = useAuthSession();

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!state.role) return false;
    return ROLE_PRIORITY[state.role] >= ROLE_PRIORITY[requiredRole];
  };

  return {
    ...state,
    ...authActions,
    hasRole,
    canEdit: () => hasRole('editor'),
    isAdmin: () => hasRole('admin'),
  };
};
