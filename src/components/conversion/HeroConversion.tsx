/**
 * HeroConversion - Hero banner limpo e 100% editável via admin
 * Usa apenas dados do banco (hero_slides) - sem conteúdo hardcoded
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroSlides } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroConversion() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: heroSlides = [], isLoading } = useHeroSlides();

  // Auto-rotate slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  if (isLoading) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="w-full h-[280px] md:h-[340px] lg:h-[400px] rounded-2xl" />
        </div>
      </section>
    );
  }

  if (heroSlides.length === 0) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="w-full h-[280px] md:h-[340px] lg:h-[400px] rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <p className="text-primary-foreground text-lg">
              Nenhum banner configurado. Adicione no painel admin.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentSlideData = heroSlides[currentSlide];
  const hasTextContent = currentSlideData?.title || currentSlideData?.subtitle || currentSlideData?.cta_text;
  const isDarkTheme = currentSlideData?.theme === 'dark';

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="relative h-[280px] md:h-[340px] lg:h-[400px] rounded-2xl overflow-hidden shadow-xl">
          {/* Background Slides */}
          <AnimatePresence mode="wait">
            {heroSlides.map((slide, index) => (
              index === currentSlide && (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.desktop_image}
                    alt={slide.title || 'Banner promocional'}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {/* Overlay - only if there's text content */}
          {hasTextContent && (
            <div className={`absolute inset-0 ${
              isDarkTheme 
                ? 'bg-gradient-to-r from-black/60 via-black/30 to-transparent' 
                : 'bg-gradient-to-r from-white/70 via-white/40 to-transparent'
            }`} />
          )}

          {/* Content from database - only rendered if exists */}
          {hasTextContent && (
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6 md:px-12">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className={`max-w-lg ${isDarkTheme ? 'text-white' : 'text-foreground'}`}
                >
                  {/* Title from DB */}
                  {currentSlideData.title && (
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3 leading-tight">
                      {currentSlideData.title}
                    </h2>
                  )}

                  {/* Subtitle from DB */}
                  {currentSlideData.subtitle && (
                    <p className={`text-base md:text-lg mb-4 md:mb-6 ${
                      isDarkTheme ? 'text-white/90' : 'text-muted-foreground'
                    }`}>
                      {currentSlideData.subtitle}
                    </p>
                  )}

                  {/* CTA Button from DB */}
                  {currentSlideData.cta_text && currentSlideData.cta_link && (
                    <Link to={currentSlideData.cta_link}>
                      <Button 
                        size="lg" 
                        className="font-semibold px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {currentSlideData.cta_text}
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 md:p-3 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 md:p-3 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Próximo slide"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>
            </>
          )}

          {/* Slide indicators */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 md:w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
