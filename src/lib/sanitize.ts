/**
 * Customer data sanitization — single source of truth.
 * Rule: emails always trimmed + lowercased; phones digits-only with '55' BR prefix.
 * Pure functions, no IO, fully testable. Use everywhere instead of inline regex.
 */

export const sanitizeEmail = (raw: string | null | undefined): string =>
  (raw ?? '').trim().toLowerCase();

export const sanitizeDigits = (raw: string | null | undefined): string =>
  (raw ?? '').replace(/\D/g, '');

/**
 * Returns digits-only Brazilian phone with leading '55' country prefix.
 * - Strips all non-digits
 * - If already starts with '55' and length >= 12, keeps as-is
 * - Otherwise prepends '55'
 * - Returns '' for empty/invalid input
 */
export const sanitizePhone = (raw: string | null | undefined): string => {
  const digits = sanitizeDigits(raw);
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
};

export const sanitizeCEP = (raw: string | null | undefined): string =>
  sanitizeDigits(raw).slice(0, 8);

export const sanitizeCPF = (raw: string | null | undefined): string =>
  sanitizeDigits(raw).slice(0, 11);

export const sanitizeCNPJ = (raw: string | null | undefined): string =>
  sanitizeDigits(raw).slice(0, 14);

export const isValidCPF = (raw: string | null | undefined): boolean =>
  sanitizeCPF(raw).length === 11;

export const isValidCNPJ = (raw: string | null | undefined): boolean =>
  sanitizeCNPJ(raw).length === 14;

export const isValidCEP = (raw: string | null | undefined): boolean =>
  sanitizeCEP(raw).length === 8;

export const isValidEmail = (raw: string | null | undefined): boolean => {
  const v = sanitizeEmail(raw);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 255;
};
