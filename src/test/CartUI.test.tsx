import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentOrderSummary } from '@/components/payment/PaymentOrderSummary';
import { CartStickyCheckoutBar } from '@/components/cart/CartStickyCheckoutBar';

describe('PaymentOrderSummary', () => {
  const items = [
    { name: 'Caneca', quantity: 2, price: 50 },
    { name: 'Quadro', quantity: 1, price: 100, size: '30x40' },
  ];

  it('renders item count and total in BRL', () => {
    render(
      <PaymentOrderSummary items={items} subtotal={200} shippingCost={0} total={200} />,
    );
    expect(screen.getAllByText(/R\$\s*200,00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 itens/)).toBeTruthy();
  });

  it('shows "Grátis" when shippingCost = 0', () => {
    render(
      <PaymentOrderSummary items={items} subtotal={200} shippingCost={0} total={200} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Resumo do pedido/i }));
    expect(screen.getByText(/Grátis/)).toBeTruthy();
  });

  it('renders installments when provided', () => {
    render(
      <PaymentOrderSummary
        items={items} subtotal={200} shippingCost={0} total={600}
        installments={12} installmentValue={50}
      />,
    );
    expect(screen.getByText(/12×/)).toBeTruthy();
  });

  it('toggles details on header click', () => {
    render(
      <PaymentOrderSummary items={items} subtotal={200} shippingCost={0} total={200} />,
    );
    const btn = screen.getByRole('button', { name: /Resumo do pedido/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('CartStickyCheckoutBar', () => {
  it('renders total via formatCurrency', () => {
    render(
      <CartStickyCheckoutBar total={123.4} itemCount={2} onCheckout={() => {}} />,
    );
    expect(screen.getByText(/R\$\s*123,40/)).toBeTruthy();
    expect(screen.getByText(/2 itens/)).toBeTruthy();
  });

  it('uses singular form for 1 item', () => {
    render(
      <CartStickyCheckoutBar total={50} itemCount={1} onCheckout={() => {}} />,
    );
    expect(screen.getByText(/1 item/)).toBeTruthy();
  });

  it('fires onCheckout on click', () => {
    const fn = vi.fn();
    render(<CartStickyCheckoutBar total={50} itemCount={1} onCheckout={fn} />);
    fireEvent.click(screen.getByRole('button', { name: /FINALIZAR COMPRA/i }));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('respects disabled prop', () => {
    render(
      <CartStickyCheckoutBar total={50} itemCount={1} onCheckout={() => {}} disabled />,
    );
    const btn = screen.getByRole('button', { name: /FINALIZAR COMPRA/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
