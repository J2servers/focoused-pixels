import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { storeInfo } from '@/data/store';
import { categories } from '@/data/products';

export function Footer() {
  return (
    <footer className="bg-muted mt-16">
      {/* Newsletter */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Receba nossas novidades por e-mail</h3>
              <p className="text-primary-foreground/80">Ofertas exclusivas e lançamentos em primeira mão</p>
            </div>
            <form className="flex w-full md:w-auto gap-2">
              <Input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="bg-primary-foreground text-foreground w-full md:w-80"
              />
              <Button variant="secondary" className="whitespace-nowrap font-semibold">
                Inscrever
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-primary">
              {storeInfo.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Especialistas em personalização a laser em acrílico e MDF. 
              Produtos únicos e exclusivos para você e sua empresa.
            </p>
            <div className="flex gap-3">
              <a 
                href={storeInfo.social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href={storeInfo.social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href={storeInfo.social.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-bold text-lg mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/categoria/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-bold text-lg mb-4">Institucional</h4>
            <ul className="space-y-2">
              {storeInfo.footerLinks.institutional.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {storeInfo.footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 text-primary" />
                <a href={`mailto:${storeInfo.email}`} className="hover:text-primary transition-colors">
                  {storeInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                <a href={`tel:${storeInfo.phone.replace(/\D/g, '')}`} className="hover:text-primary transition-colors">
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>{storeInfo.address.city}, {storeInfo.address.state}</span>
              </li>
            </ul>

            {/* Formas de Pagamento */}
            <div className="mt-6">
              <h5 className="font-semibold text-sm mb-2">Formas de Pagamento</h5>
              <div className="flex flex-wrap gap-2">
                {storeInfo.footerLinks.payment.map((method) => (
                  <span 
                    key={method}
                    className="text-xs bg-background px-2 py-1 rounded border border-border"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {storeInfo.name}. Todos os direitos reservados.</p>
            <p>CNPJ: {storeInfo.cnpj}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
