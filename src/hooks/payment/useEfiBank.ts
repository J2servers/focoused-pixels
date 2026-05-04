import { useMutation } from '@tanstack/react-query';
import { useGatewayMutation, useTestConnection } from './useGatewayMutation';
import type { EfiPaymentRequest } from './types';

const FN = 'payment-efi';

export function useEfiBank() {
  return useGatewayMutation<EfiPaymentRequest>(FN, 'EFI Bank');
}

export function useTestEfiBank() {
  return useTestConnection(FN);
}

export function useCreateEfiPix() {
  const gateway = useEfiBank();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      payerName?: string;
      payerCpf?: string;
      expireSeconds?: number;
    }) => gateway.mutateAsync({ action: 'create_pix', ...input }),
  });
}

export function useCreateEfiBoleto() {
  const gateway = useEfiBank();
  return useMutation({
    mutationFn: (input: {
      orderId: string;
      amount: number;
      description?: string;
      payerName: string;
      payerCpf: string;
      payerEmail?: string;
    }) => gateway.mutateAsync({ action: 'create_boleto', ...input }),
  });
}
