import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu, ChevronRight, Sparkles, Info, HelpCircle, Package, ShoppingCart, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import logoPincel from '@/assets/logo-pincel-de-luz.png';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

export function MobileHeader() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const parentCategories = useMemo(() =>
    categories.filter(c => !c.parent_id),
    [categories]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 safe-area-pt">
      {/* ── Main Bar ── */}
      <div className="relative overflow-hidden">
        {/* Glass background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: scrolled
              ? 'hsla(240, 20%, 92%, 0.78)'
              : 'hsla(240, 20%, 92%, 0.96)',
          }}
          transition={{ duration: 0.5 }}
          style={{
            backdropFilter: 'blur(24px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          }}
        />

        {/* Ambient glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 rounded-full opacity-30 pointer-events-none" style={{
          background: 'radial-gradient(ellipse, hsl(var(--neon-primary) / 0.4), transparent 70%)',
          filter: 'blur(20px)',
        }} />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{
          background: `linear-gradient(90deg, 
            transparent 5%, 
            hsl(var(--neon-primary) / 0.7) 30%, 
            hsl(var(--neon-cyan) / 0.5) 50%, 
            hsl(var(--neon-primary) / 0.7) 70%, 
            transparent 95%)`,
        }} />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between h-[88px] px-4">
          {/* Left cluster: Menu + User */}
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <div><OrbButton><Menu className="h-5 w-5" /></OrbButton></div>
              </SheetTrigger>
              <SheetContent side="left" className="w-[310px] p-0 border-r-0" style={{
                background: 'hsl(var(--background))',
                borderRight: '2px solid hsl(var(--neon-primary) / 0.2)',
                boxShadow: '10px 0 40px hsl(var(--neu-dark) / 0.3)',
              }}>
                <MobileDrawer
                  company={company}
                  categories={parentCategories}
                  loading={categoriesLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleSearch={handleSearch}
                />
              </SheetContent>
            </Sheet>

            <Link to="/minha-area">
              <OrbButton size="sm">
                <User className="h-4 w-4" />
              </OrbButton>
            </Link>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.img
              src={company?.header_logo || logoPincel}
              alt="Logo"
              className="h-11 w-auto max-w-[160px] object-contain"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350 }}
            />
          </Link>

          {/* Right cluster: Search + Cart */}
          <div className="flex items-center gap-2">
            <OrbButton size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </OrbButton>

            <Link to="/carrinho" className="relative">
              <OrbButton>
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 text-[9px] font-black rounded-full h-[18px] w-[18px] flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
                        color: 'hsl(var(--primary-foreground))',
                        border: '2px solid hsl(var(--background))',
                        boxShadow: '0 2px 8px hsl(var(--primary) / 0.5)',
                      }}
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </OrbButton>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'hsl(var(--foreground) / 0.2)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsSearchOpen(false)}
            />
            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="absolute inset-x-3 top-3 z-50 rounded-3xl p-4"
              style={{
                background: 'hsl(var(--background))',
                boxShadow: `
                  0 20px 60px hsl(var(--neu-dark) / 0.5),
                  0 0 0 1px hsl(var(--neon-primary) / 0.3),
                  inset 0 1px 0 hsl(var(--neu-light) / 0.6)
                `,
              }}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setIsSearchOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-muted-foreground"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: '3px 3px 6px hsl(var(--neu-dark) / 0.4), -3px -3px 6px hsl(var(--neu-light) / 0.6)',
                  }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
                <div className="flex-1 rounded-full overflow-hidden" style={{
                  boxShadow: 'inset 3px 3px 8px hsl(var(--neu-dark) / 0.45), inset -3px -3px 8px hsl(var(--neu-light) / 0.6)',
                  border: '1px solid hsl(var(--neon-primary) / 0.25)',
                }}>
                  <Input
                    type="search"
                    placeholder="O que você procura?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 shadow-none bg-transparent h-10 rounded-full text-sm"
                    autoFocus
                  />
                </div>
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Button type="submit" size="icon" disabled={!searchQuery.trim()} className="rounded-full h-10 w-10">
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Promo Strip ── */}
      <div className="relative py-1.5 px-4 text-center text-[11px] font-bold overflow-hidden" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          background: 'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.35), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
        }} />
        <span className="relative z-10">🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </header>
  );
}

/* ═══════════════════════════════════════════════════
   Orb Button — circular floating neumorphic button
   ═══════════════════════════════════════════════════ */
function OrbButton({
  children,
  onClick,
  size = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'default' | 'sm';
}) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
  const shadowScale = size === 'sm' ? 0.75 : 1;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.78, y: 3, boxShadow: `inset 3px 3px 6px hsl(var(--neu-dark) / 0.5), inset -3px -3px 6px hsl(var(--neu-light) / 0.4)` }}
      whileHover={{ scale: 1.12, y: -5 }}
      transition={{ type: 'spring', stiffness: 450, damping: 15 }}
      className={`${dim} rounded-full flex items-center justify-center relative text-foreground cursor-pointer shrink-0`}
      style={{
        background: 'hsl(var(--background))',
        boxShadow: `
          ${8 * shadowScale}px ${8 * shadowScale}px ${20 * shadowScale}px hsl(var(--neu-dark) / 0.5),
          ${-8 * shadowScale}px ${-8 * shadowScale}px ${20 * shadowScale}px hsl(var(--neu-light) / 0.75),
          inset 0 1px 0 hsl(var(--neu-light) / 0.7),
          inset 0 -1px 0 hsl(var(--neu-dark) / 0.06),
          0 0 0 1px hsl(var(--neon-primary) / 0.15)
        `,
      }}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════
   Drawer — slide-in navigation
   ═══════════════════════════════════════════════════ */
function MobileDrawer({ company, categories, loading, searchQuery, setSearchQuery, handleSearch }: any) {
  return (
    <div className="flex flex-col gap-4 p-5 pt-8">
      {/* Brand */}
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.12)' }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
          boxShadow: '0 6px 18px hsl(var(--primary) / 0.35)',
        }}>
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{company?.company_name || 'Loja'}</p>
          <p className="text-[10px] text-muted-foreground tracking-wide">Explore nosso catálogo</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="rounded-full overflow-hidden" style={{
          boxShadow: 'inset 3px 3px 8px hsl(var(--neu-dark) / 0.4), inset -3px -3px 8px hsl(var(--neu-light) / 0.6)',
          border: '1px solid hsl(var(--neon-primary) / 0.15)',
        }}>
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent rounded-full text-sm h-10"
          />
        </div>
      </form>

      {/* Categories */}
      <nav className="flex flex-col gap-1.5">
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold px-3 mb-1">Categorias</p>
        {loading ? (
          [...Array(5)].map((_: any, i: number) => <Skeleton key={i} className="h-11 w-full rounded-full" />)
        ) : (
          categories.map((cat: any, idx: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.035, type: 'spring', stiffness: 200 }}
            >
              <SheetClose asChild>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all group"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: `5px 5px 12px hsl(var(--neu-dark) / 0.3), -5px -5px 12px hsl(var(--neu-light) / 0.55)`,
                    border: '1px solid hsl(var(--neon-primary) / 0.08)',
                  }}
                >
                  <span className="group-hover:text-primary transition-colors duration-200">{cat.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      {/* Links */}
      <div className="pt-3 mt-1" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.08)' }}>
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold px-3 mb-2">Links</p>
        {[
          { to: '/checkout', icon: Sparkles, label: 'Solicitar Orçamento' },
          { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
          { to: '/sobre', icon: Info, label: 'Sobre Nós' },
          { to: '/faq', icon: HelpCircle, label: 'FAQ' },
        ].map((link) => (
          <SheetClose key={link.to} asChild>
            <Link
              to={link.to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          </SheetClose>
        ))}
      </div>
    </div>
  );
}
