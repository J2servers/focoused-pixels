import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  useCreateMercadoPagoPix,
  useCreateMercadoPagoPreference,
  useMercadoPago
} from '@/hooks/usePaymentGateway';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCheckoutProfile } from '@/hooks/useCheckoutProfile';
import type { Json } from '@/integrations/supabase/types';
import {
  generateIdempotencyKey,
  getIdempotencyEntry,
  setIdempotencyEntry,
  shouldAllowAction,
  cleanupIdempotencyEntries,
} from '@/lib/idempotency';
import { isRateLimited, paymentCircuitBreaker } from '@/lib/rate-limit';

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

function generateOrderNumber(): string {
  const now = new Date();
  const datePrefix = `PL${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const unique = Date.now().toString(36).toUpperCase().slice(-6);
  return `${datePrefix}-${unique}`;
}

function sanitizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const PIX_POLL_TIMEOUT_MS = 15 * 60 * 1000;

export const BOLETO_FLOW_TEMPLATE = [
  'Seu pedido fica reservado, mas o produto so entra em producao e envio depois da confirmacao do pagamento do boleto.',
  'Assim que o sistema reconhecer a compensacao do boleto, enviaremos automaticamente a confirmacao por mensagem e o pedido segue para a proxima etapa.',
  'Se o boleto vencer sem pagamento, o pedido continua fora da receita e aguarda nova acao do cliente.',
];

export function usePaymentFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: companyInfo } = useCompanyInfo();
  const { user, session } = useAuthContext();
  const { savedProfile, hasProfile, saveProfile } = useCheckoutProfile(user?.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: '', email: '', cpf: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', cep: '',
  });
  const [customText, setCustomText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [cartWeight, setCartWeight] = useState(0.5);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pixPollStart = useRef<number>(0);

  const createPix = useCreateMercadoPagoPix();
  const createPreference = useCreateMercadoPagoPreference();
  const mercadoPago = useMercadoPago();

  const pixDiscount = companyInfo?.pix_discount_percent ?? 5;
  const maxInstallments = companyInfo?.max_installments ?? 12;
  const minInstallmentValue = companyInfo?.min_installment_value ?? 50;
  const boletoExtraDays = companyInfo?.boleto_extra_days ?? 3;
  const paymentMethodsEnabled = companyInfo?.payment_methods_enabled ?? ['pix', 'credit_card', 'boleto'];

  // Auto-advance if authenticated
  useEffect(() => {
    if (user && session && currentStep === 1) {
      setCurrentStep(2);
      setCustomerForm(prev => ({
        ...prev,
        email: user.email || '',
        name: prev.name || user.user_metadata?.full_name || '',
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
            const data = JSON.parse(storedPayment);
            const shippingCost = data.shipping?.cost || 0;
            const itemsAmount = data.amount || 0;
            if (!itemsAmount || itemsAmount <= 0) {
              toast.error('Valor do pedido inválido');
              navigate('/');
              return;
            }
            setPaymentState({
              orderId: data.orderId, amount: itemsAmount + shippingCost, shippingCost,
              shippingMethod: data.shipping?.method || '',
              customerName: data.customerName || '', customerEmail: data.customerEmail || '',
              customerCpf: data.customerCpf || '', customerPhone: data.customerPhone || '',
              description: data.description || '',
            });
            if (data.cartItems?.length > 0) {
              const productIds = data.cartItems
                .map((item: { id?: string; product_id?: string }) => item.id || item.product_id)
                .filter(Boolean);
              if (productIds.length > 0) {
                const { data: products } = await supabase
                  .from('products').select('id, weight_kg').in('id', productIds);
                if (products) {
                  const weightMap = new Map(products.map((p: { id: string; weight_kg: number | null }) => [p.id, p.weight_kg || 0.5]));
                  const totalWeight = data.cartItems.reduce((sum: number, item: { id?: string; product_id?: string; quantity?: number }) => {
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
          orderId: order.id, amount: order.total, shippingCost: order.shipping_cost || 0,
          shippingMethod: order.shipping_method || '', customerName: order.customer_name,
          customerEmail: order.customer_email, customerCpf: '', customerPhone: order.customer_phone,
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

  const saveCustomerAsLead = useCallback(async (name: string, email: string, phone: string) => {
    try {
      await supabase.from('leads').upsert({
        name: name.trim(), email: email.trim().toLowerCase(),
        phone: sanitizePhone(phone), source: 'checkout',
        tags: ['cliente', 'pagamento'], is_subscribed: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (e) {
      console.error('Error saving lead:', e);
    }
  }, []);

  const createOrderInDB = useCallback(async (state: PaymentState): Promise<string | null> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(state.orderId)) return state.orderId;

    // Idempotency check: prevent duplicate order creation
    let cartItemsForKey: Array<{ id: string; quantity: number }> = [];
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment);
        cartItemsForKey = (parsed.cartItems || []).map((i: { id?: string; quantity?: number }) => ({
          id: i.id || '',
          quantity: i.quantity || 1,
        }));
      }
    } catch { /* empty */ }

    const idemKey = generateIdempotencyKey(state.customerEmail, cartItemsForKey, state.amount);
    const existingEntry = getIdempotencyEntry(idemKey);
    if (existingEntry && (existingEntry.status === 'processing' || existingEntry.status === 'completed')) {
      if (existingEntry.orderId) return existingEntry.orderId;
      toast.info('Pedido já está sendo processado...');
      return null;
    }
    setIdempotencyEntry(idemKey, 'processing');

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    let cartItems: unknown[] = [];
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) cartItems = JSON.parse(storedPayment).cartItems || [{ description: state.description, amount: state.amount }];
    } catch { cartItems = [{ description: state.description, amount: state.amount }]; }

    const prodNotes: string[] = [];
    if (customText.trim()) prodNotes.push(`📝 Texto: ${customText.trim()}`);
    if (uploadedFiles.length > 0) prodNotes.push(`📎 Arquivos: ${uploadedFiles.map(f => f.name).join(', ')}`);

    let shippingInfo: { method?: string; cost?: number; cep?: string; city?: string; state?: string } = {};
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) shippingInfo = JSON.parse(storedPayment).shipping || {};
    } catch { /* empty */ }

    const { error } = await supabase.from('orders').insert({
      id: orderId, order_number: orderNumber,
      customer_name: state.customerName.trim(),
      customer_email: state.customerEmail.trim().toLowerCase(),
      customer_phone: sanitizePhone(state.customerPhone) || state.customerPhone || '',
      items: cartItems as unknown as Json,
      subtotal: state.amount - state.shippingCost, total: state.amount,
      shipping_cost: state.shippingCost,
      shipping_method: state.shippingMethod || shippingInfo.method || null,
      shipping_cep: shippingInfo.cep || customerForm.cep?.trim() || null,
      shipping_city: shippingInfo.city || customerForm.city?.trim() || null,
      shipping_state: shippingInfo.state || customerForm.state?.trim() || null,
      shipping_address: [customerForm.street, customerForm.number, customerForm.complement, customerForm.neighborhood].filter(Boolean).join(', ') || null,
      order_status: 'pending', payment_status: 'pending', production_status: 'pending',
      custom_text: customText.trim() || null,
      customer_files: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : [],
      production_notes: prodNotes.length > 0 ? prodNotes.join('\n') : null,
    });

    if (error) {
      console.error('Error creating order:', error);
      setIdempotencyEntry(idemKey, 'failed');
      toast.error('Erro ao criar pedido. Tente novamente.');
      return null;
    }
    setIdempotencyEntry(idemKey, 'completed', orderId);
    cleanupIdempotencyEntries();
    sessionStorage.removeItem('pending_payment');
    await saveCustomerAsLead(state.customerName, state.customerEmail, state.customerPhone);
    return orderId;
  }, [customText, uploadedFiles, customerForm, saveCustomerAsLead]);

  const handleDetailsSubmit = useCallback(async () => {
    if (isProcessing || !paymentState) return;
    setIsProcessing(true);
    try {
      const name = customerForm.name.trim();
      const email = user?.email || customerForm.email.trim().toLowerCase();
      const phone = customerForm.phone.trim();
      if (!name || !phone) { toast.error('Nome e telefone são obrigatórios'); return; }
      if (!customerForm.street.trim() || !customerForm.cep.trim()) { toast.error('Endereço e CEP são obrigatórios'); return; }

      const updatedState: PaymentState = {
        ...paymentState, customerName: name, customerEmail: email,
        customerCpf: customerForm.cpf.replace(/\D/g, ''), customerPhone: phone,
      };
      const dbOrderId = await createOrderInDB(updatedState);
      if (!dbOrderId) return;

      const fullAddress = [customerForm.street, customerForm.number, customerForm.complement, customerForm.neighborhood, customerForm.city, customerForm.state].filter(Boolean).join(', ');
      await saveProfile({ fullName: name, email, phone, address: fullAddress, cep: customerForm.cep });
      setPaymentState({ ...updatedState, orderId: dbOrderId });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, paymentState, customerForm, user, createOrderInDB, saveProfile]);

  const ensureOrderExists = useCallback(async (): Promise<string | null> => {
    if (!paymentState) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(paymentState.orderId)) return paymentState.orderId;
    const dbOrderId = await createOrderInDB(paymentState);
    if (dbOrderId) setPaymentState(prev => prev ? { ...prev, orderId: dbOrderId } : null);
    return dbOrderId;
  }, [paymentState, createOrderInDB]);

  const handleGeneratePix = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    // Debounce guard
    if (!shouldAllowAction('generate_pix')) {
      toast.info('Aguarde antes de tentar novamente...');
      return;
    }
    // Rate limit: max 3 PIX requests per minute
    if (isRateLimited('pix_generation', 3, 60_000)) {
      toast.error('Muitas tentativas. Aguarde 1 minuto.');
      return;
    }
    // Circuit breaker
    if (!paymentCircuitBreaker.canExecute()) {
      toast.error('Serviço temporariamente indisponível. Tente em 30 segundos.');
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await createPix.mutateAsync({
        orderId, amount: paymentState.amount, description: paymentState.description,
        payerEmail: paymentState.customerEmail, payerName: paymentState.customerName,
        payerPhone: paymentState.customerPhone,
      });
      paymentCircuitBreaker.recordSuccess();
      setPixData({
        qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64,
        paymentId: result.paymentId, expirationDate: result.expirationDate,
        finalAmount: result.finalAmount, discountPercent: result.discountPercent,
      });
      toast.success('PIX gerado com sucesso!');
    } catch (error) {
      paymentCircuitBreaker.recordFailure();
      console.error('Error generating PIX:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, createPix]);

  const handleGenerateBoleto = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    if (!shouldAllowAction('generate_boleto')) {
      toast.info('Aguarde antes de tentar novamente...');
      return;
    }
    if (isRateLimited('boleto_generation', 3, 60_000)) {
      toast.error('Muitas tentativas. Aguarde 1 minuto.');
      return;
    }
    if (!paymentCircuitBreaker.canExecute()) {
      toast.error('Serviço temporariamente indisponível. Tente em 30 segundos.');
      return;
    }
    if (!paymentState.customerCpf || paymentState.customerCpf.replace(/\D/g, '').length < 11) {
      toast.error('CPF válido é obrigatório para boleto');
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await mercadoPago.mutateAsync({
        action: 'create_boleto', orderId, amount: paymentState.amount,
        description: paymentState.description, payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName, payerCpf: paymentState.customerCpf.replace(/\D/g, ''),
        payerZipCode: customerForm.cep, payerStreetName: customerForm.street,
        payerStreetNumber: customerForm.number || 'S/N',
        payerNeighborhood: customerForm.neighborhood, payerCity: customerForm.city,
        payerState: customerForm.state, payerPhone: paymentState.customerPhone,
      });
      setBoletoData({
        barcode: result.barcode, boletoUrl: result.boletoUrl,
        paymentId: result.paymentId, expirationDate: result.expirationDate,
      });
      toast.success('Boleto gerado com sucesso!');
    } catch (error) {
      console.error('Error generating boleto:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, mercadoPago, customerForm]);

  const handleCreditCard = useCallback(async () => {
    if (!paymentState || isProcessing) return;
    if (!shouldAllowAction('credit_card')) {
      toast.info('Aguarde antes de tentar novamente...');
      return;
    }
    if (isRateLimited('card_payment', 3, 60_000)) {
      toast.error('Muitas tentativas. Aguarde 1 minuto.');
      return;
    }
    if (!paymentCircuitBreaker.canExecute()) {
      toast.error('Serviço temporariamente indisponível. Tente em 30 segundos.');
      return;
    }
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const result = await createPreference.mutateAsync({
        orderId,
        items: [{ title: paymentState.description, quantity: 1, unit_price: paymentState.amount }],
        payerEmail: paymentState.customerEmail, payerName: paymentState.customerName,
      });
      if (result.initPoint) window.location.href = result.initPoint;
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [paymentState, isProcessing, ensureOrderExists, createPreference]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 3000);
  }, []);

  const calculateInstallments = useCallback((amount: number) => {
    const result = [];
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
