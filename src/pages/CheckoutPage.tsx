import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { CheckoutStepCustomer } from '@/components/checkout/CheckoutStepCustomer';
import { CheckoutStepProducts } from '@/components/checkout/CheckoutStepProducts';
import { CheckoutStepSpecifications } from '@/components/checkout/CheckoutStepSpecifications';
import { CheckoutStepCommercial } from '@/components/checkout/CheckoutStepCommercial';
import { CheckoutStepReview } from '@/components/checkout/CheckoutStepReview';
import { CheckoutCartSummary } from '@/components/checkout/CheckoutCartSummary';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSubscribeLead } from '@/hooks/useLeads';

export interface QuoteFormData {
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  customerCnpj: string;
  
  // Delivery info
  deliveryAddress: string;
  deliveryCep: string;
  deliveryDeadline: Date | null;
  shippingMethod: string;
  
  // Product details
  productTypes: string[];
  ledOption: string;
  qrCodeCount: number;
  brocheStyle: string;
  otherProductDescription: string;
  
  // Specifications
  customText: string;
  logoUrl: string;
  preferredColors: string;
  dimensions: string;
  quantity: number;
  material: string;
  thickness: string;
  borderFinish: string;
  qrCodeLinks: string[];
  qrCodeType: string;
  
  // Style references
  referenceLinks: string;
  stylePreference: string;
  visualNotes: string;
  
  // Commercial
  maxBudget: string;
  paymentMethod: string;
  requestVolumeDiscount: boolean;
  requestPrototype: boolean;
  acceptWarranty: boolean;
  wantWhatsappConfirmation: boolean;
  
  // Additional
  purpose: string;
  additionalNotes: string;
}

const initialFormData: QuoteFormData = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerCompany: '',
  customerCnpj: '',
  deliveryAddress: '',
  deliveryCep: '',
  deliveryDeadline: null,
  shippingMethod: 'sedex',
  productTypes: [],
  ledOption: '',
  qrCodeCount: 1,
  brocheStyle: '',
  otherProductDescription: '',
  customText: '',
  logoUrl: '',
  preferredColors: '',
  dimensions: '',
  quantity: 1,
  material: 'acrilico',
  thickness: '',
  borderFinish: '',
  qrCodeLinks: [''],
  qrCodeType: '',
  referenceLinks: '',
  stylePreference: '',
  visualNotes: '',
  maxBudget: '',
  paymentMethod: 'pix',
  requestVolumeDiscount: false,
  requestPrototype: false,
  acceptWarranty: true,
  wantWhatsappConfirmation: true,
  purpose: '',
  additionalNotes: '',
};

const steps = [
  { id: 1, title: 'Dados Pessoais', shortTitle: 'Dados' },
  { id: 2, title: 'Tipo de Produto', shortTitle: 'Produto' },
  { id: 3, title: 'Especificações', shortTitle: 'Specs' },
  { id: 4, title: 'Condições Comerciais', shortTitle: 'Comercial' },
  { id: 5, title: 'Revisão', shortTitle: 'Revisão' },
];

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const subscribeLead = useSubscribeLead();

  const updateFormData = (updates: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.customerName && formData.customerEmail && formData.customerPhone);
      case 2:
        return formData.productTypes.length > 0 || items.length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return formData.acceptWarranty;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build quote data with proper types
      const quoteData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        customer_company: formData.customerCompany || null,
        customer_cnpj: formData.customerCnpj || null,
        delivery_address: formData.deliveryAddress || null,
        delivery_cep: formData.deliveryCep || null,
        delivery_deadline: formData.deliveryDeadline?.toISOString().split('T')[0] || null,
        shipping_method: formData.shippingMethod || null,
        product_types: formData.productTypes,
        led_option: formData.ledOption || null,
        qr_code_count: formData.qrCodeCount || null,
        broche_style: formData.brocheStyle || null,
        other_product_description: formData.otherProductDescription || null,
        custom_text: formData.customText || null,
        logo_url: formData.logoUrl || null,
        preferred_colors: formData.preferredColors || null,
        dimensions: formData.dimensions || null,
        quantity: formData.quantity,
        material: formData.material || null,
        thickness: formData.thickness || null,
        border_finish: formData.borderFinish || null,
        qr_code_links: formData.qrCodeLinks.filter(l => l.trim()),
        qr_code_type: formData.qrCodeType || null,
        reference_links: formData.referenceLinks || null,
        style_preference: formData.stylePreference || null,
        visual_notes: formData.visualNotes || null,
        max_budget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
        payment_method: formData.paymentMethod || null,
        request_volume_discount: formData.requestVolumeDiscount,
        request_prototype: formData.requestPrototype,
        accept_warranty: formData.acceptWarranty,
        want_whatsapp_confirmation: formData.wantWhatsappConfirmation,
        purpose: formData.purpose || null,
        additional_notes: formData.additionalNotes || null,
        cart_items: items.length > 0 ? JSON.parse(JSON.stringify(items)) : null,
        cart_total: total > 0 ? total : null,
        status: 'pending' as const,
      };

      const { error } = await supabase.from('quotes').insert(quoteData);

      if (error) throw error;

      // Save lead for marketing
      try {
        await subscribeLead.mutateAsync({
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone || undefined,
          source: 'checkout',
          tags: ['orcamento', ...formData.productTypes],
        });
      } catch {
        // Lead save is not critical, just log
        console.log('Lead already exists or failed to save');
      }

      toast.success('Orçamento enviado com sucesso! Entraremos em contato em breve.');
      clearCart();
      navigate('/orcamento-enviado');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Error submitting quote:', errorMessage);
      toast.error('Erro ao enviar orçamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Solicitar Orçamento</h1>
          <p className="text-muted-foreground mb-8">
            Preencha o formulário abaixo com os detalhes do seu pedido personalizado
          </p>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center flex-1 ${
                    step.id === currentStep
                      ? 'text-primary'
                      : step.id < currentStep
                      ? 'text-success'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                      step.id === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id < currentStep
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span className="text-xs hidden sm:block">{step.shortTitle}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentStep === 1 && (
                    <CheckoutStepCustomer
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 2 && (
                    <CheckoutStepProducts
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 3 && (
                    <CheckoutStepSpecifications
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 4 && (
                    <CheckoutStepCommercial
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  )}
                  {currentStep === 5 && (
                    <CheckoutStepReview
                      formData={formData}
                      cartItems={items}
                      cartTotal={total}
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>

                    {currentStep < steps.length ? (
                      <Button
                        onClick={nextStep}
                        disabled={!validateStep(currentStep)}
                      >
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !validateStep(currentStep)}
                        className="bg-success hover:bg-success/90"
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar Orçamento'}
                        <Check className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <CheckoutCartSummary items={items} total={total} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default CheckoutPage;
