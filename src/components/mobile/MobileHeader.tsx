import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu, ChevronRight, Package, Info, HelpCircle, Sparkles, ShoppingCart, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import logoPincel from '@/assets/logo-pincel-de-luz.png';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export function MobileHeader() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40">
      {/* ─── Top Bar ─── */}
      <div
        className="transition-all duration-500"
        style={{
          background: scrolled ? 'hsl(var(--background) / 0.92)' : 'hsl(var(--background))',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          boxShadow: scrolled ? '0 1px 12px hsl(var(--neu-dark) / 0.15)' : 'none',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground"
                style={{
                  background: 'hsl(var(--muted) / 0.5)',
                }}
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-border bg-background">
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

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src={company?.header_logo || logoPincel}
              alt="Logo"
              className="h-9 w-auto max-w-[140px] object-contain"
            />
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground"
              style={{ background: 'hsl(var(--muted) / 0.5)' }}
            >
              <Search className="h-[18px] w-[18px]" />
            </motion.button>

            <Link to="/carrinho">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground relative"
                style={{ background: 'hsl(var(--muted) / 0.5)' }}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      border: '2px solid hsl(var(--background))',
                    }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Search Overlay ─── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/10"
              style={{ backdropFilter: 'blur(6px)' }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed inset-x-3 top-3 z-50 rounded-2xl p-3 bg-background border border-border"
              style={{ boxShadow: '0 12px 40px hsl(var(--neu-dark) / 0.25)' }}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSearchOpen(false)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground shrink-0"
                >
                  <X className="h-5 w-5" />
                </motion.button>
                <Input
                  type="search"
                  placeholder="O que você procura?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-10 rounded-xl border-muted bg-muted/30 text-sm"
                  autoFocus
                />
                <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="rounded-xl shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Promo Strip ─── */}
      <div className="py-1.5 text-center text-[11px] font-semibold" style={{
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
      }}>
        🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}
      </div>

      {/* Thin separator */}
      <div className="h-px bg-border" />
    </header>
  );
}

/* ─── Drawer ─── */
function MobileDrawer({ company, categories, loading, searchQuery, setSearchQuery, handleSearch }: any) {
  return (
    <div className="flex flex-col p-5 pt-8 gap-5">
      {/* Brand */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">{company?.company_name || 'Loja'}</p>
          <p className="text-[11px] text-muted-foreground">Explore nosso catálogo</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
          className="h-10 rounded-xl bg-muted/40 border-muted text-sm"
        />
      </form>

      {/* Categories */}
      <nav className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-1">Categorias</p>
        {loading ? (
          [...Array(5)].map((_: any, i: number) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)
        ) : (
          categories.map((cat: any, idx: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <SheetClose asChild>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      {/* Links */}
      <div className="pt-3 border-t border-border flex flex-col gap-0.5">
        {[
          { to: '/checkout', icon: Sparkles, label: 'Solicitar Orçamento' },
          { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
          { to: '/sobre', icon: Info, label: 'Sobre Nós' },
          { to: '/faq', icon: HelpCircle, label: 'FAQ' },
        ].map((link) => (
          <SheetClose key={link.to} asChild>
            <Link
              to={link.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
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
