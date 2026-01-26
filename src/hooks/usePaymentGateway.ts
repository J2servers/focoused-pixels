import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface MercadoPagoPaymentRequest {
  action: 'create_preference' | 'create_pix' | 'check_status' | 'test_connection';
  orderId?: string;
  amount?: number;
  description?: string;
  payerEmail?: string;
  payerName?: string;
  paymentId?: string;
  items?: PaymentItem[];
}

interface EfiPaymentRequest {
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

interface StripePaymentRequest {
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
  items?: Array<{ name: string; quantity: number; price: number }>;
}

// Mercado Pago
export function useMercadoPago() {
  return useMutation({
    mutationFn: async (request: MercadoPagoPaymentRequest) => {
      const { data, error } = await supabase.functions.invoke('payment-mercadopago', {
        body: request,
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Payment failed');
      
      return data;
    },
    onError: (error: Error) => {
      console.error('Mercado Pago error:', error);
      toast.error(error.message || 'Erro no Mercado Pago');
    },
  });
}

export function useTestMercadoPago() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('payment-mercadopago', {
        body: { action: 'test_connection' },
      });
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useCreateMercadoPagoPreference() {
  const mutation = useMercadoPago();
  
  return useMutation({
    mutationFn: async ({ orderId, items, payerEmail, payerName }: {
      orderId: string;
      items: PaymentItem[];
      payerEmail: string;
      payerName: string;
    }) => {
      return mutation.mutateAsync({
        action: 'create_preference',
        orderId,
        items,
        payerEmail,
        payerName,
      });
    },
  });
}

export function useCreateMercadoPagoPix() {
  const mutation = useMercadoPago();
  
  return useMutation({
    mutationFn: async ({ orderId, amount, description, payerEmail, payerName }: {
      orderId: string;
      amount: number;
      description?: string;
      payerEmail: string;
      payerName?: string;
    }) => {
      return mutation.mutateAsync({
        action: 'create_pix',
        orderId,
        amount,
        description,
        payerEmail,
        payerName,
      });
    },
  });
}

// EFI Bank
export function useEfiBank() {
  return useMutation({
    mutationFn: async (request: EfiPaymentRequest) => {
      const { data, error } = await supabase.functions.invoke('payment-efi', {
        body: request,
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Payment failed');
      
      return data;
    },
    onError: (error: Error) => {
      console.error('EFI Bank error:', error);
      toast.error(error.message || 'Erro no EFI Bank');
    },
  });
}

export function useTestEfiBank() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('payment-efi', {
        body: { action: 'test_connection' },
      });
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useCreateEfiPix() {
  const mutation = useEfiBank();
  
  return useMutation({
    mutationFn: async ({ orderId, amount, description, payerName, payerCpf, expireSeconds }: {
      orderId: string;
      amount: number;
      description?: string;
      payerName?: string;
      payerCpf?: string;
      expireSeconds?: number;
    }) => {
      return mutation.mutateAsync({
        action: 'create_pix',
        orderId,
        amount,
        description,
        payerName,
        payerCpf,
        expireSeconds,
      });
    },
  });
}

export function useCreateEfiBoleto() {
  const mutation = useEfiBank();
  
  return useMutation({
    mutationFn: async ({ orderId, amount, description, payerName, payerCpf, payerEmail }: {
      orderId: string;
      amount: number;
      description?: string;
      payerName: string;
      payerCpf: string;
      payerEmail?: string;
    }) => {
      return mutation.mutateAsync({
        action: 'create_boleto',
        orderId,
        amount,
        description,
        payerName,
        payerCpf,
        payerEmail,
      });
    },
  });
}

// Stripe
export function useStripe() {
  return useMutation({
    mutationFn: async (request: StripePaymentRequest) => {
      const { data, error } = await supabase.functions.invoke('payment-stripe', {
        body: request,
      });
      
      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error || 'Payment failed');
      
      return data;
    },
    onError: (error: Error) => {
      console.error('Stripe error:', error);
      toast.error(error.message || 'Erro no Stripe');
    },
  });
}

export function useTestStripe() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('payment-stripe', {
        body: { action: 'test_connection' },
      });
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useCreateStripeCheckout() {
  const mutation = useStripe();
  
  return useMutation({
    mutationFn: async ({ orderId, items, customerEmail, successUrl, cancelUrl }: {
      orderId: string;
      items: Array<{ name: string; quantity: number; price: number }>;
      customerEmail?: string;
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      return mutation.mutateAsync({
        action: 'create_checkout',
        orderId,
        items,
        customerEmail,
        successUrl,
        cancelUrl,
      });
    },
  });
}

export function useCreateStripePaymentIntent() {
  const mutation = useStripe();
  
  return useMutation({
    mutationFn: async ({ orderId, amount, description, customerEmail, customerName }: {
      orderId: string;
      amount: number;
      description?: string;
      customerEmail?: string;
      customerName?: string;
    }) => {
      return mutation.mutateAsync({
        action: 'create_payment_intent',
        orderId,
        amount,
        description,
        customerEmail,
        customerName,
      });
    },
  });
}
