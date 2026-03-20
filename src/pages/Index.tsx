/**
 * Index - Homepage com tema Neumorphism
 */

import { useState } from 'react';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { 
  MobileHeader, 
  MobileBottomNav, 
  MobileHeroCarousel, 
  MobileCategoryGrid, 
  MobileProductSection,
  MobileFloatingContact 
} from '@/components/mobile';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { CookieBanner } from '@/components/CookieBanner';
import { MiniCart, PromoPopupManager } from '@/components/storefront';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProductCardOptimized } from '@/components/conversion/ProductCardOptimized';
import { DynamicSocialProof } from '@/components/conversion/DynamicSocialProof';
import {
  TrustBar,
  HeroConversion,
  SocialProofSection,
  BestSellersSection,
  GuaranteesSection,
} from '@/components/conversion';

/* ── Category visual cards ── */
function CategoriesShowcase({ categories }: { categories: any[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Categorias</h2>
            <p className="text-sm text-muted-foreground mt-1">Encontre o produto perfeito</p>
          </div>
          <Link to="/categorias">
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todas
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 stagger-children">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden neu-raised hover:shadow-product-hover transition-all duration-500"
            >
              {cat.image_url && (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-sm md:text-base leading-tight">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Category product section ── */
function CategoryProductsSection({ 
  category, 
  products, 
  onAddToCart 
}: { 
  category: any; 
  products: any[]; 
  onAddToCart: () => void;
}) {
  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{category.name}</h2>
          <Link to={`/categoria/${category.slug}`}>
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 stagger-children">
          {products.map((product, idx) => (
            <ProductCardOptimized 
              key={product.id}
              product={product} 
              index={idx}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 8);

  const getProductsByCategory = (categoryId: string) => {
    const childIds = categories.filter(c => c.parent_id === categoryId).map(c => c.id);
    const allCategoryIds = [categoryId, ...childIds];
    return products.filter(p => {
      const productCategory = categories.find(c => c.slug === p.category);
      return productCategory && allCategoryIds.includes(productCategory.id);
    }).slice(0, 4);
  };

  // ═══ Mobile ═══
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <MobileHeader />
        <main className="flex-1">
          <MobileHeroCarousel />
          <MobileCategoryGrid />
          {productsLoading ? (
            <div className="px-4 py-4">
              <Skeleton className="h-6 w-32 mb-3 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            parentCategories.map((category) => {
              const categoryProducts = getProductsByCategory(category.id);
              if (categoryProducts.length === 0) return null;
              return (
                <MobileProductSection
                  key={category.id}
                  title={category.name}
                  products={categoryProducts}
                  categorySlug={category.slug}
                />
              );
            })
          )}
          {!productsLoading && products.length === 0 && (
            <div className="py-12 px-4 text-center">
              <div className="rounded-2xl neu-concave p-8">
                <h2 className="text-lg font-bold mb-2">Catálogo em construção</h2>
                <p className="text-sm text-muted-foreground mb-4">Em breve teremos produtos disponíveis.</p>
                <Link to="/sobre"><Button size="sm">Saiba mais</Button></Link>
              </div>
            </div>
          )}
          <div className="px-4 py-2">
            <GuaranteesSection />
          </div>
        </main>
        <MobileBottomNav />
        <MobileFloatingContact />
        <CookieBanner />
      </div>
    );
  }

  // ═══ Desktop ═══
  return (
    <div className="min-h-screen flex flex-col bg-background page-enter">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero full-width */}
        <HeroConversion />

        {/* Categories Showcase */}
        {!categoriesLoading && (
          <CategoriesShowcase categories={parentCategories} />
        )}

        {/* Best Sellers */}
        <BestSellersSection onAddToCart={() => setMiniCartOpen(true)} />

        {/* Category Sections */}
        {productsLoading || categoriesLoading ? (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-6 rounded-xl" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          parentCategories.slice(0, 3).map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            if (categoryProducts.length === 0) return null;
            return (
              <CategoryProductsSection
                key={category.id}
                category={category}
                products={categoryProducts}
                onAddToCart={() => setMiniCartOpen(true)}
              />
            );
          })
        )}

        {/* Social Proof */}
        <SocialProofSection />

        {/* Guarantees */}
        <GuaranteesSection />

        {!productsLoading && products.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="rounded-2xl neu-concave p-12 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4">Catálogo em construção</h2>
                <p className="text-muted-foreground mb-6">Em breve teremos produtos disponíveis.</p>
                <Link to="/sobre"><Button size="lg">Saiba mais</Button></Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
      <CookieBanner />
      <MiniCart open={miniCartOpen} onOpenChange={setMiniCartOpen} />
      <PromoPopupManager />
      <DynamicSocialProof />
    </div>
  );
};

export default Index;
