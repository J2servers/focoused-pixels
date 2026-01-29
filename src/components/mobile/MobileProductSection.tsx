import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { MobileProductCard } from './MobileProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  badge?: string;
  freeShipping?: boolean;
  inStock?: boolean;
}

interface MobileProductSectionProps {
  title: string;
  products: Product[];
  categorySlug?: string;
  showAll?: boolean;
}

export function MobileProductSection({ 
  title, 
  products, 
  categorySlug,
  showAll = true 
}: MobileProductSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Handle scroll to update fade indicators
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [products]);

  if (products.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold">{title}</h2>
        {showAll && categorySlug && (
          <Link 
            to={`/categoria/${categorySlug}`} 
            className="text-sm text-primary font-medium flex items-center"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      <div className="relative">
        {/* Left fade indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showLeftFade ? 1 : 0 }}
          className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
        />
        
        {/* Right fade indicator with animated chevron */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: showRightFade ? 1 : 0 }}
          className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1"
        >
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Horizontal Scroll - hidden scrollbar */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 scrollbar-none"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex gap-3 px-4">
            {products.slice(0, 6).map((product, index) => (
              <motion.div
                key={product.id}
                className="w-[160px] flex-shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MobileProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MobileProductGrid({ 
  products,
  title
}: { 
  products: Product[];
  title?: string;
}) {
  return (
    <section className="py-4 px-4">
      {title && (
        <h2 className="text-base font-bold mb-3">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <MobileProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
