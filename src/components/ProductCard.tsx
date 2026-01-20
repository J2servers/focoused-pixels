import { Link } from 'react-router-dom';
import { Star, Truck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const badgeVariants: Record<string, { label: string; className: string }> = {
    lancamento: { label: 'LANÇAMENTO', className: 'bg-primary text-primary-foreground' },
    desconto: { label: `ATÉ ${product.discount}% OFF`, className: 'bg-primary text-primary-foreground' },
    brinde: { label: 'COMPRE E GANHE', className: 'bg-accent text-accent-foreground' },
    esgotado: { label: 'ESGOTADO', className: 'bg-muted text-muted-foreground' },
  };

  const badge = product.badge ? badgeVariants[product.badge] : null;

  return (
    <Link 
      to={`/produto/${product.slug}`}
      className="group block bg-card rounded-lg border border-border shadow-product hover:shadow-product-hover transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {badge && (
          <Badge className={`absolute top-3 left-3 z-10 ${badge.className} text-xs font-semibold`}>
            {badge.label}
          </Badge>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

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
            <div className="flex items-center gap-1 text-xs text-success mt-1">
              <Truck className="h-3 w-3" />
              <span>Frete grátis</span>
            </div>
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
  );
}
