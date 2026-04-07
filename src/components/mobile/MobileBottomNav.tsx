import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="flex justify-center px-3 pb-2">
        <div
          className="relative w-full max-w-[360px] rounded-2xl overflow-visible"
          style={{
            background: 'hsl(var(--background))',
            boxShadow: `
              4px 4px 10px hsl(var(--neu-dark) / 0.4),
              -4px -4px 10px hsl(var(--neu-light) / 0.5),
              inset 1px 1px 2px hsl(var(--neu-light) / 0.3),
              inset -1px -1px 2px hsl(var(--neu-dark) / 0.1)
            `,
            border: '0.5px solid hsl(280 90% 65% / 0.3)',
          }}
        >
          <div className="flex items-center justify-around h-[48px] px-1 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isCart = item.path === '/carrinho';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center flex-1 h-full relative focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div
                        key="active"
                        initial={{ scale: 0.5, y: 0 }}
                        animate={{ scale: 1, y: -14 }}
                        exit={{ scale: 0.5, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        className="absolute -top-2 flex items-center justify-center"
                      >
                        {/* Outer glow ring */}
                        <div
                          className="w-[46px] h-[46px] rounded-full flex items-center justify-center"
                          style={{
                            background: 'hsl(var(--background))',
                            boxShadow: `
                              3px 3px 8px hsl(var(--neu-dark) / 0.45),
                              -3px -3px 8px hsl(var(--neu-light) / 0.5),
                              inset 2px 2px 4px hsl(var(--neu-light) / 0.3),
                              inset -2px -2px 4px hsl(var(--neu-dark) / 0.15)
                            `,
                            border: '1px solid hsl(280 90% 65% / 0.4)',
                          }}
                        >
                          {/* Inner filled circle */}
                          <div
                            className="w-[34px] h-[34px] rounded-full flex items-center justify-center relative"
                            style={{
                              background: 'hsl(var(--primary))',
                              boxShadow: `
                                inset 2px 2px 4px hsl(0 0% 100% / 0.15),
                                inset -2px -2px 4px hsl(0 0% 0% / 0.2),
                                0 2px 8px hsl(var(--primary) / 0.4)
                              `,
                            }}
                          >
                            <item.icon className="h-[16px] w-[16px] text-primary-foreground stroke-[2.5px]" aria-hidden="true" />
                            
                            {isCart && itemCount > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                style={{
                                  background: 'hsl(var(--destructive))',
                                  color: 'hsl(var(--destructive-foreground))',
                                  boxShadow: '0 2px 4px hsl(var(--destructive) / 0.4)',
                                }}
                              >
                                {itemCount > 9 ? '9+' : itemCount}
                              </motion.span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="inactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center relative"
                      >
                        <item.icon
                          className="h-[16px] w-[16px] text-muted-foreground stroke-[1.5px]"
                          aria-hidden="true"
                        />
                        {isCart && itemCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                            style={{
                              background: 'hsl(var(--primary))',
                              color: 'hsl(var(--primary-foreground))',
                            }}
                          >
                            {itemCount > 9 ? '9+' : itemCount}
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span
                    className={cn(
                      "text-[8px] transition-all duration-200 leading-none",
                      isActive ? "mt-5 font-bold text-primary" : "mt-0.5 font-medium text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
