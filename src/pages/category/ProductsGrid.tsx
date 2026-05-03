import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/ProductCard';
import { MobileProductCard } from '@/components/mobile/MobileProductCard';
import { SuggestedCategories, SuggestedCat } from './SuggestedCategories';

interface ProductLike { id: string }

export function ProductsGrid({
  isLoading, viewMode, isMobile, filteredProducts, visibleProducts, hasMoreProducts, onLoadMore,
  visibleCount, hasActiveFilters, clearFilters, allCategories,
}: {
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  isMobile: boolean;
  filteredProducts: ProductLike[];
  visibleProducts: ProductLike[];
  hasMoreProducts: boolean;
  onLoadMore: () => void;
  visibleCount: number;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  allCategories: SuggestedCat[];
}) {
  if (isLoading) {
    return (
      <div className={cn(viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5" : "flex flex-col gap-4")}>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className={cn(viewMode === 'grid' ? "aspect-square rounded-2xl" : "h-36 rounded-2xl")} />
        ))}
      </div>
    );
  }
  if (filteredProducts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <div className="neu-concave rounded-2xl p-8 max-w-sm mx-auto">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-base font-medium text-foreground mb-2">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground mb-4">Tente ajustar os filtros ou explorar outras categorias</p>
          {hasActiveFilters && <Button onClick={clearFilters} size="sm">Limpar filtros</Button>}
          <SuggestedCategories categories={allCategories} />
        </div>
      </motion.div>
    );
  }
  return (
    <>
      <div className={cn(viewMode === 'grid'
        ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5"
        : "flex flex-col gap-4")}>
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03, duration: 0.3 }} layout>
              {isMobile
                ? <MobileProductCard product={product as Parameters<typeof MobileProductCard>[0]['product']} index={index} />
                : <ProductCard product={product as Parameters<typeof ProductCard>[0]['product']} index={index} />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {hasMoreProducts && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-8">
          <Button variant="outline" size="lg" onClick={onLoadMore} className="gap-2 rounded-full px-8">
            Carregar mais produtos
            <span className="text-xs text-muted-foreground">({filteredProducts.length - visibleCount} restantes)</span>
          </Button>
        </motion.div>
      )}
    </>
  );
}
