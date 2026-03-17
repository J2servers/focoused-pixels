import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="h-full"
    >
      <Link
        to={`/produto/${product.slug}`}
        className="block group h-full"
      >
        <div
          className="relative rounded-[20px] overflow-hidden transition-all duration-300 active:scale-[0.98] h-full flex flex-col"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--surface-elevated)), hsl(var(--surface-inset)))',
            boxShadow: '-6px -6px 12px hsl(var(--neu-light) / 0.92), 8px 8px 16px hsl(var(--neu-dark) / 0.42), 0 0 0 1px hsl(var(--neon-primary) / 0.16)',
          }}
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-[20px] m-2 mb-0 rounded-b-2xl flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
              loading="lazy"
            />
            
            {/* Badges — soft style */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.badge === 'lancamento' && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{
                  background: 'hsl(var(--primary) / 0.85)',
                  color: 'hsl(var(--primary-foreground))',
                  boxShadow: '0 2px 6px hsl(var(--primary) / 0.3)',
                }}>
                  Destaque
                </span>
              )}
              {hasDiscount && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: 'hsl(var(--destructive) / 0.8)',
                  color: 'hsl(var(--destructive-foreground))',
                  boxShadow: '0 2px 6px hsl(var(--destructive) / 0.25)',
                }}>
                  -{discountPercent}%
                </span>
              )}
              {!product.inStock && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                  background: 'hsl(var(--muted) / 0.9)',
                  color: 'hsl(var(--muted-foreground))',
                }}>
                  Esgotado
                </span>
              )}
            </div>

            {/* Add to Cart — soft elevated button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="absolute bottom-2 right-2 w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{
                background: 'hsl(var(--surface-elevated) / 0.95)',
                boxShadow: '-2px -2px 4px hsl(var(--neu-light) / 0.85), 3px 3px 6px hsl(var(--neu-dark) / 0.35), 0 0 0 1px hsl(var(--neon-primary) / 0.22)',
                color: 'hsl(var(--primary))',
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-3 pt-2 flex flex-col flex-grow">
            <h3 className="font-semibold text-xs line-clamp-2 h-8 leading-tight" style={{
              color: 'hsl(var(--heading-color))',
            }}>
              {product.name}
            </h3>
            
            {/* Price */}
            <div className="mt-auto pt-1.5">
              <div className="h-4">
                {hasDiscount && product.originalPrice ? (
                  <p className="text-[10px] text-muted-foreground line-through leading-none">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                ) : <div />}
              </div>
              <p className="text-base font-bold leading-tight" style={{
                color: 'hsl(var(--price-color))',
              }}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Free Shipping */}
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
    </motion.div>
  );
}
