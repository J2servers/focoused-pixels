import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { CookieBanner } from '@/components/CookieBanner';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Truck, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { benefits } from '@/data/store';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeInView } from '@/components/animations';
import { useProducts, useCategories, useHeroSlides } from '@/hooks/useProducts';

const benefitIcons: Record<string, React.ReactNode> = {
  'truck': <Truck className="h-8 w-8" />,
  'credit-card': <CreditCard className="h-8 w-8" />,
  'message-circle': <MessageCircle className="h-8 w-8" />,
  'shield-check': <ShieldCheck className="h-8 w-8" />,
};

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: heroSlides = [], isLoading: slidesLoading } = useHeroSlides();

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

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

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero Carousel */}
        <section className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gradient-purple">
          {slidesLoading ? (
            <Skeleton className="w-full h-full" />
          ) : heroSlides.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                {heroSlides.map((slide, index) => (
                  index === currentSlide && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
                      <motion.img
                        src={slide.desktop_image}
                        alt={slide.title || 'Banner'}
                        className="w-full h-full object-cover"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 6, ease: 'linear' }}
                      />
                      <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-4">
                          <div className={`max-w-xl ${slide.theme === 'light' ? 'text-black' : 'text-white'}`}>
                            {slide.title && (
                              <motion.h2 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2"
                              >
                                {slide.title}
                              </motion.h2>
                            )}
                            {slide.subtitle && (
                              <motion.p 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="text-lg sm:text-xl mb-6 opacity-90"
                              >
                                {slide.subtitle}
                              </motion.p>
                            )}
                            {slide.cta_text && slide.cta_link && (
                              <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                              >
                                <Link to={slide.cta_link}>
                                  <Button size="lg" variant="secondary" className="font-bold text-lg">
                                    {slide.cta_text}
                                  </Button>
                                </Link>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
              {heroSlides.length > 1 && (
                <>
                  <motion.button
                    onClick={prevSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </motion.button>
                  <motion.button
                    onClick={nextSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </motion.button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {heroSlides.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center">
              <div className="text-white text-center">
                <h2 className="text-3xl font-bold mb-2">Goat Comunicação Visual</h2>
                <p className="text-lg opacity-90">Produtos personalizados de alta qualidade</p>
              </div>
            </div>
          )}
        </section>

        {/* Benefits */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <FadeInView key={benefit.title} delay={index * 0.1} direction="up">
                  <motion.div 
                    className="flex items-center gap-3 justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <div className="text-primary">{benefitIcons[benefit.icon]}</div>
                    <div>
                      <p className="font-bold text-sm">{benefit.title}</p>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Product Sections by Category */}
        {productsLoading || categoriesLoading ? (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
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
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold uppercase tracking-wide">{category.name}</h2>
                      <Link to={`/categoria/${category.slug}`}>
                        <Button variant="outline" size="sm">Ver todos</Button>
                      </Link>
                    </div>
                  </FadeInView>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {categoryProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}

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
    </div>
  );
};

export default Index;
