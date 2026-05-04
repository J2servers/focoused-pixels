import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';
import { useCheckoutTotals } from '@/hooks/useCheckoutTotals';

vi.mock('@/hooks/useCompanyInfo', () => ({
  useCompanyInfo: () => ({
    data: {
      quantity_discount_10: 5, quantity_discount_20: 10,
      quantity_discount_50: 15, quantity_discount_100: 20,
      free_shipping_minimum: 200,
    },
  }),
}));

vi.mock('@/hooks/usePaymentCredentials', () => ({
  usePaymentCredentials: () => ({
    data: { max_installments: 12, min_installment_value: 50 },
  }),
}));

describe('useCheckoutTotals', () => {
  beforeEach(() => useCart.getState().clearCart());

  it('returns top installment preview', () => {
    act(() => {
      useCart.getState().addItem({
        id: 'p1', name: 'P1', price: 600, image: '', quantity: 1,
      });
    });
    const { result } = renderHook(() => useCheckoutTotals());
    expect(result.current.installment.number).toBe(12);
    expect(result.current.installment.value).toBe(50);
    expect(result.current.maxInstallments).toBe(12);
  });

  it('drops installment count when total < min', () => {
    act(() => {
      useCart.getState().addItem({
        id: 'p1', name: 'P1', price: 40, image: '', quantity: 1,
      });
    });
    const { result } = renderHook(() => useCheckoutTotals());
    expect(result.current.installment.number).toBe(1);
  });
});
