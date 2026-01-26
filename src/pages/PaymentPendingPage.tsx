import { Link, useSearchParams } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Home, MessageCircle, Mail } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const PaymentPendingPage = () => {
  const { whatsapp, email } = useSiteSettings();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');

  const whatsappLink = whatsapp 
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Fiz um pagamento via boleto e gostaria de confirmar.')}`
    : '#';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-12 w-12 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Pagamento em Processamento
              </h1>
              <p className="text-muted-foreground text-lg">
                Estamos aguardando a confirmação do seu pagamento
              </p>
            </div>

            {paymentId && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ID do Pagamento: <span className="font-mono">{paymentId}</span>
                </p>
              </div>
            )}

            <div className="p-4 bg-amber-500/5 rounded-lg space-y-3 text-left">
              <p className="font-medium">Próximos passos:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>Se você pagou via Boleto, aguarde até 3 dias úteis para a confirmação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Você receberá um email assim que o pagamento for confirmado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Seu pedido será processado automaticamente após a confirmação</span>
                </li>
              </ul>
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

              {email && (
                <a href={`mailto:${email}`}>
                  <Button variant="ghost" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
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

export default PaymentPendingPage;
