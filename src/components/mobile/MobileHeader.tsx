import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu, ChevronRight, Package, Info, HelpCircle, Sparkles, ShoppingCart } from 'lucide-react';
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
  const mobileLogoHeight = Math.min(Math.max(company?.header_logo_mobile_height ?? 36, 20), 140);
  const categorySuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return parentCategories.slice(0, 6);
    return parentCategories
      .filter((cat) => cat.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [parentCategories, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCategorySelect = (slug: string, closeSearch = true) => {
    navigate(`/categoria/${slug}`);
    if (closeSearch) {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <div
        className="transition-all duration-500"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: scrolled
            ? `0 4px 16px hsl(var(--neu-dark) / 0.25), inset 0 -1px 0 hsl(var(--neu-dark) / 0.06), inset 0 1px 0 hsl(var(--neu-light) / 0.5)`
            : `0 2px 8px hsl(var(--neu-dark) / 0.12), inset 0 1px 0 hsl(var(--neu-light) / 0.4)`,
          borderBottom: '1px solid hsl(var(--neon-primary) / 0.2)',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="neu-icon-btn"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-5 w-5 text-foreground" aria-hidden="true" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-0" style={{
              background: 'hsl(var(--background))',
              borderRight: '1px solid hsl(var(--neon-primary) / 0.2)',
              boxShadow: '6px 0 24px hsl(var(--neu-dark) / 0.2)',
            }}>
              <MobileDrawer
                company={company}
                categories={parentCategories}
                loading={categoriesLoading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                handleCategorySelect={handleCategorySelect}
              />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Página inicial">
            <img
              src={company?.header_logo || logoPincel}
              alt={company?.company_name || 'Pincel de Luz - Página inicial'}
              className="w-auto max-w-[160px] object-contain"
              style={{ height: `${mobileLogoHeight}px` }}
            />
          </Link>

          {/* Right */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="neu-icon-btn"
              aria-label="Abrir busca"
            >
              <Search className="h-[18px] w-[18px] text-foreground" aria-hidden="true" />
            </motion.button>

            <Link to="/carrinho" aria-label={`Carrinho${itemCount > 0 ? ` com ${itemCount} itens` : ''}`}>
              <motion.div whileTap={{ scale: 0.9 }} className="neu-icon-btn relative">
                <ShoppingCart className="h-[18px] w-[18px] text-foreground" aria-hidden="true" />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-[9px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center"
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      border: '2px solid hsl(var(--background))',
                      boxShadow: '0 2px 6px hsl(var(--primary) / 0.4)',
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

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'hsl(var(--foreground) / 0.08)', backdropFilter: 'blur(6px)' }}
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed inset-x-3 top-3 z-50 rounded-2xl p-3"
              style={{
                background: 'hsl(var(--background))',
                boxShadow: `8px 8px 20px hsl(var(--neu-dark) / 0.35), -8px -8px 20px hsl(var(--neu-light) / 0.5), inset 0 1px 0 hsl(var(--neu-light) / 0.4)`,
                border: '1px solid hsl(var(--neon-primary) / 0.2)',
              }}
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSearchOpen(false)}
                  className="neu-icon-btn-sm shrink-0"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
                <div className="flex-1 rounded-xl overflow-hidden" style={{
                  boxShadow: 'inset 3px 3px 6px hsl(var(--neu-dark) / 0.3), inset -3px -3px 6px hsl(var(--neu-light) / 0.5)',
                  border: '1px solid hsl(var(--neon-primary) / 0.15)',
                }}>
                  <Input
                    type="search"
                    placeholder="O que você procura?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 shadow-none bg-transparent h-10 text-sm"
                    autoFocus
                  />
                </div>
                <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="rounded-xl shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2 px-1">
                  {searchQuery.trim() ? 'Categorias sugeridas' : 'Categorias populares'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categorySuggestions.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-primary/20 hover:bg-primary/10"
                    >
                      {cat.name}
                    </button>
                  ))}
                  {categorySuggestions.length === 0 && (
                    <span className="text-xs text-muted-foreground px-1">Nenhuma categoria encontrada.</span>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Promo Strip */}
      <div className="py-1.5 text-center text-[11px] font-semibold" style={{
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
      }}>
        🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}
      </div>
    </header>
  );
}

/* ─── Drawer ─── */
function MobileDrawer({
  company,
  categories,
  loading,
  searchQuery,
  setSearchQuery,
  handleSearch,
  handleCategorySelect,
}: any) {
  return (
    <div className="flex flex-col p-5 pt-8 gap-5">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.12)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
            boxShadow: '3px 3px 8px hsl(var(--neu-dark) / 0.3), -2px -2px 6px hsl(var(--neu-light) / 0.2)',
          }}
        >
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">{company?.company_name || 'Loja'}</p>
          <p className="text-[11px] text-muted-foreground">Explore nosso catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="rounded-xl overflow-hidden" style={{
          boxShadow: 'inset 3px 3px 6px hsl(var(--neu-dark) / 0.3), inset -3px -3px 6px hsl(var(--neu-light) / 0.5)',
          border: '1px solid hsl(var(--neon-primary) / 0.1)',
        }}>
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent h-10 text-sm"
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 6).map((cat: any) => (
          <SheetClose key={cat.id} asChild>
            <button
              type="button"
              onClick={() => handleCategorySelect(cat.slug, false)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              {cat.name}
            </button>
          </SheetClose>
        ))}
      </div>

      <nav className="flex flex-col gap-1.5">
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
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: '3px 3px 8px hsl(var(--neu-dark) / 0.2), -3px -3px 8px hsl(var(--neu-light) / 0.4)',
                    border: '1px solid hsl(var(--neon-primary) / 0.08)',
                  }}
                >
                  <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      <div className="pt-3" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.08)' }}>
        {[
          { to: '/checkout', icon: Sparkles, label: 'Solicitar Orçamento' },
          { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
          { to: '/sobre', icon: Info, label: 'Sobre Nós' },
          { to: '/faq', icon: HelpCircle, label: 'FAQ' },
        ].map((link) => (
          <SheetClose key={link.to} asChild>
            <Link
              to={link.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors"
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

