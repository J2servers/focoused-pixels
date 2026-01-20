import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { CookieBanner } from '@/components/CookieBanner';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Truck, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products, categories, getProductsByCategory } from '@/data/products';
import { heroSlides, benefits, storeInfo } from '@/data/store';

const benefitIcons: Record<string, React.ReactNode> = {
  'truck': <Truck className="h-8 w-8" />,
  'credit-card': <CreditCard className="h-8 w-8" />,
  'message-circle': <MessageCircle className="h-8 w-8" />,
  'shield-check': <ShieldCheck className="h-8 w-8" />,
};

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const featuredCategories = ['broches', 'qr-code', 'letreiros', 'home-decor'];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* Hero Carousel */}
        <section className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gradient-purple">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-xl text-white">
                    {slide.badge && (
                      <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold mb-4">
                        {slide.badge}
                      </span>
                    )}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-lg sm:text-xl mb-2 opacity-90">{slide.subtitle}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-accent mb-6">{slide.discount}</p>
                    <Link to={slide.href}>
                      <Button size="lg" variant="secondary" className="font-bold text-lg">
                        {slide.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-center gap-3 justify-center">
                  <div className="text-primary">{benefitIcons[benefit.icon]}</div>
                  <div>
                    <p className="font-bold text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Sections */}
        {featuredCategories.map((catSlug) => {
          const category = categories.find((c) => c.slug === catSlug);
          const categoryProducts = getProductsByCategory(catSlug).slice(0, 4);
          if (!category || categoryProducts.length === 0) return null;

          return (
            <section key={catSlug} className="py-12">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">{category.name}</h2>
                  <Link to={`/categoria/${catSlug}`}>
                    <Button variant="outline" size="sm">Ver todos</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      <Footer />
      <WhatsAppButton />
      <CookieBanner />
    </div>
  );
};

export default Index;
