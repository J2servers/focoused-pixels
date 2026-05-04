/**
 * pendingPayment.ts — Typed wrappers around sessionStorage('pending_payment').
 *
 * Centralizes read/write/clear so we don't sprinkle JSON.parse + try/catch
 * across the checkout codebase. All accessors are SSR-safe.
 */

export interface PendingPaymentItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  image?: string;
}

export interface PendingPaymentShipping {
  method?: string;
  cost?: number;
  cep?: string;
  city?: string;
  state?: string;
}

export interface PendingPayment {
  orderId: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerCpf?: string;
  customerPhone?: string;
  description?: string;
  cartItems?: PendingPaymentItem[];
  shipping?: PendingPaymentShipping;
}

export const PENDING_PAYMENT_KEY = 'pending_payment';

function safeStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readPendingPayment(): PendingPayment | null {
  const s = safeStorage();
  if (!s) return null;
  const raw = s.getItem(PENDING_PAYMENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingPayment;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function readPendingCartItems(): PendingPaymentItem[] {
  const p = readPendingPayment();
  return Array.isArray(p?.cartItems) ? p!.cartItems : [];
}

export function readPendingShipping(): PendingPaymentShipping {
  const p = readPendingPayment();
  return p?.shipping ?? {};
}

export function writePendingPayment(payment: PendingPayment): boolean {
  const s = safeStorage();
  if (!s) return false;
  try {
    s.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
    return true;
  } catch {
    return false;
  }
}

export function clearPendingPayment(): void {
  const s = safeStorage();
  if (!s) return;
  s.removeItem(PENDING_PAYMENT_KEY);
}

export function pendingCartItemKeys(items: PendingPaymentItem[]): Array<{ id: string; quantity: number }> {
  return items.map((i) => ({ id: i.id ?? '', quantity: i.quantity || 1 }));
}
