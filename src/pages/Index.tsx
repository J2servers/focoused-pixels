/**
 * Index - Homepage otimizada para conversão
 * Implementa: Trust Bar, Hero impactante, Best Sellers, Prova Social, Garantias
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
import { motion } from 'framer-motion';
import { FadeInView } from '@/components/animations';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';

// New conversion components
import {
  TrustBar,
  HeroConversion,
  ProductCardOptimized,
  SocialProofSection,
  BestSellersSection,
  GuaranteesSection,
} from '@/components/conversion';

const Index = () => {
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Get parent categories for display
  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 4);

  // Get products by category
  const getProductsByCategory = (categoryId: string) => {
    const childIds = categories.filter(c => c.parent_id === categoryId).map(c => c.id);
    const allCategoryIds = [categoryId, ...childIds];
    return products.filter(p => {
      const productCategory = categories.find(c => c.slug === p.category);
      return productCategory && allCategoryIds.includes(productCategory.id);
    }).slice(0, 4);
  };

  // Mobile Version - Keep existing mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-16">
        <MobileHeader />
        
        <main className="flex-1">
          <MobileHeroCarousel />
          <MobileCategoryGrid />
          
          {productsLoading ? (
            <div className="px-4 py-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
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
              <h2 className="text-lg font-bold mb-2">Catálogo em construção</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Em breve teremos produtos disponíveis.
              </p>
              <Link to="/sobre">
                <Button size="sm">Saiba mais</Button>
              </Link>
            </div>
          )}
        </main>

        <MobileBottomNav />
        <MobileFloatingContact />
        <CookieBanner />
      </div>
    );
  }

  // Desktop Version - Optimized for conversion
  return (
    <div className="min-h-screen flex flex-col">
      {/* Trust Bar - Fixed top with credibility indicators */}
      <TrustBar />
      
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero Section - Conversion optimized with countdown */}
        <HeroConversion />

        {/* Best Sellers Section - High-converting products */}
        <BestSellersSection onAddToCart={() => setMiniCartOpen(true)} />

        {/* Product Sections by Category */}
        {productsLoading || categoriesLoading ? (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          parentCategories.map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            if (categoryProducts.length === 0) return null;

            return (
              <section key={category.id} className="py-12">
                <div className="container mx-auto px-4">
                  <FadeInView delay={0.1}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
                        <p className="text-muted-foreground mt-1">Produtos personalizados de alta qualidade</p>
                      </div>
                      <Link to={`/categoria/${category.slug}`}>
                        <Button variant="outline" className="group">
                          Ver todos
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </FadeInView>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {categoryProducts.map((product, index) => (
                      <ProductCardOptimized 
                        key={product.id} 
                        product={product} 
                        index={index}
                        onAddToCart={() => setMiniCartOpen(true)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}

        {/* Social Proof Section - Reviews and stats */}
        <SocialProofSection />

        {/* Guarantees Section - Build trust */}
        <GuaranteesSection />

        {/* If no products, show message */}
        {!productsLoading && products.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">Catálogo em construção</h2>
              <p className="text-muted-foreground mb-6">
                Em breve teremos produtos disponíveis. Enquanto isso, entre em contato conosco!
              </p>
              <Link to="/sobre">
                <Button size="lg">Saiba mais</Button>
              </Link>
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
    </div>
  );
};

export default Index;
