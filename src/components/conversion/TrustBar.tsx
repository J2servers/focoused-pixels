/**
 * TrustBar - Barra de confiança neumorphism premium
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
    <div className="py-2.5 overflow-hidden" style={{
      background: 'hsl(var(--surface-inset))',
      boxShadow: 'inset -3px -3px 6px hsl(var(--neu-light) / 0.85), inset 3px 3px 8px hsl(var(--neu-dark) / 0.20), 0 0 0 1px hsl(var(--neon-primary) / 0.08)',
    }}>
      <div className="container mx-auto px-4">
        {/* Mobile: scrolling */}
        <div className="block md:hidden overflow-hidden">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {[...items, ...items].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="text-primary">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: static */}
        <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="text-primary">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
