import { describe, it, expect } from 'vitest';

// Pure-port of edge helpers (no Deno dependencies) for unit testing the algorithms.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

describe('webhook crypto helpers', () => {
  it('timingSafeEqual matches identical strings', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
  });
  it('timingSafeEqual rejects different strings', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });
  it('hmacSha256Hex produces RFC 4231 vector', async () => {
    // Vector: key="key", message="The quick brown fox jumps over the lazy dog"
    const out = await hmacSha256Hex('key', 'The quick brown fox jumps over the lazy dog');
    expect(out).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });
  it('sanitizePhone normalizes Brazilian phones', () => {
    expect(sanitizePhone('(11) 99999-8888')).toBe('5511999998888');
    expect(sanitizePhone('5511999998888')).toBe('5511999998888');
    expect(sanitizePhone('011999998888')).toBe('5511999998888');
    expect(sanitizePhone('123')).toBeNull();
    expect(sanitizePhone(null)).toBeNull();
  });
});
