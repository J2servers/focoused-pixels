import { describe, it, expect } from 'vitest';
import {
  sanitizeEmail, sanitizeDigits, sanitizePhone,
  sanitizeCEP, sanitizeCPF, sanitizeCNPJ,
  isValidCPF, isValidCNPJ, isValidCEP, isValidEmail,
} from '@/lib/sanitize';

describe('sanitizeEmail', () => {
  it('trims + lowercases', () => {
    expect(sanitizeEmail('  Foo@BAR.com ')).toBe('foo@bar.com');
  });
  it('handles null/undefined', () => {
    expect(sanitizeEmail(null)).toBe('');
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('sanitizeDigits', () => {
  it('strips non-digits', () => {
    expect(sanitizeDigits('(11) 98765-4321')).toBe('11987654321');
    expect(sanitizeDigits('abc')).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('prepends 55 if missing', () => {
    expect(sanitizePhone('11987654321')).toBe('5511987654321');
  });
  it('keeps 55 when already present (>=12 digits)', () => {
    expect(sanitizePhone('5511987654321')).toBe('5511987654321');
    expect(sanitizePhone('+55 (11) 98765-4321')).toBe('5511987654321');
  });
  it('does not double-prefix short codes that happen to start with 55', () => {
    // short '55...' (less than 12 digits) is treated as raw and prefixed
    expect(sanitizePhone('5512345')).toBe('555512345');
  });
  it('returns empty for empty/non-digit input', () => {
    expect(sanitizePhone('')).toBe('');
    expect(sanitizePhone('---')).toBe('');
    expect(sanitizePhone(null)).toBe('');
  });
});

describe('sanitizeCEP / CPF / CNPJ', () => {
  it('truncates to max length', () => {
    expect(sanitizeCEP('01310-100abc')).toBe('01310100');
    expect(sanitizeCPF('123.456.789-01extra')).toBe('12345678901');
    expect(sanitizeCNPJ('12.345.678/0001-99extra')).toBe('12345678000199');
  });
});

describe('validators', () => {
  it('CPF/CNPJ/CEP length checks', () => {
    expect(isValidCPF('123.456.789-01')).toBe(true);
    expect(isValidCPF('123')).toBe(false);
    expect(isValidCNPJ('12.345.678/0001-99')).toBe(true);
    expect(isValidCNPJ('123')).toBe(false);
    expect(isValidCEP('01310-100')).toBe(true);
    expect(isValidCEP('123')).toBe(false);
  });
  it('email basic shape', () => {
    expect(isValidEmail('Foo@bar.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(`${'a'.repeat(250)}@b.com`)).toBe(false);
  });
});
