/**
 * installments.ts — pure rules for credit card installments.
 *
 * Business rules (Mercado Pago, Pincel de Luz):
 *  - Default max parcels: 12.
 *  - Each parcel must be >= MIN_INSTALLMENT (R$ 50,00). Reduce N until satisfied.
 *  - "Sem juros" until maxNoInterest (default 12).
 *  - Returns 1×total when total <= 0 or input is invalid (NaN, negative).
 */

export const MIN_INSTALLMENT = 50;
export const DEFAULT_MAX_INSTALLMENTS = 12;

export interface Installment {
  number: number;
  value: number;
  total: number;
  hasInterest: boolean;
  label: string;
}

export interface InstallmentOptions {
  /** Hard cap on parcels (default 12). */
  maxInstallments?: number;
  /** Minimum value per parcel in BRL (default 50). */
  minPerInstallment?: number;
  /** Number of parcels offered "no interest" (default = maxInstallments). */
  maxNoInterest?: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

const fmt = (n: number): string =>
  `R$ ${n.toFixed(2).replace('.', ',')}`;

/**
 * Highest valid installment for a given total honoring min-per-parcel rule.
 */
export function maxValidInstallments(
  total: number,
  options: InstallmentOptions = {},
): number {
  const max = Math.max(1, Math.floor(options.maxInstallments ?? DEFAULT_MAX_INSTALLMENTS));
  const min = Math.max(0.01, options.minPerInstallment ?? MIN_INSTALLMENT);
  if (!Number.isFinite(total) || total <= 0) return 1;
  if (total < min) return 1;
  const limit = Math.floor(total / min);
  return Math.max(1, Math.min(max, limit));
}

/**
 * Build the full list of valid installments from 1× up to the maximum allowed.
 */
export function buildInstallments(
  total: number,
  options: InstallmentOptions = {},
): Installment[] {
  if (!Number.isFinite(total) || total <= 0) {
    return [{
      number: 1,
      value: 0,
      total: 0,
      hasInterest: false,
      label: '1× de R$ 0,00 sem juros',
    }];
  }
  const safeTotal = round2(total);
  const max = maxValidInstallments(safeTotal, options);
  const noInterest = Math.max(1, Math.floor(options.maxNoInterest ?? options.maxInstallments ?? DEFAULT_MAX_INSTALLMENTS));

  const list: Installment[] = [];
  for (let n = 1; n <= max; n++) {
    const value = round2(safeTotal / n);
    const hasInterest = n > noInterest;
    list.push({
      number: n,
      value,
      total: safeTotal,
      hasInterest,
      label: hasInterest
        ? `${n}× de ${fmt(value)} com juros`
        : `${n}× de ${fmt(value)} sem juros`,
    });
  }
  return list;
}

/**
 * Pick the highest valid installment for a "ou em até Nx de RS Y" preview.
 */
export function maxInstallmentPreview(
  total: number,
  options: InstallmentOptions = {},
): Installment {
  const list = buildInstallments(total, options);
  return list[list.length - 1];
}
