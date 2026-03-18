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

export function MobileHeader() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      {/* Main Header Bar */}
      <div 
        className="transition-all duration-500"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: scrolled
            ? `0 6px 24px hsl(var(--neu-dark) / 0.45),
               inset 0 -1px 0 hsl(var(--neu-dark) / 0.08),
               inset 0 2px 0 hsl(var(--neu-light) / 0.7)`
            : `0 4px 14px hsl(var(--neu-dark) / 0.3),
               inset 0 1px 0 hsl(var(--neu-light) / 0.6)`,
          borderBottom: '1.5px solid hsl(var(--neon-primary) / 0.35)',
        }}
      >
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-[5%] right-[5%] h-px" style={{
          background: 'linear-gradient(90deg, transparent, hsl(var(--neon-primary) / 0.4), hsl(var(--neon-cyan) / 0.25), hsl(var(--neon-primary) / 0.4), transparent)',
        }} />

        <div className="flex items-center justify-between h-[72px] px-3 gap-2">
          {/* Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'hsl(var(--background))',
                  boxShadow: `6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)),
                             -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)),
                             inset 0 2px 0 hsl(var(--neu-light) / 0.6),
                             inset 0 -1px 0 hsl(var(--neu-dark) / 0.12)`,
                  border: '1.5px solid hsl(var(--neon-primary) / 0.45)',
                }}
              >
                <Menu className="h-5 w-5 text-foreground" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-0" style={{
              background: 'hsl(var(--background))',
              borderRight: '2px solid hsl(var(--neon-primary) / 0.4)',
              boxShadow: '8px 0 32px hsl(var(--neu-dark) / 0.5)',
            }}>
              {/* Drawer Header */}
              <div className="p-5 pb-4" style={{
                borderBottom: '1px solid hsl(var(--neon-primary) / 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
                    boxShadow: '4px 4px 10px hsl(var(--neu-dark) / 0.5), -2px -2px 6px hsl(var(--neu-light) / 0.3)',
                    border: '1.5px solid hsl(var(--neon-primary) / 0.7)',
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
              <nav className="p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-2">Categorias</p>
                {categoriesLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                  ))
                ) : (
                  parentCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <SheetClose asChild>
                        <Link
                          to={`/categoria/${cat.slug}`}
                          className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group"
                          style={{
                            background: 'hsl(var(--background))',
                            boxShadow: `4px 4px 10px hsl(var(--neu-dark) / calc(var(--neu-intensity) * 0.7)),
                                       -4px -4px 10px hsl(var(--neu-light) / calc(var(--neu-intensity) * 0.9)),
                                       inset 0 1px 0 hsl(var(--neu-light) / 0.4)`,
                            border: '1px solid hsl(var(--neon-primary) / 0.15)',
                          }}
                        >
                          <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                            background: 'hsl(var(--background))',
                            boxShadow: 'inset 2px 2px 4px hsl(var(--neu-dark) / 0.5), inset -2px -2px 4px hsl(var(--neu-light) / 0.5)',
                            border: '1px solid hsl(var(--neon-primary) / 0.15)',
                          }}>
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      </SheetClose>
                    </motion.div>
                  ))
                )}

                {/* Divider */}
                <div className="pt-3 mt-3" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.12)' }}>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-2">Links</p>
                  {[
                    { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
                    { to: '/sobre', icon: Info, label: 'Sobre Nós' },
                    { to: '/faq', icon: HelpCircle, label: 'FAQ' },
                  ].map((link) => (
                    <SheetClose key={link.to} asChild>
                      <Link
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            <img 
              src={company?.header_logo || logoPincel} 
              alt="Logo"
              className="h-14 w-auto max-w-[200px] object-contain"
            />
          </Link>

          {/* Search Button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsSearchOpen(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'hsl(var(--background))',
              boxShadow: `6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)),
                         -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)),
                         inset 0 2px 0 hsl(var(--neu-light) / 0.6),
                         inset 0 -1px 0 hsl(var(--neu-dark) / 0.12)`,
              border: '1.5px solid hsl(var(--neon-primary) / 0.45)',
            }}
          >
            <Search className="h-5 w-5 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-0 z-50 h-[72px] px-3 flex items-center"
            style={{
              background: 'hsl(var(--background))',
              boxShadow: '0 6px 20px hsl(var(--neu-dark) / 0.4)',
              borderBottom: '1.5px solid hsl(var(--neon-primary) / 0.5)',
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center w-full gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setIsSearchOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'hsl(var(--background))',
                  boxShadow: '3px 3px 8px hsl(var(--neu-dark) / 0.5), -3px -3px 8px hsl(var(--neu-light) / 0.5)',
                  border: '1px solid hsl(var(--neon-primary) / 0.3)',
                }}
              >
                <X className="h-4 w-4" />
              </motion.button>
              <div className="flex-1 rounded-2xl overflow-hidden" style={{
                boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.5), inset -4px -4px 10px hsl(var(--neu-light) / 0.7)',
                border: '1px solid hsl(var(--neon-primary) / 0.4)',
              }}>
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 shadow-none bg-transparent"
                  autoFocus
                />
              </div>
              <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="shrink-0 rounded-xl">
                Buscar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Strip */}
      <div className="py-1.5 px-4 text-center text-xs font-bold relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
        borderBottom: '1px solid hsl(var(--neon-accent) / 0.3)',
      }}>
        {/* Shimmer */}
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
