/**
 * CategoryPage — orchestrator. Decomposed UI in src/pages/category/*.
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { MobileHeader, MobileBottomNav, MobileFloatingContact } from '@/components/mobile';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useProductsByCategory, useCategoryBySlug, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { FilterContent } from './category/FilterContent';
import { CategoryBanner, SubcategoryChips, ActiveFilterTags } from './category/CategoryBanner';
import { CategoryToolbar, SortOption } from './category/CategoryToolbar';
import { ProductsGrid } from './category/ProductsGrid';
import { SuggestedCategories } from './category/SuggestedCategories';
import { buildCategorySeo } from '@/lib/seo/contentGenerators';

const ITEMS_PER_PAGE = 12;

const CategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'relevance');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFreeShipping, setShowOnlyFreeShipping] = useState(false);
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(subcategorySlug || categorySlug);
  const { data: allCategories = [] } = useCategories();
  const { data: baseProducts = [], isLoading: productsLoading } = useProductsByCategory(subcategorySlug || categorySlug);

  const parentCategory = subcategorySlug && categorySlug
    ? allCategories.find(c => c.slug === categorySlug) : null;

  useEffect(() => { setVisibleCount(ITEMS_PER_PAGE); }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    if (sortBy !== 'relevance') searchParams.set('sort', sortBy);
    else searchParams.delete('sort');
    setSearchParams(searchParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const availableSizes = useMemo(() => {
    const s = new Set<string>();
    baseProducts.forEach(p => p.sizes?.forEach((x: string) => s.add(x)));
    return Array.from(s).sort();
  }, [baseProducts]);

  const priceRange = useMemo(() => {
    if (baseProducts.length === 0) return { min: 0, max: 0 };
    const prices = baseProducts.map(p => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [baseProducts]);

  const productCounts = useMemo(() => ({
    inStock: baseProducts.filter(p => p.inStock).length,
    freeShipping: baseProducts.filter(p => p.freeShipping).length,
    onSale: baseProducts.filter(p => p.originalPrice && p.originalPrice > p.price).length,
  }), [baseProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...baseProducts];
    if (priceMin) result = result.filter(p => p.price >= parseFloat(priceMin));
    if (priceMax) result = result.filter(p => p.price <= parseFloat(priceMax));
    if (selectedSizes.length > 0) result = result.filter(p => p.sizes?.some((s: string) => selectedSizes.includes(s)));
    if (showOnlyInStock) result = result.filter(p => p.inStock);
    if (showOnlyFreeShipping) result = result.filter(p => p.freeShipping);
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
      case 'discount': result.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
      default: result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [baseProducts, priceMin, priceMax, selectedSizes, sortBy, showOnlyInStock, showOnlyFreeShipping, showOnlyOnSale]);

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const clearFilters = () => {
    setPriceMin(''); setPriceMax(''); setSelectedSizes([]);
    setShowOnlyInStock(false); setShowOnlyFreeShipping(false); setShowOnlyOnSale(false);
  };

  const activeFilters = useMemo(() => {
    const list: { label: string; onRemove: () => void }[] = [];
    if (priceMin) list.push({ label: `Min R$ ${priceMin}`, onRemove: () => setPriceMin('') });
    if (priceMax) list.push({ label: `Max R$ ${priceMax}`, onRemove: () => setPriceMax('') });
    selectedSizes.forEach(s => list.push({ label: `Tam: ${s}`, onRemove: () => toggleSize(s) }));
    if (showOnlyInStock) list.push({ label: 'Em estoque', onRemove: () => setShowOnlyInStock(false) });
    if (showOnlyFreeShipping) list.push({ label: 'Frete grátis', onRemove: () => setShowOnlyFreeShipping(false) });
    if (showOnlyOnSale) list.push({ label: 'Em promoção', onRemove: () => setShowOnlyOnSale(false) });
    return list;
  }, [priceMin, priceMax, selectedSizes, showOnlyInStock, showOnlyFreeShipping, showOnlyOnSale]);

  const hasActiveFilters = activeFilters.length > 0;
  const isLoading = categoryLoading || productsLoading;
  const handleLoadMore = useCallback(() => setVisibleCount(prev => prev + ITEMS_PER_PAGE), []);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const filterContentNode = (
    <FilterContent
      priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax}
      priceRange={priceRange} availableSizes={availableSizes} selectedSizes={selectedSizes} toggleSize={toggleSize}
      showOnlyInStock={showOnlyInStock} setShowOnlyInStock={setShowOnlyInStock}
      showOnlyFreeShipping={showOnlyFreeShipping} setShowOnlyFreeShipping={setShowOnlyFreeShipping}
      showOnlyOnSale={showOnlyOnSale} setShowOnlyOnSale={setShowOnlyOnSale}
      productCounts={productCounts} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
      category={category} categorySlug={categorySlug} subcategorySlug={subcategorySlug}
    />
  );

  if (!isLoading && !category) {
    const NotFound = (
      <div className="neu-concave rounded-2xl p-8 max-w-sm mx-auto">
        <h1 className="text-xl font-bold mb-4">Categoria não encontrada</h1>
        <SuggestedCategories categories={allCategories} />
        <Link to="/"><Button size="sm" className="mt-4">Voltar para a home</Button></Link>
      </div>
    );
    return isMobile ? (
      <div className="min-h-screen flex flex-col pb-16 bg-background">
        <MobileHeader />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">{NotFound}</main>
        <MobileBottomNav />
      </div>
    ) : (
      <div className="min-h-screen flex flex-col bg-background">
        <DynamicTopBar /><DynamicMainHeader /><NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">{NotFound}</main>
        <DynamicFooter />
      </div>
    );
  }

  const seo = category ? buildCategorySeo({
    name: category.name,
    description: category.description,
    productCount: filteredProducts.length,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  }) : null;

  const SEO = category && seo && (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      {category.image_url && <meta property="og:image" content={category.image_url} />}
      <link rel="canonical" href={`${window.location.origin}/categoria/${subcategorySlug || categorySlug}${parentCategory ? '' : ''}`} />
    </Helmet>
  );

  if (isMobile) {
    return (
      <HelmetProvider>
        <div className="min-h-screen flex flex-col bg-background pb-20">
          {SEO}
          <MobileHeader />
          <main className="flex-1">
            <div className="px-4 py-4">
              <CategoryBanner category={category} productCount={filteredProducts.length} priceRange={priceRange} />
              <SubcategoryChips category={category} categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
              <ActiveFilterTags activeFilters={activeFilters} clearFilters={clearFilters} />
              <CategoryToolbar isMobile hasActiveFilters={hasActiveFilters} activeFiltersCount={activeFilters.length}
                viewMode={viewMode} setViewMode={setViewMode} sortBy={sortBy} setSortBy={setSortBy} filterContent={filterContentNode} />
              <ProductsGrid isLoading={isLoading} viewMode={viewMode} isMobile filteredProducts={filteredProducts}
                visibleProducts={visibleProducts} hasMoreProducts={hasMoreProducts} onLoadMore={handleLoadMore}
                visibleCount={visibleCount} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} allCategories={allCategories} />
            </div>
          </main>
          <MobileBottomNav />
          <MobileFloatingContact />
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {SEO}
        <DynamicTopBar /><DynamicMainHeader /><NavigationBar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/categorias">Categorias</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                {parentCategory ? (
                  <>
                    <BreadcrumbItem><BreadcrumbLink href={`/categoria/${categorySlug}`}>{parentCategory.name}</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>{category?.name}</BreadcrumbPage></BreadcrumbItem>
                  </>
                ) : (
                  <BreadcrumbItem><BreadcrumbPage>{category?.name || 'Carregando...'}</BreadcrumbPage></BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            <CategoryBanner category={category} productCount={filteredProducts.length} priceRange={priceRange} />
            <SubcategoryChips category={category} categorySlug={categorySlug} subcategorySlug={subcategorySlug} />
            <ActiveFilterTags activeFilters={activeFilters} clearFilters={clearFilters} />
            <CategoryToolbar isMobile={false} hasActiveFilters={hasActiveFilters} activeFiltersCount={activeFilters.length}
              viewMode={viewMode} setViewMode={setViewMode} sortBy={sortBy} setSortBy={setSortBy} filterContent={filterContentNode} />

            <div className="flex gap-8">
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-28 rounded-2xl p-5 space-y-1" style={{
                  background: 'hsl(var(--background))',
                  boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.3), inset -4px -4px 10px hsl(var(--neu-light) / 0.5)',
                  border: '1px solid hsl(var(--neon-primary) / 0.1)',
                }}>
                  <h3 className="font-semibold mb-4 text-sm">Filtros</h3>
                  {filterContentNode}
                </div>
              </aside>
              <div className="flex-1 min-w-0">
                <ProductsGrid isLoading={isLoading} viewMode={viewMode} isMobile={false} filteredProducts={filteredProducts}
                  visibleProducts={visibleProducts} hasMoreProducts={hasMoreProducts} onLoadMore={handleLoadMore}
                  visibleCount={visibleCount} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} allCategories={allCategories} />
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

export default CategoryPage;
