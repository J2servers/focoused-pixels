import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { categories } from '@/data/products';
import logoPincelDeLuz from '@/assets/logo-pincel-de-luz.png';

export function DynamicFooter() {
  const { data: company } = useCompanyInfo();

  const footerLogo = company?.footer_logo || logoPincelDeLuz;

  const institutionalLinks = [
    { name: 'Sobre Nós', href: '/sobre' },
    { name: 'Política de Privacidade', href: '/privacidade' },
    { name: 'Termos de Uso', href: '/termos' },
    { name: 'Garantia', href: '/garantia' },
  ];

  const helpLinks = [
    { name: 'Trocas e Devoluções', href: '/trocas' },
    { name: 'Perguntas Frequentes', href: '/faq' },
    { name: 'Contato', href: '/contato' },
    { name: 'Rastreio', href: '/rastreio' },
    { name: 'Como Personalizar', href: '/como-personalizar' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Receba Ofertas Exclusivas</h3>
              <p className="text-primary-foreground/80">Cadastre-se e ganhe 10% de desconto na primeira compra</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <Input 
                type="email" 
                placeholder="Seu melhor email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-w-[250px]"
              />
              <Button variant="secondary">Cadastrar</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div className="lg:col-span-2">
            <img 
              src={footerLogo} 
              alt={company?.company_name || 'Logo'} 
              className="h-12 mb-4 object-contain"
            />
            <p className="text-muted-foreground text-sm mb-4">
              Especialistas em comunicação visual personalizada. Letreiros LED, displays QR Code, 
              crachás empresariais e muito mais em acrílico e MDF de alta qualidade.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {company?.social_instagram && (
                <a href={company.social_instagram} target="_blank" rel="noopener noreferrer" 
                   className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {company?.social_facebook && (
                <a href={company.social_facebook} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {company?.social_youtube && (
                <a href={company.social_youtube} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link to={`/categoria/${category.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-bold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm">
              {institutionalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              {company?.email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-primary" />
                  <a href={`mailto:${company.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {company.email}
                  </a>
                </li>
              )}
              {company?.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-primary" />
                  <a href={`tel:${company.phone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {company.phone}
                  </a>
                </li>
              )}
              {company?.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{company.address}</span>
                </li>
              )}
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <h5 className="font-medium text-sm mb-2">Formas de Pagamento</h5>
              <p className="text-xs text-muted-foreground">
                PIX, Boleto, Cartão de Crédito em até {company?.installments || 12}x, Cartão de Débito
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>{company?.copyright_text || `© ${new Date().getFullYear()} ${company?.company_name || 'Pincel de Luz Personalizados'}. Todos os direitos reservados.`}</p>
          {company?.cnpj && <p>CNPJ: {company.cnpj}</p>}
        </div>
      </div>
    </footer>
  );
}
