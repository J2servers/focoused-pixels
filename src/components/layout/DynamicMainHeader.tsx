import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categoryTree = useMemo(() => {
    const parents = categories.filter(c => !c.parent_id);
    return parents.map(p => ({
      ...p,
      subcategories: categories.filter(c => c.parent_id === p.id)
    }));
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const headerLogo = company?.header_logo || logoPincelDeLuz;
  const headerLogoHeight = Math.min(Math.max(company?.header_logo_height ?? 64, 24), 180);

  return (
    <header className="sticky top-0 z-50">
      {/* Glass backdrop layer */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: scrolled
            ? 'hsl(var(--background) / 0.85)'
            : 'hsl(var(--background) / 0.95)',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px)',
        }}
      />

      {/* Bottom neon line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{
        background: `linear-gradient(90deg, 
          transparent 0%, 
          hsl(var(--neon-primary) / 0.6) 20%, 
          hsl(var(--neon-cyan) / 0.4) 50%, 
          hsl(var(--neon-primary) / 0.6) 80%, 
          transparent 100%)`,
      }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Main row - tall */}
        <div className="flex items-center justify-between h-24 gap-4">
          {/* Left: Menu (mobile) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <FloatingIconBtn>
                  <Menu className="h-5 w-5" />
                </FloatingIconBtn>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 border-r-0" style={{
                background: 'hsl(var(--background))',
                borderRight: '2px solid hsl(var(--neon-primary) / 0.3)',
              }}>
                <DrawerContent
                  company={company}
                  categoryTree={categoryTree}
                  categoriesLoading={categoriesLoading}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleSearch={handleSearch}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <motion.img
              src={headerLogo}
              alt={company?.company_name || 'Logo'}
              className="w-auto max-w-[240px] object-contain"
              style={{ height: `${headerLogoHeight}px` }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          </Link>

          {/* Desktop search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <motion.div
                className="relative rounded-full overflow-hidden"
                style={{
                  background: 'hsl(var(--background) / 0.6)',
                  boxShadow: `
                    8px 8px 20px hsl(var(--neu-dark) / 0.5),
                    -8px -8px 20px hsl(var(--neu-light) / 0.7),
                    inset 0 1px 0 hsl(var(--neu-light) / 0.5)
                  `,
                  border: '1px solid hsl(var(--neon-primary) / 0.2)',
                }}
                whileHover={{ boxShadow: `
                  8px 8px 20px hsl(var(--neu-dark) / 0.5),
                  -8px -8px 20px hsl(var(--neu-light) / 0.7),
                  inset 0 1px 0 hsl(var(--neu-light) / 0.5),
                  0 0 0 1px hsl(var(--neon-primary) / 0.4)
                `}}
              >
                <Input
                  type="search"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-5 pr-14 rounded-full border-0 shadow-none bg-transparent text-sm font-medium placeholder:text-muted-foreground/50"
                />
                <motion.div whileTap={{ scale: 0.85 }} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button type="submit" size="icon" className="h-8 w-8 rounded-full">
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile search */}
            <div className="lg:hidden">
              <FloatingIconBtn onClick={() => setSearchOpen(true)}>
                <Search className="h-[18px] w-[18px]" />
              </FloatingIconBtn>
            </div>

            {/* Quote - desktop */}
            <Link to="/checkout" className="hidden md:block">
              <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <div
                  className="px-5 h-11 rounded-full flex items-center gap-2 text-xs font-bold tracking-wide text-foreground cursor-pointer transition-colors hover:text-primary"
                  style={{
                    background: 'hsl(var(--background) / 0.7)',
                    boxShadow: `
                      8px 8px 20px hsl(var(--neu-dark) / 0.45),
                      -8px -8px 20px hsl(var(--neu-light) / 0.65),
                      inset 0 1px 0 hsl(var(--neu-light) / 0.6)
                    `,
                    border: '1px solid hsl(var(--neon-accent) / 0.35)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Orçamento
                </div>
              </motion.div>
            </Link>

            {/* User */}
            <Link to="/minha-area">
              <FloatingIconBtn>
                <User className="h-[18px] w-[18px]" />
              </FloatingIconBtn>
            </Link>

            {/* Cart */}
            <Link to="/carrinho" className="relative">
              <FloatingIconBtn>
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
                        boxShadow: '0 2px 8px hsl(var(--primary) / 0.5)',
                      }}
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </FloatingIconBtn>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 top-0 z-50 h-24 px-4 flex items-center"
            style={{
              background: 'hsl(var(--background))',
              borderBottom: '2px solid hsl(var(--neon-primary) / 0.4)',
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center w-full gap-3">
              <FloatingIconBtn onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </FloatingIconBtn>
              <div className="flex-1 rounded-full overflow-hidden" style={{
                boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.5), inset -4px -4px 10px hsl(var(--neu-light) / 0.7)',
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
              <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="rounded-full px-4">
                Buscar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Floating Icon Button ── */
function FloatingIconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.85, y: 2 }}
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="w-12 h-12 rounded-full flex items-center justify-center relative text-foreground cursor-pointer"
      style={{
        background: 'hsl(var(--background) / 0.8)',
        boxShadow: `
          10px 10px 24px hsl(var(--neu-dark) / 0.5),
          -10px -10px 24px hsl(var(--neu-light) / 0.7),
          inset 0 2px 0 hsl(var(--neu-light) / 0.6),
          inset 0 -2px 0 hsl(var(--neu-dark) / 0.08)
        `,
        border: '1px solid hsl(var(--neon-primary) / 0.25)',
      }}
    >
      {children}
    </motion.button>
  );
}

/* ── Drawer Content ── */
function DrawerContent({ company, categoryTree, categoriesLoading, searchQuery, setSearchQuery, handleSearch }: any) {
  return (
    <div className="flex flex-col gap-5 mt-6 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.15)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
          boxShadow: '0 4px 14px hsl(var(--primary) / 0.4)',
        }}>
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">{company?.company_name || 'Loja'}</p>
          <p className="text-[10px] text-muted-foreground">Navegue pelo catálogo</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="rounded-full overflow-hidden" style={{
          boxShadow: 'inset 3px 3px 8px hsl(var(--neu-dark) / 0.5), inset -3px -3px 8px hsl(var(--neu-light) / 0.7)',
          border: '1px solid hsl(var(--neon-primary) / 0.2)',
        }}>
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent rounded-full pr-10"
          />
        </div>
      </form>

      {/* Categories */}
      <nav className="flex flex-col gap-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-1">Categorias</p>
        {categoriesLoading ? (
          [...Array(5)].map((_: any, i: number) => <Skeleton key={i} className="h-11 w-full rounded-full" />)
        ) : (
          categoryTree.map((cat: any, idx: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
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
                  <span>{cat.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      {/* Quick links */}
      <div className="pt-3 flex flex-col gap-1" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.1)' }}>
        <SheetClose asChild>
          <Link to="/checkout" className="py-2.5 px-4 rounded-full text-sm font-medium hover:text-primary transition-colors">
            Solicitar Orçamento
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link to="/login" className="py-2.5 px-4 rounded-full text-sm font-medium hover:text-primary transition-colors">
            Minha Conta
          </Link>
        </SheetClose>
      </div>
    </div>
  );
}

