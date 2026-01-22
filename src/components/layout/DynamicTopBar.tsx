import { Instagram, Facebook, Youtube, Mail, Phone } from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

// Pinterest icon component since lucide doesn't have it
const PinterestIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44.22-.9 1.4-5.9 1.4-5.9s-.36-.7-.36-1.75c0-1.64.95-2.87 2.13-2.87 1 0 1.5.75 1.5 1.66 0 1.02-.65 2.54-.99 3.95-.28 1.18.6 2.14 1.77 2.14 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.07-4.88-5.02-4.88-3.42 0-5.43 2.57-5.43 5.22 0 1.04.4 2.15.9 2.75.1.12.11.22.08.34-.09.37-.3 1.18-.34 1.34-.05.22-.18.26-.41.16-1.5-.7-2.44-2.88-2.44-4.64 0-3.77 2.74-7.24 7.91-7.24 4.15 0 7.38 2.96 7.38 6.92 0 4.12-2.6 7.44-6.21 7.44-1.21 0-2.35-.63-2.74-1.38l-.75 2.85c-.27 1.04-.99 2.34-1.48 3.14A12 12 0 1 0 12 0z"/>
  </svg>
);

export function DynamicTopBar() {
  const { data: company } = useCompanyInfo();

  const freeShippingMessage = company?.free_shipping_message || 
    `Frete grátis em compras acima de R$ ${company?.free_shipping_minimum || 159}`;

  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Free Shipping Message */}
        <div className="flex items-center gap-2 font-medium">
          <span className="hidden sm:inline">🚚</span>
          <span>{freeShippingMessage}</span>
        </div>

        {/* Contact and Social */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {company?.email && (
              <a 
                href={`mailto:${company.email}`} 
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{company.email}</span>
              </a>
            )}
            {company?.phone && (
              <a 
                href={`tel:${company.phone.replace(/\D/g, '')}`} 
                className="flex items-center gap-1 hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </a>
            )}
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-2">
            {company?.social_instagram && (
              <a 
                href={company.social_instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {company?.social_facebook && (
              <a 
                href={company.social_facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors p-1"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {company?.social_youtube && (
              <a 
                href={company.social_youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors p-1"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {company?.social_pinterest && (
              <a 
                href={company.social_pinterest} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors p-1"
                aria-label="Pinterest"
              >
                <PinterestIcon />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
