import { describe, it, expect } from 'vitest';
import {
  buildFullAddress,
  buildShippingAddressLine,
  buildProductionNotes,
  generateOrderNumber,
  sanitizeCustomerSnapshot,
} from '@/lib/order';

describe('order builders', () => {
  it('buildFullAddress joins non-empty fields', () => {
    expect(buildFullAddress({
      street: 'Av. X', number: '100', complement: '',
      neighborhood: 'Centro', city: 'SP', state: 'SP',
    })).toBe('Av. X, 100, Centro, SP, SP');
  });

  it('buildShippingAddressLine returns null when empty', () => {
    expect(buildShippingAddressLine({})).toBeNull();
    expect(buildShippingAddressLine({ street: 'Rua A', number: '1' }))
      .toBe('Rua A, 1');
  });

  it('buildProductionNotes joins text + files', () => {
    expect(buildProductionNotes('', [])).toBeNull();
    expect(buildProductionNotes('Olá', [])).toBe('📝 Texto: Olá');
    expect(buildProductionNotes('', [{ name: 'a.png', url: 'u' }]))
      .toBe('📎 Arquivos: a.png');
    expect(buildProductionNotes('x', [{ name: 'a.png', url: 'u' }, { name: 'b.png', url: 'u' }]))
      .toBe('📝 Texto: x\n📎 Arquivos: a.png, b.png');
  });

  it('generateOrderNumber matches PLYYMMDD-XXXXXX pattern', () => {
    const n = generateOrderNumber(new Date(2026, 4, 4), 1234567890);
    expect(n).toMatch(/^PL260504-[0-9A-Z]{1,6}$/);
  });

  it('sanitizeCustomerSnapshot trims/lowercases/prefixes', () => {
    const s = sanitizeCustomerSnapshot({
      customerName: '  John ', customerEmail: 'JOHN@X.com', customerPhone: '11999999999',
    });
    expect(s.customerName).toBe('John');
    expect(s.customerEmail).toBe('john@x.com');
    expect(s.customerPhone).toMatch(/^55/);
  });

  it('sanitizeCustomerSnapshot keeps original phone when sanitize returns empty', () => {
    const s = sanitizeCustomerSnapshot({
      customerName: 'X', customerEmail: 'x@y.z', customerPhone: '',
    });
    expect(s.customerPhone).toBe('');
  });
});
