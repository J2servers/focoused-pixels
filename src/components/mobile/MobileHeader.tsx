import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Menu, ChevronRight, Sparkles, Home, Info, HelpCircle, Package } from 'lucide-react';
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
} from '@/components/ui/sheet';

export function MobileHeader() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

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
      <div className="bg-background" style={{
        boxShadow: '0 4px 12px hsl(var(--neu-dark) / 0.3), 0 -2px 8px hsl(var(--neu-light) / 0.5) inset',
        borderBottom: '1px solid hsl(var(--neon-primary) / 0.25)',
      }}>
        <div className="flex items-center justify-between h-[72px] px-3">
          {/* Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.92 }}
                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'hsl(var(--background))',
                  boxShadow: '3px 3px 6px hsl(var(--neu-dark) / var(--neu-intensity)), -3px -3px 6px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.4)',
                  border: '1px solid hsl(var(--neon-primary) / 0.3)',
                }}
              >
                <Menu className="h-5 w-5 text-foreground" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-0" style={{
              background: 'hsl(var(--background))',
              borderRight: '1px solid hsl(var(--neon-primary) / 0.4)',
            }}>
              {/* Drawer Header */}
              <div className="p-5 pb-4" style={{
                borderBottom: '1px solid hsl(var(--neon-primary) / 0.15)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{
                    background: 'hsl(var(--primary))',
                    boxShadow: '2px 2px 6px hsl(var(--neu-dark) / 0.5), -2px -2px 6px hsl(var(--neu-light) / 0.3)',
                    border: '1px solid hsl(var(--neon-primary) / 0.6)',
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
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Categorias</p>
                {categoriesLoading ? (
                  [...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-11 w-full rounded-2xl" />
                  ))
                ) : (
                  parentCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        to={`/categoria/${cat.slug}`}
                        className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group"
                        style={{
                          background: 'hsl(var(--background))',
                          boxShadow: '3px 3px 6px hsl(var(--neu-dark) / calc(var(--neu-intensity) * 0.6)), -3px -3px 6px hsl(var(--neu-light) / calc(var(--neu-intensity) * 0.8)), inset 0 1px 0 hsl(var(--neu-light) / 0.3)',
                          border: '1px solid hsl(var(--neon-primary) / 0.1)',
                        }}
                      >
                        <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </motion.div>
                  ))
                )}

                {/* Divider */}
                <div className="pt-3 mt-3" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.1)' }}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Links</p>
                  {[
                    { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
                    { to: '/sobre', icon: Info, label: 'Sobre Nós' },
                    { to: '/faq', icon: HelpCircle, label: 'FAQ' },
                  ].map((link, i) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center flex-1 justify-center px-2">
            <img 
              src={company?.header_logo || logoPincel} 
              alt="Pincel de Luz"
              className="h-14 w-auto max-w-[200px] object-contain"
            />
          </Link>

          {/* Search Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: 'hsl(var(--background))',
              boxShadow: '3px 3px 6px hsl(var(--neu-dark) / var(--neu-intensity)), -3px -3px 6px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.4)',
              border: '1px solid hsl(var(--neon-primary) / 0.3)',
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
            className="absolute inset-x-0 top-0 z-50 h-14 px-3"
            style={{
              background: 'hsl(var(--background))',
              boxShadow: '0 4px 12px hsl(var(--neu-dark) / 0.3)',
              borderBottom: '1px solid hsl(var(--neon-primary) / 0.4)',
            }}
          >
            <form onSubmit={handleSearch} className="flex items-center h-full gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: 'hsl(var(--background))',
                  boxShadow: '2px 2px 4px hsl(var(--neu-dark) / 0.5), -2px -2px 4px hsl(var(--neu-light) / 0.5)',
                }}
              >
                <X className="h-4 w-4" />
              </motion.button>
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="shrink-0 rounded-xl">
                Buscar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Strip */}
      <div className="py-1.5 px-4 text-center text-xs font-semibold" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
        color: 'hsl(var(--primary-foreground))',
        borderBottom: '1px solid hsl(var(--neon-accent) / 0.3)',
      }}>
        🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}
      </div>
    </header>
  );
}
