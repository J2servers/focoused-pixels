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
