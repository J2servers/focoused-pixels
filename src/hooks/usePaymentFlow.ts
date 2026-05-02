import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCheckoutProfile } from '@/hooks/useCheckoutProfile';
import { useOrderCreator } from '@/hooks/payment/useOrderCreator';
import { usePaymentMethods } from '@/hooks/payment/usePaymentMethods';
import {
  PIX_POLL_TIMEOUT_MS,
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useCompanyInfo();
  const { user, session } = useAuthContext();
  const { savedProfile, hasProfile, saveProfile } = useCheckoutProfile(user?.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerForm, setCustomerForm] = useState<CustomerForm>(EMPTY_FORM);
  const [customText, setCustomText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [cartWeight, setCartWeight] = useState(0.5);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pixPollStart = useRef<number>(0);

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
    if (dbOrderId) setPaymentState(prev => prev ? { ...prev, orderId: dbOrderId } : null);
    return dbOrderId;
  }, [paymentState, createOrderInDB]);

  const { createPix, createPreference, mercadoPago, handleGeneratePix, handleGenerateBoleto, handleCreditCard } =
    usePaymentMethods({
      paymentState, customerForm, isProcessing, setIsProcessing,
      setPixData, setBoletoData, ensureOrderExists,
    });

  // Auto-advance if authenticated
  useEffect(() => {
    if (user && session && currentStep === 1) {
      setCurrentStep(2);
      setCustomerForm(prev => ({
        ...prev,
        email: user.email || '',
        name: prev.name || (user.user_metadata as { full_name?: string } | undefined)?.full_name || '',
      }));
    }
  }, [user, session, currentStep]);

  // Pre-fill from saved profile
  useEffect(() => {
    if (!savedProfile) return;
    setCustomerForm(prev => ({
      ...prev,
      name: prev.name || savedProfile.fullName || '',
      email: prev.email || savedProfile.email || '',
      phone: prev.phone || savedProfile.phone || '',
      cep: prev.cep || savedProfile.cep || '',
    }));
  }, [savedProfile]);

  // Load order data
  useEffect(() => {
    const loadPaymentData = async () => {
      const orderId = searchParams.get('order');
      if (!orderId) {
        const storedPayment = sessionStorage.getItem('pending_payment');
        if (storedPayment) {
          try {
            const data = JSON.parse(storedPayment) as {
              orderId: string; amount?: number; description?: string;
              customerName?: string; customerEmail?: string; customerCpf?: string; customerPhone?: string;
              shipping?: { cost?: number; method?: string };
              cartItems?: Array<{ id?: string; product_id?: string; quantity?: number }>;
            };
            const shippingCost = data.shipping?.cost || 0;
            const itemsAmount = data.amount || 0;
            if (!itemsAmount || itemsAmount <= 0) {
              toast.error('Valor do pedido inválido');
              navigate('/');
              return;
            }
            setPaymentState({
              orderId: data.orderId,
              amount: itemsAmount + shippingCost,
              shippingCost,
              shippingMethod: data.shipping?.method || '',
              customerName: data.customerName || '',
              customerEmail: data.customerEmail || '',
              customerCpf: data.customerCpf || '',
              customerPhone: data.customerPhone || '',
              description: data.description || '',
            });
            if (data.cartItems && data.cartItems.length > 0) {
              const productIds = data.cartItems
                .map(item => item.id || item.product_id)
                .filter((v): v is string => Boolean(v));
              if (productIds.length > 0) {
                const { data: products } = await supabase
                  .from('products').select('id, weight_kg').in('id', productIds);
                if (products) {
                  const weightMap = new Map(products.map(p => [p.id, p.weight_kg || 0.5]));
                  const totalWeight = data.cartItems.reduce((sum, item) => {
                    return sum + (weightMap.get(item.id || item.product_id || '') || 0.5) * (item.quantity || 1);
                  }, 0);
                  setCartWeight(Math.max(0.3, totalWeight));
                }
              }
            }
          } catch {
            toast.error('Dados do pedido corrompidos');
            sessionStorage.removeItem('pending_payment');
            navigate('/');
            return;
          }
          setIsLoading(false);
          return;
        }
        toast.error('Pedido não encontrado');
        navigate('/');
        return;
      }
      try {
        const { data: order, error } = await supabase
          .from('orders').select('*').eq('id', orderId).single();
        if (error || !order) throw new Error('Pedido não encontrado');
        setPaymentState({
          orderId: order.id,
          amount: order.total,
          shippingCost: order.shipping_cost || 0,
          shippingMethod: order.shipping_method || '',
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerCpf: '',
          customerPhone: order.customer_phone,
          description: `Pedido #${order.order_number}`,
        });
        if (user && session) setCurrentStep(3);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Erro ao carregar pedido');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    loadPaymentData();
  }, [searchParams, navigate, user, session]);

  // PIX polling
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus === 'approved') return;
    pixPollStart.current = Date.now();
    const checkStatus = async () => {
      if (Date.now() - pixPollStart.current > PIX_POLL_TIMEOUT_MS) {
        toast.error('O tempo do PIX expirou. Gere um novo código.');
        setPixData(null);
        return;
      }
      try {
        const result = await mercadoPago.mutateAsync({
          action: 'check_status', paymentId: pixData.paymentId,
        });
        if (result.status === 'approved') {
          setPaymentStatus('approved');
          toast.success('Pagamento confirmado!');
          sessionStorage.removeItem('pending_payment');
          setTimeout(() => navigate('/pagamento/sucesso'), 2000);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData, paymentStatus, mercadoPago, navigate]);

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

      const fullAddress = [customerForm.street, customerForm.number, customerForm.complement,
        customerForm.neighborhood, customerForm.city, customerForm.state].filter(Boolean).join(', ');
      await saveProfile({ fullName: name, email, phone, address: fullAddress, cep: customerForm.cep });
      setPaymentState({ ...updatedState, orderId: dbOrderId });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, paymentState, customerForm, user, createOrderInDB, saveProfile]);

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
    setCustomerForm(prev => ({
      ...prev,
      name: savedProfile.fullName || prev.name,
      email: (user?.email || savedProfile.email || prev.email),
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
