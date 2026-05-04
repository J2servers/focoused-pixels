// ============================================================================
// Checkout / Payment Flow Types (used by useOrderCreator, usePaymentFlow, etc.)
// ============================================================================

export interface PaymentState {
  orderId: string;
  amount: number;
  shippingCost: number;
  shippingMethod: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  description: string;
}

export interface CustomerForm {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
  expirationDate: string;
  finalAmount: number;
  discountPercent: number;
}

export interface BoletoData {
  barcode: string;
  boletoUrl: string;
  paymentId: string;
  expirationDate: string;
}

export interface UploadedFile {
  name: string;
  url: string;
}

export const PIX_POLL_TIMEOUT_MS = 15 * 60 * 1000;

export const BOLETO_FLOW_TEMPLATE = [
  'Seu pedido fica reservado, mas o produto so entra em producao e envio depois da confirmacao do pagamento do boleto.',
  'Assim que o sistema reconhecer a compensacao do boleto, enviaremos automaticamente a confirmacao por mensagem e o pedido segue para a proxima etapa.',
  'Se o boleto vencer sem pagamento, o pedido continua fora da receita e aguarda nova acao do cliente.',
];

export function generateOrderNumber(): string {
  const now = new Date();
  const datePrefix = `PL${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const unique = Date.now().toString(36).toUpperCase().slice(-6);
  return `${datePrefix}-${unique}`;
}

export function sanitizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================================
// Gateway request payload types (Mercado Pago / EFI / Stripe edge functions)
// ============================================================================

export interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
}

export interface MercadoPagoPaymentRequest {
  action:
    | 'create_preference'
    | 'create_pix'
    | 'create_boleto'
    | 'create_card_payment'
    | 'check_status'
    | 'test_connection'
    | 'get_installments'
    | 'get_payment_methods';
  orderId?: string;
  amount?: number;
  description?: string;
  payerEmail?: string;
  payerName?: string;
  payerCpf?: string;
  payerPhone?: string;
  paymentId?: string;
  items?: PaymentItem[];
  token?: string;
  installments?: number;
  issuerId?: string;
  paymentMethodId?: string;
  bin?: string;
  payerZipCode?: string;
  payerStreetName?: string;
  payerStreetNumber?: string;
  payerNeighborhood?: string;
  payerCity?: string;
  payerState?: string;
}

export interface EfiPaymentRequest {
  action: 'create_pix' | 'check_status' | 'test_connection' | 'create_boleto';
  orderId?: string;
  amount?: number;
  description?: string;
  payerName?: string;
  payerCpf?: string;
  payerEmail?: string;
  txid?: string;
  expireSeconds?: number;
}

export interface StripeLineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface StripePaymentRequest {
  action: 'create_checkout' | 'create_payment_intent' | 'check_status' | 'test_connection';
  orderId?: string;
  amount?: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
  customerName?: string;
  paymentIntentId?: string;
  successUrl?: string;
  cancelUrl?: string;
  items?: StripeLineItem[];
}
