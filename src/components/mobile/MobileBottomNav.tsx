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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb"
      style={{
        background: 'hsl(var(--surface-elevated))',
        boxShadow: '0 -6px 16px hsl(var(--neu-dark) / 0.25), -6px -6px 12px hsl(var(--neu-light) / 0.6) inset, 0 0 0 1px hsl(var(--neon-primary) / 0.12)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCart = item.path === '/carrinho';
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={isActive ? {
                  background: 'hsl(var(--surface-inset))',
                  boxShadow: 'inset -3px -3px 6px hsl(var(--neu-light) / 0.85), inset 3px 3px 8px hsl(var(--neu-dark) / 0.30), 0 0 0 1px hsl(var(--neon-primary) / 0.35)',
                } : {
                  background: 'hsl(var(--surface-elevated))',
                  boxShadow: '-2px -2px 5px hsl(var(--neu-light) / 0.7), 3px 3px 6px hsl(var(--neu-dark) / 0.25)',
                }}
              >
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-colors duration-200",
                  isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground"
                )} />

                {/* Cart badge */}
                {isCart && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      boxShadow: '0 2px 6px hsl(var(--primary) / 0.35)',
                    }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </motion.div>

              <span className={cn(
                "text-[10px] mt-0.5 transition-colors duration-200",
                isActive ? "font-bold text-primary" : "font-medium text-muted-foreground"
              )}>
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{
                    background: 'hsl(var(--primary))',
                    boxShadow: '0 0 6px hsl(var(--primary) / 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
