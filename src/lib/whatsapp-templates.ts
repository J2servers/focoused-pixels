/**
 * whatsapp-templates.ts — Pure templates for outgoing WhatsApp messages.
 * Centralizes message composition so different CTAs share consistent copy.
 */
import { formatCurrency } from '@/lib/format';

export interface CartLineForWhatsApp {
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export function renderCartCheckoutMessage(input: {
  items: CartLineForWhatsApp[];
  total: number;
  itemCount: number;
}): string {
  const lines = input.items.map((i) =>
    `- ${i.name}${i.size ? ` (${i.size})` : ''} | Qtd: ${i.quantity} | ${formatCurrency(i.price * i.quantity)}`,
  ).join('\n');
  return [
    'Olá! Quero finalizar meu carrinho na Pincel de Luz.',
    '',
    'Resumo do carrinho:',
    lines,
    '',
    `Total parcial: ${formatCurrency(input.total)}`,
    `Quantidade de itens: ${input.itemCount}`,
    '',
    'Pode me ajudar com o fechamento e prazo de produção?',
  ].join('\n');
}

export function renderProductQuoteMessage(input: {
  productName: string;
  quantity: number;
  size?: string;
  color?: string;
  url?: string;
}): string {
  const parts = [
    `Olá! Tenho interesse no produto: ${input.productName}.`,
    `Quantidade desejada: ${input.quantity}`,
  ];
  if (input.size) parts.push(`Tamanho: ${input.size}`);
  if (input.color) parts.push(`Cor: ${input.color}`);
  if (input.url) parts.push(`Link: ${input.url}`);
  parts.push('Pode me passar valor, prazo e formas de pagamento?');
  return parts.join('\n');
}

export function renderAbandonedCartMessage(input: {
  customerName: string;
  total: number;
  recoveryUrl?: string;
}): string {
  const greet = input.customerName
    ? `Oi ${input.customerName.split(' ')[0]}!`
    : 'Oi!';
  const out = [
    greet,
    `Vimos que você deixou um carrinho de ${formatCurrency(input.total)} pendente na Pincel de Luz.`,
    'Quer que a gente reserve seus produtos e finalize agora?',
  ];
  if (input.recoveryUrl) out.push(`👉 ${input.recoveryUrl}`);
  return out.join('\n');
}
