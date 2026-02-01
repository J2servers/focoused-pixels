import { useSearchParams, Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { ProductCard } from '@/components/ProductCard';
import { MobileProductCard } from '@/components/mobile/MobileProductCard';
import { MobileHeader, MobileBottomNav, MobileFloatingContact } from '@/components/mobile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useSearchProducts } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: results = [], isLoading } = useSearchProducts(query);
  const isMobile = useIsMobile();

  // Mobile Version
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <MobileHeader />

        <main className="flex-1 px-4 py-4">
          <div className="mb-4">
            <h1 className="text-lg font-bold mb-1">
              Resultados para "{query}"
            </h1>
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-base font-semibold mb-2">Nenhum produto encontrado</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tente buscar por outros termos
              </p>
              <Link to="/">
                <Button size="sm">Ver todos os produtos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {results.map((product, index) => (
                <MobileProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </main>

        <MobileBottomNav />
        <MobileFloatingContact />
      </div>
    );
  }

  // Desktop Version
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Resultados para "{query}"
            </h1>
            {!isLoading && (
              <p className="text-muted-foreground">
                {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h2>
              <p className="text-muted-foreground mb-6">
                Tente buscar por outros termos ou navegue pelas categorias
              </p>
              <Link to="/">
                <Button size="lg">Ver todos os produtos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default SearchPage;
