import { Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, MessageCircle, Clock } from 'lucide-react';
import { storeInfo } from '@/data/store';

const QuoteSuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Orçamento Enviado com Sucesso!
              </h1>
              <p className="text-muted-foreground">
                Recebemos sua solicitação e entraremos em contato em breve.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-primary" />
                <span>Resposta em até 24 horas úteis</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="h-5 w-5 text-success" />
                <span>Você receberá uma mensagem no WhatsApp informado</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/">
                <Button className="w-full" size="lg">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar para a Loja
                </Button>
              </Link>

              <a
                href={`https://wa.me/${storeInfo.whatsapp.replace(/\D/g, '')}?text=Olá! Acabei de enviar um orçamento pelo site e gostaria de mais informações.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default QuoteSuccessPage;
