import { describe, it, expect } from 'vitest';
import { orderStatusLabel, orderStatusBadgeClass, isOrderStatus } from '@/lib/orderStatus';

describe('orderStatus', () => {
  it('returns labels for known statuses', () => {
    expect(orderStatusLabel('paid')).toBe('Pago');
    expect(orderStatusLabel('in_production')).toBe('Em produção');
    expect(orderStatusLabel('delivered')).toBe('Entregue');
  });
  it('falls back for unknown', () => {
    expect(orderStatusLabel('mystery')).toBe('Desconhecido');
    expect(orderStatusLabel(null)).toBe('Desconhecido');
  });
  it('badge class uses design tokens', () => {
    expect(orderStatusBadgeClass('cancelled')).toContain('destructive');
    expect(orderStatusBadgeClass('paid')).toContain('primary');
  });
  it('isOrderStatus type guard', () => {
    expect(isOrderStatus('shipped')).toBe(true);
    expect(isOrderStatus('foo')).toBe(false);
  });
});
