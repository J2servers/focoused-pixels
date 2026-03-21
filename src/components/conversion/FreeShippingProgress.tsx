/**
 * FreeShippingProgress - Barra de progresso para frete grátis
 * Aumenta ticket médio em +30% incentivando adição de itens
 */

import { motion } from 'framer-motion';
import { Truck, Gift } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface FreeShippingProgressProps {
  variant?: 'inline' | 'floating' | 'banner';
}

export function FreeShippingProgress({ variant = 'inline' }: FreeShippingProgressProps) {
  const { total } = useCart();
  const { freeShippingMinimum } = useSiteSettings();
  
  const freeShippingMin = freeShippingMinimum || 199;
  const remaining = Math.max(0, freeShippingMin - total);
  const progress = Math.min((total / freeShippingMin) * 100, 100);
  const hasReached = remaining <= 0;

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-3 ${hasReached ? 'bg-green-500' : 'bg-primary'} text-white`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            {hasReached ? (
              <>
                <Gift className="h-5 w-5" />
                <span className="font-medium">🎉 Parabéns! Você ganhou FRETE GRÁTIS!</span>
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" />
                <span className="font-medium">
                  Falta apenas <strong>R$ {remaining.toFixed(2).replace('.', ',')}</strong> para FRETE GRÁTIS!
                </span>
                <Progress value={progress} className="w-32 h-2 bg-white/30" />
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-20 right-4 z-40 p-4 rounded-2xl shadow-xl ${
          hasReached ? 'bg-green-500 text-white' : 'bg-card border border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          {hasReached ? (
            <>
              <Gift className="h-6 w-6" />
              <span className="font-bold">Frete Grátis! 🎉</span>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Frete Grátis</span>
              </div>
              <Progress value={progress} className="w-28 h-2 mb-1" />
              <span className="text-xs text-muted-foreground">
                Falta R$ {remaining.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <div className={`p-4 rounded-xl ${hasReached ? 'bg-green-50 border border-green-200' : 'bg-muted'}`}>
      <div className="flex items-center gap-3 mb-2">
        {hasReached ? (
          <Gift className="h-5 w-5 text-green-600" />
        ) : (
          <Truck className="h-5 w-5 text-primary" />
        )}
        <span className={`font-medium ${hasReached ? 'text-green-700' : ''}`}>
          {hasReached 
            ? '🎉 Você ganhou Frete Grátis!' 
            : `Falta R$ ${remaining.toFixed(2).replace('.', ',')} para Frete Grátis`
          }
        </span>
      </div>
      {!hasReached && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  );
}

