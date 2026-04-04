/**
 * ProductCardOptimized - Card de produto com design neumorphism
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Eye, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { QuickViewModal } from '@/components/storefront/QuickViewModal';
import { WishlistButton } from '@/components/product/WishlistButton';
import { useActivePromotions } from '@/hooks/usePromotions';
import { PromotionCountdown } from './PromotionCountdown';

interface ProductCardOptimizedProps {
  product: Product;
  index?: number;
  onAddToCart?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  highlightBadge?: string;
}

export function ProductCardOptimized({ 
  product, 
  index = 0, 
  onAddToCart,
  variant = 'default',
  highlightBadge
}: ProductCardOptimizedProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { data: promotions = [] } = useActivePromotions();
  const navigate = useNavigate();
  const categoryId = (product as { categoryId?: string }).categoryId;

  const activePromotion = useMemo(() => {
    return promotions.find((promo) => {
      if (promo.rule === 'general') return true;
      if (promo.rule === 'product') return promo.product_ids?.includes(product.id);
      if (promo.rule === 'category') {
        return Boolean(
          promo.category_ids?.includes(product.category) ||
            (categoryId && promo.category_ids?.includes(categoryId))
        );
      }
      return false;
    });
  }, [categoryId, product.category, product.id, promotions]);

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

  const savings = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <>
      <Link 
        to={`/produto/${product.slug}`}
        className="group flex flex-col h-full rounded-2xl neu-raised hover:shadow-product-hover card-lift transition-all duration-500"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl m-[2px] mb-0">
          {highlightBadge && (
            <Badge className="absolute top-2.5 right-2.5 z-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-xl border border-white/40 shadow-lg">
              {highlightBadge}
            </Badge>
          )}

          {/* Badge */}
          {savings > 0 && product.inStock && (
            <Badge className="absolute top-2.5 left-2.5 z-10 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-xl">
              -{savings}%
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground neu-flat px-4 py-1.5 rounded-full">Esgotado</span>
            </div>
          )}

          {/* Quick View on hover */}
          <button
            onClick={handleQuickView}
            className={`absolute right-2.5 z-10 neu-btn p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 ${highlightBadge ? 'top-12' : 'top-2.5'}`}
          >
            <Eye className="h-4 w-4 text-foreground/70" />
          </button>

          <div className={`absolute right-12 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/90 rounded-full shadow ${highlightBadge ? 'top-12' : 'top-2.5'}`}>
            <WishlistButton product={{ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }} size="sm" />
          </div>

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3.5 sm:p-4 mx-[2px] mb-[2px]">
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
              <span className="text-lg sm:text-xl font-bold text-foreground">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* CTA */}
          {activePromotion?.end_date && (
            <div className="mt-2 mb-1">
              <PromotionCountdown endDate={activePromotion.end_date} />
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <Button 
              onClick={handleBuyNow}
              disabled={!product.inStock}
              size="sm"
              className="flex-1 font-semibold text-xs rounded-xl h-9"
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              {product.inStock ? 'Comprar' : 'Indisponível'}
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
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

