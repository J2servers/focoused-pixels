/**
 * PaymentPage - Página de pagamento com métodos PIX, Cartão e Boleto
 * 
 * Integração com Mercado Pago:
 * - PIX com desconto configurável (padrão 5%)
 * - Cartão até 12x com valor mínimo por parcela
 * - Boleto com dias extras para pagamento
 * 
 * MELHORIAS v2:
 * - Order number com prefixo + timestamp base36 (anti-colisão)
 * - Validação de email no frontend
 * - Limpeza de sessionStorage após criação do pedido
 * - Timeout no polling de PIX (15 min)
 * - Proteção contra duplo-clique nos botões
 * - customer_phone nunca vazio (null se ausente)
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  useCreateMercadoPagoPix, 
  useCreateMercadoPagoPreference,
  useMercadoPago
} from '@/hooks/usePaymentGateway';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { supabase } from '@/integrations/supabase/client';
import { 
  QrCode, CreditCard, Building2, Loader2, Copy, CheckCircle2, 
  Clock, AlertCircle, ExternalLink, Percent, Shield, User,
  Upload, FileImage, X, Type
} from 'lucide-react';

interface PaymentState {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  description: string;
}

// ===== HELPERS =====

/** Generate a collision-resistant order number: PL250318-A1B2C3 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePrefix = `PL${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  const unique = Date.now().toString(36).toUpperCase().slice(-6);
  return `${datePrefix}-${unique}`;
}

/** Basic email validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Generate a client-side UUID so anonymous inserts don't need a protected SELECT */
function generateClientOrderId(): string {
  return crypto.randomUUID();
}

/** Sanitize phone: keep only digits, ensure 55 prefix */
function sanitizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.startsWith('0')) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

const PIX_POLL_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: companyInfo } = useCompanyInfo();
  
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsCustomerInfo, setNeedsCustomerInfo] = useState(false);
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    cep: '',
  });
  
  // Custom product details (optional)
  const [customText, setCustomText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [copied, setCopied] = useState(false);
  
  // Prevent double-submit
  const [isProcessing, setIsProcessing] = useState(false);
  
  // PIX polling start time for timeout
  const pixPollStart = useRef<number>(0);

  // Mutations
  const createPix = useCreateMercadoPagoPix();
  const createPreference = useCreateMercadoPagoPreference();
  const mercadoPago = useMercadoPago();

  // Get payment config
  const pixDiscount = companyInfo?.pix_discount_percent ?? 5;
  const maxInstallments = companyInfo?.max_installments ?? 12;
  const minInstallmentValue = companyInfo?.min_installment_value ?? 50;
  const boletoExtraDays = companyInfo?.boleto_extra_days ?? 3;
  const paymentMethodsEnabled = companyInfo?.payment_methods_enabled ?? ['pix', 'credit_card', 'boleto'];

  // Load order data from URL params or session
  useEffect(() => {
    const loadPaymentData = async () => {
      const orderId = searchParams.get('order');
      
      if (!orderId) {
        const storedPayment = sessionStorage.getItem('pending_payment');
        if (storedPayment) {
          try {
            const data = JSON.parse(storedPayment);
            if (!data.amount || data.amount <= 0) {
              toast.error('Valor do pedido inválido');
              navigate('/');
              return;
            }
            setPaymentState(data);
            if (!data.customerEmail || !data.customerName) {
              setNeedsCustomerInfo(true);
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
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error || !order) {
          throw new Error('Pedido não encontrado');
        }

        setPaymentState({
          orderId: order.id,
          amount: order.total,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerCpf: '',
          customerPhone: order.customer_phone,
          description: `Pedido #${order.order_number}`,
        });
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Erro ao carregar pedido');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, [searchParams, navigate]);

  // Poll payment status for PIX with timeout
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus === 'approved') return;

    pixPollStart.current = Date.now();

    const checkStatus = async () => {
      // Timeout after 15 minutes
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
          // Clear session data
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ai', 'eps', 'cdr'];

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo ${file.name} é muito grande (máx. 10MB)`);
          continue;
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          toast.error(`Tipo de arquivo não permitido: .${ext}`);
          continue;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `customer-uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('order-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('order-files')
          .getPublicUrl(filePath);

        setUploadedFiles(prev => [...prev, { name: file.name, url: urlData.publicUrl }]);
        toast.success(`${file.name} enviado!`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const createOrderInDB = async (state: PaymentState): Promise<string | null> => {
    // If orderId is already a UUID (came from DB), skip creation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(state.orderId)) return state.orderId;

    const orderId = generateClientOrderId();
    const orderNumber = generateOrderNumber();
    const sanitizedPhone = sanitizePhone(state.customerPhone);

    // Get cart items from sessionStorage
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

    // Build production notes from custom data
    const prodNotes: string[] = [];
    if (customText.trim()) {
      prodNotes.push(`📝 Texto do cliente: ${customText.trim()}`);
    }
    if (uploadedFiles.length > 0) {
      prodNotes.push(`📎 Arquivos: ${uploadedFiles.map(f => f.name).join(', ')}`);
    }

    const { error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        customer_name: state.customerName.trim(),
        customer_email: state.customerEmail.trim().toLowerCase(),
        customer_phone: sanitizedPhone || state.customerPhone || '',
        items: cartItems as unknown as import('@/integrations/supabase/types').Json,
        subtotal: state.amount,
        total: state.amount,
        order_status: 'pending',
        payment_status: 'pending',
        production_status: 'pending',
        custom_text: customText.trim() || null,
        customer_files: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : [],
        production_notes: prodNotes.length > 0 ? prodNotes.join('\n') : null,
        shipping_address: customerForm.address?.trim() || null,
        shipping_cep: customerForm.cep?.trim() || null,
      })
      ;

    if (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
      return null;
    }

    // Clear sessionStorage after successful order creation
    sessionStorage.removeItem('pending_payment');

    // Save customer as lead
    await saveCustomerAsLead(state.customerName, state.customerEmail, state.customerPhone);

    return orderId;
  };

  const handleCustomerSubmit = async () => {
    if (isProcessing) return;
    
    const name = customerForm.name.trim();
    const email = customerForm.email.trim().toLowerCase();
    
    if (!name || !email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error('Por favor, informe um email válido');
      return;
    }
    
    if (paymentState) {
      setIsProcessing(true);
      try {
        const updatedState = {
          ...paymentState,
          customerName: name,
          customerEmail: email,
          customerCpf: customerForm.cpf.replace(/\D/g, ''),
          customerPhone: customerForm.phone,
        };

        const dbOrderId = await createOrderInDB(updatedState);
        if (!dbOrderId) {
          setIsProcessing(false);
          return;
        }

        setPaymentState({ ...updatedState, orderId: dbOrderId });
        setNeedsCustomerInfo(false);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const ensureOrderExists = async (): Promise<string | null> => {
    if (!paymentState) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(paymentState.orderId)) return paymentState.orderId;
    
    const dbOrderId = await createOrderInDB(paymentState);
    if (dbOrderId) {
      setPaymentState(prev => prev ? { ...prev, orderId: dbOrderId } : null);
    }
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

      if (result.initPoint) {
        window.location.href = result.initPoint;
      }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateInstallments = (amount: number) => {
    const installments = [];
    for (let i = 1; i <= maxInstallments; i++) {
      const installmentValue = amount / i;
      if (installmentValue >= minInstallmentValue) {
        installments.push({
          number: i,
          value: installmentValue,
          total: amount,
        });
      }
    }
    return installments;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  if (!paymentState) {
    return null;
  }

  // Show customer info form if needed
  if (needsCustomerInfo) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar />
        <DynamicMainHeader />
        <NavigationBar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-lg mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados para Pagamento
                  </CardTitle>
                  <CardDescription>
                    Informe seus dados para prosseguir com o pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF (para boleto)</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={customerForm.cpf}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, cpf: e.target.value }))}
                      maxLength={14}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      maxLength={20}
                    />
                  </div>

                  <Separator />

                  {/* Optional: Custom Text & File Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      <span>Personalização do produto <Badge variant="outline" className="text-xs">Opcional</Badge></span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customText" className="flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5" />
                        Texto para gravação
                      </Label>
                      <Textarea
                        id="customText"
                        placeholder="Ex: Nome da empresa, frase personalizada, dados do QR Code..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Escreva o texto que deseja gravar no produto. Caso prefira, envie pelo WhatsApp após a compra.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fileUpload" className="flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Logo, imagem ou QR Code
                      </Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        <input
                          id="fileUpload"
                          type="file"
                          accept="image/*,.pdf,.svg,.ai,.eps,.cdr"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label htmlFor="fileUpload" className="cursor-pointer space-y-2">
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground">
                            {isUploading ? 'Enviando...' : 'Clique para enviar ou arraste arquivos'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, SVG, PDF, AI, EPS (máx. 10MB)
                          </p>
                        </label>
                      </div>

                      {/* Uploaded files list */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                              <FileImage className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate flex-1">{file.name}</span>
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              <button
                                onClick={() => removeFile(index)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        💡 Você também pode enviar esses arquivos pelo WhatsApp após finalizar a compra.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Valor a pagar:</span>
                      <span className="font-bold text-lg">{formatCurrency(paymentState.amount)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCustomerSubmit}
                    className="w-full"
                    size="lg"
                    disabled={!customerForm.name.trim() || !customerForm.email.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Continuar para Pagamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <DynamicFooter />
      </div>
    );
  }

  const pixAmount = paymentState.amount * (1 - pixDiscount / 100);
  const installments = calculateInstallments(paymentState.amount);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Pagamento</h1>
              <p className="text-muted-foreground">
                Escolha a forma de pagamento que preferir
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                {/* Payment Method Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                      className="grid gap-4"
                    >
                      {paymentMethodsEnabled.includes('pix') && (
                        <div className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                  <QrCode className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="font-medium">PIX</p>
                                  <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                                <Percent className="h-3 w-3 mr-1" />
                                {pixDiscount}% OFF
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      )}

                      {paymentMethodsEnabled.includes('credit_card') && (
                        <div className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                          <RadioGroupItem value="credit_card" id="credit_card" />
                          <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                  <CreditCard className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Cartão de Crédito</p>
                                  <p className="text-sm text-muted-foreground">
                                    Até {maxInstallments}x de {formatCurrency(minInstallmentValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}

                      {paymentMethodsEnabled.includes('boleto') && (
                        <div className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
                          <RadioGroupItem value="boleto" id="boleto" />
                          <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Boleto Bancário</p>
                                  <p className="text-sm text-muted-foreground">
                                    Vencimento em 3 dias + {boletoExtraDays} extras
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* PIX Payment */}
                {paymentMethod === 'pix' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-emerald-500" />
                        Pagamento PIX
                      </CardTitle>
                      <CardDescription>
                        Escaneie o QR Code ou copie o código para pagar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!pixData ? (
                        <div className="text-center space-y-4">
                          <div className="p-6 bg-emerald-500/5 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(pixAmount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="line-through">{formatCurrency(paymentState.amount)}</span>
                              {' '}- {pixDiscount}% de desconto
                            </p>
                          </div>
                          <Button 
                            onClick={handleGeneratePix}
                            disabled={createPix.isPending || isProcessing}
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            {(createPix.isPending || isProcessing) ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <QrCode className="h-4 w-4 mr-2" />
                            )}
                            Gerar QR Code PIX
                          </Button>
                        </div>
                      ) : paymentStatus === 'approved' ? (
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-emerald-600">
                              Pagamento Confirmado!
                            </p>
                            <p className="text-muted-foreground">
                              Redirecionando...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                              <img 
                                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                alt="QR Code PIX"
                                className="w-48 h-48"
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
                              <Input 
                                value={pixData.qrCode}
                                readOnly
                                className="font-mono text-xs"
                              />
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(pixData.qrCode)}
                              >
                                {copied ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              O pagamento é confirmado automaticamente em segundos
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Credit Card Payment */}
                {paymentMethod === 'credit_card' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        Pagamento com Cartão
                      </CardTitle>
                      <CardDescription>
                        Você será redirecionado para o checkout seguro do Mercado Pago
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-6 bg-blue-500/5 rounded-lg text-center">
                        <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
                        {installments.length > 1 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            ou até {installments[installments.length - 1].number}x de{' '}
                            {formatCurrency(installments[installments.length - 1].value)}
                          </p>
                        )}
                      </div>

                      {installments.length > 0 && (
                        <div className="space-y-2">
                          <Label>Opções de parcelamento:</Label>
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {installments.map((inst) => (
                              <div key={inst.number} className="flex justify-between text-sm p-2 rounded hover:bg-muted/50">
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
                        {(createPreference.isPending || isProcessing) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        Pagar com Cartão
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Boleto Payment */}
                {paymentMethod === 'boleto' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        Boleto Bancário
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!boletoData ? (
                        <div className="space-y-4">
                          <div className="p-6 bg-orange-500/5 rounded-lg text-center">
                            <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento em {3 + boletoExtraDays} dias
                            </p>
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
                            {(mercadoPago.isPending || isProcessing) ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Building2 className="h-4 w-4 mr-2" />
                            )}
                            Gerar Boleto
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <CheckCircle2 className="h-12 w-12 text-orange-500 mx-auto mb-2" />
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
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">{paymentState.customerName}</p>
                      <p className="text-sm text-muted-foreground">{paymentState.customerEmail}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 text-sm">
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
                        {paymentMethod === 'pix' 
                          ? formatCurrency(pixAmount)
                          : formatCurrency(paymentState.amount)
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                      <Shield className="h-4 w-4 shrink-0" />
                      Pagamento 100% seguro via Mercado Pago
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DynamicFooter />
    </div>
  );
};

export default PaymentPage;
