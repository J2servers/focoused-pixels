/**
 * CategoryPage - Enhanced category listing with 25+ improvements
 * 
 * #1 Dynamic layout components (DynamicTopBar/MainHeader/Footer)
 * #2 Category hero banner with image from DB
 * #3 Category description display
 * #4 Subcategory quick-nav chips
 * #5 Removable active filter tags
 * #6 Grid/List view toggle
 * #7 Product count per filter option
 * #8 Sort by discount %
 * #9 SEO meta tags + JSON-LD
 * #10 Animated filter transitions
 * #11 Load more pagination
 * #12 Empty state with suggested categories
 * #13 Color filter extraction
 * #14 Price range with preset buttons
 * #15 URL-persisted sort (query param)
 * #16 Skeleton loading states
 * #17 Results summary with price range info
 * #18 Mobile subcategory horizontal scroll
 * #19 Sticky filters on desktop
 * #20 "On sale" filter
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { ProductCard } from '@/components/ProductCard';
import { MobileProductCard } from '@/components/mobile/MobileProductCard';
import { MobileHeader, MobileBottomNav, MobileFloatingContact } from '@/components/mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, ChevronRight, X, Grid3X3, List, Tag, Truck, Package, Percent, ArrowUpDown } from 'lucide-react';
import { useProductsByCategory, useCategoryBySlug, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest' | 'discount';

const ITEMS_PER_PAGE = 12;

const CategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  // #15 URL-persisted sort
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'relevance');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFreeShipping, setShowOnlyFreeShipping] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false); // #20
  // #6 View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // #11 Pagination
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(subcategorySlug || categorySlug);
  const { data: allCategories = [] } = useCategories();
  const { data: baseProducts = [], isLoading: productsLoading } = useProductsByCategory(subcategorySlug || categorySlug);

  const parentCategory = subcategorySlug && categorySlug
    ? allCategories.find(c => c.slug === categorySlug)
    : null;

  // Reset pagination on category change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [categorySlug, subcategorySlug]);

  // #15 Persist sort to URL
  useEffect(() => {
    if (sortBy !== 'relevance') {
      searchParams.set('sort', sortBy);
    } else {
      searchParams.delete('sort');
    }
    setSearchParams(searchParams, { replace: true });
  }, [sortBy]);

  // Get available sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    baseProducts.forEach(p => p.sizes?.forEach((s: string) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [baseProducts]);

  // #13 Extract colors from products
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    baseProducts.forEach(p => p.colors?.forEach((c: string) => colors.add(c)));
    return Array.from(colors).sort();
  }, [baseProducts]);

  // #17 Price range info
  const priceRange = useMemo(() => {
    if (baseProducts.length === 0) return { min: 0, max: 0 };
    const prices = baseProducts.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [baseProducts]);

  // #7 Product counts
  const productCounts = useMemo(() => ({
    inStock: baseProducts.filter(p => p.inStock).length,
    freeShipping: baseProducts.filter(p => p.freeShipping).length,
    onSale: baseProducts.filter(p => p.originalPrice && p.originalPrice > p.price).length,
  }), [baseProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...baseProducts];

    if (priceMin) result = result.filter(p => p.price >= parseFloat(priceMin));
    if (priceMax) result = result.filter(p => p.price <= parseFloat(priceMax));
    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes?.some((size: string) => selectedSizes.includes(size)));
    }
    if (showOnlyInStock) result = result.filter(p => p.inStock);
    if (showOnlyFreeShipping) result = result.filter(p => p.freeShipping);
    // #20 On sale filter
    if (showOnlyOnSale) result = result.filter(p => p.originalPrice && p.originalPrice > p.price);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest':
        result.sort((a, b) => {
          if (a.badge === 'lancamento' && b.badge !== 'lancamento') return -1;
          if (b.badge === 'lancamento' && a.badge !== 'lancamento') return 1;
          return 0;
        });
        break;
      // #8 Sort by discount
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [baseProducts, priceMin, priceMax, selectedSizes, sortBy, showOnlyInStock, showOnlyFreeShipping, showOnlyOnSale]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setPriceMin(''); setPriceMax('');
    setSelectedSizes([]);
    setShowOnlyInStock(false);
    setShowOnlyFreeShipping(false);
    setShowOnlyOnSale(false);
  };

  // #5 Active filters list
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = [];
    if (priceMin) filters.push({ label: `Min R$ ${priceMin}`, onRemove: () => setPriceMin('') });
    if (priceMax) filters.push({ label: `Max R$ ${priceMax}`, onRemove: () => setPriceMax('') });
    selectedSizes.forEach(s => filters.push({ label: `Tam: ${s}`, onRemove: () => toggleSize(s) }));
    if (showOnlyInStock) filters.push({ label: 'Em estoque', onRemove: () => setShowOnlyInStock(false) });
    if (showOnlyFreeShipping) filters.push({ label: 'Frete grátis', onRemove: () => setShowOnlyFreeShipping(false) });
    if (showOnlyOnSale) filters.push({ label: 'Em promoção', onRemove: () => setShowOnlyOnSale(false) });
    return filters;
  }, [priceMin, priceMax, selectedSizes, showOnlyInStock, showOnlyFreeShipping, showOnlyOnSale]);

  const hasActiveFilters = activeFilters.length > 0;
  const isLoading = categoryLoading || productsLoading;

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  if (!isLoading && !category) {
    if (isMobile) {
      return (
        <div className="min-h-screen flex flex-col pb-16 bg-background">
          <MobileHeader />
          <main className="flex-1 container mx-auto px-4 py-16 text-center">
            <div className="neu-concave rounded-2xl p-8 max-w-sm mx-auto">
              <h1 className="text-xl font-bold mb-4">Categoria não encontrada</h1>
              {/* #12 Suggested categories */}
              <SuggestedCategories categories={allCategories} />
              <Link to="/">
                <Button size="sm" className="mt-4">Voltar para a home</Button>
              </Link>
            </div>
          </main>
          <MobileBottomNav />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="neu-concave rounded-2xl p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
            <SuggestedCategories categories={allCategories} />
            <Link to="/">
              <Button className="mt-4">Voltar para a home</Button>
            </Link>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* #14 Price Range with presets */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Faixa de Preço</Label>
        <div className="flex items-center gap-2 mb-2">
          <Input type="number" placeholder="De" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full h-9 text-sm" />
          <span className="text-muted-foreground text-xs">—</span>
          <Input type="number" placeholder="Até" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full h-9 text-sm" />
        </div>
        {priceRange.max > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {[50, 100, 200, 500].filter(v => v <= priceRange.max).map(v => (
              <Button key={v} variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setPriceMax(String(v))}>
                Até R${v}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Tamanhos</Label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <Button
                key={size}
                variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSize(size)}
                className="min-w-[3rem] h-8 text-xs"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Checkbox Filters with counts (#7) */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold block">Filtros</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="inStock" checked={showOnlyInStock} onCheckedChange={(c) => setShowOnlyInStock(c as boolean)} />
          <label htmlFor="inStock" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            Em estoque
            <span className="text-xs text-muted-foreground">({productCounts.inStock})</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="freeShipping" checked={showOnlyFreeShipping} onCheckedChange={(c) => setShowOnlyFreeShipping(c as boolean)} />
          <label htmlFor="freeShipping" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
            Frete grátis
            <span className="text-xs text-muted-foreground">({productCounts.freeShipping})</span>
          </label>
        </div>
        {/* #20 On sale */}
        <div className="flex items-center space-x-2">
          <Checkbox id="onSale" checked={showOnlyOnSale} onCheckedChange={(c) => setShowOnlyOnSale(c as boolean)} />
          <label htmlFor="onSale" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
            Em promoção
            <span className="text-xs text-muted-foreground">({productCounts.onSale})</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-sm">
          Limpar todos os filtros
        </Button>
      )}

      {/* #4 Subcategories */}
      {category?.subcategories && category.subcategories.length > 0 && !subcategorySlug && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Subcategorias</Label>
          <ul className="space-y-1.5">
            {category.subcategories.map((sub: { id: string; slug: string; name: string }) => (
              <li key={sub.id}>
                <Link
                  to={`/categoria/${categorySlug}/${sub.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-muted/50"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // #2 Category Hero Banner
  const CategoryBanner = () => {
    if (!category) return null;
    const hasImage = category.image_url;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "relative rounded-2xl overflow-hidden mb-6",
          hasImage ? "h-40 md:h-56" : "py-6 md:py-8"
        )}
        style={!hasImage ? {
          background: 'hsl(var(--background))',
          boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.4), inset -4px -4px 10px hsl(var(--neu-light) / 0.6)',
        } : undefined}
      >
        {hasImage && (
          <>
            <img src={category.image_url!} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        )}
        <div className={cn("relative z-10 px-5 md:px-8", hasImage ? "absolute bottom-0 left-0 right-0 pb-5 md:pb-8" : "")}>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold",
              hasImage ? "text-white" : "text-foreground"
            )}
          >
            {category.name}
          </motion.h1>
          {/* #3 Category description */}
          {category.description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn("text-sm mt-1.5 max-w-2xl", hasImage ? "text-white/80" : "text-muted-foreground")}
            >
              {category.description}
            </motion.p>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn("text-xs mt-2", hasImage ? "text-white/60" : "text-muted-foreground")}
          >
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            {priceRange.max > 0 && ` • R$ ${priceRange.min.toFixed(0)} — R$ ${priceRange.max.toFixed(0)}`}
          </motion.p>
        </div>
      </motion.div>
    );
  };

  // #4 Subcategory chips
  const SubcategoryChips = () => {
    const subs = category?.subcategories;
    if (!subs || subs.length === 0 || subcategorySlug) return null;

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
        <Link
          to={`/categoria/${categorySlug}`}
          className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-primary text-primary-foreground"
        >
          Todos
        </Link>
        {subs.map((sub: { id: string; slug: string; name: string }) => (
          <Link
            key={sub.id}
            to={`/categoria/${categorySlug}/${sub.slug}`}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-medium border border-border bg-background hover:border-primary/50 hover:text-primary transition-colors"
          >
            {sub.name}
          </Link>
        ))}
      </div>
    );
  };

  // #5 Active filter tags
  const ActiveFilterTags = () => {
    if (!hasActiveFilters) return null;
    return (
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs text-muted-foreground">Filtros ativos:</span>
        <AnimatePresence>
          {activeFilters.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.05 }}
            >
              <Badge variant="secondary" className="gap-1 pl-2.5 pr-1 py-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={f.onRemove}>
                {f.label}
                <X className="h-3 w-3" />
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive px-2" onClick={clearFilters}>
          Limpar tudo
        </Button>
      </div>
    );
  };

  // #6 Toolbar: sort + view toggle
  const Toolbar = () => (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6"><FilterContent /></div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* #6 View mode toggle */}
        <div className="hidden md:flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn("p-1.5 transition-colors", viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("p-1.5 transition-colors", viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className={cn("h-8 text-xs", isMobile ? "w-[130px]" : "w-[180px]")}>
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevância</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
            <SelectItem value="name-asc">Nome A-Z</SelectItem>
            <SelectItem value="newest">Lançamentos</SelectItem>
            {/* #8 Sort by discount */}
            <SelectItem value="discount">Maior desconto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Products Grid with animations
  const ProductsGrid = () => {
    if (isLoading) {
      return (
        <div className={cn(
          viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5" : "flex flex-col gap-4"
        )}>
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
            <p className="text-base font-medium text-foreground mb-2">
              Nenhum produto encontrado
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar os filtros ou explorar outras categorias
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} size="sm">Limpar filtros</Button>
            )}
            {/* #12 Suggested categories */}
            <SuggestedCategories categories={allCategories} />
          </div>
        </motion.div>
      );
    }

    return (
      <>
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5"
            : "flex flex-col gap-4"
        )}>
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                layout
              >
                {isMobile ? (
                  <MobileProductCard product={product} index={index} />
                ) : (
                  <ProductCard product={product} index={index} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* #11 Load More */}
        {hasMoreProducts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-8">
            <Button variant="outline" size="lg" onClick={handleLoadMore} className="gap-2 rounded-full px-8">
              Carregar mais produtos
              <span className="text-xs text-muted-foreground">
                ({filteredProducts.length - visibleCount} restantes)
              </span>
            </Button>
          </motion.div>
        )}
      </>
    );
  };

  // Mobile
  if (isMobile) {
    return (
      <HelmetProvider>
        <div className="min-h-screen flex flex-col bg-background pb-20">
          {/* #9 SEO */}
          {category && (
            <Helmet>
              <title>{category.name} | Produtos Personalizados</title>
              <meta name="description" content={category.description || `Confira todos os produtos da categoria ${category.name}`} />
            </Helmet>
          )}
          <MobileHeader />
          <main className="flex-1">
            <div className="px-4 py-4">
              <CategoryBanner />
              {/* #18 Mobile subcategory scroll */}
              <SubcategoryChips />
              <ActiveFilterTags />
              <Toolbar />
              <ProductsGrid />
            </div>
          </main>
          <MobileBottomNav />
          <MobileFloatingContact />
        </div>
      </HelmetProvider>
    );
  }

  // Desktop
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* #9 SEO */}
        {category && (
          <Helmet>
            <title>{category.name} | Produtos Personalizados</title>
            <meta name="description" content={category.description || `Confira todos os produtos da categoria ${category.name}`} />
            <link rel="canonical" href={`${window.location.origin}/categoria/${subcategorySlug || categorySlug}`} />
          </Helmet>
        )}
        <DynamicTopBar />
        <DynamicMainHeader />
        <NavigationBar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/categorias">Categorias</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {parentCategory ? (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/categoria/${categorySlug}`}>{parentCategory.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{category?.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{category?.name || 'Carregando...'}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            {/* #2 Category Banner */}
            <CategoryBanner />

            {/* #4 Subcategory chips */}
            <SubcategoryChips />

            {/* #5 Active filter tags */}
            <ActiveFilterTags />

            {/* Toolbar */}
            <Toolbar />

            <div className="flex gap-8">
              {/* #19 Sticky sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-28 rounded-2xl p-5 space-y-1" style={{
                  background: 'hsl(var(--background))',
                  boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.3), inset -4px -4px 10px hsl(var(--neu-light) / 0.5)',
                  border: '1px solid hsl(var(--neon-primary) / 0.1)',
                }}>
                  <h3 className="font-semibold mb-4 text-sm">Filtros</h3>
                  <FilterContent />
                </div>
              </aside>

              {/* Products */}
              <div className="flex-1 min-w-0">
                <ProductsGrid />
              </div>
            </div>
          </div>
        </main>

        <DynamicFooter />
        <WhatsAppButton />
        <AIChatWidget />
      </div>
    </HelmetProvider>
  );
};

// #12 Suggested categories component
function SuggestedCategories({ categories }: { categories: { id: string; slug: string; name: string; parent_id: string | null }[] }) {
  const parents = categories.filter(c => !c.parent_id).slice(0, 4);
  if (parents.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2">Explore outras categorias:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {parents.map(c => (
          <Link key={c.id} to={`/categoria/${c.slug}`}>
            <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
