export type AppRole = 'admin' | 'editor' | 'support';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
}

export const ROLE_PRIORITY: Record<AppRole, number> = {
  admin: 3,
  editor: 2,
  support: 1,
};

export const pickHighestRole = (roles: { role: AppRole }[] | null): AppRole | null => {
  if (!roles?.length) return null;
  return roles.reduce<AppRole | null>((best, item) => {
    if (!best) return item.role;
    return ROLE_PRIORITY[item.role] > ROLE_PRIORITY[best] ? item.role : best;
  }, null);
};
