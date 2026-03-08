import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Truck, Zap, Clock, Shield, ArrowRight } from 'lucide-react';
import { useHeroSlides } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function DarkHero() {
  const { data: slides = [] } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const settings = useSiteSettings();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden flex items-end pb-16 pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050d1a] via-[#0c2340] to-[#0a3d5c]" />
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent 80%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent 80%)',
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary))/0.12] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[80px] pointer-events-none" />

      {slide?.desktop_image && (
        <motion.div style={{ y }} className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id}
              src={slide.desktop_image}
              alt={slide.title || ''}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.25, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#050d1a]/60 to-transparent" />
        </motion.div>
      )}

      <motion.div style={{ opacity }} className="relative z-10 max-w-[1240px] mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
                <span className="font-mono text-xs tracking-[0.18em] uppercase text-white/70">
                  {settings.companyName}
                </span>
              </div>

              <h1 className="font-bebas text-[clamp(3.5rem,10vw,9rem)] leading-[0.85] tracking-[0.06em] uppercase text-white mb-4">
                <span className="block">{slide?.title || 'Criatividade'}</span>
                <span className="block text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}>
                  {slide?.subtitle || 'Que Brilha'}
                </span>
                <span className="block text-[hsl(var(--primary))] drop-shadow-[0_0_18px_hsl(var(--primary)/0.4)]">
                  Em Cada Peça
                </span>
              </h1>

              <p className="max-w-xl text-white/50 text-lg leading-relaxed mb-8">
                {settings.seoDescription}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/categorias"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm
                    bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]
                    text-[#050d1a] shadow-[0_14px_30px_hsl(var(--primary)/0.3)]
                    hover:shadow-[0_18px_40px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5 transition-all"
                >
                  Ver Catálogo <ArrowRight className="h-4 w-4" />
                </Link>
                {slide?.cta_link && slide?.cta_text && (
                  <Link
                    to={slide.cta_link}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold text-sm
                      border border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.05]
                      text-white hover:border-[hsl(var(--primary))/0.8] hover:bg-[hsl(var(--primary))/0.12]
                      hover:-translate-y-0.5 transition-all"
                  >
                    {slide.cta_text}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block"
          >
            <div className="p-6 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,8,18,0.5)]">
              <div className="flex justify-between items-center pb-4 border-b border-white/[0.08] mb-5">
                <h3 className="font-bebas text-2xl tracking-[0.12em] uppercase text-white">Nossos Números</h3>
                <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-[0.1em] uppercase text-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] border border-[hsl(var(--primary))/0.18]">
                  ao vivo
                </span>
              </div>
              <div className="grid gap-3">
                {[
                  { label: 'Frete Grátis', value: `R$ ${settings.freeShippingMinimum}+`, icon: <Truck className="h-4 w-4" /> },
                  { label: 'Parcelamento', value: `Até ${settings.installments}x`, icon: <Zap className="h-4 w-4" /> },
                  { label: 'Produção', value: settings.productionTime, icon: <Clock className="h-4 w-4" /> },
                  { label: 'Garantia', value: settings.warranty, icon: <Shield className="h-4 w-4" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.12] flex items-center justify-center text-[hsl(var(--primary))]">
                      {item.icon}
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] tracking-[0.1em] uppercase text-white/50">{item.label}</span>
                      <strong className="block text-white text-sm">{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-[hsl(var(--primary))]' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
