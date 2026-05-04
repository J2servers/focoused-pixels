import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useCartTotals } from '@/hooks/useCartTotals';

// Mock useCompanyInfo to avoid Supabase IO.
vi.mock('@/hooks/useCompanyInfo', () => ({
  useCompanyInfo: () => ({
    data: {
      quantity_discount_10: 5,
      quantity_discount_20: 10,
      quantity_discount_50: 15,
      quantity_discount_100: 20,
      free_shipping_minimum: 200,
    },
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('useCartTotals', () => {
  beforeEach(() => {
    useCart.getState().clearCart();
  });

  it('returns zeros for empty cart', () => {
    const { result } = renderHook(() => useCartTotals(), { wrapper });
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.freeShippingProgress).toBe(0);
  });

  it('reacts to cart updates', () => {
    const { result } = renderHook(() => useCartTotals(), { wrapper });
    act(() => {
      useCart.getState().addItem({
        id: 'p1', name: 'P1', price: 100, image: '', quantity: 1,
      });
    });
    expect(result.current.subtotal).toBe(100);
    expect(result.current.freeShippingProgress).toBe(0.5);
    expect(result.current.freeShippingRemaining).toBe(100);
  });

  it('triggers free-shipping over minimum and applies PIX 5%', () => {
    act(() => {
      useCart.getState().addItem({
        id: 'p1', name: 'P1', price: 250, image: '', quantity: 1,
      });
    });
    const { result } = renderHook(
      () => useCartTotals({ freight: 30, paymentMethod: 'pix' }),
      { wrapper },
    );
    expect(result.current.freeShippingApplied).toBe(true);
    expect(result.current.freight).toBe(0);
    expect(result.current.pixDiscount).toBeCloseTo(12.5, 2);
    expect(result.current.total).toBeCloseTo(237.5, 2);
  });
});
