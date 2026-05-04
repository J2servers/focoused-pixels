import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { resolveBrandImage } from '@/lib/branding';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileDrawer } from './header/MobileDrawer';
import { MobileSearchOverlay } from './header/MobileSearchOverlay';

export function MobileHeader() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { itemCount, total } = useCart();
  const { freeShippingMinimum } = useSiteSettings();
  const minShipping = freeShippingMinimum || 159;
  const freeShippingProgress = Math.min((total / minShipping) * 100, 100);
  const hasFreeShipping = total >= minShipping;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const mobileLogoHeight = Math.min(Math.max(company?.header_logo_mobile_height ?? 36, 20), 140);
  const mobileLogo = resolveBrandImage(company?.header_logo, company?.footer_logo);
  const categorySuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return parentCategories.slice(0, 6);
    return parentCategories.filter((cat) => cat.name.toLowerCase().includes(query)).slice(0, 8);
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
        <div className="flex items-center justify-between h-12 px-3">
          <Sheet>
            <SheetTrigger asChild>
              <motion.button whileTap={{ scale: 0.9 }} className="neu-icon-btn" aria-label="Abrir menu de navegação">
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

          <Link to="/" className="absolute left-1/2 -translate-x-1/2" aria-label={company?.company_name || 'Página inicial'}>
            {mobileLogo ? (
              <img
                src={mobileLogo}
                alt={company?.company_name || 'Página inicial'}
                className="w-auto max-w-[160px] object-contain"
                style={{ height: `${mobileLogoHeight}px` }}
              />
            ) : (
              <span className="text-sm font-semibold text-foreground">{company?.company_name || 'Início'}</span>
            )}
          </Link>

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
                    aria-live="polite"
                    aria-label={`${itemCount} itens no carrinho`}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </motion.div>
            </Link>
          </div>
        </div>

        {itemCount > 0 && !hasFreeShipping && (
          <div className="px-4 pb-1.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
              </div>
              <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap">
                Falta R$ {(minShipping - total).toFixed(0)} p/ frete grátis
              </span>
            </div>
          </div>
        )}
        {itemCount > 0 && hasFreeShipping && (
          <div className="px-4 pb-1.5">
            <p className="text-[9px] text-center font-semibold" style={{ color: 'hsl(var(--success))' }}>
              🎉 Frete grátis desbloqueado!
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {searchOpen && (
          <MobileSearchOverlay
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            onClose={() => setSearchOpen(false)}
            onCategorySelect={handleCategorySelect}
            suggestions={categorySuggestions}
          />
        )}
      </AnimatePresence>

      <div className="py-1 text-center text-[10px] font-semibold" style={{
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
      }}>
        🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}
      </div>
    </header>
  );
}
