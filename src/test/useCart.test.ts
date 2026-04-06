import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';

describe('useCart store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.clearCart());
  });

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('adds an item', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Letreiro',
        price: 100,
        image: '/img.jpg',
      });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.itemCount).toBe(1);
    expect(result.current.total).toBe(100);
  });

  it('increments quantity for duplicate item+size', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 50, image: '' });
      result.current.addItem({ id: '1', name: 'A', price: 50, image: '' });
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(100);
  });

  it('treats different sizes as different items', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 50, image: '', size: 'P' });
      result.current.addItem({ id: '1', name: 'A', price: 50, image: '', size: 'G' });
    });
    expect(result.current.items).toHaveLength(2);
  });

  it('removes an item', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 50, image: '' });
      result.current.removeItem('1', undefined);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 30, image: '' });
      result.current.updateQuantity('1', undefined, 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(150);
  });

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 30, image: '' });
      result.current.updateQuantity('1', undefined, 0);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem({ id: '1', name: 'A', price: 30, image: '' });
      result.current.addItem({ id: '2', name: 'B', price: 50, image: '' });
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });
});
