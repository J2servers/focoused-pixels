import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Search, label: 'Buscar', path: '/busca' },
  { icon: Grid3X3, label: 'Categorias', path: '/categorias' },
  { icon: ShoppingCart, label: 'Carrinho', path: '/carrinho' },
  { icon: User, label: 'Conta', path: '/minha-area' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb" role="navigation" aria-label="Navegação principal">
      <div
        className="mx-0 mb-0 overflow-hidden"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: '0 -1px 4px hsl(var(--neu-dark) / 0.12)',
          borderTop: '1px solid hsl(var(--neon-primary) / 0.15)',
        }}
      >
        <div className="flex items-center justify-around h-[44px] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isCart = item.path === '/carrinho';

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative group focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={isActive ? {
                    background: 'hsl(var(--primary) / 0.1)',
                    border: '1px solid hsl(var(--neon-primary) / 0.3)',
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground stroke-[1.8px]"
                    )}
                    aria-hidden="true"
                  />

                  {isCart && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        boxShadow: '0 2px 4px hsl(var(--primary) / 0.3)',
                      }}
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </motion.div>

                <span
                  className={cn(
                    "text-[9px] mt-0 transition-all duration-200 leading-none",
                    isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute -bottom-1 w-5 h-[3px] rounded-full"
                    style={{
                      background: 'hsl(var(--primary))',
                      boxShadow: '0 0 8px hsl(var(--neon-primary) / 0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

