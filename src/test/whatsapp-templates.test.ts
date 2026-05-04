import { describe, it, expect } from 'vitest';
import {
  renderCartCheckoutMessage,
  renderProductQuoteMessage,
  renderAbandonedCartMessage,
} from '@/lib/whatsapp-templates';

describe('whatsapp-templates', () => {
  it('renderCartCheckoutMessage includes items and total in BRL', () => {
    const msg = renderCartCheckoutMessage({
      items: [
        { name: 'Quadro', quantity: 2, price: 50 },
        { name: 'Caneca', quantity: 1, price: 30, size: 'P' },
      ],
      total: 130,
      itemCount: 3,
    });
    expect(msg).toContain('- Quadro | Qtd: 2');
    expect(msg).toContain('- Caneca (P) | Qtd: 1');
    expect(msg).toMatch(/R\$\s*130,00/);
    expect(msg).toContain('Quantidade de itens: 3');
  });

  it('renderProductQuoteMessage includes optional fields when present', () => {
    const msg = renderProductQuoteMessage({
      productName: 'Quadro X', quantity: 1, size: 'M', color: 'Azul',
      url: 'https://x.com/p',
    });
    expect(msg).toContain('Quadro X');
    expect(msg).toContain('Tamanho: M');
    expect(msg).toContain('Cor: Azul');
    expect(msg).toContain('Link: https://x.com/p');
  });

  it('renderProductQuoteMessage skips optional fields when missing', () => {
    const msg = renderProductQuoteMessage({ productName: 'Y', quantity: 2 });
    expect(msg).not.toContain('Tamanho');
    expect(msg).not.toContain('Cor');
    expect(msg).not.toContain('Link');
  });

  it('renderAbandonedCartMessage uses first name and recovery url', () => {
    const m = renderAbandonedCartMessage({
      customerName: 'Maria Silva', total: 250, recoveryUrl: 'https://x.com/r',
    });
    expect(m).toContain('Oi Maria!');
    expect(m).toMatch(/R\$\s*250,00/);
    expect(m).toContain('https://x.com/r');
  });

  it('renderAbandonedCartMessage falls back without name', () => {
    const m = renderAbandonedCartMessage({ customerName: '', total: 50 });
    expect(m.startsWith('Oi!')).toBe(true);
  });
});
