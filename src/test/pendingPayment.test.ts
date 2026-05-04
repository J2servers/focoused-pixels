import { describe, it, expect, beforeEach } from 'vitest';
import {
  readPendingPayment,
  readPendingCartItems,
  readPendingShipping,
  writePendingPayment,
  clearPendingPayment,
  pendingCartItemKeys,
  PENDING_PAYMENT_KEY,
} from '@/lib/pendingPayment';

describe('pendingPayment', () => {
  beforeEach(() => sessionStorage.clear());

  it('returns null when nothing stored', () => {
    expect(readPendingPayment()).toBeNull();
    expect(readPendingCartItems()).toEqual([]);
    expect(readPendingShipping()).toEqual({});
  });

  it('writes and reads back', () => {
    const p = {
      orderId: 'o1',
      amount: 100,
      cartItems: [{ name: 'X', quantity: 2, price: 50, id: 'p1' }],
      shipping: { method: 'PAC', cep: '01310100' },
    };
    expect(writePendingPayment(p)).toBe(true);
    expect(readPendingPayment()?.orderId).toBe('o1');
    expect(readPendingCartItems()[0].name).toBe('X');
    expect(readPendingShipping().method).toBe('PAC');
  });

  it('handles malformed JSON gracefully', () => {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, '{invalid');
    expect(readPendingPayment()).toBeNull();
  });

  it('clearPendingPayment removes the entry', () => {
    writePendingPayment({ orderId: 'o', amount: 1 });
    clearPendingPayment();
    expect(readPendingPayment()).toBeNull();
  });

  it('pendingCartItemKeys defaults missing id and quantity', () => {
    expect(pendingCartItemKeys([
      { name: 'X', quantity: 0, price: 0 },
      { name: 'Y', quantity: 3, price: 10, id: 'y' },
    ])).toEqual([
      { id: '', quantity: 1 },
      { id: 'y', quantity: 3 },
    ]);
  });
});
