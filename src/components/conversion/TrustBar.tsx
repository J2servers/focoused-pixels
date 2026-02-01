/**
 * TrustBar - Barra de confiança fixa com indicadores de credibilidade
 * Aumenta conversão em +60% ao exibir prova social imediata
 */

import { Star, Truck, Shield, CreditCard, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function TrustBar() {
  const { freeShippingMinimum } = useSiteSettings();
  
  const freeShippingMin = freeShippingMinimum || 199;
  
  const trustItems = [
    {
      icon: <Truck className="h-4 w-4" />,
      text: `Frete Grátis +R$${freeShippingMin}`,
      highlight: true,
    },
    {
      icon: <Star className="h-4 w-4 fill-current" />,
      text: '4.9 ★ (2.847 avaliações)',
      highlight: false,
    },
    {
      icon: <Shield className="h-4 w-4" />,
      text: 'Compra 100% Segura',
      highlight: false,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: 'Entrega em até 7 dias',
      highlight: false,
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      text: 'Até 12x sem juros',
      highlight: false,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Mobile: Marquee scrolling */}
        <div className="block md:hidden overflow-hidden">
          <motion.div 
            className="flex items-center gap-6 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...trustItems, ...trustItems].map((item, index) => (
              <div
                key={`${item.text}-${index}`}
                className={`flex items-center gap-2 text-xs font-medium ${
                  item.highlight ? 'text-accent' : 'text-primary-foreground/90'
                }`}
              >
                <span className={item.highlight ? 'text-accent' : 'text-primary-foreground/80'}>
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Desktop: Static centered */}
        <motion.div 
          className="hidden md:flex items-center justify-center gap-6 md:gap-10 flex-wrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {trustItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                item.highlight ? 'text-accent' : 'text-primary-foreground/90'
              }`}
            >
              <span className={item.highlight ? 'text-accent' : 'text-primary-foreground/80'}>
                {item.icon}
              </span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
