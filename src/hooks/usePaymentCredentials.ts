import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentCredentials {
  id: string;
  payment_gateway_primary: string | null;
  mercadopago_enabled: boolean | null;
  mercadopago_public_key: string | null;
  mercadopago_access_token: string | null;
  mercadopago_sandbox: boolean | null;
  efi_enabled: boolean | null;
  efi_client_id: string | null;
  efi_client_secret: string | null;
  efi_sandbox: boolean | null;
  efi_pix_key: string | null;
  pagseguro_enabled: boolean | null;
  pagseguro_email: string | null;
  pagseguro_token: string | null;
  pagseguro_sandbox: boolean | null;
  stripe_enabled: boolean | null;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_sandbox: boolean | null;
  asaas_enabled: boolean | null;
  asaas_api_key: string | null;
  asaas_sandbox: boolean | null;
  payment_methods_enabled: string[] | null;
  pix_discount_percent: number | null;
  boleto_extra_days: number | null;
  max_installments: number | null;
  min_installment_value: number | null;
  updated_at: string;
}

const defaultPaymentCredentials: Omit<PaymentCredentials, 'id' | 'updated_at'> = {
  payment_gateway_primary: 'mercadopago',
  mercadopago_enabled: false,
  mercadopago_public_key: null,
  mercadopago_access_token: null,
  mercadopago_sandbox: true,
  efi_enabled: false,
  efi_client_id: null,
  efi_client_secret: null,
  efi_sandbox: true,
  efi_pix_key: null,
  pagseguro_enabled: false,
  pagseguro_email: null,
  pagseguro_token: null,
  pagseguro_sandbox: true,
  stripe_enabled: false,
  stripe_public_key: null,
  stripe_secret_key: null,
  stripe_sandbox: true,
  asaas_enabled: false,
  asaas_api_key: null,
  asaas_sandbox: true,
  payment_methods_enabled: ['pix', 'credit_card', 'boleto'],
  pix_discount_percent: 5,
  boleto_extra_days: 3,
  max_installments: 12,
  min_installment_value: 50,
};

export function usePaymentCredentials() {
  return useQuery({
    queryKey: ['payment-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_credentials')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching payment credentials:', error);
        return { id: '', updated_at: new Date().toISOString(), ...defaultPaymentCredentials } as PaymentCredentials;
      }

      return { ...defaultPaymentCredentials, ...data } as PaymentCredentials;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePaymentCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<PaymentCredentials> }) => {
      if (id) {
        const { error } = await supabase
          .from('payment_credentials')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_credentials')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-credentials'] });
    },
  });
}
