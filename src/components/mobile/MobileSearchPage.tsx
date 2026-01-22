import { memo, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { MobileBottomNav } from './MobileBottomNav';
import { useSearchProducts } from '@/hooks/useProducts';

const popularSearches = [
  'Letreiro LED',
  'QR Code',
  'Placa de porta',
  'Chaveiro personalizado',
  'Broche',
  'Crachá',
];

export const MobileSearchPage = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(!initialQuery);
  
  const { data: results = [], isLoading } = useSearchProducts(initialQuery);

  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
      setQuery(searchTerm.trim());
      setIsFocused(false);
    }
  }, [setSearchParams]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  }, [query, handleSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchParams({});
    setIsFocused(true);
  }, [setSearchParams]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fixed Search Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border safe-area-top">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 h-14 px-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="pl-9 pr-8 h-10"
              autoFocus={!initialQuery}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Link to="/" className="text-sm text-primary font-medium">
            Cancelar
          </Link>
        </form>
      </header>

      <main className="pt-16 px-4">
        <AnimatePresence mode="wait">
          {isFocused && !initialQuery ? (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              {/* Popular Searches */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm">Buscas populares</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 active:scale-95 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches Placeholder */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-sm text-muted-foreground">Buscas recentes</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suas buscas recentes aparecerão aqui
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="font-semibold mb-1">Nenhum resultado</h2>
                  <p className="text-sm text-muted-foreground">
                    Tente buscar por outros termos
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {results.length} {results.length === 1 ? 'produto' : 'produtos'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileBottomNav />
    </div>
  );
});

MobileSearchPage.displayName = 'MobileSearchPage';
