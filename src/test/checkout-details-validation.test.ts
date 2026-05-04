import { describe, it, expect } from 'vitest';
import { isValidCpf, formatCpf, cpfDigits } from '@/lib/cpf';

interface CustomerForm {
  name: string;
  phone: string;
  cpf: string;
  street: string;
  cep: string;
  city: string;
  state: string;
}

// Mirrors the validation logic in PaymentStepDetails.
function isCheckoutValid(form: CustomerForm, selectedMethod: string | null): boolean {
  const cleanCepLen = form.cep.replace(/\D/g, '').length;
  return Boolean(
    form.name.trim() &&
    form.phone.trim() &&
    isValidCpf(form.cpf) &&
    form.street.trim() &&
    cleanCepLen === 8 &&
    form.city.trim() &&
    form.state.trim() &&
    selectedMethod !== null,
  );
}

const valid: CustomerForm = {
  name: 'João Silva',
  phone: '(11) 99999-8888',
  cpf: formatCpf('52998224725'), // valid mod-11
  street: 'Rua A',
  cep: '01310-100',
  city: 'São Paulo',
  state: 'SP',
};

describe('checkout details validation', () => {
  it('accepts a fully filled form with valid CPF and selected shipping', () => {
    expect(isCheckoutValid(valid, 'PAC')).toBe(true);
  });
  it('rejects when CPF is invalid', () => {
    expect(isCheckoutValid({ ...valid, cpf: '111.111.111-11' }, 'PAC')).toBe(false);
  });
  it('rejects when CEP has wrong length', () => {
    expect(isCheckoutValid({ ...valid, cep: '12345' }, 'PAC')).toBe(false);
  });
  it('rejects when shipping method not selected', () => {
    expect(isCheckoutValid(valid, null)).toBe(false);
  });
  it('rejects when required address field missing', () => {
    expect(isCheckoutValid({ ...valid, street: '   ' }, 'SEDEX')).toBe(false);
  });
  it('cpfDigits keeps only digits up to 11', () => {
    expect(cpfDigits('529.982.247-25abc')).toBe('52998224725');
  });
});
