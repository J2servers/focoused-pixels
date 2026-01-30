/**
 * ProductCard - Card de exibição de produto
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > Layout):
 * - show_product_ratings: Exibir/ocultar estrelas de avaliação
 * - show_product_stock: Exibir quantidade em estoque
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, ShoppingCart, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: () => void;
}

export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { showProductRatings, showProductStock } = useSiteSettings();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
    onAddToCart?.();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewOpen(true);
  };

  const badgeVariants: Record<string, { label: string; className: string }> = {
    lancamento: { label: 'LANÇAMENTO', className: 'bg-primary text-primary-foreground' },
    desconto: { label: `ATÉ ${product.discount}% OFF`, className: 'bg-primary text-primary-foreground' },
    brinde: { label: 'COMPRE E GANHE', className: 'bg-accent text-accent-foreground' },
    esgotado: { label: 'ESGOTADO', className: 'bg-muted text-muted-foreground' },
  };

  const badge = product.badge ? badgeVariants[product.badge] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      >
        <Link 
          to={`/produto/${product.slug}`}
          className="group block bg-card rounded-lg border border-border shadow-product hover:shadow-product-hover transition-all duration-300"
        >
          <motion.div 
            className="relative aspect-square overflow-hidden rounded-t-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {badge && (
              <Badge className={`absolute top-3 left-3 z-10 ${badge.className} text-xs font-semibold`}>
                {badge.label}
              </Badge>
            )}
            
            {/* Quick View Button */}
            <motion.button
              onClick={handleQuickView}
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              className="absolute top-3 right-3 z-10 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </motion.button>

            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Low Stock Indicator */}
            {product.inStock && showProductStock && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Poucas unidades
                </div>
              </div>
            )}
          </motion.div>

          <div className="p-4">
            {/* Rating - Controlled by show_product_ratings setting */}
            {showProductRatings && (
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
              </div>
            )}

            {/* Name */}
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Stock - Controlled by show_product_stock setting */}
            {showProductStock && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Package className="h-3 w-3" />
                <span>{product.inStock ? 'Em estoque' : 'Sem estoque'}</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-3">
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              {product.freeShipping && (
                <motion.div 
                  className="flex items-center gap-1 text-xs text-success mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Truck className="h-3 w-3" />
                  <span>Frete grátis</span>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button className="w-full font-semibold" disabled={!product.inStock}>
                {product.inStock ? 'COMPRAR' : 'INDISPONÍVEL'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                ADICIONAR AO CARRINHO
              </Button>
            </div>
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
