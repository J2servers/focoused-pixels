import { Link } from 'react-router-dom';

import { ShoppingCart, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  badge?: string;
  freeShipping?: boolean;
  inStock?: boolean;
}

interface MobileProductCardProps {
  product: Product;
  index?: number;
}

export function MobileProductCard({ product, index = 0 }: MobileProductCardProps) {
  const { addItem } = useCart();
  
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    
    toast.success('Produto adicionado ao carrinho!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  return (
    <div className="h-full">
      <Link
        to={`/produto/${product.slug}`}
        className="block group h-full"
      >
        <div className="relative rounded-lg transition-all duration-200 active:scale-[0.98] h-full flex flex-col" style={{ boxShadow: '0 1px 3px hsl(var(--neu-dark) / 0.1)', border: '0.4px solid hsl(270 80% 60% / 0.2)' }}>
          {/* Image */}
          <div className="relative aspect-[4/4] overflow-hidden rounded-t-lg m-[0.5px] mb-0 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            
            {/* Badges */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-0.5">
              {product.badge === 'lancamento' && (
                <Badge className="bg-accent text-accent-foreground text-[8px] px-1 py-0 rounded-lg leading-tight">
                  DESTAQUE
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground text-[8px] px-1 py-0 rounded-lg animate-pulse">
                  -{discountPercent}%
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="secondary" className="text-[8px] px-1 py-0 rounded-lg">
                  ESGOTADO
                </Badge>
              )}
            </div>

            {/* Quick Add Button */}
            <div className="absolute bottom-1 right-1">
              <Button
                size="icon"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="h-6 w-6 rounded-md shadow-sm"
              >
                <ShoppingCart className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-1.5 flex flex-col flex-grow mx-[0.5px] mb-[0.5px]">
            <h3 className="font-medium text-[9px] text-foreground line-clamp-2 leading-tight min-h-[20px]">
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="mt-auto pt-1">
              <div className="h-3">
                {hasDiscount && product.originalPrice ? (
                  <p className="text-[8px] text-muted-foreground line-through leading-none">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                ) : <div />}
              </div>
              <p className="text-xs font-bold text-primary leading-tight">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-[8px] text-muted-foreground mt-0.5">
                ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Free Shipping Badge */}
            <div className="h-4 mt-1">
              {product.freeShipping && (
                <div className="flex items-center gap-0.5 text-success">
                  <Truck className="h-2.5 w-2.5" />
                  <span className="text-[8px] font-medium">Frete Grátis</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

