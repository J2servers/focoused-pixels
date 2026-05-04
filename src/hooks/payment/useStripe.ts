import { useMutation } from '@tanstack/react-query';
import { useGatewayMutation, useTestConnection } from './useGatewayMutation';
import type { StripeLineItem, StripePaymentRequest } from './types';

const FN = 'payment-stripe';

export function useStripe() {
  return useGatewayMutation<StripePaymentRequest>(FN, 'Stripe');
}

export function useTestStripe() {
  return useTestConnection(FN);
}

export function useCreateStripeCheckout() {
  const gateway = useStripe();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      items: StripeLineItem[];
      customerEmail?: string;
      successUrl?: string;
      cancelUrl?: string;
    }) => gateway.mutateAsync({ action: 'create_checkout', ...input }),
  });
}

export function useCreateStripePaymentIntent() {
  const gateway = useStripe();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      customerEmail?: string;
      customerName?: string;
    }) => gateway.mutateAsync({ action: 'create_payment_intent', ...input }),
  });
}
