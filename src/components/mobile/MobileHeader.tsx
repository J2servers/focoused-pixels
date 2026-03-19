import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu, ChevronRight, Sparkles, Info, HelpCircle, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import logoPincel from '@/assets/logo-pincel-de-luz.png';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

/* ── Floating pill button ── */
function FloatingBtn({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.82, y: 3 }}
      whileHover={{ scale: 1.1, y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`w-12 h-12 rounded-full flex items-center justify-center text-foreground cursor-pointer shrink-0 ${className}`}
      style={{
        background: 'hsl(var(--background) / 0.85)',
        boxShadow: `
          10px 10px 25px hsl(var(--neu-dark) / 0.5),
          -10px -10px 25px hsl(var(--neu-light) / 0.7),
          inset 0 2px 0 hsl(var(--neu-light) / 0.5),
          inset 0 -2px 0 hsl(var(--neu-dark) / 0.06)
        `,
        border: '1px solid hsl(var(--neon-primary) / 0.2)',
      }}
    >
      {children}
    </motion.button>
  );
}

export function MobileHeader() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

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
      {/* Main bar */}
      <div className="relative">
        {/* Glass background */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: scrolled
              ? 'hsl(var(--background) / 0.82)'
              : 'hsl(var(--background) / 0.95)',
            backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(10px)',
            WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(10px)',
          }}
        />

        {/* Bottom neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{
          background: `linear-gradient(90deg, transparent 0%, hsl(var(--neon-primary) / 0.5) 25%, hsl(var(--neon-cyan) / 0.3) 50%, hsl(var(--neon-primary) / 0.5) 75%, transparent 100%)`,
        }} />

        <div className="relative z-10 flex items-center justify-between h-20 px-4 gap-3">
          {/* Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <FloatingBtn>
                <Menu className="h-5 w-5" />
              </FloatingBtn>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-0" style={{
              background: 'hsl(var(--background))',
              borderRight: '2px solid hsl(var(--neon-primary) / 0.25)',
            }}>
              {/* Drawer Header */}
              <div className="p-5 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.15)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
                    boxShadow: '0 4px 14px hsl(var(--primary) / 0.4)',
                  }}>
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Menu</h2>
                    <p className="text-[10px] text-muted-foreground">Navegue pelas categorias</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <nav className="p-4 space-y-1.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-2">Categorias</p>
                {categoriesLoading ? (
                  [...Array(6)].map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-full" />)
                ) : (
                  parentCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <SheetClose asChild>
                        <Link
                          to={`/categoria/${cat.slug}`}
                          className="flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all group hover:text-primary"
                          style={{
                            background: 'hsl(var(--background))',
                            boxShadow: `4px 4px 10px hsl(var(--neu-dark) / 0.35), -4px -4px 10px hsl(var(--neu-light) / 0.6)`,
                            border: '1px solid hsl(var(--neon-primary) / 0.1)',
                          }}
                        >
                          <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      </SheetClose>
                    </motion.div>
                  ))
                )}

                {/* Links */}
                <div className="pt-3 mt-3" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.1)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-2">Links</p>
                  {[
                    { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
                    { to: '/sobre', icon: Info, label: 'Sobre Nós' },
                    { to: '/faq', icon: HelpCircle, label: 'FAQ' },
                  ].map((link) => (
                    <SheetClose key={link.to} asChild>
                      <Link
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center flex-1 justify-center px-2">
            <motion.img
              src={company?.header_logo || logoPincel}
              alt="Logo"
              className="h-12 w-auto max-w-[180px] object-contain"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          </Link>

          {/* Search */}
          <FloatingBtn onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </FloatingBtn>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 top-0 z-50 h-20 px-4 flex items-center"
            style={{
              background: 'hsl(var(--background))',
              borderBottom: '2px solid hsl(var(--neon-primary) / 0.3)',
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center w-full gap-3">
              <FloatingBtn onClick={() => setIsSearchOpen(false)} className="!w-10 !h-10">
                <X className="h-4 w-4" />
              </FloatingBtn>
              <div className="flex-1 rounded-full overflow-hidden" style={{
                boxShadow: 'inset 3px 3px 8px hsl(var(--neu-dark) / 0.5), inset -3px -3px 8px hsl(var(--neu-light) / 0.7)',
                border: '1px solid hsl(var(--neon-primary) / 0.3)',
              }}>
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none bg-transparent h-11 rounded-full"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="shrink-0 rounded-full px-4">
                Buscar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo strip */}
      <div className="relative py-1.5 px-4 text-center text-xs font-bold overflow-hidden" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          background: 'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.3), transparent)',
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
