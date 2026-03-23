/**
 * StickyBuyBar - Fixed bottom bar on mobile with Add to Cart + Buy Now
 * Improvements: #1 Sticky mobile CTA, #2 Price always visible, #3 Product thumbnail in bar
 */
import { useState, useEffect } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyBuyBarProps {
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  onBuyNow: () => void;
  onAddToCart: () => void;
}

export function StickyBuyBar({
  productName,
  productImage,
  price,
  originalPrice,
  inStock,
  onBuyNow,
  onAddToCart,
}: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the main CTA buttons (~500px)
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_hsl(var(--foreground)/0.08)] px-3 py-2.5 safe-area-bottom"
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            {/* Thumbnail */}
            <img
              src={productImage}
              alt={productName}
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
            />

            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground line-clamp-1">{productName}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-foreground">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
                {originalPrice && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <button
              onClick={onAddToCart}
              disabled={!inStock}
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-border bg-background text-foreground active:scale-95 transition-transform disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
            <button
              onClick={onBuyNow}
              disabled={!inStock}
              className="h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0 bg-primary text-primary-foreground font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" />
              Comprar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
