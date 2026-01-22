import { memo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import logo from '@/assets/logo-pincel-de-luz.png';

export const MobileHeader = memo(() => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: company } = useCompanyInfo();
  const navigate = useNavigate();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border lg:hidden safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.form
              key="search-form"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSearch}
              className="flex items-center gap-2 flex-1"
            >
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-9 text-sm"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={toggleSearch}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="header-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              <Link to="/" className="flex items-center">
                <img 
                  src={company?.header_logo || logo} 
                  alt={company?.company_name || 'Logo'} 
                  className="h-9 w-auto object-contain"
                  loading="eager"
                />
              </Link>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={toggleSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  asChild
                >
                  <Link to="/rastreio">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
});

MobileHeader.displayName = 'MobileHeader';
