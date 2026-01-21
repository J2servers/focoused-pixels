import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useProductsByCategory, useCategoryBySlug, useCategories } from '@/hooks/useProducts';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';

const CategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [showOnlyFreeShipping, setShowOnlyFreeShipping] = useState(false);

  // Fetch data from Supabase
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(subcategorySlug || categorySlug);
  const { data: allCategories = [] } = useCategories();
  const { data: baseProducts = [], isLoading: productsLoading } = useProductsByCategory(subcategorySlug || categorySlug);

  // Find parent category if viewing subcategory
  const parentCategory = subcategorySlug && categorySlug 
    ? allCategories.find(c => c.slug === categorySlug) 
    : null;

  // Get available sizes from products
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    baseProducts.forEach(p => p.sizes?.forEach((s: string) => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [baseProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...baseProducts];

    // Price filter
    if (priceMin) {
      result = result.filter(p => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      result = result.filter(p => p.price <= parseFloat(priceMax));
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes?.some((size: string) => selectedSizes.includes(size))
      );
    }

    // Stock filter
    if (showOnlyInStock) {
      result = result.filter(p => p.inStock);
    }

    // Free shipping filter
    if (showOnlyFreeShipping) {
      result = result.filter(p => p.freeShipping);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => {
          if (a.badge === 'lancamento' && b.badge !== 'lancamento') return -1;
          if (b.badge === 'lancamento' && a.badge !== 'lancamento') return 1;
          return 0;
        });
        break;
      default:
        result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [baseProducts, priceMin, priceMax, selectedSizes, sortBy, showOnlyInStock, showOnlyFreeShipping]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedSizes([]);
    setShowOnlyInStock(false);
    setShowOnlyFreeShipping(false);
  };

  const hasActiveFilters = priceMin || priceMax || selectedSizes.length > 0 || showOnlyInStock || showOnlyFreeShipping;

  const isLoading = categoryLoading || productsLoading;

  if (!isLoading && !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <MainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <Link to="/">
            <Button>Voltar para a home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Faixa de Preço</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="De"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Até"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full"
          />
        </div>
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
                className="min-w-[3rem]"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Other Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold block">Filtros</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="inStock" 
            checked={showOnlyInStock}
            onCheckedChange={(checked) => setShowOnlyInStock(checked as boolean)}
          />
          <label htmlFor="inStock" className="text-sm cursor-pointer">
            Apenas em estoque
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="freeShipping" 
            checked={showOnlyFreeShipping}
            onCheckedChange={(checked) => setShowOnlyFreeShipping(checked as boolean)}
          />
          <label htmlFor="freeShipping" className="text-sm cursor-pointer">
            Frete grátis
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          Limpar filtros
        </Button>
      )}

      {/* Subcategories */}
      {category?.subcategories && category.subcategories.length > 0 && !subcategorySlug && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Subcategorias</Label>
          <ul className="space-y-2">
            {category.subcategories.map((sub: { id: string; slug: string; name: string }) => (
              <li key={sub.id}>
                <Link
                  to={`/categoria/${categorySlug}/${sub.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="h-4 w-4" />
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {parentCategory ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/categoria/${categorySlug}`}>
                      {parentCategory.name}
                    </BreadcrumbLink>
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

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {category?.name}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'} encontrados
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {hasActiveFilters && (
                      <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="name-asc">Nome A-Z</SelectItem>
                  <SelectItem value="newest">Lançamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32 bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-4">Filtros</h3>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={clearFilters}>Limpar filtros</Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CategoryPage;
