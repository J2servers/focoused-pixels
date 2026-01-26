import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Package, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const PaymentSuccessPage = () => {
  const { checkoutSuccessMessage, whatsapp } = useSiteSettings();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Simple celebration animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes celebrate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .celebrate-icon { animation: celebrate 0.6s ease-in-out 3; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const whatsappLink = whatsapp 
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Acabei de realizar um pagamento e gostaria de confirmar meu pedido.')}`
    : '#';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto celebrate-icon">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Pagamento Confirmado!
              </h1>
              <p className="text-muted-foreground text-lg">
                {checkoutSuccessMessage || 'Obrigado pela sua compra! Seu pedido está sendo processado.'}
              </p>
            </div>

            {paymentId && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ID do Pagamento: <span className="font-mono">{paymentId}</span>
                </p>
              </div>
            )}

            <div className="p-4 bg-emerald-500/5 rounded-lg space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-5 w-5 text-primary" />
                <span>Você receberá um email com os detalhes do pedido</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                <span>Entraremos em contato para acompanhamento</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/">
                <Button className="w-full" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar para a Loja
                </Button>
              </Link>

              {whatsapp && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Falar no WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <DynamicFooter />
    </div>
  );
};

export default PaymentSuccessPage;
