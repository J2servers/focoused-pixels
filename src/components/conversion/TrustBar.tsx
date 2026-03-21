/**
 * TrustBar - Barra de confiança neumorphism
 */

import { Truck, Star, Shield, Clock, CreditCard } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function TrustBar() {
  const { freeShippingMinimum } = useSiteSettings();
  const freeShippingMin = freeShippingMinimum || 199;

  const items = [
    { icon: <Truck className="h-3.5 w-3.5" />, text: `Frete Grátis +R$${freeShippingMin}` },
    { icon: <Star className="h-3.5 w-3.5 fill-current" />, text: '4.9 ★ (2.847 avaliações)' },
    { icon: <Shield className="h-3.5 w-3.5" />, text: 'Compra 100% Segura' },
    { icon: <Clock className="h-3.5 w-3.5" />, text: 'Entrega em até 7 dias' },
    { icon: <CreditCard className="h-3.5 w-3.5" />, text: 'Até 12x sem juros' },
  ];

  return (
    <div className="bg-foreground text-background py-2.5 overflow-hidden neu-sm">
      <div className="container mx-auto px-4">
        {/* Mobile: scrolling */}
        <div className="block md:hidden overflow-hidden">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {[...items, ...items].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium opacity-90">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: static */}
        <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-1.5 text-xs font-medium opacity-90">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

