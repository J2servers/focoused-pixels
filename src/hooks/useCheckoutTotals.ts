/**
 * useCheckoutTotals — checkout-aware wrapper over useCartTotals.
 *
 * Composes the cart totals (subtotal/discount/coupon/freight/PIX) and surfaces
 * convenience fields used by the multi-step checkout (PaymentPage), namely:
 *  - selected payment method
 *  - selected freight quote
 *  - active coupon
 *  - top installment preview (for "ou em até Nx de R$ Y")
 */
import { useMemo } from 'react';
import { useCartTotals } from '@/hooks/useCartTotals';
import { usePaymentCredentials } from '@/hooks/usePaymentCredentials';
import { maxInstallmentPreview, type Installment } from '@/lib/installments';
import type { CouponLike } from '@/lib/pricing';
import type { PaymentMethod, TotalsBreakdown } from '@/lib/totals';

export interface UseCheckoutTotalsInput {
  freight?: number;
  coupon?: CouponLike | null;
  paymentMethod?: PaymentMethod;
}

export interface UseCheckoutTotalsResult extends TotalsBreakdown {
  freeShippingMinimum: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  installment: Installment;
  maxInstallments: number;
  minInstallment: number;
}

export function useCheckoutTotals(input: UseCheckoutTotalsInput = {}): UseCheckoutTotalsResult {
  const totals = useCartTotals(input);
  const { data: creds } = usePaymentCredentials();
  const maxInstallments = creds?.max_installments ?? 12;
  const minInstallment = creds?.min_installment_value ?? 50;

  const installment = useMemo(
    () =>
      maxInstallmentPreview(totals.total, {
        maxInstallments,
        minPerInstallment: minInstallment,
        maxNoInterest: maxInstallments,
      }),
    [totals.total, maxInstallments, minInstallment],
  );

  return {
    ...totals,
    installment,
    maxInstallments,
    minInstallment,
  };
}
