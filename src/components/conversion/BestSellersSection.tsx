/**
 * BestSellersSection - Seção de produtos mais vendidos com contador
 * Direciona atenção para produtos de alta conversão
 */

import { motion } from 'framer-motion';
import { Flame, TrendingUp, ArrowRight } from 'lucide-react';
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

  // Sort by rating and reviews to get "best sellers"
  const bestSellers = [...products]
    .filter(p => p.inStock)
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 4);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Mais Vendidos 
                <TrendingUp className="h-6 w-6 text-primary" />
              </h2>
              <p className="text-muted-foreground">Os favoritos dos nossos clientes</p>
            </div>
          </div>
          
          <Link to="/categorias">
            <Button variant="outline" className="group">
              Ver todos os produtos
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
