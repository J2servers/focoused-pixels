/**
 * HeroConversion - Hero banner otimizado para alta conversão
 * Inclui: proposta de valor clara, countdown de urgência, prova social
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroSlides } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

// Countdown hook
function useCountdown(hours: number = 24) {
  const [timeLeft, setTimeLeft] = useState({
    hours: hours,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Get or set end time in localStorage
    const storageKey = 'promo_countdown_end';
    let endTime = localStorage.getItem(storageKey);
    
    if (!endTime) {
      endTime = (Date.now() + hours * 60 * 60 * 1000).toString();
      localStorage.setItem(storageKey, endTime);
    }

    const calculateTimeLeft = () => {
      const diff = parseInt(endTime!) - Date.now();
      if (diff <= 0) {
        // Reset countdown
        const newEndTime = (Date.now() + hours * 60 * 60 * 1000).toString();
        localStorage.setItem(storageKey, newEndTime);
        return { hours, minutes: 0, seconds: 0 };
      }
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [hours]);

  return timeLeft;
}

// Testimonial rotator
const testimonials = [
  { text: "Produto incrível, superou minhas expectativas!", author: "Maria S.", rating: 5 },
  { text: "Entrega super rápida e qualidade perfeita!", author: "João P.", rating: 5 },
  { text: "Atendimento nota 10, recomendo muito!", author: "Ana L.", rating: 5 },
  { text: "Melhor personalização que já vi!", author: "Carlos R.", rating: 5 },
];

export function HeroConversion() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { data: heroSlides = [], isLoading } = useHeroSlides();
  const countdown = useCountdown(24);

  // Auto-rotate slides
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="w-full h-[400px] lg:h-[500px] rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Slides */}
          {heroSlides.length > 0 ? (
            <AnimatePresence mode="wait">
              {heroSlides.map((slide, index) => (
                index === currentSlide && (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, scale: 1.1 }}
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
                )
              ))}
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-purple-900" />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8 lg:px-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl text-white"
              >
                {/* Badge de oferta */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold mb-4"
                >
                  <Sparkles className="h-4 w-4" />
                  OFERTA ESPECIAL
                </motion.div>

                {/* Título Principal */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                  Personalizados que
                  <span className="block text-accent">Encantam ✨</span>
                </h1>

                {/* Proposta de valor */}
                <p className="text-lg md:text-xl text-white/90 mb-6">
                  Produtos únicos em acrílico e MDF com gravação a laser de alta precisão
                </p>

                {/* Countdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 inline-block"
                >
                  <div className="flex items-center gap-2 text-accent font-bold mb-2">
                    <Clock className="h-5 w-5" />
                    <span>20% OFF - Termina em:</span>
                  </div>
                  <div className="flex gap-3">
                    {[
                      { value: countdown.hours.toString().padStart(2, '0'), label: 'Horas' },
                      { value: countdown.minutes.toString().padStart(2, '0'), label: 'Min' },
                      { value: countdown.seconds.toString().padStart(2, '0'), label: 'Seg' },
                    ].map((item, i) => (
                      <div key={item.label} className="text-center">
                        <div className="bg-white text-primary text-2xl font-bold px-3 py-2 rounded-lg min-w-[50px]">
                          {item.value}
                        </div>
                        <div className="text-xs text-white/80 mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3 mb-8"
                >
                  <Link to="/categorias">
                    <Button 
                      size="lg" 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
                    >
                      VER OFERTAS
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/checkout">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold px-8 py-6 rounded-xl"
                    >
                      Solicitar Orçamento
                    </Button>
                  </Link>
                </motion.div>

                {/* Testimonial rotativo */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex text-accent">
                        {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-white/90">
                        "{testimonials[currentTestimonial].text}" - <strong>{testimonials[currentTestimonial].author}</strong>
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Slide indicators */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
