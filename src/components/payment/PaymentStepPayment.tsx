import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  QrCode, CreditCard, Building2, Loader2, Copy, CheckCircle2,
  Clock, AlertCircle, ExternalLink, Percent, Shield, ArrowLeft,
} from 'lucide-react';
import type { PaymentState, PixData, BoletoData } from '@/hooks/usePaymentFlow';
import { formatCurrency, BOLETO_FLOW_TEMPLATE } from '@/hooks/usePaymentFlow';

interface Props {
  paymentState: PaymentState;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  setPaymentMethod: (m: 'pix' | 'credit_card' | 'boleto') => void;
  paymentMethodsEnabled: string[];
  pixDiscount: number;
  boletoExtraDays: number;
  pixData: PixData | null;
  boletoData: BoletoData | null;
  paymentStatus: string;
  copied: boolean;
  isProcessing: boolean;
  installments: { number: number; value: number; total: number }[];
  createPixPending: boolean;
  createPreferencePending: boolean;
  mercadoPagoPending: boolean;
  onGeneratePix: () => void;
  onGenerateBoleto: () => void;
  onCreditCard: () => void;
  onCopy: (text: string) => void;
  onBack: () => void;
  setPaymentState: (fn: (prev: PaymentState | null) => PaymentState | null) => void;
}

export function PaymentStepPayment({
  paymentState, paymentMethod, setPaymentMethod, paymentMethodsEnabled,
  pixDiscount, boletoExtraDays, pixData, boletoData, paymentStatus,
  copied, isProcessing, installments,
  createPixPending, createPreferencePending, mercadoPagoPending,
  onGeneratePix, onGenerateBoleto, onCreditCard, onCopy, onBack, setPaymentState,
}: Props) {
  const pixAmount = paymentState.amount * (1 - pixDiscount / 100);

  return (
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
                      <Percent className="h-3 w-3 mr-0.5" />{pixDiscount}% OFF
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
                      <p className="text-xs text-muted-foreground">Vencimento em {3 + boletoExtraDays} dias</p>
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
              <QrCode className="h-5 w-5 text-emerald-500" />PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pixData ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-emerald-500/5 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(pixAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="line-through">{formatCurrency(paymentState.amount)}</span>{' '}- {pixDiscount}% desconto
                  </p>
                </div>
                <Button onClick={onGeneratePix} disabled={createPixPending || isProcessing} size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {(createPixPending || isProcessing) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
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
                    <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX" className="w-44 h-44" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Clock className="h-4 w-4 animate-pulse" /><span className="text-sm">Aguardando pagamento...</span>
                </div>
                <div className="space-y-2">
                  <Label>Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input value={pixData.qrCode} readOnly className="font-mono text-xs" />
                    <Button variant="outline" onClick={() => onCopy(pixData.qrCode)}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />O pagamento é confirmado automaticamente em segundos
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
              <CreditCard className="h-5 w-5 text-blue-500" />Cartão de Crédito ou Débito
            </CardTitle>
            <CardDescription>Checkout seguro via Mercado Pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-500/5 rounded-lg text-center">
              <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
              {installments.length > 1 && (
                <p className="text-sm text-muted-foreground mt-1">
                  ou até {installments[installments.length - 1].number}x de {formatCurrency(installments[installments.length - 1].value)}
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
            <Button onClick={onCreditCard} disabled={createPreferencePending || isProcessing} size="lg" className="w-full">
              {(createPreferencePending || isProcessing) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
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
              <Building2 className="h-5 w-5 text-orange-500" />Boleto Bancário
            </CardTitle>
            <CardDescription>O produto so e liberado apos a confirmacao real do boleto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!boletoData ? (
              <>
                <div className="p-4 bg-orange-500/5 rounded-lg text-center">
                  <p className="text-2xl font-bold">{formatCurrency(paymentState.amount)}</p>
                  <p className="text-sm text-muted-foreground">Vencimento em {3 + boletoExtraDays} dias</p>
                </div>
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-left">
                  <p className="font-medium text-foreground mb-2">Mensagem automatica para pagamento em boleto</p>
                  <div className="space-y-2 text-muted-foreground">
                    {BOLETO_FLOW_TEMPLATE.map((item) => (<p key={item}>• {item}</p>))}
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
                <Button onClick={onGenerateBoleto} disabled={mercadoPagoPending || isProcessing} size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                  {(mercadoPagoPending || isProcessing) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Building2 className="h-4 w-4 mr-2" />}
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
                    <Button variant="outline" onClick={() => onCopy(boletoData.barcode)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-left">
                  <p className="font-medium text-foreground mb-2">Como funciona a confirmacao</p>
                  <div className="space-y-2 text-muted-foreground">
                    {BOLETO_FLOW_TEMPLATE.map((item) => (<p key={item}>• {item}</p>))}
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <a href={boletoData.boletoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />Visualizar Boleto
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
            <span>Cliente</span><span className="font-medium">{paymentState.customerName}</span>
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal (itens)</span><span>{formatCurrency(paymentState.amount - paymentState.shippingCost)}</span>
            </div>
            {paymentState.shippingCost > 0 && (
              <div className="flex justify-between">
                <span>Frete</span><span>{formatCurrency(paymentState.shippingCost)}</span>
              </div>
            )}
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
            <span>{paymentMethod === 'pix' ? formatCurrency(pixAmount) : formatCurrency(paymentState.amount)}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0" />Pagamento 100% seguro via Mercado Pago
          </div>
        </CardContent>
      </Card>

      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />Voltar para dados de entrega
      </Button>
    </div>
  );
}
