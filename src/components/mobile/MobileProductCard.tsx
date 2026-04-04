import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        <div className="relative rounded-2xl overflow-hidden neu-raised transition-all duration-300 active:scale-[0.98] h-full flex flex-col">
          {/* Image - fixed aspect ratio */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl flex-shrink-0">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.badge === 'lancamento' && (
                <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-xl">
                  DESTAQUE
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-xl">
                  -{discountPercent}%
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-xl">
                  ESGOTADO
                </Badge>
              )}
            </div>

            {/* Quick Add Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="absolute bottom-2 right-2"
            >
              <Button
                size="icon"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="h-9 w-9 rounded-xl shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Content - fixed heights for uniformity */}
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="font-medium text-xs text-foreground line-clamp-2 h-8 leading-tight">
              {product.name}
            </h3>
            
            {/* Price - fixed height block */}
            <div className="mt-auto pt-1.5">
              <div className="h-4">
                {hasDiscount && product.originalPrice ? (
                  <p className="text-[10px] text-muted-foreground line-through leading-none">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                ) : <div />}
              </div>
              <p className="text-base font-bold text-primary leading-tight">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Free Shipping Badge */}
            <div className="h-5 mt-1.5">
              {product.freeShipping && (
                <div className="flex items-center gap-1 text-success">
                  <Truck className="h-3 w-3" />
                  <span className="text-[10px] font-medium">Frete Grátis</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

