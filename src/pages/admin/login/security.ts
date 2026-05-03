// Security constants & helpers extracted from AdminLoginPage
import { z } from 'zod';

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
export const WINDOW_MS = 5 * 60 * 1000;
export const BAN_THRESHOLD = 15;

export const SAFE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const DANGEROUS_PATTERNS = /[<>"'`;(){}[\]\\|&$!#]/;

export const sanitize = (v: string): string =>
  v.replace(/[<>"'`;(){}[\]\\|&$!#]/g, '').trim().slice(0, 255);

export const loginSchema = z.object({
  email: z
    .string()
    .max(255, 'Email muito longo')
    .refine((v) => SAFE_EMAIL.test(v), 'Email inválido')
    .refine((v) => !DANGEROUS_PATTERNS.test(v), 'Caracteres não permitidos'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128, 'Senha muito longa'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

const SEC_KEY = '__x9f2';
export interface SecurityData {
  a: { t: number; s: boolean }[];
  l: number | null;
  f: number;
  b: boolean;
  h: string;
}

const computeHash = (a: number, f: number, b: boolean): string => {
  const raw = `${a}-${f}-${b ? '1' : '0'}-x9f2`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
};

export const getSecData = (): SecurityData => {
  try {
    const r = sessionStorage.getItem(SEC_KEY);
    if (!r) return { a: [], l: null, f: 0, b: false, h: computeHash(0, 0, false) };
    const d: SecurityData = JSON.parse(r);
    if (d.h !== computeHash(d.a.length, d.f, d.b)) {
      const banned: SecurityData = {
        a: [],
        l: null,
        f: BAN_THRESHOLD,
        b: true,
        h: computeHash(0, BAN_THRESHOLD, true),
      };
      sessionStorage.setItem(SEC_KEY, JSON.stringify(banned));
      return banned;
    }
    return d;
  } catch {
    return { a: [], l: null, f: 0, b: false, h: computeHash(0, 0, false) };
  }
};

export const saveSecData = (
  a: SecurityData['a'],
  l: number | null,
  f: number,
  b: boolean,
) => {
  const d: SecurityData = { a, l, f, b, h: computeHash(a.length, f, b) };
  sessionStorage.setItem(SEC_KEY, JSON.stringify(d));
};

export const resetSecKeyOnce = () => {
  const RESET_KEY = '__x9f2_reset_v2';
  if (!sessionStorage.getItem(RESET_KEY)) {
    sessionStorage.removeItem(SEC_KEY);
    sessionStorage.setItem(RESET_KEY, '1');
  }
};

export const getFingerprint = (): string => {
  const nav = navigator;
  const raw = [
    nav.userAgent,
    nav.language,
    nav.hardwareConcurrency,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
};

export const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
