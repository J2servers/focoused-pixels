/**
 * CategoriesPage - All categories listing with improvements
 *
 * #21 Dynamic layout components
 * #22 Product count per category
 * #23 Subcategory display under parent
 * #24 Category search/filter
 * #25 Animated grid with staggered entry
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Package } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';
import { Search, ChevronRight, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { MobileHeader, MobileBottomNav } from '@/components/mobile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// #22 Fetch product counts per category
function useProductCountsByCategory() {
  return useQuery({
    queryKey: ['product-counts-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id')
        .eq('status', 'active')
        .is('deleted_at', null);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach(p => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: productCounts = {} } = useProductCountsByCategory();
  const isMobile = useIsMobile();
  // #24 Search
  const [search, setSearch] = useState('');

  const parentCategories = categories.filter(c => !c.parent_id);

  // Build tree with subcategories
  const categoryTree = useMemo(() => {
    return parentCategories
      .filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        const matchParent = p.name.toLowerCase().includes(q);
        const subs = categories.filter(c => c.parent_id === p.id);
        const matchSub = subs.some(s => s.name.toLowerCase().includes(q));
        return matchParent || matchSub;
      })
      .map(p => ({
        ...p,
        subcategories: categories.filter(c => c.parent_id === p.id),
        totalProducts: (productCounts[p.id] || 0) +
          categories.filter(c => c.parent_id === p.id).reduce((sum, c) => sum + (productCounts[c.id] || 0), 0),
      }));
  }, [parentCategories, categories, search, productCounts]);

  const content = (
    <div className="px-4 py-6">
      <PageSEO
        title="Categorias | Produtos Personalizados"
        description="Explore todas as categorias de produtos personalizados da Pincel de Luz: letreiros LED, displays, crachás e mais."
        path="/categorias"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold mb-1">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          {categoryTree.length} {categoryTree.length === 1 ? 'categoria' : 'categorias'} disponíveis
        </p>
      </div>

      {/* #24 Search */}
      {parentCategories.length > 4 && (
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl"
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : categoryTree.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-2xl neu-concave p-8 max-w-sm mx-auto">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search ? 'Nenhuma categoria encontrada para esta busca.' : 'Nenhuma categoria disponível.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {categoryTree.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                layout
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group block"
                >
                  <div
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97]"
                    style={{
                      background: 'hsl(var(--background))',
                      boxShadow: '6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)), -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.4)',
                      border: '1px solid hsl(var(--neon-primary) / 0.15)',
                    }}
                  >
                    {cat.image_url ? (
                      <motion.img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center neu-concave">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* #22 Product count badge */}
                    {cat.totalProducts > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground text-[10px] px-2 py-0.5">
                          {cat.totalProducts} {cat.totalProducts === 1 ? 'produto' : 'produtos'}
                        </Badge>
                      </div>
                    )}

                    {/* Category name + subcategories */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-white text-sm leading-tight drop-shadow-lg">
                        {cat.name}
                      </h3>
                      {/* #23 Subcategory names */}
                      {cat.subcategories.length > 0 && (
                        <p className="text-[10px] text-white/60 mt-0.5 line-clamp-1">
                          {cat.subcategories.map(s => s.name).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* #23 Subcategory links below card */}
                {cat.subcategories.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {cat.subcategories.slice(0, 3).map(sub => (
                      <Link key={sub.id} to={`/categoria/${cat.slug}/${sub.slug}`}>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0.5 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          {sub.name}
                          {productCounts[sub.id] ? ` (${productCounts[sub.id]})` : ''}
                        </Badge>
                      </Link>
                    ))}
                    {cat.subcategories.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground">
                        +{cat.subcategories.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-20">
        <MobileHeader />
        <main className="flex-1">{content}</main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />
      <main className="flex-1">
        <div className="container mx-auto">{content}</div>
      </main>
      <DynamicFooter />
    </div>
  );
}
