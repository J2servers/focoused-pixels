import { Link, useSearchParams } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RotateCcw, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const PaymentErrorPage = () => {
  const { whatsapp } = useSiteSettings();
  const [searchParams] = useSearchParams();
  
  const error = searchParams.get('error') || 'Ocorreu um erro no pagamento';

  const whatsappLink = whatsapp 
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Tive um problema com meu pagamento e preciso de ajuda.')}`
    : '#';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Pagamento não realizado
              </h1>
              <p className="text-muted-foreground">
                {error}
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
              <p>Possíveis motivos:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Cartão recusado pela operadora</li>
                <li>Limite insuficiente</li>
                <li>Dados incorretos</li>
                <li>Tempo expirado</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/carrinho">
                <Button className="w-full" size="lg">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </Link>

              <Link to="/">
                <Button variant="outline" className="w-full" size="lg">
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
                  <Button variant="ghost" className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Preciso de Ajuda
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

export default PaymentErrorPage;
