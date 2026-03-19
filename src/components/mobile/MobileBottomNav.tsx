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
  { icon: User, label: 'Conta', path: '/login' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      {/* Frosted glass container */}
      <div
        className="mx-3 mb-2 rounded-2xl border border-border/60 overflow-hidden"
        style={{
          background: 'hsl(var(--background) / 0.85)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          boxShadow: '0 -4px 24px hsl(var(--neu-dark) / 0.12), 0 0 0 0.5px hsl(var(--border) / 0.5)',
        }}
      >
        <div className="flex items-center justify-around h-[60px] px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isCart = item.path === '/carrinho';

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative group"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive
                      ? "bg-primary/10"
                      : "bg-transparent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive
                        ? "text-primary stroke-[2.5px]"
                        : "text-muted-foreground stroke-[1.8px]"
                    )}
                  />

                  {/* Cart badge */}
                  {isCart && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                      }}
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </motion.div>

                <span
                  className={cn(
                    "text-[10px] mt-0.5 transition-all duration-300",
                    isActive
                      ? "font-bold text-primary"
                      : "font-medium text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>

                {/* Active pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPill"
                    className="absolute -bottom-1 w-5 h-[3px] rounded-full"
                    style={{ background: 'hsl(var(--primary))' }}
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
