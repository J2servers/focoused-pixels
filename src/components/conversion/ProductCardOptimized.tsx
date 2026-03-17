/**
 * ProductCardOptimized - Card de produto com design neumorphism
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
        className="group flex flex-col h-full rounded-[20px] overflow-hidden transition-all duration-500"
        style={{
          background: 'linear-gradient(145deg, hsl(var(--surface-elevated)), hsl(var(--surface-inset)))',
          boxShadow: '-6px -6px 12px hsl(var(--neu-light) / 0.92), 8px 8px 16px hsl(var(--neu-dark) / 0.42), 0 0 0 1px hsl(var(--neon-primary) / 0.16)',
        }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden m-2 mb-0 rounded-2xl">
          {/* Badge */}
          {savings > 0 && product.inStock && (
            <span className="absolute top-2.5 left-2.5 z-10 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: 'hsl(var(--destructive) / 0.8)',
                color: 'hsl(var(--destructive-foreground))',
                boxShadow: '0 2px 6px hsl(var(--destructive) / 0.25)',
              }}
            >
              -{savings}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground px-4 py-1.5 rounded-full"
                style={{
                  background: 'hsl(var(--surface-elevated) / 0.9)',
                  boxShadow: '-3px -3px 6px hsl(var(--neu-light) / 0.85), 4px 4px 8px hsl(var(--neu-dark) / 0.30)',
                }}
              >Esgotado</span>
            </div>
          )}

          {/* Quick View on hover */}
          <button
            onClick={handleQuickView}
            className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
            style={{
              background: 'hsl(var(--surface-elevated) / 0.95)',
              boxShadow: '-2px -2px 4px hsl(var(--neu-light) / 0.85), 3px 3px 6px hsl(var(--neu-dark) / 0.35), 0 0 0 1px hsl(var(--neon-primary) / 0.16)',
            }}
          >
            <Eye className="h-4 w-4 text-foreground/70" />
          </button>

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out rounded-2xl"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 sm:p-4">
          {/* Rating - fixed height */}
          <div className="flex items-center gap-1.5 mb-1.5 h-4">
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

          {/* Name - fixed height */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 h-10 text-foreground/90 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Price - fixed height block */}
          <div className="mt-auto pt-2">
            <div className="h-4">
              {product.originalPrice ? (
                <span className="text-xs text-muted-foreground line-through block leading-none">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              ) : <div />}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-bold" style={{ color: 'hsl(var(--price-color))' }}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* CTA */}
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="w-full mt-3 font-semibold text-xs rounded-xl h-9"
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
