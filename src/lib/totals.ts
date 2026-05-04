/**
 * Cart totals — single source of truth.
 * Composes pure helpers (pricing/sanitize) into a deterministic breakdown.
 * Pipeline: subtotal -> progressive(qty) -> coupon -> freight (free over min) -> PIX 5%.
 */
import {
  calculateCouponDiscount,
  getProgressiveDiscountPercent,
  type CouponLike,
  type QuantityDiscountTiers,
} from '@/lib/pricing';

export interface CartLine {
  /** Unit price (BRL). */
  price: number;
  quantity: number;
}

export type PaymentMethod = 'pix' | 'card' | 'boleto' | undefined;

export interface ComputeTotalsInput {
  items: CartLine[];
  freight?: number;
  freeShippingMinimum?: number | null;
  tiers?: QuantityDiscountTiers | null;
  coupon?: CouponLike | null;
  paymentMethod?: PaymentMethod;
  /** PIX discount %. Default 5. */
  pixDiscountPercent?: number;
  now?: Date;
}

export interface TotalsBreakdown {
  itemCount: number;
  subtotal: number;
  progressiveDiscountPercent: number;
  progressiveDiscount: number;
  couponDiscount: number;
  freight: number;
  freeShippingApplied: boolean;
  pixDiscount: number;
  total: number;
}

const round2 = (n: number): number =>
  Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

const safeNum = (n: number | null | undefined): number =>
  Number.isFinite(n as number) ? (n as number) : 0;

/**
 * Apply free-shipping rule: when subtotal >= minimum, freight is zeroed.
 */
export function applyFreeShipping(
  subtotal: number,
  freight: number,
  minimum: number | null | undefined,
): { freight: number; applied: boolean } {
  const min = safeNum(minimum);
  if (min > 0 && subtotal >= min) return { freight: 0, applied: true };
  return { freight: round2(safeNum(freight)), applied: false };
}

export function computeCartTotals(input: ComputeTotalsInput): TotalsBreakdown {
  const items = (input.items ?? []).filter(
    (l) => Number.isFinite(l?.price) && Number.isFinite(l?.quantity),
  );
  const itemCount = items.reduce((s, l) => s + l.quantity, 0);
  const subtotal = round2(items.reduce((s, l) => s + l.price * l.quantity, 0));

  // Progressive discount based on TOTAL quantity in cart.
  const tiers = input.tiers;
  const progressivePct = tiers
    ? getProgressiveDiscountPercent(itemCount, tiers)
    : 0;
  const progressiveDiscount = round2((subtotal * progressivePct) / 100);

  const afterProgressive = round2(subtotal - progressiveDiscount);

  // Coupon — silently ignored if invalid (UI validates separately).
  let couponDiscount = 0;
  if (input.coupon && afterProgressive > 0) {
    try {
      couponDiscount = round2(
        calculateCouponDiscount(input.coupon, afterProgressive, input.now),
      );
    } catch {
      couponDiscount = 0;
    }
  }
  const afterCoupon = Math.max(0, round2(afterProgressive - couponDiscount));

  // Freight + free-shipping.
  const { freight, applied: freeShippingApplied } = applyFreeShipping(
    afterCoupon,
    safeNum(input.freight),
    input.freeShippingMinimum,
  );

  let total = round2(afterCoupon + freight);

  // PIX discount applied last on the final total.
  const pixPct = input.pixDiscountPercent ?? 5;
  let pixDiscount = 0;
  if (input.paymentMethod === 'pix' && pixPct > 0 && total > 0) {
    pixDiscount = round2((total * pixPct) / 100);
    total = round2(total - pixDiscount);
  }

  return {
    itemCount,
    subtotal,
    progressiveDiscountPercent: progressivePct,
    progressiveDiscount,
    couponDiscount,
    freight,
    freeShippingApplied,
    pixDiscount,
    total: Math.max(0, total),
  };
}
