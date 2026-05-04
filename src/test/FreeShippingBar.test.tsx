import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FreeShippingBar } from '@/components/cart/FreeShippingBar';

const progressMock = vi.fn();
vi.mock('@/hooks/useFreeShippingProgress', () => ({
  useFreeShippingProgress: () => progressMock(),
}));

describe('FreeShippingBar', () => {
  it('renders nothing when disabled', () => {
    progressMock.mockReturnValue({
      enabled: false, applied: false, progress: 0, remaining: 0, message: '',
    });
    const { container } = render(<FreeShippingBar />);
    expect(container.firstChild).toBeNull();
  });

  it('renders progress bar with remaining message', () => {
    progressMock.mockReturnValue({
      enabled: true, applied: false, progress: 0.5, remaining: 100,
      message: 'Faltam R$ 100,00 para frete grátis',
    });
    render(<FreeShippingBar />);
    expect(screen.getByText(/Faltam/)).toBeTruthy();
  });

  it('renders applied state', () => {
    progressMock.mockReturnValue({
      enabled: true, applied: true, progress: 1, remaining: 0,
      message: '🎉 Frete grátis liberado!',
    });
    render(<FreeShippingBar />);
    expect(screen.getByText(/Frete grátis liberado/)).toBeTruthy();
  });

  it('clamps progress between 0 and 100', () => {
    progressMock.mockReturnValue({
      enabled: true, applied: false, progress: 1.5, remaining: 0,
      message: 'x',
    });
    const { container } = render(<FreeShippingBar />);
    const bar = container.querySelector('[style*="width"]') as HTMLElement | null;
    expect(bar?.style.width).toBe('100%');
  });
});
