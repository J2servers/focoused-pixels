import { MobileCategoriesPage } from '@/components/mobile/MobileCategoriesPage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigate } from 'react-router-dom';

// Route wrapper that redirects desktop users to home
const MobileCategoriesRoute = () => {
  const isMobile = useIsMobile();
  
  // On desktop, redirect to home since categories are in the nav
  if (isMobile === false) {
    return <Navigate to="/" replace />;
  }
  
  return <MobileCategoriesPage />;
};

export default MobileCategoriesRoute;
