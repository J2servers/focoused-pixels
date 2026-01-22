import { memo, ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const MobileLayout = memo(({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}: MobileLayoutProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <MobileHeader />}
      <main className={`${showHeader ? 'pt-14' : ''} ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
});

MobileLayout.displayName = 'MobileLayout';
