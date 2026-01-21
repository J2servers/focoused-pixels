import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storeInfo } from '@/data/store';
import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const faqCategories = [
  {
    category: 'Pedidos e Pagamentos',
    questions: [
      {
        question: 'Como faço um pedido?',
        answer: 'Você pode fazer seu pedido diretamente pelo site, adicionando os produtos ao carrinho e preenchendo o formulário de orçamento. Após enviar, nossa equipe entrará em contato via WhatsApp para confirmar os detalhes e enviar o link de pagamento.',
      },
      {
        question: 'Quais formas de pagamento vocês aceitam?',
        answer: `Aceitamos ${storeInfo.footerLinks.payment.join(', ')}. O parcelamento em até ${storeInfo.installments}x sem juros está disponível para cartão de crédito.`,
      },
      {
        question: 'O pagamento é seguro?',
        answer: 'Sim! Utilizamos plataformas de pagamento certificadas e criptografia SSL para garantir a segurança de todas as transações.',
      },
      {
        question: 'Posso cancelar meu pedido?',
        answer: 'Pedidos podem ser cancelados antes do início da produção. Após a produção iniciada, não é possível cancelar, pois os produtos são personalizados e feitos sob demanda.',
      },
    ],
  },
  {
    category: 'Produção e Personalização',
    questions: [
      {
        question: 'Qual o prazo de produção?',
        answer: `O prazo de produção é de ${storeInfo.productionTime}, contados a partir da aprovação do layout e confirmação do pagamento. Pedidos com maior volume podem ter prazos diferenciados.`,
      },
      {
        question: 'Em qual formato devo enviar minha arte/logo?',
        answer: 'Aceitamos arquivos nos formatos PNG, JPG, SVG, PDF e CDR. Para melhor qualidade, recomendamos arquivos vetoriais (SVG, PDF ou CDR) ou imagens em alta resolução (mínimo 300dpi).',
      },
      {
        question: 'Vocês fazem ajustes na arte?',
        answer: 'Sim! Nossa equipe de design pode fazer pequenos ajustes e adaptações na sua arte para melhor resultado no produto. Ajustes complexos podem ter custo adicional.',
      },
      {
        question: 'Como funciona a aprovação do layout?',
        answer: 'Após o pagamento, enviamos uma prévia digital do produto para sua aprovação via WhatsApp. Você pode solicitar ajustes antes de aprovar. Após a aprovação, não aceitamos alterações.',
      },
      {
        question: 'Quais materiais vocês trabalham?',
        answer: `Trabalhamos com ${storeInfo.customizationOptions.materials.join(', ')}. Cada material tem características específicas e indicações de uso que nossa equipe pode orientar.`,
      },
    ],
  },
  {
    category: 'Entrega e Frete',
    questions: [
      {
        question: 'Como funciona o frete?',
        answer: `O frete é calculado com base no CEP de entrega. Oferecemos frete grátis para pedidos acima de R$ ${storeInfo.freeShippingMinimum}. Enviamos para todo o Brasil via Correios ou transportadora.`,
      },
      {
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo de entrega varia de acordo com sua localização. Após a postagem, você receberá o código de rastreio para acompanhar o pedido. Capitais costumam receber em 3-7 dias úteis.',
      },
      {
        question: 'Vocês enviam para todo o Brasil?',
        answer: 'Sim! Enviamos para todos os estados brasileiros. O prazo e valor do frete variam de acordo com a região.',
      },
      {
        question: 'Meu produto chegou danificado, o que faço?',
        answer: 'Entre em contato conosco em até 7 dias após o recebimento, enviando fotos da embalagem e do produto. Analisaremos o caso e providenciaremos a reposição sem custo adicional.',
      },
    ],
  },
  {
    category: 'Garantia e Devoluções',
    questions: [
      {
        question: 'Os produtos têm garantia?',
        answer: `Sim! Oferecemos garantia de ${storeInfo.warranty} contra defeitos de fabricação. A garantia não cobre danos por mau uso, quedas ou exposição inadequada.`,
      },
      {
        question: 'Posso devolver um produto personalizado?',
        answer: 'Por serem produtos personalizados e feitos sob demanda, não aceitamos devoluções por arrependimento, conforme previsto no Código de Defesa do Consumidor. Trocas são aceitas apenas em caso de defeito de fabricação.',
      },
      {
        question: 'Como aciono a garantia?',
        answer: 'Entre em contato via WhatsApp com fotos do produto e descrição do problema. Nossa equipe analisará e, se confirmado defeito de fabricação, providenciaremos a reposição.',
      },
    ],
  },
  {
    category: 'Produtos Específicos',
    questions: [
      {
        question: 'O letreiro com LED gasta muita energia?',
        answer: 'Não! Nossos letreiros utilizam LED de baixo consumo, gastando em média 0,5W por letra. Você pode deixar ligado por horas sem impacto significativo na conta de luz.',
      },
      {
        question: 'O display de QR Code funciona em ambiente externo?',
        answer: 'Nossos displays são indicados para uso interno ou áreas cobertas. Para uso externo, recomendamos modelos específicos com proteção UV. Consulte nossa equipe.',
      },
      {
        question: 'Qual a diferença entre acrílico espelhado e acrílico comum?',
        answer: 'O acrílico espelhado tem uma camada refletiva que cria um efeito de espelho, perfeito para peças decorativas e detalhes sofisticados. O acrílico comum é transparente ou colorido sem reflexo.',
      },
      {
        question: 'Vocês fazem projetos sob medida?',
        answer: 'Sim! Desenvolvemos projetos personalizados para empresas e eventos. Entre em contato com nossa equipe para discutir suas necessidades e receber um orçamento especial.',
      },
    ],
  },
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
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
                  href={storeInfo.whatsappLink}
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

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default FAQPage;
