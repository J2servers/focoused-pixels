/**
 * PaymentPage - Multi-step payment flow (refactored)
 * Step 1: Auth | Step 2: Details | Step 3: Payment
 */
import { useMemo } from 'react';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Lock, Truck, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { PaymentStepAuth } from '@/components/payment/PaymentStepAuth';
import { PaymentStepDetails } from '@/components/payment/PaymentStepDetails';
import { PaymentStepPayment } from '@/components/payment/PaymentStepPayment';
import { PaymentOrderSummary } from '@/components/payment/PaymentOrderSummary';
import { usePaymentFlow } from '@/hooks/usePaymentFlow';

interface PendingPaymentItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
}

const steps = [
  { id: 1, title: 'Criar Conta', shortTitle: 'Conta', icon: Lock },
  { id: 2, title: 'Entrega', shortTitle: 'Entrega', icon: Truck },
  { id: 3, title: 'Pagamento', shortTitle: 'Pagar', icon: CreditCard },
];

const PaymentPage = () => {
  const flow = usePaymentFlow();
  const { currentStep, setCurrentStep, paymentState, isLoading } = flow;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar /><DynamicMainHeader /><NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" /><Skeleton className="h-96 w-full" />
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  if (!paymentState) return null;

  const progress = (currentStep / steps.length) * 100;
  const installments = flow.calculateInstallments(paymentState.amount);

  // Read cart items from session storage so we can render an itemized summary.
  const summaryItems: PendingPaymentItem[] = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('pending_payment');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { cartItems?: PendingPaymentItem[] };
      return Array.isArray(parsed.cartItems) ? parsed.cartItems : [];
    } catch {
      return [];
    }
  }, []);

  const subtotal = Math.max(0, paymentState.amount - paymentState.shippingCost);
  const maxInstallment = installments.length > 0 ? installments[installments.length - 1] : null;
  const installmentCount = maxInstallment?.number ?? 1;
  const installmentValue = maxInstallment?.value ?? paymentState.amount;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar /><DynamicMainHeader /><NavigationBar />
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
                    <div key={step.id} className={`flex flex-col items-center flex-1 ${
                      step.id === currentStep ? 'text-primary'
                        : step.id < currentStep ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium mb-1 transition-colors ${
                        step.id === currentStep ? 'bg-primary text-primary-foreground'
                          : step.id < currentStep ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
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
              {currentStep === 1 && (
                <PaymentStepAuth
                  onAuthenticated={() => { setCurrentStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  isAuthenticated={!!flow.user && !!flow.session}
                  userEmail={flow.user?.email || undefined}
                />
              )}

              {currentStep === 2 && (
                <>
                  {flow.hasProfile && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Cliente recorrente detectado.</p>
                          <p className="text-xs text-muted-foreground">Use seus dados salvos para finalizar mais rápido.</p>
                        </div>
                        <Button type="button" onClick={flow.applySavedCheckoutProfile}>Usar dados salvos</Button>
                      </CardContent>
                    </Card>
                  )}
                  <PaymentStepDetails
                    customerForm={flow.customerForm}
                    setCustomerForm={flow.setCustomerForm}
                    customText={flow.customText}
                    setCustomText={flow.setCustomText}
                    uploadedFiles={flow.uploadedFiles}
                    setUploadedFiles={flow.setUploadedFiles}
                    amount={paymentState.amount}
                    shippingCost={paymentState.shippingCost}
                    cartWeight={flow.cartWeight}
                    onShippingChange={(cost, method, city, state) => {
                      flow.setPaymentState(prev => prev ? {
                        ...prev, amount: (prev.amount - prev.shippingCost) + cost,
                        shippingCost: cost, shippingMethod: method,
                      } : null);
                      flow.setCustomerForm(prev => ({ ...prev, city: city || prev.city, state: state || prev.state }));
                    }}
                    onSubmit={flow.handleDetailsSubmit}
                    isProcessing={flow.isProcessing}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="mt-2">
                    <ArrowLeft className="h-4 w-4 mr-1" />Voltar
                  </Button>
                </>
              )}

              {currentStep === 3 && (
                <PaymentStepPayment
                  paymentState={paymentState}
                  paymentMethod={flow.paymentMethod}
                  setPaymentMethod={flow.setPaymentMethod}
                  paymentMethodsEnabled={flow.paymentMethodsEnabled}
                  pixDiscount={flow.pixDiscount}
                  boletoExtraDays={flow.boletoExtraDays}
                  pixData={flow.pixData}
                  boletoData={flow.boletoData}
                  paymentStatus={flow.paymentStatus}
                  copied={flow.copied}
                  isProcessing={flow.isProcessing}
                  installments={installments}
                  createPixPending={flow.createPix.isPending}
                  createPreferencePending={flow.createPreference.isPending}
                  mercadoPagoPending={flow.mercadoPago.isPending}
                  onGeneratePix={flow.handleGeneratePix}
                  onGenerateBoleto={flow.handleGenerateBoleto}
                  onCreditCard={flow.handleCreditCard}
                  onCopy={flow.copyToClipboard}
                  onBack={() => setCurrentStep(2)}
                  setPaymentState={flow.setPaymentState}
                />
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
