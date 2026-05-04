import { useMutation } from '@tanstack/react-query';
import { useGatewayMutation, useTestConnection } from './useGatewayMutation';
import type { MercadoPagoPaymentRequest, PaymentItem } from './types';

const FN = 'payment-mercadopago';

export function useMercadoPago() {
  return useGatewayMutation<MercadoPagoPaymentRequest>(FN, 'Mercado Pago');
}

export function useTestMercadoPago() {
  return useTestConnection(FN);
}

export function useCreateMercadoPagoPreference() {
  const gateway = useMercadoPago();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      items: PaymentItem[];
      payerEmail: string;
      payerName: string;
    }) => gateway.mutateAsync({ action: 'create_preference', ...input }),
  });
}

export function useCreateMercadoPagoPix() {
  const gateway = useMercadoPago();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      payerEmail: string;
      payerName?: string;
      payerPhone?: string;
    }) => gateway.mutateAsync({ action: 'create_pix', ...input }),
  });
}

export function useCreateMercadoPagoBoleto() {
  const gateway = useMercadoPago();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      payerEmail: string;
      payerName: string;
      payerCpf: string;
    }) => gateway.mutateAsync({ action: 'create_boleto', ...input }),
  });
}

export function useCreateMercadoPagoCardPayment() {
  const gateway = useMercadoPago();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      payerEmail: string;
      payerName?: string;
      payerCpf?: string;
      token: string;
      installments: number;
      paymentMethodId: string;
      issuerId?: string;
    }) => gateway.mutateAsync({ action: 'create_card_payment', ...input }),
  });
}
