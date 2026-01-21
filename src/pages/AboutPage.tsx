import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Card, CardContent } from '@/components/ui/card';
import { storeInfo } from '@/data/store';
import { Target, Eye, Heart, Award, Users, Lightbulb } from 'lucide-react';
import logo from '@/assets/logo-goat.png';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <img src={logo} alt={storeInfo.fullName} className="h-20 md:h-28 mx-auto mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Sobre a {storeInfo.fullName}
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Transformando ideias em peças únicas de comunicação visual desde 2018
            </p>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Nossa História</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-4">
                  A <strong className="text-foreground">{storeInfo.fullName}</strong> nasceu da paixão por transformar 
                  ambientes e criar peças que contam histórias. Fundada em 2018, começamos como uma pequena oficina 
                  especializada em corte a laser e, ao longo dos anos, nos tornamos referência em comunicação visual 
                  personalizada no Brasil.
                </p>
                <p className="mb-4">
                  Nossa jornada começou com a missão de democratizar o acesso a produtos personalizados de alta 
                  qualidade. Acreditamos que cada cliente merece ter peças únicas que reflitam sua personalidade, 
                  sua marca ou momentos especiais da vida.
                </p>
                <p>
                  Hoje, contamos com uma equipe altamente qualificada e equipamentos de última geração para 
                  entregar produtos que superam expectativas. Cada peça que produzimos carrega nosso compromisso 
                  com a excelência e atenção aos detalhes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Missão, Visão, Valores */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Missão</h3>
                  <p className="text-muted-foreground">
                    Criar produtos personalizados que transformem ambientes e fortaleçam marcas, 
                    entregando qualidade, inovação e atendimento excepcional a cada cliente.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Visão</h3>
                  <p className="text-muted-foreground">
                    Ser a empresa líder em comunicação visual personalizada no Brasil, reconhecida 
                    pela qualidade, criatividade e excelência em cada projeto.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Valores</h3>
                  <p className="text-muted-foreground">
                    Qualidade sem concessões, inovação constante, respeito ao cliente, 
                    sustentabilidade e compromisso com prazos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Por que escolher a GOAT?</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Qualidade Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Materiais selecionados e acabamento impecável em cada peça
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Personalização Total</h3>
                <p className="text-sm text-muted-foreground">
                  Criamos exatamente o que você imagina, do jeito que você precisa
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Atendimento Humanizado</h3>
                <p className="text-sm text-muted-foreground">
                  Equipe dedicada para acompanhar seu pedido do início ao fim
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Entrega Garantida</h3>
                <p className="text-sm text-muted-foreground">
                  Produção em {storeInfo.productionTime} e envio para todo Brasil
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Números */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-2">5+</p>
                <p className="opacity-80">Anos de experiência</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-2">10k+</p>
                <p className="opacity-80">Clientes satisfeitos</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-2">50k+</p>
                <p className="opacity-80">Produtos entregues</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold mb-2">4.9</p>
                <p className="opacity-80">Avaliação média</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Tem alguma dúvida ou quer fazer um orçamento especial? 
              Nossa equipe está pronta para ajudar!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={storeInfo.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-success text-success-foreground rounded-lg font-semibold hover:bg-success/90 transition-colors"
              >
                Falar no WhatsApp
              </a>
              <a
                href={`mailto:${storeInfo.email}`}
                className="inline-flex items-center justify-center px-8 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                {storeInfo.email}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default AboutPage;
