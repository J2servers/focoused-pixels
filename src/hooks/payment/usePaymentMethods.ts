import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  useCreateMercadoPagoPix,
  useCreateMercadoPagoPreference,
  useMercadoPago,
} from '@/hooks/usePaymentGateway';
import { shouldAllowAction } from '@/lib/idempotency';
import { isRateLimited, paymentCircuitBreaker } from '@/lib/rate-limit';
import type { CustomerForm, PaymentState, PixData, BoletoData } from './types';

interface UsePaymentMethodsArgs {
  paymentState: PaymentState | null;
  customerForm: CustomerForm;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  setPixData: (v: PixData | null) => void;
  setBoletoData: (v: BoletoData | null) => void;
  ensureOrderExists: () => Promise<string | null>;
}

export function usePaymentMethods({
  paymentState, customerForm, isProcessing, setIsProcessing,
  setPixData, setBoletoData, ensureOrderExists,
}: UsePaymentMethodsArgs) {
  const createPix = useCreateMercadoPagoPix();
  const createPreference = useCreateMercadoPagoPreference();
  const mercadoPago = useMercadoPago();

  const guardAction = useCallback((debounceKey: string, rateKey: string): boolean => {
    if (!shouldAllowAction(debounceKey)) {
      toast.info('Aguarde antes de tentar novamente...');
      return false;
    }
    if (isRateLimited(rateKey, 3, 60_000)) {
      toast.error('Muitas tentativas. Aguarde 1 minuto.');
      return false;
    }
    if (!paymentCircuitBreaker.canExecute()) {
      toast.error('Serviço temporariamente indisponível. Tente em 30 segundos.');
      return false;
    }
    return true;
  }, []);

  const handleGeneratePix = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    if (!guardAction('generate_pix', 'pix_generation')) return;
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await createPix.mutateAsync({
        orderId,
        amount: paymentState.amount,
        description: paymentState.description,
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
        payerPhone: paymentState.customerPhone,
      });
      paymentCircuitBreaker.recordSuccess();
      setPixData({
        qrCode: result.qrCode,
        qrCodeBase64: result.qrCodeBase64,
        paymentId: result.paymentId,
        expirationDate: result.expirationDate,
        finalAmount: result.finalAmount,
        discountPercent: result.discountPercent,
      });
      toast.success('PIX gerado com sucesso!');
    } catch (error) {
      paymentCircuitBreaker.recordFailure();
      console.error('Error generating PIX:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, createPix, guardAction, setIsProcessing, setPixData]);

  const handleGenerateBoleto = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    if (!guardAction('generate_boleto', 'boleto_generation')) return;
    if (!paymentState.customerCpf || paymentState.customerCpf.replace(/\D/g, '').length < 11) {
      toast.error('CPF válido é obrigatório para boleto');
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await mercadoPago.mutateAsync({
        action: 'create_boleto',
        orderId,
        amount: paymentState.amount,
        description: paymentState.description,
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
        payerCpf: paymentState.customerCpf.replace(/\D/g, ''),
        payerZipCode: customerForm.cep,
        payerStreetName: customerForm.street,
        payerStreetNumber: customerForm.number || 'S/N',
        payerNeighborhood: customerForm.neighborhood,
        payerCity: customerForm.city,
        payerState: customerForm.state,
        payerPhone: paymentState.customerPhone,
      });
      setBoletoData({
        barcode: result.barcode,
        boletoUrl: result.boletoUrl,
        paymentId: result.paymentId,
        expirationDate: result.expirationDate,
      });
      toast.success('Boleto gerado com sucesso!');
    } catch (error) {
      console.error('Error generating boleto:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, mercadoPago, customerForm, guardAction, setIsProcessing, setBoletoData]);

  const handleCreditCard = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    if (!guardAction('credit_card', 'card_payment')) return;
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await createPreference.mutateAsync({
        orderId,
        items: [{ title: paymentState.description, quantity: 1, unit_price: paymentState.amount }],
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
      });
      if (result.initPoint) window.location.href = result.initPoint;
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, createPreference, guardAction, setIsProcessing]);

  return { createPix, createPreference, mercadoPago, handleGeneratePix, handleGenerateBoleto, handleCreditCard };
}
