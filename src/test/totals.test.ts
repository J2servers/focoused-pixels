import { describe, it, expect } from 'vitest';
import {
  computeCartTotals,
  applyFreeShipping,
  type CartLine,
} from '@/lib/totals';
import type { QuantityDiscountTiers } from '@/lib/pricing';

const tiers: QuantityDiscountTiers = { q10: 5, q20: 10, q50: 15, q100: 20 };
const lines = (pairs: [number, number][]): CartLine[] =>
  pairs.map(([price, quantity]) => ({ price, quantity }));

describe('applyFreeShipping', () => {
  it('zeros freight when subtotal >= minimum', () => {
    expect(applyFreeShipping(150, 25, 100)).toEqual({ freight: 0, applied: true });
  });
  it('keeps freight below minimum', () => {
    expect(applyFreeShipping(50, 25, 100)).toEqual({ freight: 25, applied: false });
  });
  it('ignores null/zero minimum', () => {
    expect(applyFreeShipping(1000, 25, null)).toEqual({ freight: 25, applied: false });
    expect(applyFreeShipping(1000, 25, 0)).toEqual({ freight: 25, applied: false });
  });
  it('handles invalid freight', () => {
    expect(applyFreeShipping(50, NaN, 100)).toEqual({ freight: 0, applied: false });
  });
});

describe('computeCartTotals', () => {
  it('returns zeros for empty cart', () => {
    const t = computeCartTotals({ items: [] });
    expect(t.itemCount).toBe(0);
    expect(t.subtotal).toBe(0);
    expect(t.total).toBe(0);
  });

  it('sums subtotal and item count', () => {
    const t = computeCartTotals({ items: lines([[10, 2], [5, 3]]) });
    expect(t.itemCount).toBe(5);
    expect(t.subtotal).toBe(35);
    expect(t.total).toBe(35);
  });

  it('applies freight without free-shipping', () => {
    const t = computeCartTotals({ items: lines([[10, 2]]), freight: 15 });
    expect(t.freight).toBe(15);
    expect(t.total).toBe(35);
    expect(t.freeShippingApplied).toBe(false);
  });

  it('triggers free-shipping over minimum', () => {
    const t = computeCartTotals({
      items: lines([[100, 2]]),
      freight: 25,
      freeShippingMinimum: 150,
    });
    expect(t.freight).toBe(0);
    expect(t.freeShippingApplied).toBe(true);
    expect(t.total).toBe(200);
  });

  it('applies progressive discount by total qty', () => {
    const t = computeCartTotals({
      items: lines([[10, 25]]),
      tiers,
    });
    expect(t.progressiveDiscountPercent).toBe(10);
    expect(t.progressiveDiscount).toBe(25);
    expect(t.total).toBe(225);
  });

  it('chains coupon AFTER progressive', () => {
    const t = computeCartTotals({
      items: lines([[10, 25]]), // subtotal 250 -> -10% = 225
      tiers,
      coupon: { type: 'percentage', value: 20, is_active: true }, // 20% on 225 = 45
    });
    expect(t.couponDiscount).toBe(45);
    expect(t.total).toBe(180);
  });

  it('silently ignores invalid coupon', () => {
    const t = computeCartTotals({
      items: lines([[10, 5]]),
      coupon: { type: 'percentage', value: 10, is_active: false },
    });
    expect(t.couponDiscount).toBe(0);
    expect(t.total).toBe(50);
  });

  it('applies PIX 5% on final total', () => {
    const t = computeCartTotals({
      items: lines([[100, 1]]),
      freight: 20,
      paymentMethod: 'pix',
    });
    expect(t.pixDiscount).toBe(6); // 5% of 120
    expect(t.total).toBe(114);
  });

  it('does not apply PIX discount for card', () => {
    const t = computeCartTotals({
      items: lines([[100, 1]]),
      paymentMethod: 'card',
    });
    expect(t.pixDiscount).toBe(0);
    expect(t.total).toBe(100);
  });

  it('combines progressive + coupon + free-shipping + PIX', () => {
    const t = computeCartTotals({
      items: lines([[10, 50]]), // subtotal 500
      tiers, // -15% = 425
      coupon: { type: 'fixed', value: 25, is_active: true }, // -25 = 400
      freight: 30,
      freeShippingMinimum: 300, // free
      paymentMethod: 'pix', // -5% on 400 = -20
    });
    expect(t.progressiveDiscount).toBe(75);
    expect(t.couponDiscount).toBe(25);
    expect(t.freeShippingApplied).toBe(true);
    expect(t.pixDiscount).toBe(20);
    expect(t.total).toBe(380);
  });

  it('clamps total to >= 0', () => {
    const t = computeCartTotals({
      items: lines([[10, 1]]),
      coupon: { type: 'fixed', value: 999, is_active: true },
    });
    expect(t.total).toBeGreaterThanOrEqual(0);
  });

  it('is NaN-safe for malformed input', () => {
    const t = computeCartTotals({
      items: [
        { price: NaN, quantity: 2 },
        { price: 10, quantity: 1 },
      ],
      freight: NaN,
    });
    expect(t.subtotal).toBe(10);
    expect(t.freight).toBe(0);
    expect(t.total).toBe(10);
  });

  it('rounds to 2 decimal places', () => {
    const t = computeCartTotals({ items: lines([[3.333, 3]]) });
    expect(t.subtotal).toBe(10);
    expect(Number.isInteger(t.total * 100)).toBe(true);
  });

  it('respects custom pixDiscountPercent', () => {
    const t = computeCartTotals({
      items: lines([[100, 1]]),
      paymentMethod: 'pix',
      pixDiscountPercent: 10,
    });
    expect(t.pixDiscount).toBe(10);
    expect(t.total).toBe(90);
  });
});
