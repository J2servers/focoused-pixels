/**
 * ProductCard - Card de exibição de produto
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > Layout):
 * - show_product_ratings: Exibir/ocultar estrelas de avaliação
 * - show_product_stock: Exibir quantidade em estoque
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, ShoppingCart, Package, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { WishlistButton } from '@/components/product/WishlistButton';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  index?: number;
  onAddToCart?: () => void;
}

export function ProductCard({ product, index = 0, onAddToCart }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { showProductRatings, showProductStock } = useSiteSettings();
  const navigate = useNavigate();

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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    sessionStorage.setItem('pending_payment', JSON.stringify({
      orderId: `quick-${Date.now()}`,
      amount: product.price,
      customerName: '',
      customerEmail: '',
      customerCpf: '',
      customerPhone: '',
      description: product.name,
      cartItems: [{ name: product.name, quantity: 1, price: product.price }],
    }));
    navigate('/pagamento');
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
        className="h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      >
        <Link
          to={`/produto/${product.slug}`}
          className="group flex h-full flex-col rounded-lg border border-border bg-card shadow-product transition-all duration-300 hover:shadow-product-hover"
        >
          <motion.div
            className="relative aspect-square overflow-hidden rounded-t-lg flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {badge && (
              <Badge className={`absolute top-3 left-3 z-10 ${badge.className} text-xs font-semibold`}>
                {badge.label}
              </Badge>
            )}

            <motion.button
              onClick={handleQuickView}
              initial={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              className="absolute top-3 right-3 z-10 rounded-full bg-background/90 p-2 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              <Eye className="h-4 w-4" />
            </motion.button>

            <div className="absolute top-3 right-14 z-10 opacity-0 transition-opacity group-hover:opacity-100 bg-background/90 rounded-full shadow-lg">
              <WishlistButton product={{ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }} size="sm" />
            </div>

            <motion.img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />

            {product.inStock && showProductStock && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Poucas unidades
                </div>
              </div>
            )}
          </motion.div>

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 h-5">
              {showProductRatings && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">({product.reviews})</span>
                </div>
              )}
            </div>

            <h3 className="mb-2 h-10 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">
              {product.name}
            </h3>

            <div className="mb-2 h-4">
              {showProductStock && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span>{product.inStock ? 'Em estoque' : 'Sem estoque'}</span>
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="h-5">
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="mt-1 h-4">
                {product.freeShipping && (
                  <motion.div
                    className="flex items-center gap-1 text-xs text-success"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Truck className="h-3 w-3" />
                    <span>Frete grátis</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <Button className="h-10 w-full font-semibold" disabled={!product.inStock}>
                {product.inStock ? 'COMPRAR' : 'INDISPONÍVEL'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full px-2 text-xs"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                <span className="ml-1 truncate">ADICIONAR</span>
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
