import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCheckoutProfile } from '@/hooks/useCheckoutProfile';
import { useOrderCreator } from '@/hooks/payment/useOrderCreator';
import { usePaymentMethods } from '@/hooks/payment/usePaymentMethods';
import { usePaymentLoader } from '@/hooks/payment/usePaymentLoader';
import { usePixPolling } from '@/hooks/payment/usePixPolling';
import {
  UUID_REGEX,
  type CustomerForm,
  type PaymentState,
  type PixData,
  type BoletoData,
  type UploadedFile,
} from '@/hooks/payment/types';

export type { PaymentState, CustomerForm, PixData, BoletoData };
export { formatCurrency, BOLETO_FLOW_TEMPLATE } from '@/hooks/payment/types';

const EMPTY_FORM: CustomerForm = {
  name: '', email: '', cpf: '', phone: '',
  street: '', number: '', complement: '', neighborhood: '',
  city: '', state: '', cep: '',
};

export function usePaymentFlow() {
  useCompanyInfo();
  const { user, session } = useAuthContext();
  const { savedProfile, hasProfile, saveProfile } = useCheckoutProfile(user?.id);
  const { paymentState, setPaymentState, cartWeight, isLoading, fromExistingOrder } = usePaymentLoader();

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [customerForm, setCustomerForm] = useState<CustomerForm>(EMPTY_FORM);
  const [customText, setCustomText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentCreds } = usePaymentCredentials();
  const pixDiscount = paymentCreds?.pix_discount_percent ?? 5;
  const maxInstallments = paymentCreds?.max_installments ?? 12;
  const minInstallmentValue = paymentCreds?.min_installment_value ?? 50;
  const boletoExtraDays = paymentCreds?.boleto_extra_days ?? 3;
  const paymentMethodsEnabled = paymentCreds?.payment_methods_enabled ?? ['pix', 'credit_card', 'boleto'];

  const { createOrderInDB } = useOrderCreator({ customerForm, customText, uploadedFiles });

  const ensureOrderExists = useCallback(async (): Promise<string | null> => {
    if (!paymentState) return null;
    if (UUID_REGEX.test(paymentState.orderId)) return paymentState.orderId;
    const dbOrderId = await createOrderInDB(paymentState);
    if (dbOrderId) setPaymentState((prev) => prev ? { ...prev, orderId: dbOrderId } : null);
    return dbOrderId;
  }, [paymentState, createOrderInDB, setPaymentState]);

  const { createPix, createPreference, mercadoPago, handleGeneratePix, handleGenerateBoleto, handleCreditCard } =
    usePaymentMethods({
      paymentState, customerForm, isProcessing, setIsProcessing,
      setPixData, setBoletoData, ensureOrderExists,
    });

  // Auto-advance to step 2 when authenticated
  useEffect(() => {
    if (user && session && currentStep === 1) {
      setCurrentStep(2);
      setCustomerForm((prev) => ({
        ...prev,
        email: user.email ?? '',
        name: prev.name || (user.user_metadata as { full_name?: string } | undefined)?.full_name || '',
      }));
    }
  }, [user, session, currentStep]);

  // When loading from existing DB order, jump straight to payment
  useEffect(() => {
    if (fromExistingOrder && user && session) setCurrentStep(3);
  }, [fromExistingOrder, user, session]);

  // Pre-fill from saved profile
  useEffect(() => {
    if (!savedProfile) return;
    setCustomerForm((prev) => ({
      ...prev,
      name: prev.name || savedProfile.fullName || '',
      email: prev.email || savedProfile.email || '',
      phone: prev.phone || savedProfile.phone || '',
      cep: prev.cep || savedProfile.cep || '',
    }));
  }, [savedProfile]);

  usePixPolling({ pixData, paymentStatus, setPaymentStatus, setPixData, mercadoPago });

  const handleDetailsSubmit = useCallback(async () => {
    if (isProcessing || !paymentState) return;
    setIsProcessing(true);
    try {
      const name = customerForm.name.trim();
      const email = user?.email || customerForm.email.trim().toLowerCase();
      const phone = customerForm.phone.trim();
      if (!name || !phone) { toast.error('Nome e telefone são obrigatórios'); return; }
      if (!customerForm.street.trim() || !customerForm.cep.trim()) {
        toast.error('Endereço e CEP são obrigatórios'); return;
      }

      const updatedState: PaymentState = {
        ...paymentState,
        customerName: name,
        customerEmail: email,
        customerCpf: customerForm.cpf.replace(/\D/g, ''),
        customerPhone: phone,
      };
      const dbOrderId = await createOrderInDB(updatedState);
      if (!dbOrderId) return;

      const fullAddress = [
        customerForm.street, customerForm.number, customerForm.complement,
        customerForm.neighborhood, customerForm.city, customerForm.state,
      ].filter(Boolean).join(', ');
      await saveProfile({ fullName: name, email, phone, address: fullAddress, cep: customerForm.cep });
      setPaymentState({ ...updatedState, orderId: dbOrderId });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, paymentState, customerForm, user, createOrderInDB, saveProfile, setPaymentState]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 3000);
  }, []);

  const calculateInstallments = useCallback((amount: number) => {
    const result: Array<{ number: number; value: number; total: number }> = [];
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = amount / i;
      if (installmentValue >= minInstallmentValue) {
        result.push({ number: i, value: installmentValue, total: amount });
      }
    }
    return result;
  }, [maxInstallments, minInstallmentValue]);

  const applySavedCheckoutProfile = useCallback(() => {
    if (!savedProfile) return;
    setCustomerForm((prev) => ({
      ...prev,
      name: savedProfile.fullName || prev.name,
      email: user?.email || savedProfile.email || prev.email,
      phone: savedProfile.phone || prev.phone,
      cep: savedProfile.cep || prev.cep,
    }));
    toast.success('Dados de entrega preenchidos em 1 clique.');
  }, [savedProfile, user]);

  return {
    currentStep, setCurrentStep, paymentMethod, setPaymentMethod,
    paymentState, setPaymentState, isLoading, customerForm, setCustomerForm,
    customText, setCustomText, uploadedFiles, setUploadedFiles, cartWeight,
    pixData, boletoData, paymentStatus, copied, isProcessing,
    pixDiscount, maxInstallments, boletoExtraDays, paymentMethodsEnabled,
    user, session, hasProfile, savedProfile,
    createPix, createPreference, mercadoPago,
    handleDetailsSubmit, handleGeneratePix, handleGenerateBoleto, handleCreditCard,
    copyToClipboard, calculateInstallments, applySavedCheckoutProfile,
  };
}
