/**
 * ProductCardOptimized - Card de produto com design moderno e limpo
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
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

  const savings = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <>
      <Link 
        to={`/produto/${product.slug}`}
        className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {/* Badge */}
          {savings > 0 && product.inStock && (
            <Badge className="absolute top-2.5 left-2.5 z-10 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-md">
              -{savings}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-4 py-1.5 rounded-full">Esgotado</span>
            </div>
          )}

          {/* Quick View on hover */}
          <button
            onClick={handleQuickView}
            className="absolute top-2.5 right-2.5 z-10 bg-card/90 backdrop-blur-sm hover:bg-card p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
          >
            <Eye className="h-4 w-4 text-foreground/70" />
          </button>

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 sm:p-4">
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-accent text-accent'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Name */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-auto text-foreground/90 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-3 space-y-0.5">
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through block">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold text-foreground">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="w-full mt-3 font-semibold text-xs rounded-lg h-9"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            {product.inStock ? 'Adicionar' : 'Indisponível'}
          </Button>
        </div>
      </Link>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}
