export type Channel = 'email' | 'whatsapp';
export type PageTab = 'templates' | 'workflows';
export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'created_at' | 'updated_at';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const SYSTEM_EVENTS = [
  { value: 'pix_generated', label: 'PIX Gerado', icon: '💳' },
  { value: 'boleto_generated', label: 'Boleto Emitido', icon: '🧾' },
  { value: 'card_approved', label: 'Cartão Aprovado', icon: '✅' },
  { value: 'card_pending', label: 'Cartão em Análise', icon: '⏳' },
  { value: 'payment_confirmed', label: 'Pagamento Confirmado', icon: '🎉' },
  { value: 'order_shipped', label: 'Pedido Enviado', icon: '📦' },
  { value: 'abandoned_cart', label: 'Carrinho Abandonado', icon: '🛒' },
  { value: 'new_lead', label: 'Novo Lead', icon: '👤' },
  { value: 'review_received', label: 'Avaliação Recebida', icon: '⭐' },
  { value: 'boleto_reminder', label: 'Lembrete de Boleto', icon: '🔔' },
];

export const TEMPLATE_VARIABLES: { key: string; desc: string }[] = [
  { key: '{{customer_name}}', desc: 'Nome do cliente' },
  { key: '{{customer_email}}', desc: 'E-mail do cliente' },
  { key: '{{customer_phone}}', desc: 'Telefone do cliente' },
  { key: '{{order_number}}', desc: 'Número do pedido' },
  { key: '{{total}}', desc: 'Valor total' },
  { key: '{{amount}}', desc: 'Valor (alias de total)' },
  { key: '{{tracking_code}}', desc: 'Código de rastreio' },
  { key: '{{production_status}}', desc: 'Status de produção' },
  { key: '{{coupon_code}}', desc: 'Código do cupom' },
  { key: '{{discount_percent}}', desc: 'Percentual de desconto' },
  { key: '{{expires_at}}', desc: 'Data de expiração' },
  { key: '{{cart_items}}', desc: 'Itens do carrinho' },
  { key: '{{company_name}}', desc: 'Nome da empresa' },
  { key: '{{barcode}}', desc: 'Código de barras do boleto' },
  { key: '{{boleto_url}}', desc: 'Link do boleto' },
  { key: '{{expiration_date}}', desc: 'Data de vencimento' },
  { key: '{{shipping_address}}', desc: 'Endereço de entrega' },
  { key: '{{shipping_city}}', desc: 'Cidade de entrega' },
  { key: '{{shipping_state}}', desc: 'Estado de entrega' },
  { key: '{{shipping_cep}}', desc: 'CEP de entrega' },
  { key: '{{delivery_estimate}}', desc: 'Estimativa de entrega' },
  { key: '{{payment_link}}', desc: 'Link de pagamento PIX' },
];

export const SAMPLE_VALUES: Record<string, string> = {
  '{{customer_name}}': 'Ana Paula',
  '{{customer_email}}': 'ana@email.com',
  '{{customer_phone}}': '(11) 99999-0000',
  '{{order_number}}': '#PL2603-A1B2C3',
  '{{total}}': 'R$ 289,90',
  '{{amount}}': 'R$ 289,90',
  '{{tracking_code}}': 'BR123456789',
  '{{production_status}}': 'Em produção',
  '{{coupon_code}}': 'VOLTA10',
  '{{discount_percent}}': '10%',
  '{{expires_at}}': 'hoje 23:59',
  '{{cart_items}}': '2 itens personalizados',
  '{{company_name}}': 'Pincel de Luz',
  '{{barcode}}': '23793.38128 60000.000003 00000.000400 1 84340000028990',
  '{{boleto_url}}': 'https://www.mercadopago.com.br/payments/123/ticket',
  '{{expiration_date}}': '28/03/2026',
  '{{shipping_address}}': 'Rua das Flores, 123 - Centro',
  '{{shipping_city}}': 'São Paulo',
  '{{shipping_state}}': 'SP',
  '{{shipping_cep}}': '01001-000',
  '{{delivery_estimate}}': '5 a 8 dias úteis',
  '{{payment_link}}': 'https://pix.mercadopago.com/abc123',
};

// Utility functions
export const replaceVariables = (text: string) =>
  TEMPLATE_VARIABLES.reduce((acc, v) => acc.split(v.key).join(SAMPLE_VALUES[v.key] || v.key), text);

export const sanitizePreviewHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, form, meta, base').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

export const detectVariables = (text: string): string[] => {
  const matches = text.match(/\{\{[\w]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
};

export const getWhatsAppSegmentInfo = (text: string) => {
  const len = text.length;
  const segments = Math.ceil(len / 1600);
  const isLong = len > 1000;
  return { length: len, segments, isLong };
};

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export const findUnknownVars = (text: string): string[] => {
  const used = detectVariables(text);
  const known = TEMPLATE_VARIABLES.map(v => v.key);
  return used.filter(v => !known.includes(v));
};

export const isEventDefault = (name: string) => SYSTEM_EVENTS.some(ev => ev.value === name);

export const isNew = (createdAt?: string) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
};

// Admin theme classes
export const cardCls = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]";
export const inputCls = "bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white";
export const mutedText = "text-[hsl(var(--admin-text-muted))]";
