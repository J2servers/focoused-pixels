/**
 * Index - Homepage com tema Neumorphism
 * Performance-optimized with lazy loading for below-fold components
 */

import { useState, lazy, Suspense, useMemo, useCallback } from 'react';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { 
  MobileHeader, 
  MobileBottomNav, 
  MobileCategoryGrid, 
  MobileProductSection,
  MobileFloatingContact 
} from '@/components/mobile';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CookieBanner } from '@/components/CookieBanner';
import { MiniCart } from '@/components/storefront';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProductCardOptimized } from '@/components/conversion/ProductCardOptimized';
import {
  TrustBar,
  HeroConversion,
  BestSellersSection,
  GuaranteesSection,
  HowItWorksSection,
  WeeklyUrgencySection,
} from '@/components/conversion';
import { RainbowCategoryStrip } from '@/components/conversion/RainbowCategoryStrip';
import { PageSEO, WebSiteSchema, LocalBusinessSchema } from '@/components/seo/PageSEO';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { BackToTop } from '@/components/conversion/BackToTop';
import { SectionDivider } from '@/components/conversion/SectionDivider';

// Lazy load below-fold heavy components
const SocialProofSection = lazy(() => import('@/components/conversion/SocialProofSection').then(m => ({ default: m.SocialProofSection })));
const VideoStoriesCarousel = lazy(() => import('@/components/conversion/VideoStoriesCarousel').then(m => ({ default: m.VideoStoriesCarousel })));
const MobileHeroCarousel = lazy(() => import('@/components/mobile/MobileHeroCarousel').then(m => ({ default: m.MobileHeroCarousel })));
const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget').then(m => ({ default: m.AIChatWidget })));
const DynamicSocialProof = lazy(() => import('@/components/conversion/DynamicSocialProof').then(m => ({ default: m.DynamicSocialProof })));
const PromoPopupManager = lazy(() => import('@/components/storefront/PromoPopup').then(m => ({ default: m.PromoPopupManager })));
const ExitIntentPopup = lazy(() => import('@/components/conversion/ExitIntentPopup').then(m => ({ default: m.ExitIntentPopup })));

/* ── Category product section ── */
function CategoryProductsSection({ 
  category, 
  products, 
  onAddToCart 
}: { 
  category: { name: string; slug: string };
  products: Product[]; 
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
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
  const { data: companyData } = useCompanyInfo();
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const categoryProductsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const cat of parentCategories) {
      const childIds = categories.filter(c => c.parent_id === cat.id).map(c => c.id);
      const allCategoryIds = new Set([cat.id, ...childIds]);
      const prods = products.filter(p => {
        const productCategory = categories.find(c => c.slug === p.category);
        return productCategory && allCategoryIds.has(productCategory.id);
      }).slice(0, 8);
      if (prods.length > 0) map.set(cat.id, prods);
    }
    return map;
  }, [parentCategories, categories, products]);

  const handleOpenMiniCart = useCallback(() => setMiniCartOpen(true), []);

  // ═══ Mobile ═══
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <PageSEO
          title="Pincel de Luz Personalizados | Letreiros LED, Displays e Personalização"
          description="Especialistas em comunicação visual: letreiros LED, displays QR Code, crachás e produtos personalizados. Frete grátis acima de R$ 159."
          path="/"
        />
        <WebSiteSchema />
        <LocalBusinessSchema company={companyData} />
        <MobileHeader />
        <main id="main-content" className="flex-1" role="main">
          <Suspense fallback={<Skeleton className="aspect-[16/9] mx-4 mt-2 rounded-2xl" />}>
            <MobileHeroCarousel />
          </Suspense>
          
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
              const categoryProducts = categoryProductsMap.get(category.id);
              if (!categoryProducts?.length) return null;
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
                <h2 className="text-lg font-bold mb-2">Catálogo em atualização</h2>
                <p className="text-sm text-muted-foreground mb-4">Estamos preparando uma vitrine ainda mais completa para você.</p>
                <Link to="/sobre"><Button size="sm">Saiba mais</Button></Link>
              </div>
            </div>
          )}
          <div className="px-4 py-2">
            <GuaranteesSection />
          </div>
          <HowItWorksSection />
        </main>
        <MobileBottomNav />
        <MobileFloatingContact />
        <CookieBanner />
        <Suspense fallback={null}>
          <AIChatWidget />
        </Suspense>
      </div>
    );
  }

  // ═══ Desktop ═══
  return (
    <div className="min-h-screen flex flex-col bg-background page-enter">
      <PageSEO
        title="Pincel de Luz Personalizados | Letreiros LED, Displays e Personalização"
        description="Especialistas em comunicação visual: letreiros LED, displays QR Code, crachás e produtos personalizados em acrílico e MDF. Frete grátis acima de R$ 159."
        path="/"
      />
      <WebSiteSchema />
      <LocalBusinessSchema company={companyData} />
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main id="main-content" className="flex-1" role="main">
        <HeroConversion />

        {!categoriesLoading && (
          <RainbowCategoryStrip categories={parentCategories} />
        )}

        <BestSellersSection onAddToCart={handleOpenMiniCart} />
        <SectionDivider />
        <WeeklyUrgencySection />
        <SectionDivider />

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
          parentCategories.map((category) => {
            const categoryProducts = categoryProductsMap.get(category.id);
            if (!categoryProducts?.length) return null;
            return (
              <CategoryProductsSection
                key={category.id}
                category={category}
                products={categoryProducts}
                onAddToCart={handleOpenMiniCart}
              />
            );
          })
        )}

        <Suspense fallback={null}>
          <SocialProofSection />
        </Suspense>

        <Suspense fallback={null}>
          <VideoStoriesCarousel />
        </Suspense>

        <SectionDivider />
        <GuaranteesSection />
        <HowItWorksSection />

        {!productsLoading && products.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="rounded-2xl neu-concave p-12 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4">Catálogo em atualização</h2>
                <p className="text-muted-foreground mb-6">Estamos organizando uma seleção especial com produtos prontos para personalização.</p>
                <Link to="/sobre"><Button size="lg">Saiba mais</Button></Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <BackToTop />
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>
      <CookieBanner />
      <MiniCart open={miniCartOpen} onOpenChange={setMiniCartOpen} />
      <Suspense fallback={null}>
        <PromoPopupManager />
        <DynamicSocialProof />
        <ExitIntentPopup />
      </Suspense>
    </div>
  );
};

export default Index;
