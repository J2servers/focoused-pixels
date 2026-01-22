import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeroSlides } from '@/hooks/useProducts';

export function MobileHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: slides = [], isLoading } = useHeroSlides();

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) {
    return <Skeleton className="w-full aspect-[16/9] rounded-none" />;
  }

  if (slides.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
        <div className="text-white text-center px-6">
          <h2 className="text-xl font-bold mb-1">Pincel de Luz</h2>
          <p className="text-sm opacity-90">Personalização de alta qualidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => (
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
                src={slide.mobile_image || slide.desktop_image}
                alt={slide.title || 'Banner'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white"
                >
                  {slide.title && (
                    <h2 className="text-lg font-bold mb-1">{slide.title}</h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-sm opacity-90 mb-2 line-clamp-2">{slide.subtitle}</p>
                  )}
                  {slide.cta_text && slide.cta_link && (
                    <Link to={slide.cta_link}>
                      <Button size="sm" variant="secondary" className="font-semibold">
                        {slide.cta_text}
                      </Button>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
