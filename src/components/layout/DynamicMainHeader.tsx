import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveBrandImage } from '@/lib/branding';
import { FloatingIconBtn } from './header/FloatingIconBtn';
import { HeaderDrawer } from './header/HeaderDrawer';
import { HeaderSearchOverlay } from './header/HeaderSearchOverlay';

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
    return parents.map(p => ({ ...p, subcategories: categories.filter(c => c.parent_id === p.id) }));
  }, [categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const headerLogo = resolveBrandImage(company?.header_logo, company?.footer_logo);
  const headerLogoHeight = Math.min(Math.max(company?.header_logo_height ?? 64, 24), 180);

  return (
    <header className="sticky top-0 z-50" role="banner">
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: scrolled ? 'hsl(var(--background) / 0.25)' : 'hsl(var(--background) / 0.30)',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'blur(12px)',
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{
        background: `linear-gradient(90deg, transparent 0%, hsl(var(--neon-primary) / 0.6) 20%, hsl(var(--neon-cyan) / 0.4) 50%, hsl(var(--neon-primary) / 0.6) 80%, transparent 100%)`,
      }} />

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex items-center justify-between h-24 gap-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <FloatingIconBtn ariaLabel="Abrir menu de navegação">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </FloatingIconBtn>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 border-r-0" style={{
                background: 'hsl(var(--background))',
                borderRight: '2px solid hsl(var(--neon-primary) / 0.3)',
              }}>
                <HeaderDrawer
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

          <Link to="/" className="flex-shrink-0 group">
            {headerLogo ? (
              <motion.img
                src={headerLogo}
                alt={company?.company_name || 'Logo'}
                className="w-auto max-w-[240px] object-contain"
                style={{ height: `${headerLogoHeight}px` }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            ) : (
              <span className="text-xl font-semibold text-foreground">{company?.company_name || 'Início'}</span>
            )}
          </Link>

          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <motion.div
                className="relative rounded-full overflow-hidden"
                style={{
                  background: 'hsl(var(--background) / 0.6)',
                  boxShadow: `8px 8px 20px hsl(var(--neu-dark) / 0.5), -8px -8px 20px hsl(var(--neu-light) / 0.7), inset 0 1px 0 hsl(var(--neu-light) / 0.5)`,
                  border: '1px solid hsl(var(--neon-primary) / 0.2)',
                }}
                whileHover={{ boxShadow: `8px 8px 20px hsl(var(--neu-dark) / 0.5), -8px -8px 20px hsl(var(--neu-light) / 0.7), inset 0 1px 0 hsl(var(--neu-light) / 0.5), 0 0 0 1px hsl(var(--neon-primary) / 0.4)` }}
              >
                <Input
                  type="search"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar produtos"
                  className="w-full h-12 pl-5 pr-14 rounded-full border-0 shadow-none bg-transparent text-sm font-medium placeholder:text-muted-foreground/50"
                />
                <motion.div whileTap={{ scale: 0.85 }} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button type="submit" size="icon" className="h-8 w-8 rounded-full" aria-label="Buscar">
                    <Search className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="lg:hidden">
              <FloatingIconBtn onClick={() => setSearchOpen(true)} ariaLabel="Abrir busca">
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              </FloatingIconBtn>
            </div>

            <Link to="/pagamento" className="hidden md:block">
              <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                <div
                  className="px-5 h-11 rounded-full flex items-center gap-2 text-xs font-bold tracking-wide text-foreground cursor-pointer transition-colors hover:text-primary"
                  style={{
                    background: 'hsl(var(--background) / 0.7)',
                    boxShadow: `8px 8px 20px hsl(var(--neu-dark) / 0.45), -8px -8px 20px hsl(var(--neu-light) / 0.65), inset 0 1px 0 hsl(var(--neu-light) / 0.6)`,
                    border: '1px solid hsl(var(--neon-accent) / 0.35)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Orçamento
                </div>
              </motion.div>
            </Link>

            <Link to="/minha-area" aria-label="Minha conta">
              <FloatingIconBtn ariaLabel="Minha conta">
                <User className="h-[18px] w-[18px]" aria-hidden="true" />
              </FloatingIconBtn>
            </Link>

            <Link to="/carrinho" className="relative" aria-label={`Carrinho${itemCount > 0 ? ` com ${itemCount} itens` : ''}`}>
              <FloatingIconBtn ariaLabel="Carrinho de compras">
                <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
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

      <AnimatePresence>
        {searchOpen && (
          <HeaderSearchOverlay
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
