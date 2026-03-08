/**
 * TestePage - Nova página de vendas com UX totalmente redesenhado
 * Busca todos os dados do backend (hero_slides, products, categories, company_info)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ShoppingBag, Search, Menu, X,
  Sparkles, Shield, Truck, Clock, Star, Eye, Heart,
  Instagram, Facebook, Phone, Mail, MapPin, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroSlides, useProducts, useCategories, useFeaturedProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCart } from '@/hooks/useCart';
import { useIsMobile } from '@/hooks/use-mobile';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MiniCart } from '@/components/storefront/MiniCart';
import logoImage from '@/assets/logo-pincel-de-luz.png';

export default function TestePage() {
  const { data: heroSlides = [] } = useHeroSlides();
  const { data: allProducts = [] } = useProducts();
  const { data: featuredProducts = [] } = useFeaturedProducts(8);
  const { data: categories = [] } = useCategories();
  const settings = useSiteSettings();
  const { items } = useCart();
  const isMobile = useIsMobile();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  // Hero auto-rotate
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : allProducts.slice(0, 8);
  const topCategories = categories.filter(c => !c.parent_id).slice(0, 6);

  return (
    <div className="min-h-screen bg-background font-['Montserrat',sans-serif]">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left nav (desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {['Início', 'Sobre', 'Produtos', 'Categorias'].map((label, i) => {
                const paths = ['/', '/sobre', '/categorias', '/categorias'];
                return (
                  <Link
                    key={label}
                    to={paths[i]}
                    className="px-4 py-2 text-sm font-semibold text-foreground/80 hover:text-primary rounded-full hover:bg-primary/5 transition-all"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Center logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-background border-4 border-primary/20 shadow-lg flex items-center justify-center overflow-hidden -mt-1">
                <img src={logoImage} alt={settings.companyName} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
              </div>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link to="/busca" className="p-2.5 rounded-full hover:bg-muted transition-colors">
                <Search className="w-5 h-5 text-foreground/70" />
              </Link>
              <button
                onClick={() => setMiniCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-muted transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-foreground/70" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
              <Link to="/checkout" className="hidden md:inline-flex">
                <Button size="sm" className="rounded-full font-bold px-6 shadow-md">
                  Contato
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full hover:bg-muted transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/50 bg-background"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {[
                  { label: 'Início', path: '/' },
                  { label: 'Sobre', path: '/sobre' },
                  { label: 'Produtos', path: '/categorias' },
                  { label: 'Categorias', path: '/categorias' },
                  { label: 'FAQ', path: '/faq' },
                  { label: 'Contato', path: '/checkout' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <section className="relative w-full overflow-hidden">
        <div className="container mx-auto px-4 pt-6 pb-2">
          <div className="relative rounded-3xl overflow-hidden h-[280px] md:h-[380px] lg:h-[460px] shadow-2xl">
            <AnimatePresence mode="wait">
              {heroSlides.length > 0 ? (
                <motion.div
                  key={heroSlides[currentSlide]?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <img
                    src={heroSlides[currentSlide]?.desktop_image}
                    alt={heroSlides[currentSlide]?.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                  
                  {/* Text content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-8 md:px-14 lg:px-16 max-w-2xl">
                      {heroSlides[currentSlide]?.title && (
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3"
                        >
                          {heroSlides[currentSlide].title.split(' ').map((word, i, arr) => (
                            i >= arr.length - 2 ? (
                              <span key={i} className="text-accent"> {word}</span>
                            ) : (
                              <span key={i}> {word}</span>
                            )
                          ))}
                        </motion.h1>
                      )}
                      {heroSlides[currentSlide]?.subtitle && (
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35, duration: 0.5 }}
                          className="text-sm md:text-base text-white/80 mb-6 max-w-md leading-relaxed"
                        >
                          {heroSlides[currentSlide].subtitle}
                        </motion.p>
                      )}
                      {heroSlides[currentSlide]?.cta_text && heroSlides[currentSlide]?.cta_link && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <Link to={heroSlides[currentSlide].cta_link!}>
                            <Button
                              size="lg"
                              className="rounded-full font-bold px-8 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              {heroSlides[currentSlide].cta_text}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <div className="text-center text-primary-foreground px-6">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{settings.companyName}</h1>
                    <p className="text-lg opacity-80">Produtos personalizados de alta qualidade</p>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Nav arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════ ABOUT / QUEM SOMOS ═══════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight mb-2">
                  Produtos feitos com{' '}
                  <span className="text-primary">precisão e criatividade.</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4 mb-8 max-w-lg">
                  Na {settings.companyName}, cada peça é produzida com materiais premium — acrílico cristal, 
                  MDF de alta densidade e LED de longa duração. Do conceito à entrega, cuidamos de cada detalhe 
                  para que seu produto seja único.
                </p>

                {/* Feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Sparkles, title: 'Personalização', desc: 'Cada peça é única, feita sob medida para você.' },
                    { icon: Shield, title: 'Garantia', desc: `${settings.warranty} de garantia em todos os produtos.` },
                    { icon: Truck, title: 'Entrega', desc: `Produção em ${settings.productionTime}.` },
                  ].map((feat, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <feat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{feat.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                {topCategories[0]?.image_url ? (
                  <img
                    src={topCategories[0].image_url}
                    alt="Nossos produtos"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CATEGORIAS ═══════════════ */}
      {topCategories.length > 0 && (
        <section className="py-12 md:py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                <span className="text-primary">Nossas linhas</span> de produtos
              </h2>
              <p className="text-muted-foreground text-sm mt-2">Explore categorias feitas para cada ocasião</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topCategories.map((cat, i) => (
                <Link key={cat.id} to={`/categoria/${cat.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="group relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl transition-all"
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-xs md:text-sm font-bold leading-tight">{cat.name}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ PRODUTOS DESTAQUE ═══════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              <span className="text-primary">Produtos em destaque</span> para você
            </h2>
            <p className="text-muted-foreground text-sm mt-2">Seleção especial dos nossos melhores itens</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link to={`/produto/${product.slug}`} className="group block">
                  <div className="bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {product.discount && product.discount >= 10 && (
                        <span className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                      {product.badge === 'lancamento' && (
                        <span className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Novo
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-foreground shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            Ver detalhes
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                      <h3 className="text-xs md:text-sm font-semibold text-foreground line-clamp-2 mb-2 leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className={`w-3 h-3 ${si < 4 ? 'text-accent fill-accent' : 'text-muted-foreground/30'}`} />
                        ))}
                        <span className="text-[10px] text-muted-foreground ml-1">4.5</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base md:text-lg font-extrabold text-primary">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                      {product.price >= 50 && settings.installments > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          até {settings.installments}x de R$ {(product.price / settings.installments).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/categorias">
              <Button variant="outline" size="lg" className="rounded-full font-bold px-10 gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Ver todos os produtos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST BAR ═══════════════ */}
      <section className="py-12 bg-primary/5 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Shield, label: 'Compra Segura', desc: 'Pagamento 100% protegido' },
              { icon: Truck, label: 'Entrega Rápida', desc: settings.productionTime },
              { icon: Clock, label: 'Garantia', desc: `${settings.warranty} de garantia` },
              { icon: Sparkles, label: 'Personalizado', desc: 'Feito sob medida' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-foreground text-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <img src={logoImage} alt={settings.companyName} className="w-12 h-12 mb-4 brightness-200" />
              <h3 className="font-extrabold text-lg mb-2">{settings.companyName}</h3>
              <p className="text-sm text-background/60 leading-relaxed">
                Produtos personalizados em acrílico, MDF e LED com qualidade premium.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-background/80">Navegação</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Início', path: '/' },
                  { label: 'Produtos', path: '/categorias' },
                  { label: 'Sobre', path: '/sobre' },
                  { label: 'FAQ', path: '/faq' },
                ].map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-background/50 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-background/80">Institucional</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Política de Privacidade', path: '/privacidade' },
                  { label: 'Termos de Uso', path: '/termos' },
                  { label: 'Rastreio', path: '/rastreio' },
                ].map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-background/50 hover:text-background transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-background/80">Contato</h4>
              <ul className="space-y-3">
                {settings.whatsapp && (
                  <li className="flex items-center gap-2 text-sm text-background/50">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {settings.whatsapp}
                  </li>
                )}
                {settings.email && (
                  <li className="flex items-center gap-2 text-sm text-background/50">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {settings.email}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-background/40">
              © {new Date().getFullYear()} {settings.companyName}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-3">
              {settings.raw?.social_instagram && (
                <a href={settings.raw.social_instagram} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.raw?.social_facebook && (
                <a href={settings.raw.social_facebook} target="_blank" rel="noopener" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating elements */}
      <WhatsAppButton />
      <MiniCart open={miniCartOpen} onOpenChange={setMiniCartOpen} />
    </div>
  );
}
