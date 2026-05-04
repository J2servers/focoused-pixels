/**
 * useCartTotals — single reactive source of truth for cart math.
 * Composes useCart + useCompanyInfo + computeCartTotals.
 * Accepts optional coupon, freight and paymentMethod for checkout flows.
 */
import { useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import {
  computeCartTotals,
  type CartLine,
  type PaymentMethod,
  type TotalsBreakdown,
} from '@/lib/totals';
import type { CouponLike, QuantityDiscountTiers } from '@/lib/pricing';

export interface UseCartTotalsInput {
  coupon?: CouponLike | null;
  freight?: number;
  paymentMethod?: PaymentMethod;
}

export interface UseCartTotalsResult extends TotalsBreakdown {
  lines: CartLine[];
  freeShippingMinimum: number;
  freeShippingRemaining: number;
  freeShippingProgress: number; // 0..1
}

export function useCartTotals(input: UseCartTotalsInput = {}): UseCartTotalsResult {
  const items = useCart((s) => s.items);
  const { data: company } = useCompanyInfo();

  return useMemo(() => {
    const tiers: QuantityDiscountTiers = {
      q10: company?.quantity_discount_10 ?? 5,
      q20: company?.quantity_discount_20 ?? 10,
      q50: company?.quantity_discount_50 ?? 15,
      q100: company?.quantity_discount_100 ?? 20,
    };
    const lines: CartLine[] = items.map((i) => ({
      price: i.price,
      quantity: i.quantity,
    }));

    const freeShippingMinimum = Number(company?.free_shipping_minimum) || 0;

    const breakdown = computeCartTotals({
      items: lines,
      freight: input.freight,
      freeShippingMinimum,
      tiers,
      coupon: input.coupon,
      paymentMethod: input.paymentMethod,
    });

    const remaining = Math.max(0, freeShippingMinimum - breakdown.subtotal);
    const progress =
      freeShippingMinimum > 0
        ? Math.min(1, breakdown.subtotal / freeShippingMinimum)
        : 0;

    return {
      ...breakdown,
      lines,
      freeShippingMinimum,
      freeShippingRemaining: remaining,
      freeShippingProgress: progress,
    };
  }, [items, company, input.coupon, input.freight, input.paymentMethod]);
}
