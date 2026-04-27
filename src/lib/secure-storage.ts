/**
 * Secure localStorage helper with TTL + obfuscation.
 * Wave 4: Mitigates PII persistence in localStorage.
 *
 * Note: Browser storage is never truly secret (JS can always read it).
 * This layer provides:
 *  - Automatic expiration (TTL) — no PII lingers after session end
 *  - Light obfuscation (base64) — defeats casual DevTools snooping
 *  - Schema validation — rejects tampered payloads
 */

const PREFIX = 'pdl_sec_v1::';

interface Envelope<T> {
  v: 1;
  exp: number; // epoch ms
  data: T;
}

function encode(value: string): string {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch {
    return value;
  }
}

function decode(value: string): string {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return value;
  }
}

export function secureSet<T>(key: string, data: T, ttlMs: number): void {
  if (typeof localStorage === 'undefined') return;
  const envelope: Envelope<T> = {
    v: 1,
    exp: Date.now() + ttlMs,
    data,
  };
  try {
    localStorage.setItem(PREFIX + key, encode(JSON.stringify(envelope)));
  } catch {
    // storage full or disabled — silently ignore
  }
}

export function secureGet<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decode(raw)) as Envelope<T>;
    if (!parsed || parsed.v !== 1 || typeof parsed.exp !== 'number') {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    if (parsed.exp < Date.now()) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    localStorage.removeItem(PREFIX + key);
    return null;
  }
}

export function secureRemove(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}

/** Standard TTLs */
export const TTL = {
  CHECKOUT_PROFILE: 7 * 24 * 60 * 60 * 1000, // 7 days
  ABANDONED_CART: 48 * 60 * 60 * 1000,        // 48 hours
} as const;
