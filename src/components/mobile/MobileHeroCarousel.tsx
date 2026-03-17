import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    return <Skeleton className="w-full aspect-[16/9] mx-4 rounded-[20px]" />;
  }

  if (slides.length === 0) {
    return (
      <div className="w-full px-4 py-2">
        <div className="aspect-[16/9] rounded-[20px] flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, hsl(var(--surface-elevated)), hsl(var(--surface-inset)))',
          boxShadow: '-6px -6px 12px hsl(var(--neu-light) / 0.92), 8px 8px 16px hsl(var(--neu-dark) / 0.42), 0 0 0 1px hsl(var(--neon-primary) / 0.16)',
        }}>
          <div className="text-center px-6">
            <h2 className="text-xl font-bold mb-1 text-foreground">Pincel de Luz</h2>
            <p className="text-sm text-muted-foreground">Personalização de alta qualidade</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2">
      <div
        className="relative w-full h-[180px] max-w-[600px] mx-auto rounded-[20px] overflow-hidden"
        style={{
          boxShadow: '-6px -6px 12px hsl(var(--neu-light) / 0.92), 8px 8px 16px hsl(var(--neu-dark) / 0.42), 0 0 0 1px hsl(var(--neon-primary) / 0.16)',
        }}
      >
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white text-center"
                  >
                    {slide.title && (
                      <h2 className="text-base font-bold mb-0.5">{slide.title}</h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-xs opacity-90 mb-2 line-clamp-1">{slide.subtitle}</p>
                    )}
                    {slide.cta_text && slide.cta_link && (
                      <Link to={slide.cta_link}>
                        <Button size="sm" variant="secondary" className="font-semibold text-xs h-7 px-4 rounded-xl">
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

        {slides.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: index === currentSlide ? '20px' : '6px',
                  background: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                  boxShadow: index === currentSlide ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
