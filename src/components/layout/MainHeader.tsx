import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { categories } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import logo from '@/assets/logo-pincel-de-luz.png';

export function MainHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-semibold text-primary hover:underline">
                  Home
                </Link>
                {categories.map((category) => (
                  <div key={category.id}>
                    <Link 
                      to={`/categoria/${category.slug}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                    {category.subcategories && (
                      <div className="ml-4 mt-2 flex flex-col gap-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/categoria/${category.slug}/${sub.slug}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link to="/rastreio" className="text-lg font-medium hover:text-primary transition-colors">
                  Rastreio
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Pincel de Luz - Personalizados" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="O que você procura?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-6 text-base border-2 border-muted focus:border-primary rounded-lg"
              />
              <Button 
                type="submit"
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="pt-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="O que você procura?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-12 py-6 text-base"
                    />
                    <Button 
                      type="submit"
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            {/* Checkout Link */}
            <Link to="/checkout" className="hidden sm:block">
              <Button variant="default" size="sm" className="text-sm gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Orçamento</span>
              </Button>
            </Link>

            {/* Account Links */}
            <div className="hidden sm:flex items-center gap-1">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Fazer login</span>
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="outline" size="sm" className="text-sm hidden lg:inline-flex">
                  Cadastre-se
                </Button>
              </Link>
            </div>

            {/* Cart */}
            <Link to="/carrinho">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
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
