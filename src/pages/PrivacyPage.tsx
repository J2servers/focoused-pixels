import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { storeInfo } from '@/data/store';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground mb-8">
              Última atualização: Janeiro de 2024
            </p>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">1. Introdução</h2>
                <p className="text-muted-foreground">
                  A <strong className="text-foreground">{storeInfo.fullName}</strong> está comprometida em proteger 
                  a privacidade dos visitantes do nosso site e clientes. Esta Política de Privacidade descreve como 
                  coletamos, usamos, armazenamos e protegemos suas informações pessoais.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">2. Informações que Coletamos</h2>
                <p className="text-muted-foreground mb-4">Podemos coletar os seguintes tipos de informações:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Informações de contato:</strong> nome, e-mail, telefone, endereço</li>
                  <li><strong className="text-foreground">Informações de pagamento:</strong> dados de cartão de crédito (processados por terceiros seguros)</li>
                  <li><strong className="text-foreground">Informações de navegação:</strong> páginas visitadas, tempo de permanência, IP</li>
                  <li><strong className="text-foreground">Informações de pedidos:</strong> histórico de compras, preferências</li>
                  <li><strong className="text-foreground">Arquivos enviados:</strong> logos e artes para personalização</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">3. Como Usamos suas Informações</h2>
                <p className="text-muted-foreground mb-4">Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Processar e entregar seus pedidos</li>
                  <li>Comunicar sobre status de pedidos e atualizações</li>
                  <li>Enviar informações sobre produtos e promoções (com seu consentimento)</li>
                  <li>Melhorar nossos produtos e serviços</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">4. Compartilhamento de Informações</h2>
                <p className="text-muted-foreground mb-4">
                  Não vendemos suas informações pessoais. Podemos compartilhar dados apenas com:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Transportadoras:</strong> para entrega dos produtos</li>
                  <li><strong className="text-foreground">Processadores de pagamento:</strong> para processar transações</li>
                  <li><strong className="text-foreground">Autoridades:</strong> quando exigido por lei</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">5. Cookies</h2>
                <p className="text-muted-foreground">
                  Utilizamos cookies para melhorar sua experiência de navegação, lembrar suas preferências e 
                  analisar o tráfego do site. Você pode configurar seu navegador para recusar cookies, mas 
                  isso pode afetar algumas funcionalidades do site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">6. Segurança</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações 
                  contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia 
                  SSL para proteger dados transmitidos pelo site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">7. Seus Direitos (LGPD)</h2>
                <p className="text-muted-foreground mb-4">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Confirmar a existência de tratamento de dados</li>
                  <li>Acessar seus dados</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li>Solicitar a exclusão de dados</li>
                  <li>Revogar consentimento</li>
                  <li>Portabilidade dos dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">8. Retenção de Dados</h2>
                <p className="text-muted-foreground">
                  Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas 
                  nesta política, a menos que um período de retenção maior seja exigido por lei 
                  (por exemplo, para fins fiscais ou contábeis).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">9. Alterações nesta Política</h2>
                <p className="text-muted-foreground">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                  mudanças significativas por e-mail ou aviso em nosso site. A data da última atualização 
                  está indicada no início deste documento.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4 text-foreground">10. Contato</h2>
                <p className="text-muted-foreground">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos, 
                  entre em contato conosco:
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground font-medium">{storeInfo.fullName}</p>
                  <p className="text-muted-foreground">E-mail: {storeInfo.email}</p>
                  <p className="text-muted-foreground">Telefone: {storeInfo.phone}</p>
                  <p className="text-muted-foreground">
                    Endereço: {storeInfo.address.street}, {storeInfo.address.neighborhood} - {storeInfo.address.city}/{storeInfo.address.state}
                  </p>
                  <p className="text-muted-foreground">CNPJ: {storeInfo.cnpj}</p>
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

export default PrivacyPage;
