/**
 * Teste2Page - Motor UX Dark Glassmorphism
 * Design premium com tema escuro, acentos neon e cards de vidro
 * 100% integrado ao backend admin
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Search, ShoppingBag, Menu, X, ChevronRight, Star, Zap,
  Shield, Truck, Clock, Award, ArrowRight, Instagram,
  Facebook, Mail, Phone, MapPin, Sparkles, Eye, Heart
} from 'lucide-react';
import { useProducts, useCategories, useHeroSlides, useFeaturedProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCart } from '@/hooks/useCart';

/* ═══════════════════════════════════════════
   GLASSMORPHISM NAVBAR
   ═══════════════════════════════════════════ */
function GlassNav({ companyName, logo }: { companyName: string; logo: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-[1240px] mx-auto px-6">
          <div className={`flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-500
            ${scrolled
              ? 'bg-[#050d1a]/80 border-[hsl(var(--primary))/0.2] shadow-[0_22px_54px_rgba(0,0,0,0.4)]'
              : 'bg-[#050d1a]/40 border-white/[0.08] shadow-[0_18px_36px_rgba(0,0,0,0.18)]'
            } backdrop-blur-xl`}
          >
            <Link to="/teste2" className="flex items-center gap-3 shrink-0">
              {logo ? (
                <img src={logo} alt={companyName} className="h-8 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="font-bebas text-xl tracking-[0.18em] uppercase text-white">{companyName}</span>
                </div>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Produtos', 'Categorias', 'Sobre', 'Contato'].map(item => (
                <Link
                  key={item}
                  to={item === 'Produtos' ? '/busca' : item === 'Categorias' ? '/categorias' : item === 'Sobre' ? '/sobre' : '/faq'}
                  className="relative text-white/80 text-sm tracking-wide hover:text-white transition-colors group"
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-full h-px bg-[hsl(var(--primary))] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/busca" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                <Search className="h-4 w-4 text-white/70" />
              </Link>
              <Link to="/carrinho" className="relative w-10 h-10 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                <ShoppingBag className="h-4 w-4 text-white/70" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--primary))] text-[#050d1a] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]"
              >
                {mobileOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050d1a]/96 backdrop-blur-2xl flex items-center justify-center p-6 md:hidden"
          >
            <div className="w-full max-w-sm p-6 rounded-3xl border border-[hsl(var(--primary))/0.15] bg-white/[0.05] backdrop-blur-2xl shadow-2xl">
              <div className="grid gap-3">
                {[
                  { label: 'Produtos', to: '/busca' },
                  { label: 'Categorias', to: '/categorias' },
                  { label: 'Sobre', to: '/sobre' },
                  { label: 'FAQ', to: '/faq' },
                  { label: 'Carrinho', to: '/carrinho' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white hover:border-[hsl(var(--primary))/0.3] transition-all"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO SECTION — Full viewport, parallax
   ═══════════════════════════════════════════ */
function DarkHero() {
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
      {/* Background layers */}
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

      {/* Hero image parallax */}
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

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 max-w-[1240px] mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-end">
          {/* Left */}
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

          {/* Right — Stats glass panel */}
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

      {/* Slide dots */}
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

/* ═══════════════════════════════════════════
   CATEGORIES — Glassmorphism grid
   ═══════════════════════════════════════════ */
function CategoriesGrid() {
  const { data: categories = [] } = useCategories();
  const parents = categories.filter(c => !c.parent_id).slice(0, 8);

  if (parents.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
              <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
                Explore
              </span>
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
              Categorias
            </h2>
          </div>
          <Link to="/categorias" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/80 text-sm hover:border-[hsl(var(--primary))/0.4] transition-all">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {parents.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-[hsl(var(--primary))/0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.24)] hover:-translate-y-2 hover:border-[hsl(var(--primary))/0.4] hover:shadow-[0_24px_48px_hsl(var(--primary)/0.16)] transition-all duration-500"
              >
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#050d1a]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-base mb-1">{cat.name}</h3>
                  <span className="text-white/40 text-xs font-mono tracking-wide uppercase flex items-center gap-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                    Explorar <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PRODUCT CARD — Dark glass style
   ═══════════════════════════════════════════ */
function DarkProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group block rounded-3xl overflow-hidden border border-[hsl(var(--primary))/0.12] bg-white/[0.04] backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.24)] hover:-translate-y-2 hover:border-[hsl(var(--primary))/0.4] hover:shadow-[0_24px_48px_hsl(var(--primary)/0.16)] transition-all duration-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image area */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-white/[0.06] to-[hsl(var(--primary))/0.04]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a]/70 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount && (
              <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase bg-[hsl(var(--primary))] text-[#050d1a] font-bold shadow-lg">
                -{product.discount}%
              </span>
            )}
            {product.badge === 'lancamento' && (
              <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase bg-white/10 text-white border border-white/20 backdrop-blur-md">
                Novo
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-400 hover:border-red-400/30 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* SKU code */}
          {product.id && (
            <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.12em] uppercase text-white/40">
              #{product.id.slice(0, 6)}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-mono tracking-wide uppercase">{product.category}</span>
            <div className="flex items-center gap-1 text-[hsl(var(--primary))]">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{product.rating}</span>
            </div>
          </div>
          <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-white font-semibold text-lg">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-white/30 text-xs line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   FEATURED PRODUCTS
   ═══════════════════════════════════════════ */
function FeaturedSection() {
  const { data: products = [] } = useFeaturedProducts(8);
  const { data: allProducts = [] } = useProducts();
  const displayProducts = products.length > 0 ? products : allProducts.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[120px] pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
              <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
                Destaques
              </span>
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
              Produtos em Alta
            </h2>
          </div>
          <Link to="/busca" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/80 text-sm hover:border-[hsl(var(--primary))/0.4] transition-all">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.map((product, i) => (
            <DarkProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   DIFFERENTIALS — Glass cards
   ═══════════════════════════════════════════ */
function DifferentialsSection() {
  const settings = useSiteSettings();
  const diffs = [
    { icon: <Sparkles className="h-6 w-6" />, title: 'Personalização Total', desc: 'Cada peça é única e feita sob medida para você.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Compra 100% Segura', desc: 'Criptografia SSL e dados protegidos.' },
    { icon: <Truck className="h-6 w-6" />, title: `Frete Grátis +R$${settings.freeShippingMinimum}`, desc: 'Entrega rápida com rastreamento em tempo real.' },
    { icon: <Clock className="h-6 w-6" />, title: `Produção ${settings.productionTime}`, desc: 'Agilidade sem abrir mão da qualidade.' },
    { icon: <Award className="h-6 w-6" />, title: `Garantia ${settings.warranty}`, desc: 'Troca garantida sem complicação.' },
    { icon: <Zap className="h-6 w-6" />, title: `Até ${settings.installments}x s/ Juros`, desc: 'PIX, cartão, boleto. Você escolhe.' },
  ];

  return (
    <section className="relative py-24 border-y border-white/[0.05]"
      style={{
        background: 'linear-gradient(180deg, rgba(10,22,40,0.78), rgba(10,22,40,0.28))',
      }}
    >
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[80px] pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3 justify-center">
            <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
              Por que nos escolher
            </span>
            <span className="w-9 h-px bg-gradient-to-l from-transparent to-[hsl(var(--primary))]" />
          </div>
          <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
            Diferenciais
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {diffs.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-3xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl shadow-[0_16px_32px_rgba(0,0,0,0.16)] hover:border-[hsl(var(--primary))/0.3] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.12] flex items-center justify-center text-[hsl(var(--primary))] mb-5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]">
                {d.icon}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{d.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════ */
function CTASection() {
  const settings = useSiteSettings();

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))/0.08] via-transparent to-[hsl(var(--primary))/0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary))/0.08] blur-[100px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="p-10 md:p-16 rounded-[2rem] border border-[hsl(var(--primary))/0.2] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,8,18,0.5)] text-center">
          <h2 className="font-bebas text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white mb-4">
            Pronto Para<br />
            <span className="text-[hsl(var(--primary))]">Personalizar?</span>
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-base leading-relaxed mb-8">
            Entre em contato e transforme suas ideias em peças únicas. Orçamento rápido e sem compromisso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm
                bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]
                text-[#050d1a] shadow-[0_14px_30px_hsl(var(--primary)/0.3)]
                hover:shadow-[0_18px_40px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5 transition-all"
            >
              Solicitar Orçamento <ArrowRight className="h-4 w-4" />
            </Link>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessageTemplate)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm
                  border border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.05]
                  text-white hover:border-[hsl(var(--primary))/0.8] hover:bg-[hsl(var(--primary))/0.12]
                  hover:-translate-y-0.5 transition-all"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   DARK FOOTER
   ═══════════════════════════════════════════ */
function DarkFooter() {
  const settings = useSiteSettings();

  return (
    <footer className="relative pt-16 pb-8 border-t border-white/[0.08]"
      style={{
        background: 'linear-gradient(180deg, rgba(10,22,40,0.94), rgba(5,13,26,0.98))',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h4 className="font-bebas text-2xl tracking-[0.12em] uppercase text-white mb-4">{settings.companyName}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{settings.seoDescription}</p>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Navegação</h4>
            <ul className="space-y-3">
              {[
                { label: 'Produtos', to: '/busca' },
                { label: 'Categorias', to: '/categorias' },
                { label: 'Sobre Nós', to: '/sobre' },
                { label: 'FAQ', to: '/faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/50 text-sm hover:text-[hsl(var(--primary))] transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: 'Política de Privacidade', to: '/privacidade' },
                { label: 'Termos de Uso', to: '/termos' },
                { label: 'Rastreamento', to: '/rastreio' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/50 text-sm hover:text-[hsl(var(--primary))] transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              {settings.email && (
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail className="h-4 w-4 text-[hsl(var(--primary))]" /> {settings.email}
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone className="h-4 w-4 text-[hsl(var(--primary))]" /> WhatsApp
                </li>
              )}
            </ul>
            <div className="flex gap-3 mt-4">
              {settings.raw?.social_instagram && (
                <a href={settings.raw.social_instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.raw?.social_facebook && (
                <a href={settings.raw.social_facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] text-center">
          <p className="text-white/30 text-xs">{settings.raw?.copyright_text || `© ${new Date().getFullYear()} ${settings.companyName}. Todos os direitos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
const Teste2Page = () => {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen bg-[#050d1a] text-white overflow-x-hidden"
      style={{
        background: `
          radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 26%),
          radial-gradient(circle at 12% 18%, rgba(139,167,191,0.08), transparent 20%),
          linear-gradient(180deg, #050d1a 0%, #081321 48%, #07101c 100%)
        `,
      }}
    >
      <GlassNav companyName={settings.companyName} logo={settings.raw?.header_logo || null} />
      <DarkHero />
      <CategoriesGrid />
      <FeaturedSection />
      <DifferentialsSection />
      <CTASection />
      <DarkFooter />
    </div>
  );
};

export default Teste2Page;
