import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts, useProducts } from '@/hooks/useProducts';
import { DarkProductCard } from './DarkProductCard';

export function FeaturedSection() {
  const { data: products = [] } = useFeaturedProducts(8);
  const { data: allProducts = [] } = useProducts();
  const displayProducts = products.length > 0 ? products : allProducts.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[120px] pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
              <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">Destaques</span>
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
              Produtos em Alta
            </h2>
          </div>
          <Link to="/busca" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/80 text-sm hover:border-[hsl(var(--primary))/0.4] transition-all">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.map((product, i) => (
            <DarkProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
