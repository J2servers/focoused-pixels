import { describe, it, expect } from 'vitest';
import {
  getProgressiveDiscountPercent,
  calculateCouponDiscount,
  type QuantityDiscountTiers,
} from '@/lib/pricing';

const tiers: QuantityDiscountTiers = { q10: 5, q20: 10, q50: 15, q100: 20 };

describe('getProgressiveDiscountPercent', () => {
  it('returns 0 below 10 units', () => {
    expect(getProgressiveDiscountPercent(0, tiers)).toBe(0);
    expect(getProgressiveDiscountPercent(9, tiers)).toBe(0);
  });
  it('applies tiers correctly', () => {
    expect(getProgressiveDiscountPercent(10, tiers)).toBe(5);
    expect(getProgressiveDiscountPercent(19, tiers)).toBe(5);
    expect(getProgressiveDiscountPercent(20, tiers)).toBe(10);
    expect(getProgressiveDiscountPercent(49, tiers)).toBe(10);
    expect(getProgressiveDiscountPercent(50, tiers)).toBe(15);
    expect(getProgressiveDiscountPercent(99, tiers)).toBe(15);
    expect(getProgressiveDiscountPercent(100, tiers)).toBe(20);
    expect(getProgressiveDiscountPercent(5000, tiers)).toBe(20);
  });
  it('handles invalid input', () => {
    expect(getProgressiveDiscountPercent(NaN, tiers)).toBe(0);
    expect(getProgressiveDiscountPercent(-5, tiers)).toBe(0);
  });
});

describe('calculateCouponDiscount', () => {
  const base = { type: 'percentage' as const, value: 10, is_active: true };

  it('computes percentage discount', () => {
    expect(calculateCouponDiscount(base, 200)).toBe(20);
  });
  it('caps at max_discount', () => {
    expect(
      calculateCouponDiscount({ ...base, max_discount: 15 }, 1000),
    ).toBe(15);
  });
  it('computes fixed discount', () => {
    expect(
      calculateCouponDiscount({ type: 'fixed', value: 30, is_active: true }, 200),
    ).toBe(30);
  });
  it('clamps fixed discount to order value', () => {
    expect(
      calculateCouponDiscount({ type: 'fixed', value: 500, is_active: true }, 100),
    ).toBe(100);
  });
  it('throws when below min_order_value', () => {
    expect(() =>
      calculateCouponDiscount({ ...base, min_order_value: 100 }, 50),
    ).toThrow(/Valor mínimo/);
  });
  it('throws when expired', () => {
    expect(() =>
      calculateCouponDiscount(
        { ...base, end_date: '2020-01-01' },
        100,
        new Date('2026-05-04'),
      ),
    ).toThrow(/expirado/);
  });
  it('throws when not yet active', () => {
    expect(() =>
      calculateCouponDiscount(
        { ...base, start_date: '2099-01-01' },
        100,
        new Date('2026-05-04'),
      ),
    ).toThrow(/ainda não/);
  });
  it('throws when usage limit reached', () => {
    expect(() =>
      calculateCouponDiscount(
        { ...base, usage_limit: 5, usage_count: 5 },
        100,
      ),
    ).toThrow(/esgotado/);
  });
  it('throws when inactive', () => {
    expect(() =>
      calculateCouponDiscount({ ...base, is_active: false }, 100),
    ).toThrow(/inválido/);
  });
});
