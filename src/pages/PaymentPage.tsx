/**
 * PaymentPage - Página de pagamento com métodos PIX, Cartão e Boleto
 * 
 * Integração com Mercado Pago:
 * - PIX com desconto configurável (padrão 5%)
 * - Cartão até 12x com valor mínimo por parcela
 * - Boleto com dias extras para pagamento
 */

import { useState, useEffect } from 'react';
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
  Clock, AlertCircle, ExternalLink, Percent, Shield, User
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
  });
  
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
        // If no order ID, check if coming from cart
        const storedPayment = sessionStorage.getItem('pending_payment');
        if (storedPayment) {
          const data = JSON.parse(storedPayment);
          setPaymentState(data);
          // Check if we need customer info
          if (!data.customerEmail || !data.customerName) {
            setNeedsCustomerInfo(true);
          }
          setIsLoading(false);
          return;
        }
        toast.error('Pedido não encontrado');
        navigate('/');
        return;
      }

      try {
        // Load order from database
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

  // Poll payment status for PIX
  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus === 'approved') return;

    const checkStatus = async () => {
      try {
        const result = await mercadoPago.mutateAsync({
          action: 'check_status',
          paymentId: pixData.paymentId,
        });
        
        if (result.status === 'approved') {
          setPaymentStatus('approved');
          toast.success('Pagamento confirmado!');
          setTimeout(() => navigate('/pagamento/sucesso'), 2000);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pixData, paymentStatus, mercadoPago, navigate]);

  const handleCustomerSubmit = () => {
    if (!customerForm.name || !customerForm.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    
    if (paymentState) {
      setPaymentState({
        ...paymentState,
        customerName: customerForm.name,
        customerEmail: customerForm.email,
        customerCpf: customerForm.cpf,
        customerPhone: customerForm.phone,
      });
      setNeedsCustomerInfo(false);
    }
  };

  const handleGeneratePix = async () => {
    if (!paymentState) return;

    try {
      const result = await createPix.mutateAsync({
        orderId: paymentState.orderId,
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
    }
  };

  const handleGenerateBoleto = async () => {
    if (!paymentState || !paymentState.customerCpf) {
      toast.error('CPF é obrigatório para boleto');
      return;
    }

    try {
      const result = await mercadoPago.mutateAsync({
        action: 'create_boleto',
        orderId: paymentState.orderId,
        amount: paymentState.amount,
        description: paymentState.description,
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
        payerCpf: paymentState.customerCpf,
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
    }
  };

  const handleCreditCard = async () => {
    if (!paymentState) return;

    try {
      const items = [{
        title: paymentState.description,
        quantity: 1,
        unit_price: paymentState.amount,
      }];

      const result = await createPreference.mutateAsync({
        orderId: paymentState.orderId,
        items,
        payerEmail: paymentState.customerEmail,
        payerName: paymentState.customerName,
      });

      if (result.initPoint) {
        window.location.href = result.initPoint;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF (para boleto)</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={customerForm.cpf}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, cpf: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

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
                    disabled={!customerForm.name || !customerForm.email}
                  >
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
                            disabled={createPix.isPending}
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            {createPix.isPending ? (
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
                      <div className="space-y-2">
                        <Label>Opções de Parcelamento</Label>
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {installments.slice(0, 6).map((inst) => (
                            <div 
                              key={inst.number}
                              className="flex items-center justify-between p-3 border rounded-lg text-sm"
                            >
                              <span>{inst.number}x de {formatCurrency(inst.value)}</span>
                              <span className="text-muted-foreground">
                                Total: {formatCurrency(inst.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreditCard}
                        disabled={createPreference.isPending}
                        size="lg"
                        className="w-full"
                      >
                        {createPreference.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        Pagar com Cartão
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Pagamento processado pelo Mercado Pago
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Boleto Payment */}
                {paymentMethod === 'boleto' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        Pagamento por Boleto
                      </CardTitle>
                      <CardDescription>
                        O boleto será gerado com vencimento em 3 dias
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!boletoData ? (
                        <div className="space-y-4">
                          {!paymentState.customerCpf && (
                            <div className="space-y-2">
                              <Label htmlFor="boleto_cpf">CPF (obrigatório)</Label>
                              <Input
                                id="boleto_cpf"
                                placeholder="000.000.000-00"
                                value={paymentState.customerCpf}
                                onChange={(e) => setPaymentState(prev => prev ? {...prev, customerCpf: e.target.value} : null)}
                              />
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleGenerateBoleto}
                            disabled={mercadoPago.isPending || !paymentState.customerCpf}
                            size="lg"
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            {mercadoPago.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Building2 className="h-4 w-4 mr-2" />
                            )}
                            Gerar Boleto
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-4 bg-orange-500/5 rounded-lg text-center">
                            <p className="text-2xl font-bold">
                              {formatCurrency(paymentState.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vencimento: {new Date(boletoData.expirationDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Código de Barras</Label>
                            <div className="flex gap-2">
                              <Input 
                                value={boletoData.barcode}
                                readOnly
                                className="font-mono text-xs"
                              />
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(boletoData.barcode)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Button 
                            onClick={() => window.open(boletoData.boletoUrl, '_blank')}
                            variant="outline"
                            size="lg"
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visualizar Boleto
                          </Button>

                          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              O pagamento pode levar até 3 dias úteis para ser confirmado
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(paymentState.amount)}</span>
                      </div>
                      
                      {paymentMethod === 'pix' && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Desconto PIX ({pixDiscount}%)</span>
                          <span>-{formatCurrency(paymentState.amount * pixDiscount / 100)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-xl">
                        {paymentMethod === 'pix' 
                          ? formatCurrency(pixAmount)
                          : formatCurrency(paymentState.amount)
                        }
                      </span>
                    </div>

                    {paymentMethod === 'credit_card' && installments.length > 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ou {installments[installments.length - 1].number}x de{' '}
                        {formatCurrency(installments[installments.length - 1].value)}
                      </p>
                    )}

                    <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        <span>Pagamento 100% seguro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Processado pelo Mercado Pago</span>
                      </div>
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
