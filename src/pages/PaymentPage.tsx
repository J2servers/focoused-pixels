/**
 * PaymentPage - Multi-step payment flow
 * Step 1: Auth (create account / login)
 * Step 2: Customer details + shipping + customization
 * Step 3: Payment method (PIX, Card, Boleto)
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  useCreateMercadoPagoPix,
  useCreateMercadoPagoPreference,
  useMercadoPago
} from '@/hooks/usePaymentGateway';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  QrCode, CreditCard, Building2, Loader2, Copy, CheckCircle2,
  Clock, AlertCircle, ExternalLink, Percent, Shield, Check,
  ArrowLeft, ArrowRight, User, Lock, Truck
} from 'lucide-react';

import { PaymentStepAuth } from '@/components/payment/PaymentStepAuth';
import { PaymentStepDetails } from '@/components/payment/PaymentStepDetails';
import { useCheckoutProfile } from '@/hooks/useCheckoutProfile';

// ===== Types & Helpers =====

interface PaymentState {
  orderId: string;
  amount: number;
  shippingCost: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  description: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePrefix = `PL${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const unique = Date.now().toString(36).toUpperCase().slice(-6);
  return `${datePrefix}-${unique}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateClientOrderId(): string {
  return crypto.randomUUID();
}

function sanitizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const PIX_POLL_TIMEOUT_MS = 15 * 60 * 1000;
const BOLETO_FLOW_TEMPLATE = [
  'Seu pedido fica reservado, mas o produto so entra em producao e envio depois da confirmacao do pagamento do boleto.',
  'Assim que o sistema reconhecer a compensacao do boleto, enviaremos automaticamente a confirmacao por mensagem e o pedido segue para a proxima etapa.',
  'Se o boleto vencer sem pagamento, o pedido continua fora da receita e aguarda nova acao do cliente.',
];

// ===== Step Configuration =====
const steps = [
  { id: 1, title: 'Criar Conta', shortTitle: 'Conta', icon: Lock },
  { id: 2, title: 'Entrega', shortTitle: 'Entrega', icon: Truck },
  { id: 3, title: 'Pagamento', shortTitle: 'Pagar', icon: CreditCard },
];

// ===== Component =====

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: companyInfo } = useCompanyInfo();
  const { user, session } = useAuthContext();
  const { savedProfile, hasProfile, saveProfile } = useCheckoutProfile(user?.id);

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
  });

  // Custom product details
  const [customText, setCustomText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);

  // PIX state
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string;
    paymentId: string;
    expirationDate: string;
    finalAmount: number;
    discountPercent: number;
  } | null>(null);

  // Boleto state
  const [boletoData, setBoletoData] = useState<{
    barcode: string;
    boletoUrl: string;
    paymentId: string;
    expirationDate: string;
  } | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pixPollStart = useRef<number>(0);

  // Mutations
  const createPix = useCreateMercadoPagoPix();
  const createPreference = useCreateMercadoPagoPreference();
  const mercadoPago = useMercadoPago();

  // Payment config
  const pixDiscount = companyInfo?.pix_discount_percent ?? 5;
  const maxInstallments = companyInfo?.max_installments ?? 12;
  const minInstallmentValue = companyInfo?.min_installment_value ?? 50;
  const boletoExtraDays = companyInfo?.boleto_extra_days ?? 3;
  const paymentMethodsEnabled = companyInfo?.payment_methods_enabled ?? ['pix', 'credit_card', 'boleto'];

  // Auto-advance to step 2 if already authenticated
  useEffect(() => {
    if (user && session && currentStep === 1) {
      setCurrentStep(2);
      // Pre-fill email from auth
      setCustomerForm(prev => ({
        ...prev,
        email: user.email || '',
        name: prev.name || user.user_metadata?.full_name || '',
      }));
    }
  }, [user, session, currentStep]);

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
              orderId: data.orderId,
              amount: itemsAmount + shippingCost,
              shippingCost,
              customerName: data.customerName || '',
              customerEmail: data.customerEmail || '',
              customerCpf: data.customerCpf || '',
              customerPhone: data.customerPhone || '',
              description: data.description || '',
            });
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
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error || !order) throw new Error('Pedido não encontrado');

        setPaymentState({
          orderId: order.id,
          amount: order.total,
          shippingCost: order.shipping_cost || 0,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerCpf: '',
          customerPhone: order.customer_phone,
          description: `Pedido #${order.order_number}`,
        });
        // If order already has data, skip to step 3
        if (user && session) {
          setCurrentStep(3);
        }
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

  // PIX poll
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
          action: 'check_status',
          paymentId: pixData.paymentId,
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

  // ===== Handlers =====

  const saveCustomerAsLead = async (name: string, email: string, phone: string) => {
    try {
      const sanitizedPhone = sanitizePhone(phone);
      await supabase.from('leads').upsert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: sanitizedPhone,
        source: 'checkout',
        tags: ['cliente', 'pagamento'],
        is_subscribed: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (e) {
      console.error('Error saving lead:', e);
    }
  };

  const createOrderInDB = async (state: PaymentState): Promise<string | null> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(state.orderId)) return state.orderId;

    const orderId = generateClientOrderId();
    const orderNumber = generateOrderNumber();
    const sanitizedPhone = sanitizePhone(state.customerPhone);

    let cartItems: unknown[] = [];
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment);
        cartItems = parsed.cartItems || [{ description: state.description, amount: state.amount }];
      }
    } catch {
      cartItems = [{ description: state.description, amount: state.amount }];
    }

    const prodNotes: string[] = [];
    if (customText.trim()) prodNotes.push(`📝 Texto: ${customText.trim()}`);
    if (uploadedFiles.length > 0) prodNotes.push(`📎 Arquivos: ${uploadedFiles.map(f => f.name).join(', ')}`);

    let shippingInfo: { method?: string; cost?: number; cep?: string; city?: string; state?: string } = {};
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment);
        shippingInfo = parsed.shipping || {};
      }
    } catch { /* empty */ }

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: state.customerName.trim(),
      customer_email: state.customerEmail.trim().toLowerCase(),
      customer_phone: sanitizedPhone || state.customerPhone || '',
      items: cartItems as unknown as import('@/integrations/supabase/types').Json,
      subtotal: state.amount - state.shippingCost,
      total: state.amount,
      shipping_cost: state.shippingCost,
      shipping_method: shippingInfo.method || null,
      shipping_cep: shippingInfo.cep || customerForm.cep?.trim() || null,
      shipping_city: shippingInfo.city || customerForm.city?.trim() || null,
      shipping_state: shippingInfo.state || customerForm.state?.trim() || null,
      shipping_address: [customerForm.street, customerForm.number, customerForm.complement, customerForm.neighborhood].filter(Boolean).join(', ') || null,
      order_status: 'pending',
      payment_status: 'pending',
      production_status: 'pending',
      custom_text: customText.trim() || null,
      customer_files: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : [],
      production_notes: prodNotes.length > 0 ? prodNotes.join('\n') : null,
    });

    if (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
      return null;
    }

    sessionStorage.removeItem('pending_payment');
    await saveCustomerAsLead(state.customerName, state.customerEmail, state.customerPhone);
    return orderId;
  };

  const handleDetailsSubmit = async () => {
    if (isProcessing || !paymentState) return;
    setIsProcessing(true);

    try {
      const name = customerForm.name.trim();
      const email = user?.email || customerForm.email.trim().toLowerCase();
      const phone = customerForm.phone.trim();
      const street = customerForm.street.trim();
      const cep = customerForm.cep.trim();

      if (!name || !phone) {
        toast.error('Nome e telefone são obrigatórios');
        return;
      }
      if (!street || !cep) {
        toast.error('Endereço e CEP são obrigatórios');
        return;
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

      const fullAddress = [street, customerForm.number, customerForm.complement, customerForm.neighborhood, customerForm.city, customerForm.state].filter(Boolean).join(', ');
      await saveProfile({
        fullName: name,
        email,
        phone,
        address: fullAddress,
        cep,
      });

      setPaymentState({ ...updatedState, orderId: dbOrderId });
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsProcessing(false);
    }
  };

  const ensureOrderExists = async (): Promise<string | null> => {
    if (!paymentState) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(paymentState.orderId)) return paymentState.orderId;
    const dbOrderId = await createOrderInDB(paymentState);
    if (dbOrderId) setPaymentState(prev => prev ? { ...prev, orderId: dbOrderId } : null);
    return dbOrderId;
  };

  const handleGeneratePix = async () => {
    if (!paymentState || isProcessing) return;
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
      });
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
      console.error('Error generating PIX:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBoleto = async () => {
    if (!paymentState || isProcessing) return;
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
  };

  const handleCreditCard = async () => {
    if (!paymentState || isProcessing) return;
    setIsProcessing(true);
    try {
      const orderId = await ensureOrderExists();
      if (!orderId) return;
      const items = [{
        title: paymentState.description,
        quantity: 1,
        unit_price: paymentState.amount,
      }];
      const result = await createPreference.mutateAsync({
        orderId,
        items,
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
      });
      if (result.initPoint) window.location.href = result.initPoint;
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const calculateInstallments = (amount: number) => {
    const result = [];
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = amount / i;
      if (installmentValue >= minInstallmentValue) {
        result.push({ number: i, value: installmentValue, total: amount });
      }
    }
    return result;
  };

  // ===== Loading =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  if (!paymentState) return null;

  const applySavedCheckoutProfile = () => {
    if (!savedProfile) return;
    setCustomerForm(prev => ({
      ...prev,
      name: savedProfile.fullName || prev.name,
      email: (user?.email || savedProfile.email || prev.email),
      phone: savedProfile.phone || prev.phone,
      cep: savedProfile.cep || prev.cep,
    }));
    toast.success('Dados de entrega preenchidos em 1 clique.');
  };

  const pixAmount = paymentState.amount * (1 - pixDiscount / 100);
  const installments = calculateInstallments(paymentState.amount);
  const progress = (currentStep / steps.length) * 100;

  // ===== Render =====
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Finalizar Compra</h1>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep - 1].title} — Etapa {currentStep} de {steps.length}
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center flex-1 ${
                        step.id === currentStep
                          ? 'text-primary'
                          : step.id < currentStep
                          ? 'text-emerald-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-colors ${
                          step.id === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : step.id < currentStep
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {step.id < currentStep ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                      </div>
                      <span className="text-xs hidden sm:block">{step.shortTitle}</span>
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              {/* Step 1: Auth */}
              {currentStep === 1 && (
                <PaymentStepAuth
                  onAuthenticated={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  isAuthenticated={!!user && !!session}
                  userEmail={user?.email || undefined}
                />
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <>
                  {hasProfile && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Cliente recorrente detectado.</p>
                          <p className="text-xs text-muted-foreground">Use seus dados salvos para finalizar mais rápido.</p>
                        </div>
                        <Button type="button" onClick={applySavedCheckoutProfile}>
                          Usar dados salvos
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <PaymentStepDetails
                    customerForm={customerForm}
                    setCustomerForm={setCustomerForm}
                    customText={customText}
                    setCustomText={setCustomText}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                    amount={paymentState.amount}
                    onSubmit={handleDetailsSubmit}
                    isProcessing={isProcessing}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="mt-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                  </Button>
                </>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                        className="grid gap-3"
                      >
                        {paymentMethodsEnabled.includes('pix') && (
                          <div className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                            <RadioGroupItem value="pix" id="pix" />
                            <Label htmlFor="pix" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <QrCode className="h-4 w-4 text-emerald-500" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">PIX</p>
                                    <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-xs">
                                  <Percent className="h-3 w-3 mr-0.5" />
                                  {pixDiscount}% OFF
                                </Badge>
                              </div>
                            </Label>
                          </div>
                        )}

                        {paymentMethodsEnabled.includes('credit_card') && (
                          <div className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                            <RadioGroupItem value="credit_card" id="credit_card" />
                            <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">Cartão de Crédito / Débito</p>
                                  <p className="text-xs text-muted-foreground">
                                    {installments.length > 1
                                      ? `Até ${installments[installments.length - 1].number}x de ${formatCurrency(installments[installments.length - 1].value)}`
                                      : `${formatCurrency(paymentState.amount)} à vista`}
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        )}

                        {paymentMethodsEnabled.includes('boleto') && (
                          <div className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                            <RadioGroupItem value="boleto" id="boleto" />
                            <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                  <Building2 className="h-4 w-4 text-orange-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">Boleto Bancário</p>
                                  <p className="text-xs text-muted-foreground">
                                    Vencimento em {3 + boletoExtraDays} dias
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* PIX */}
                  {paymentMethod === 'pix' && (
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <QrCode className="h-5 w-5 text-emerald-500" />
                          PIX
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!pixData ? (
                          <div className="text-center space-y-4">
                            <div className="p-4 bg-emerald-500/5 rounded-lg">
                              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(pixAmount)}</p>
                              <p className="text-sm text-muted-foreground">
                                <span className="line-through">{formatCurrency(paymentState.amount)}</span>
                                {' '}- {pixDiscount}% desconto
                              </p>
                            </div>
                            <Button
                              onClick={handleGeneratePix}
                              disabled={createPix.isPending || isProcessing}
                              size="lg"
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              {(createPix.isPending || isProcessing)
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <QrCode className="h-4 w-4 mr-2" />}
                              Gerar QR Code PIX
                            </Button>
                          </div>
                        ) : paymentStatus === 'approved' ? (
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <p className="text-lg font-semibold text-emerald-600">Pagamento Confirmado!</p>
                            <p className="text-sm text-muted-foreground">Redirecionando...</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="p-3 bg-white rounded-lg shadow-sm">
                                <img
                                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                  alt="QR Code PIX"
                                  className="w-44 h-44"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-amber-600">
                              <Clock className="h-4 w-4 animate-pulse" />
                              <span className="text-sm">Aguardando pagamento...</span>
                            </div>
                            <div className="space-y-2">
                              <Label>Código PIX (Copia e Cola)</Label>
                              <div className="flex gap-2">
                                <Input value={pixData.qrCode} readOnly className="font-mono text-xs" />
                                <Button variant="outline" onClick={() => copyToClipboard(pixData.qrCode)}>
                                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              O pagamento é confirmado automaticamente em segundos
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Credit Card */}
                  {paymentMethod === 'credit_card' && (
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-500" />
                          Cartão de Crédito ou Débito
                        </CardTitle>
                        <CardDescription>Checkout seguro via Mercado Pago</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-500/5 rounded-lg text-center">
                          <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
                          {installments.length > 1 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              ou até {installments[installments.length - 1].number}x de{' '}
                              {formatCurrency(installments[installments.length - 1].value)}
                            </p>
                          )}
                        </div>

                        {installments.length > 0 && (
                          <div className="space-y-1.5">
                            <Label className="text-xs">Parcelamento:</Label>
                            <div className="max-h-40 overflow-y-auto space-y-0.5">
                              {installments.map((inst) => (
                                <div key={inst.number} className="flex justify-between text-xs p-1.5 rounded hover:bg-muted/50">
                                  <span>{inst.number}x de {formatCurrency(inst.value)}</span>
                                  <span className="text-muted-foreground">Total: {formatCurrency(inst.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleCreditCard}
                          disabled={createPreference.isPending || isProcessing}
                          size="lg"
                          className="w-full"
                        >
                          {(createPreference.isPending || isProcessing)
                            ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            : <ExternalLink className="h-4 w-4 mr-2" />}
                          Pagar com Cartão
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Boleto */}
                  {paymentMethod === 'boleto' && (
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-orange-500" />
                          Boleto Bancário
                        </CardTitle>
                        <CardDescription>O produto so e liberado apos a confirmacao real do boleto.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!boletoData ? (
                          <>
                            <div className="p-4 bg-orange-500/5 rounded-lg text-center">
                              <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
                              <p className="text-sm text-muted-foreground">
                                Vencimento em {3 + boletoExtraDays} dias
                              </p>
                            </div>
                            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-left">
                              <p className="font-medium text-foreground mb-2">Mensagem automatica para pagamento em boleto</p>
                              <div className="space-y-2 text-muted-foreground">
                                {BOLETO_FLOW_TEMPLATE.map((item) => (
                                  <p key={item}>• {item}</p>
                                ))}
                              </div>
                            </div>
                            {!paymentState.customerCpf && (
                              <div className="space-y-2">
                                <Label>CPF do pagador *</Label>
                                <Input
                                  placeholder="000.000.000-00"
                                  value={paymentState.customerCpf}
                                  onChange={(e) => setPaymentState(prev => prev ? { ...prev, customerCpf: e.target.value } : null)}
                                  maxLength={14}
                                />
                              </div>
                            )}
                            <Button
                              onClick={handleGenerateBoleto}
                              disabled={mercadoPago.isPending || isProcessing}
                              size="lg"
                              className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                              {(mercadoPago.isPending || isProcessing)
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Building2 className="h-4 w-4 mr-2" />}
                              Gerar Boleto
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <CheckCircle2 className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                              <p className="font-semibold">Boleto gerado!</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Código de barras</Label>
                              <div className="flex gap-2">
                                <Input value={boletoData.barcode} readOnly className="font-mono text-xs" />
                                <Button variant="outline" onClick={() => copyToClipboard(boletoData.barcode)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-left">
                              <p className="font-medium text-foreground mb-2">Como funciona a confirmacao</p>
                              <div className="space-y-2 text-muted-foreground">
                                {BOLETO_FLOW_TEMPLATE.map((item) => (
                                  <p key={item}>• {item}</p>
                                ))}
                              </div>
                            </div>
                            <Button asChild className="w-full" variant="outline">
                              <a href={boletoData.boletoUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Visualizar Boleto
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Order Summary */}
                  <Card>
                    <CardContent className="py-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Cliente</span>
                        <span className="font-medium">{paymentState.customerName}</span>
                      </div>
                      <Separator />
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(paymentState.amount)}</span>
                        </div>
                        {paymentMethod === 'pix' && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Desconto PIX ({pixDiscount}%)</span>
                            <span>-{formatCurrency(paymentState.amount * pixDiscount / 100)}</span>
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>
                          {paymentMethod === 'pix' ? formatCurrency(pixAmount) : formatCurrency(paymentState.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 shrink-0" />
                        Pagamento 100% seguro via Mercado Pago
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar para dados de entrega
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DynamicFooter />
    </div>
  );
};

export default PaymentPage;


