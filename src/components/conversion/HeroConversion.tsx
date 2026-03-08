/**
 * HeroConversion - Hero banner moderno, full-width
 * 100% editável via admin (hero_slides)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroSlides } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroConversion() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: heroSlides = [], isLoading } = useHeroSlides();

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
      <section>
        <Skeleton className="w-full h-[320px] md:h-[420px] lg:h-[500px]" />
      </section>
    );
  }

  if (heroSlides.length === 0) {
    return (
      <section className="w-full h-[320px] md:h-[420px] lg:h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum banner configurado. Adicione no painel admin.</p>
      </section>
    );
  }

  const slide = heroSlides[currentSlide];
  const hasText = slide?.title || slide?.subtitle || slide?.cta_text;
  const isDark = slide?.theme === 'dark';

  return (
    <section className="relative w-full h-[320px] md:h-[420px] lg:h-[500px] overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={slide.desktop_image}
            alt={slide.title || 'Banner'}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      {hasText && (
        <div className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-r from-black/70 via-black/40 to-transparent'
            : 'bg-gradient-to-r from-white/80 via-white/50 to-transparent'
        }`} />
      )}

      {/* Text content */}
      {hasText && (
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`max-w-xl ${isDark ? 'text-white' : 'text-foreground'}`}
            >
              {slide.title && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 tracking-tight">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className={`text-base md:text-lg mb-6 leading-relaxed ${isDark ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {slide.subtitle}
                </p>
              )}
              {slide.cta_text && slide.cta_link && (
                <Link to={slide.cta_link}>
                  <Button size="lg" className="font-bold px-8 rounded-full shadow-lg text-sm tracking-wide">
                    {slide.cta_text}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {heroSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 p-2.5 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 p-2.5 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
