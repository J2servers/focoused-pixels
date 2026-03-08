/**
 * Index - Homepage redesenhada com visual moderno
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
import { ArrowRight, ShoppingCart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import {
  TrustBar,
  HeroConversion,
  SocialProofSection,
  GuaranteesSection,
} from '@/components/conversion';

/* ── Simple Product Card (inline to avoid ref issues) ── */
function SimpleProductCard({ product, onAddToCart }: { product: any; onAddToCart: () => void }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast.success('Adicionado ao carrinho!');
    onAddToCart();
  };

  const savings = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <Link to={`/produto/${product.slug}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/40 hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
          {savings > 0 && product.inStock && (
            <span className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground text-[11px] font-bold px-2.5 py-1 rounded-lg">
              -{savings}%
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-4 py-1.5 rounded-full">Esgotado</span>
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">({product.reviews})</span>
          </div>

          {/* Name */}
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-3 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="space-y-0.5 mb-3">
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through block">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <p className="text-[11px] text-muted-foreground">
              ou 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold text-xs rounded-lg h-9 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.inStock ? 'Adicionar' : 'Indisponível'}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ── Categories Grid ── */
function CategoriesGrid({ categories }: { categories: any[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Categorias</h2>
            <p className="text-sm text-muted-foreground mt-1">Encontre o produto perfeito</p>
          </div>
          <Link to="/categorias">
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todas
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="group relative block rounded-2xl overflow-hidden bg-muted"
              style={{ paddingBottom: '75%' }}
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

/* ── Best Sellers ── */
function BestSellers({ products, onAddToCart }: { products: any[]; onAddToCart: () => void }) {
  const bestSellers = [...products]
    .filter(p => p.inStock)
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 8);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Mais Vendidos</h2>
            <p className="text-sm text-muted-foreground mt-1">Os favoritos dos nossos clientes</p>
          </div>
          <Link to="/categorias">
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {bestSellers.map((product) => (
            <SimpleProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Category Products Section ── */
function CategoryProducts({ category, products, onAddToCart }: { category: any; products: any[]; onAddToCart: () => void }) {
  return (
    <section className="py-10 lg:py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{category.name}</h2>
          <Link to={`/categoria/${category.slug}`}>
            <Button variant="ghost" size="sm" className="text-primary font-semibold group">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {products.map((product) => (
            <SimpleProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
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

  const openCart = () => setMiniCartOpen(true);

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
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
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
              <p className="text-sm text-muted-foreground mb-4">Em breve teremos produtos disponíveis.</p>
              <Link to="/sobre"><Button size="sm">Saiba mais</Button></Link>
            </div>
          )}
        </main>
        <MobileBottomNav />
        <MobileFloatingContact />
        <CookieBanner />
      </div>
    );
  }

  // ═══ Desktop ═══
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        <HeroConversion />

        {categoriesLoading ? (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <CategoriesGrid categories={parentCategories} />
        )}

        {productsLoading ? (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <BestSellers products={products} onAddToCart={openCart} />
        )}

        {!productsLoading && !categoriesLoading && parentCategories.slice(0, 3).map((category) => {
          const categoryProducts = getProductsByCategory(category.id);
          if (categoryProducts.length === 0) return null;
          return (
            <CategoryProducts
              key={category.id}
              category={category}
              products={categoryProducts}
              onAddToCart={openCart}
            />
          );
        })}

        <SocialProofSection />
        <GuaranteesSection />

        {!productsLoading && products.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold mb-4">Catálogo em construção</h2>
              <p className="text-muted-foreground mb-6">Em breve teremos produtos disponíveis.</p>
              <Link to="/sobre"><Button size="lg">Saiba mais</Button></Link>
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
