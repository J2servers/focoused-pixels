import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import logoPincelDeLuz from '@/assets/logo-pincel-de-luz.png';

export function DynamicMainHeader() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter(c => !c.parent_id);
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: categories.filter(c => c.parent_id === parent.id)
    }));
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const headerLogo = company?.header_logo || logoPincelDeLuz;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: 'hsl(var(--background))',
        boxShadow: scrolled
          ? `0 8px 32px hsl(var(--neu-dark) / 0.45), 
             0 2px 8px hsl(var(--neu-dark) / 0.2),
             inset 0 -1px 0 hsl(var(--neu-dark) / 0.1),
             inset 0 1px 0 hsl(var(--neu-light) / 0.7)`
          : `0 6px 20px hsl(var(--neu-dark) / 0.3), 
             inset 0 -1px 0 hsl(var(--neu-dark) / 0.08),
             inset 0 1px 0 hsl(var(--neu-light) / 0.6)`,
        borderBottom: '1px solid hsl(var(--neon-primary) / 0.35)',
      }}
    >
      {/* Inner glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, hsl(var(--neon-primary) / 0.5), hsl(var(--neon-cyan) / 0.3), hsl(var(--neon-primary) / 0.5), transparent)',
      }} />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-5">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                <button
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: `6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)),
                               -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)),
                               inset 0 1px 0 hsl(var(--neu-light) / 0.6),
                               inset 0 -1px 0 hsl(var(--neu-dark) / 0.15)`,
                    border: '1px solid hsl(var(--neon-primary) / 0.5)',
                  }}
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[310px] sm:w-[360px] p-0 border-r-0" style={{
              background: 'hsl(var(--background))',
              borderRight: '2px solid hsl(var(--neon-primary) / 0.4)',
              boxShadow: '8px 0 32px hsl(var(--neu-dark) / 0.5)',
            }}>
              <div className="flex flex-col gap-6 mt-8 p-5">
                {/* Drawer Logo */}
                <div className="flex items-center gap-3 pb-4" style={{
                  borderBottom: '1px solid hsl(var(--neon-primary) / 0.2)',
                }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
                    boxShadow: '4px 4px 10px hsl(var(--neu-dark) / 0.5), -2px -2px 6px hsl(var(--neu-light) / 0.3)',
                    border: '1px solid hsl(var(--neon-primary) / 0.7)',
                  }}>
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg tracking-tight">{company?.company_name || 'Loja'}</span>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="rounded-2xl overflow-hidden" style={{
                    boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.6), inset -4px -4px 10px hsl(var(--neu-light) / 0.8), inset 0 1px 3px hsl(var(--neu-dark) / 0.2)',
                    border: '1px solid hsl(var(--neon-primary) / 0.25)',
                  }}>
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 shadow-none bg-transparent pr-10"
                    />
                  </div>
                  <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-0 h-full">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Categories */}
                <nav className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-1">Categorias</p>
                  {categoriesLoading ? (
                    [...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                    ))
                  ) : (
                    categoryTree.map((category, idx) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <SheetClose asChild>
                          <Link 
                            to={`/categoria/${category.slug}`}
                            className="flex items-center justify-between py-3 px-4 rounded-2xl text-sm font-semibold transition-all duration-300 group"
                            style={{
                              background: 'hsl(var(--background))',
                              boxShadow: `4px 4px 10px hsl(var(--neu-dark) / calc(var(--neu-intensity) * 0.7)),
                                         -4px -4px 10px hsl(var(--neu-light) / calc(var(--neu-intensity) * 0.9)),
                                         inset 0 1px 0 hsl(var(--neu-light) / 0.4)`,
                              border: '1px solid hsl(var(--neon-primary) / 0.2)',
                            }}
                          >
                            <span className="group-hover:text-primary transition-colors">{category.name}</span>
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{
                              background: 'hsl(var(--background))',
                              boxShadow: 'inset 2px 2px 4px hsl(var(--neu-dark) / 0.5), inset -2px -2px 4px hsl(var(--neu-light) / 0.5)',
                              border: '1px solid hsl(var(--neon-primary) / 0.15)',
                            }}>
                              <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">→</span>
                            </div>
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))
                  )}
                </nav>

                {/* Quick links */}
                <div className="pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.15)' }}>
                  <SheetClose asChild>
                    <Link to="/checkout" className="py-2.5 px-4 rounded-xl text-sm font-medium hover:text-primary transition-colors">
                      Solicitar Orçamento
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/login" className="py-2.5 px-4 rounded-xl text-sm font-medium hover:text-primary transition-colors">
                      Minha Conta
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo with glow */}
          <Link to="/" className="flex-shrink-0 relative group">
            <img 
              src={headerLogo} 
              alt={company?.company_name || 'Logo'} 
              className="h-14 md:h-16 lg:h-20 w-auto max-w-[220px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Search - Deep Inset */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div 
              className="relative w-full rounded-2xl overflow-hidden transition-all duration-400"
              style={{
                boxShadow: searchFocused
                  ? `inset 5px 5px 12px hsl(var(--neu-dark) / 0.7),
                     inset -5px -5px 12px hsl(var(--neu-light) / 0.9),
                     inset 0 2px 4px hsl(var(--neu-dark) / 0.25)`
                  : `inset 4px 4px 10px hsl(var(--neu-dark) / 0.5),
                     inset -4px -4px 10px hsl(var(--neu-light) / 0.7),
                     inset 0 1px 3px hsl(var(--neu-dark) / 0.15)`,
                border: searchFocused
                  ? '1.5px solid hsl(var(--neon-primary) / 0.8)'
                  : '1px solid hsl(var(--neon-primary) / 0.3)',
              }}
            >
              <Input
                type="search"
                placeholder="O que você está procurando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pr-14 h-12 rounded-2xl border-0 shadow-none bg-transparent text-sm font-medium placeholder:text-muted-foreground/60"
              />
              <motion.div whileTap={{ scale: 0.88 }} className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <Button 
                  type="submit" 
                  size="icon"
                  className="h-9 w-9 rounded-xl"
                  style={{
                    boxShadow: `3px 3px 8px hsl(var(--neu-dark) / 0.4),
                               -2px -2px 6px hsl(var(--neu-light) / 0.3),
                               inset 0 1px 0 hsl(0 0% 100% / 0.25)`,
                    border: '1px solid hsl(var(--neon-primary) / 0.5)',
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Trigger */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <NavIconButton>
                  <Search className="h-[18px] w-[18px]" />
                </NavIconButton>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto" style={{
                background: 'hsl(var(--background))',
                borderBottom: '2px solid hsl(var(--neon-primary) / 0.4)',
                boxShadow: '0 8px 24px hsl(var(--neu-dark) / 0.4)',
              }}>
                <form onSubmit={handleSearch} className="pt-4">
                  <div className="relative rounded-2xl" style={{
                    boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.5), inset -4px -4px 10px hsl(var(--neu-light) / 0.7)',
                    border: '1px solid hsl(var(--neon-primary) / 0.4)',
                  }}>
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 shadow-none bg-transparent pr-10"
                      autoFocus
                    />
                    <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            {/* Quote Button */}
            <Link to="/checkout" className="hidden md:block">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="rounded-2xl font-bold text-xs tracking-wide"
                  style={{
                    boxShadow: `5px 5px 12px hsl(var(--neu-dark) / var(--neu-intensity)),
                               -5px -5px 12px hsl(var(--neu-light) / var(--neu-intensity)),
                               inset 0 1px 0 hsl(var(--neu-light) / 0.5)`,
                    border: '1.5px solid hsl(var(--neon-accent) / 0.6)',
                  }}
                >
                  Orçamento
                </Button>
              </motion.div>
            </Link>

            {/* User */}
            <Link to="/minha-area">
              <NavIconButton>
                <User className="h-[18px] w-[18px]" />
              </NavIconButton>
            </Link>

            {/* Cart */}
            <Link to="/carrinho" className="relative">
              <NavIconButton>
                <ShoppingCart className="h-[18px] w-[18px]" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
                        color: 'hsl(var(--primary-foreground))',
                        border: '2px solid hsl(var(--background))',
                        boxShadow: '0 3px 8px hsl(var(--primary) / 0.5), 0 0 0 1px hsl(var(--neon-primary) / 0.6)',
                      }}
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavIconButton>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── Reusable deep neumorphic icon button ── */
function NavIconButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.div whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06, y: -1 }}>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center relative transition-all duration-300 cursor-pointer text-foreground"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: `6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)),
                     -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)),
                     inset 0 2px 0 hsl(var(--neu-light) / 0.6),
                     inset 0 -1px 0 hsl(var(--neu-dark) / 0.12)`,
          border: '1.5px solid hsl(var(--neon-primary) / 0.45)',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
