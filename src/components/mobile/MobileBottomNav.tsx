import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}

const NavItem = memo(({ to, icon, label, isActive, badge }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex flex-col items-center justify-center gap-0.5 py-2 px-3 relative transition-colors",
      isActive ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div className="relative">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-2 h-4 min-w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium leading-tight">{label}</span>
    {isActive && (
      <motion.div
        layoutId="bottomNavIndicator"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    )}
  </Link>
));

NavItem.displayName = 'NavItem';

export const MobileBottomNav = memo(() => {
  const location = useLocation();
  const { itemCount } = useCart();
  const pathname = location.pathname;

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Início' },
    { to: '/busca', icon: <Search className="h-5 w-5" />, label: 'Buscar' },
    { to: '/categorias', icon: <Grid3X3 className="h-5 w-5" />, label: 'Categorias' },
    { to: '/carrinho', icon: <ShoppingCart className="h-5 w-5" />, label: 'Carrinho', badge: itemCount },
    { to: '/login', icon: <User className="h-5 w-5" />, label: 'Conta' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={
              item.to === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.to)
            }
            badge={item.badge}
          />
        ))}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';
