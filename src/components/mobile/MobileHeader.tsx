import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Bell, Menu } from 'lucide-react';
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
  SheetHeader,
  SheetTitle,
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
    <header className="sticky top-0 z-40 bg-background neu-flat safe-area-pt">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 neu-btn rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-background">
            <SheetHeader className="p-4 border-b border-border/30">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="p-4 space-y-2">
              {categoriesLoading ? (
                [...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))
              ) : (
                parentCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categoria/${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl neu-btn text-sm font-medium"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
              <div className="pt-4 border-t border-border/30 mt-4 space-y-2">
                <Link
                  to="/sobre"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium">Sobre Nós</span>
                </Link>
                <Link
                  to="/faq"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <span className="font-medium">FAQ</span>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={company?.header_logo || logoPincel} 
            alt="Pincel de Luz"
            className="h-8 w-auto"
          />
        </Link>

        {/* Search */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="neu-btn rounded-xl"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Full Screen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background z-50 h-14"
          >
            <form onSubmit={handleSearch} className="flex items-center h-full px-4 gap-2">
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                Buscar
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Banner */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium">
        🚚 {company?.free_shipping_message || 'Frete grátis acima de R$ 159'}
      </div>
    </header>
  );
}
