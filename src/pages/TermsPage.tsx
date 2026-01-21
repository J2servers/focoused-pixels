import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { storeInfo } from '@/data/store';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Termos de Uso</h1>
            <p className="text-muted-foreground mb-8">
              Última atualização: Janeiro de 2024
            </p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">1. Aceitação dos Termos</h2>
                <p className="text-muted-foreground">
                  Ao acessar e utilizar o site da <strong className="text-foreground">{storeInfo.fullName}</strong>, 
                  você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com 
                  qualquer parte destes termos, não deverá utilizar nosso site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">2. Produtos e Serviços</h2>
                <p className="text-muted-foreground mb-4">
                  2.1. Todos os produtos oferecidos são personalizáveis e produzidos sob demanda.
                </p>
                <p className="text-muted-foreground mb-4">
                  2.2. As imagens dos produtos são ilustrativas e podem apresentar pequenas variações 
                  de cor devido às configurações de monitor.
                </p>
                <p className="text-muted-foreground mb-4">
                  2.3. As medidas informadas podem ter variação de até 2mm devido ao processo de fabricação.
                </p>
                <p className="text-muted-foreground">
                  2.4. O prazo de produção é de {storeInfo.productionTime}, contados a partir da aprovação 
                  do layout e confirmação do pagamento.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">3. Pedidos e Pagamento</h2>
                <p className="text-muted-foreground mb-4">
                  3.1. Ao realizar um pedido, você garante que todas as informações fornecidas são verdadeiras e completas.
                </p>
                <p className="text-muted-foreground mb-4">
                  3.2. O pedido só será confirmado após a aprovação do pagamento.
                </p>
                <p className="text-muted-foreground mb-4">
                  3.3. Aceitamos as seguintes formas de pagamento: {storeInfo.footerLinks.payment.join(', ')}.
                </p>
                <p className="text-muted-foreground">
                  3.4. Reservamo-nos o direito de cancelar pedidos em caso de suspeita de fraude.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">4. Personalização e Arquivos</h2>
                <p className="text-muted-foreground mb-4">
                  4.1. Você é responsável por fornecer arquivos de qualidade adequada para a produção.
                </p>
                <p className="text-muted-foreground mb-4">
                  4.2. Não produzimos materiais que violem direitos autorais, marcas registradas ou 
                  contenham conteúdo ilegal, ofensivo ou discriminatório.
                </p>
                <p className="text-muted-foreground mb-4">
                  4.3. A aprovação do layout é de responsabilidade do cliente. Após aprovação, não 
                  aceitamos reclamações sobre erros de texto, cores ou design.
                </p>
                <p className="text-muted-foreground">
                  4.4. Arquivos enviados são armazenados de forma segura e utilizados exclusivamente 
                  para a produção do pedido.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">5. Entrega</h2>
                <p className="text-muted-foreground mb-4">
                  5.1. O prazo de entrega varia de acordo com a localidade e método de envio escolhido.
                </p>
                <p className="text-muted-foreground mb-4">
                  5.2. O frete grátis é válido para pedidos acima de R$ {storeInfo.freeShippingMinimum} 
                  (consulte condições).
                </p>
                <p className="text-muted-foreground mb-4">
                  5.3. Não nos responsabilizamos por atrasos causados pelos Correios ou transportadoras.
                </p>
                <p className="text-muted-foreground">
                  5.4. É responsabilidade do cliente fornecer endereço correto e completo para entrega.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">6. Garantia</h2>
                <p className="text-muted-foreground mb-4">
                  6.1. Oferecemos garantia de {storeInfo.warranty} contra defeitos de fabricação.
                </p>
                <p className="text-muted-foreground mb-4">
                  6.2. A garantia não cobre danos causados por mau uso, quedas, exposição inadequada 
                  a sol/água ou alterações feitas no produto.
                </p>
                <p className="text-muted-foreground">
                  6.3. Para acionar a garantia, entre em contato conosco com fotos do produto e 
                  descrição do problema.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">7. Trocas e Devoluções</h2>
                <p className="text-muted-foreground mb-4">
                  7.1. Por serem produtos personalizados, não aceitamos devoluções por arrependimento 
                  (conforme art. 49, §4º do CDC).
                </p>
                <p className="text-muted-foreground mb-4">
                  7.2. Trocas são aceitas apenas em caso de defeito de fabricação, mediante análise.
                </p>
                <p className="text-muted-foreground">
                  7.3. Produtos danificados durante o transporte devem ser reportados em até 7 dias 
                  após o recebimento, com fotos da embalagem e do produto.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">8. Propriedade Intelectual</h2>
                <p className="text-muted-foreground mb-4">
                  8.1. Todo o conteúdo do site (textos, imagens, logos, design) é propriedade da 
                  {storeInfo.fullName} e está protegido por leis de propriedade intelectual.
                </p>
                <p className="text-muted-foreground">
                  8.2. É proibida a reprodução, distribuição ou uso não autorizado do conteúdo do site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">9. Limitação de Responsabilidade</h2>
                <p className="text-muted-foreground">
                  A {storeInfo.fullName} não se responsabiliza por danos indiretos, incidentais ou 
                  consequenciais decorrentes do uso ou impossibilidade de uso de nossos produtos ou serviços.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">10. Alterações nos Termos</h2>
                <p className="text-muted-foreground">
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. 
                  Alterações entram em vigor imediatamente após publicação no site. O uso continuado 
                  do site após alterações constitui aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">11. Lei Aplicável</h2>
                <p className="text-muted-foreground">
                  Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                  Fica eleito o foro da comarca de {storeInfo.address.city}/{storeInfo.address.state} 
                  para dirimir quaisquer questões.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">12. Contato</h2>
                <p className="text-muted-foreground">
                  Dúvidas sobre estes Termos de Uso podem ser enviadas para:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground font-medium">{storeInfo.fullName}</p>
                  <p className="text-muted-foreground">E-mail: {storeInfo.email}</p>
                  <p className="text-muted-foreground">WhatsApp: {storeInfo.phone}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default TermsPage;
