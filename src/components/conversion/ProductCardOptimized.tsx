/**
 * ProductCardOptimized - Card de produto otimizado para conversão
 * Design simplificado com 1 CTA forte, badges de urgência e economia destacada
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Flame, Zap, Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';

interface ProductCardOptimizedProps {
  product: Product;
  index?: number;
  onAddToCart?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCardOptimized({ 
  product, 
  index = 0, 
  onAddToCart,
  variant = 'default'
}: ProductCardOptimizedProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success('Adicionado ao carrinho!', {
      action: {
        label: 'Ver carrinho',
        onClick: () => window.location.href = '/carrinho',
      },
    });
    onAddToCart?.();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Calculate savings
  const savings = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  // Dynamic badges
  const getBadge = () => {
    if (!product.inStock) {
      return { icon: null, label: 'ESGOTADO', className: 'bg-muted text-muted-foreground' };
    }
    if (savings >= 20) {
      return { icon: <Flame className="h-3 w-3" />, label: `-${savings}%`, className: 'bg-destructive text-destructive-foreground' };
    }
    if (product.badge === 'lancamento') {
      return { icon: <Zap className="h-3 w-3" />, label: 'NOVO', className: 'bg-primary text-primary-foreground' };
    }
    if (product.badge === 'brinde') {
      return { icon: <TrendingUp className="h-3 w-3" />, label: 'POPULAR', className: 'bg-accent text-accent-foreground' };
    }
    return null;
  };

  const badge = getBadge();

  // Fake stock count for urgency (random between 3-12)
  const fakeStock = Math.floor(Math.random() * 10) + 3;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
        className="h-full"
      >
        <Link 
          to={`/produto/${product.slug}`}
          className="group flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300"
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            {/* Badge */}
            {badge && (
              <Badge className={`absolute top-3 left-3 z-10 ${badge.className} text-xs font-bold px-2 py-1 flex items-center gap-1`}>
                {badge.icon}
                {badge.label}
              </Badge>
            )}

            {/* Quick View */}
            <motion.button
              onClick={handleQuickView}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-3 right-3 z-10 bg-background/90 hover:bg-background p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
            >
              <Eye className="h-4 w-4" />
            </motion.button>

            {/* Product Image */}
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />

            {/* Urgency indicator */}
            {product.inStock && fakeStock <= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3"
              >
                <div className="flex items-center gap-2 text-white text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  Apenas {fakeStock} em estoque!
                </div>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-4">
            {/* Rating - Compact */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-sm line-clamp-2 mb-3 group-hover:text-primary transition-colors flex-1">
              {product.name}
            </h3>

            {/* Price Section - Emphasis on savings */}
            <div className="mb-4">
              {product.originalPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs font-bold">
                    Economize R$ {(product.originalPrice - product.price).toFixed(2).replace('.', ',')}
                  </Badge>
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
            </div>

            {/* Single Strong CTA */}
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full font-bold text-xs sm:text-sm py-4 sm:py-5 rounded-xl bg-primary hover:bg-primary/90 group/btn px-2 sm:px-4"
            >
              <ShoppingCart className="h-4 w-4 flex-shrink-0 group-hover/btn:scale-110 transition-transform" />
              <span className="ml-1.5 sm:ml-2 truncate">
                {product.inStock ? 'COMPRAR' : 'INDISPONÍVEL'}
              </span>
            </Button>
          </div>
        </Link>
      </motion.div>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
