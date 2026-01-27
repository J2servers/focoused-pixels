import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useCategories } from '@/hooks/useProducts';
import logoPincelDeLuz from '@/assets/logo-pincel-de-luz.png';

export function DynamicMainHeader() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { data: company } = useCompanyInfo();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  // Build hierarchy: parent categories with their subcategories
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

  // Use custom logo from database or fallback to Pincel de Luz logo
  const headerLogo = company?.header_logo || logoPincelDeLuz;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                <SheetClose asChild>
                  <Link to="/" className="text-lg font-bold text-primary">
                    {company?.company_name || 'GOAT'}
                  </Link>
                </SheetClose>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <Button 
                    type="submit" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Mobile Categories */}
                <nav className="flex flex-col gap-2">
                  {categoriesLoading ? (
                    [...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))
                  ) : (
                    categoryTree.map((category) => (
                      <SheetClose key={category.id} asChild>
                        <Link 
                          to={`/categoria/${category.slug}`}
                          className="py-2 px-3 rounded-md hover:bg-secondary transition-colors font-medium"
                        >
                          {category.name}
                        </Link>
                      </SheetClose>
                    ))
                  )}
                </nav>

                {/* Mobile Links */}
                <div className="border-t pt-4 flex flex-col gap-2">
                  <SheetClose asChild>
                    <Link to="/checkout" className="py-2 px-3 rounded-md hover:bg-secondary transition-colors">
                      Solicitar Orçamento
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/login" className="py-2 px-3 rounded-md hover:bg-secondary transition-colors">
                      Minha Conta
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={headerLogo} 
              alt={company?.company_name || 'Logo'} 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="O que você está procurando?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 h-11"
              />
              <Button 
                type="submit" 
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Search Toggle */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="pt-4">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                      autoFocus
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            {/* Quote Button */}
            <Link to="/checkout" className="hidden md:block">
              <Button variant="outline" size="sm">
                Orçamento
              </Button>
            </Link>

            {/* User */}
            <Link to="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/carrinho" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
