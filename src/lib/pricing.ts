/**
 * Pure pricing helpers — no IO, fully testable.
 * Single source of truth for discount math (coupons + progressive quantity).
 */

export type CouponType = 'percentage' | 'fixed';

export interface CouponLike {
  type: CouponType;
  value: number;
  max_discount?: number | null;
  min_order_value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  usage_limit?: number | null;
  usage_count?: number;
}

export interface QuantityDiscountTiers {
  q10: number; // % at >=10
  q20: number; // % at >=20
  q50: number; // % at >=50
  q100: number; // % at >=100
}

/**
 * Returns the % discount applied for a given quantity, based on configured tiers.
 * Tiers are non-cumulative — highest matching tier wins.
 */
export function getProgressiveDiscountPercent(
  quantity: number,
  tiers: QuantityDiscountTiers,
): number {
  if (!Number.isFinite(quantity) || quantity < 10) return 0;
  if (quantity >= 100) return tiers.q100;
  if (quantity >= 50) return tiers.q50;
  if (quantity >= 20) return tiers.q20;
  return tiers.q10;
}

/**
 * Validates a coupon at a given moment + order value, returning the discount amount.
 * Throws Error with localized PT-BR messages for any failed rule.
 */
export function calculateCouponDiscount(
  coupon: CouponLike,
  orderValue: number,
  now: Date = new Date(),
): number {
  if (coupon.is_active === false) throw new Error('Cupom inválido ou expirado');
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    throw new Error('Cupom ainda não está ativo');
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    throw new Error('Cupom expirado');
  }
  if (
    coupon.usage_limit != null &&
    (coupon.usage_count ?? 0) >= coupon.usage_limit
  ) {
    throw new Error('Cupom esgotado');
  }
  if (coupon.min_order_value && orderValue < coupon.min_order_value) {
    throw new Error(`Valor mínimo: R$ ${coupon.min_order_value.toFixed(2)}`);
  }

  let discount =
    coupon.type === 'percentage'
      ? (orderValue * coupon.value) / 100
      : coupon.value;

  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }
  return Math.max(0, Math.min(discount, orderValue));
}
