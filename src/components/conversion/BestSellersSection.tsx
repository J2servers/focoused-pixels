/**
 * BestSellersSection - Mais vendidos com design limpo
 */

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';
import { ProductCardOptimized } from './ProductCardOptimized';

interface BestSellersSectionProps {
  onAddToCart?: () => void;
}

export function BestSellersSection({ onAddToCart }: BestSellersSectionProps) {
  const { data: products = [], isLoading } = useProducts();

  const bestSellers = [...products]
    .filter(p => p.inStock)
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 8);

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Mais Vendidos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Os favoritos dos nossos clientes</p>
          </div>
          <Link to="/categorias">
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {bestSellers.map((product, index) => (
            <ProductCardOptimized
              key={product.id}
              product={product}
              index={index}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
