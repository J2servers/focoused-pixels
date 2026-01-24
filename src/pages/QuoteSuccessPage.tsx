/**
 * QuoteSuccessPage - Página de sucesso após envio de orçamento
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > Checkout):
 * - checkout_success_message: Mensagem personalizada de sucesso
 * 
 * CONFIGURAÇÕES USADAS (Admin > Empresa > Contato):
 * - whatsapp: Número do WhatsApp para link de contato
 */

import { Link } from 'react-router-dom';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, MessageCircle, Clock } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const QuoteSuccessPage = () => {
  const { checkoutSuccessMessage, whatsapp, whatsappMessageTemplate } = useSiteSettings();

  const whatsappLink = whatsapp 
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Acabei de enviar um orçamento pelo site e gostaria de mais informações.')}`
    : '#';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
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
                {checkoutSuccessMessage}
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

export default QuoteSuccessPage;
