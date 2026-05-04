/**
 * useFreeShippingProgress — CRO helper.
 * Returns progress %, remaining BRL and a localized message.
 */
import { useCartTotals } from '@/hooks/useCartTotals';
import { formatCurrency } from '@/lib/format';

export interface FreeShippingProgress {
  enabled: boolean;
  applied: boolean;
  progress: number; // 0..1
  remaining: number;
  message: string;
}

export function useFreeShippingProgress(): FreeShippingProgress {
  const { freeShippingMinimum, freeShippingProgress, freeShippingRemaining, freeShippingApplied } =
    useCartTotals();
  const enabled = freeShippingMinimum > 0;
  const message = !enabled
    ? ''
    : freeShippingApplied
      ? '🎉 Frete grátis liberado!'
      : `Faltam ${formatCurrency(freeShippingRemaining)} para frete grátis`;
  return {
    enabled,
    applied: freeShippingApplied,
    progress: freeShippingProgress,
    remaining: freeShippingRemaining,
    message,
  };
}
