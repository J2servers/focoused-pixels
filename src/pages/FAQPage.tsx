import { DynamicTopBar, DynamicMainHeader, NavigationBar, DynamicFooter } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { PageSEO, FAQSchema } from '@/components/seo/PageSEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const FAQPage = () => {
  const settings = useSiteSettings();
  const [searchQuery, setSearchQuery] = useState('');
const faqCategories = [

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  const allFaqs = faqCategories.flatMap(cat => cat.questions);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO
        title="Perguntas Frequentes"
        description="Encontre respostas sobre pedidos, pagamentos, produção, personalização, entrega e garantia dos produtos Pincel de Luz."
        path="/faq"
      />
      <FAQSchema faqs={allFaqs} />
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Encontre respostas para as dúvidas mais comuns sobre nossos produtos e serviços
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Input
                type="text"
                placeholder="Buscar pergunta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 text-base bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category.category} className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-primary">
                      {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`${category.category}-${index}`}
                          className="bg-card border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-4">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-4">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma pergunta encontrada para "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Limpar busca
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-8 pb-6 text-center">
                <h2 className="text-xl font-bold mb-2">Não encontrou sua resposta?</h2>
                <p className="text-muted-foreground mb-6">
                  Nossa equipe está pronta para ajudar! Entre em contato pelo WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${settings.whatsapp?.replace(/\\D/g, "") || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-success hover:bg-success/90">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Falar no WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default FAQPage;

