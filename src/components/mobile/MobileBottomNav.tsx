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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      <div
        className="mx-3 mb-2 rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: `
            6px 6px 16px hsl(var(--neu-dark) / 0.3),
            -6px -6px 16px hsl(var(--neu-light) / 0.5),
            inset 0 1px 0 hsl(var(--neu-light) / 0.4),
            inset 0 -1px 0 hsl(var(--neu-dark) / 0.05)
          `,
          border: '1px solid hsl(var(--neon-primary) / 0.2)',
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
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={isActive ? {
                    background: 'hsl(var(--background))',
                    boxShadow: `inset 3px 3px 6px hsl(var(--neu-dark) / 0.35),
                                inset -3px -3px 6px hsl(var(--neu-light) / 0.5)`,
                    border: '1px solid hsl(var(--neon-primary) / 0.4)',
                  } : {
                    background: 'hsl(var(--background))',
                    boxShadow: `2px 2px 5px hsl(var(--neu-dark) / 0.15),
                                -2px -2px 5px hsl(var(--neu-light) / 0.3),
                                inset 0 1px 0 hsl(var(--neu-light) / 0.2)`,
                    border: '1px solid transparent',
                  }}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground stroke-[1.8px]"
                    )}
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
                    "text-[10px] mt-0.5 transition-all duration-300",
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
