import { describe, it, expect } from 'vitest';

// Test the role hierarchy logic in isolation
type AppRole = 'admin' | 'editor' | 'support';

const roleHierarchy: Record<AppRole, number> = {
  admin: 3,
  editor: 2,
  support: 1,
};

function hasRole(userRole: AppRole | null, requiredRole: AppRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

describe('Role hierarchy guard', () => {
  it('admin has access to all roles', () => {
    expect(hasRole('admin', 'admin')).toBe(true);
    expect(hasRole('admin', 'editor')).toBe(true);
    expect(hasRole('admin', 'support')).toBe(true);
  });

  it('editor has access to editor and support', () => {
    expect(hasRole('editor', 'admin')).toBe(false);
    expect(hasRole('editor', 'editor')).toBe(true);
    expect(hasRole('editor', 'support')).toBe(true);
  });

  it('support only has support access', () => {
    expect(hasRole('support', 'admin')).toBe(false);
    expect(hasRole('support', 'editor')).toBe(false);
    expect(hasRole('support', 'support')).toBe(true);
  });

  it('null role denies all access', () => {
    expect(hasRole(null, 'admin')).toBe(false);
    expect(hasRole(null, 'editor')).toBe(false);
    expect(hasRole(null, 'support')).toBe(false);
  });
});

describe('Auth error messages', () => {
  // Replicate the error mapping from auth-error.ts pattern
  const getAuthErrorMessage = (code: string): string => {
    const map: Record<string, string> = {
      'invalid_credentials': 'E-mail ou senha incorretos.',
      'email_not_confirmed': 'Por favor, confirme seu e-mail antes de entrar.',
      'user_not_found': 'Usuário não encontrado.',
      'signup_disabled': 'Cadastro desabilitado.',
    };
    return map[code] || 'Erro de autenticação desconhecido.';
  };

  it('maps known errors', () => {
    expect(getAuthErrorMessage('invalid_credentials')).toContain('incorretos');
    expect(getAuthErrorMessage('email_not_confirmed')).toContain('confirme');
  });

  it('returns fallback for unknown errors', () => {
    expect(getAuthErrorMessage('some_random_error')).toContain('desconhecido');
  });
});
