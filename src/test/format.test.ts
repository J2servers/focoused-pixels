import { describe, it, expect } from 'vitest';
import {
  formatCurrency, formatPercent, formatDate, formatPhone,
  formatCEP, formatCNPJ, formatCPF,
} from '@/lib/format';

describe('format utils', () => {
  it('formats BRL currency', () => {
    expect(formatCurrency(10)).toMatch(/R\$\s?10,00/);
    expect(formatCurrency(null)).toMatch(/R\$\s?0,00/);
  });
  it('formats percent', () => {
    expect(formatPercent(0.125)).toContain('12,5');
  });
  it('formats date safely', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDate('2026-05-04')).toMatch(/04\/05\/2026/);
  });
  it('formats phone (11 digits)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('1234567890')).toBe('(12) 3456-7890');
    expect(formatPhone('abc')).toBe('abc');
  });
  it('formats CEP', () => {
    expect(formatCEP('01310100')).toBe('01310-100');
    expect(formatCEP('123')).toBe('123');
  });
  it('formats CNPJ', () => {
    expect(formatCNPJ('12345678000199')).toBe('12.345.678/0001-99');
  });
  it('formats CPF', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01');
  });
});
