import { describe, it, expect } from 'vitest';
import { formatCep, isValidCep, cepDigits } from '@/lib/cep';
import { formatCpf, isValidCpf } from '@/lib/cpf';
import { formatCnpj, isValidCnpj } from '@/lib/cnpj';

describe('cep', () => {
  it('formats progressively', () => {
    expect(formatCep('01001000')).toBe('01001-000');
    expect(formatCep('010')).toBe('010');
    expect(formatCep('01001abc999X')).toBe('01001-999');
  });
  it('validates length', () => {
    expect(isValidCep('01001-000')).toBe(true);
    expect(isValidCep('123')).toBe(false);
    expect(cepDigits(null)).toBe('');
  });
});

describe('cpf', () => {
  it('formats progressively', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(formatCpf('529982')).toBe('529.982');
  });
  it('validates real and rejects invalid/repeated', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('12345678900')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });
});

describe('cnpj', () => {
  it('formats progressively', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });
  it('validates real and rejects invalid/repeated', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('00000000000000')).toBe(false);
    expect(isValidCnpj('11222333000180')).toBe(false);
  });
});
