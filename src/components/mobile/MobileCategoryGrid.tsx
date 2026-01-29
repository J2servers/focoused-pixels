import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { useState, useRef, useEffect } from 'react';

export function MobileCategoryGrid() {
  const { data: categories = [] } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  
  // Filter only parent categories
  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 8);

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
  }, [parentCategories]);

  if (parentCategories.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold">Categorias</h2>
        <Link to="/categorias" className="text-sm text-primary font-medium flex items-center">
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </Link>
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
        
        {/* Scrollable container - hidden scrollbar */}
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
            {parentCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/categoria/${category.slug}`}
                  className="flex flex-col items-center w-20 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95 overflow-hidden border border-primary/10">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <span className="text-xs text-center font-medium text-foreground line-clamp-2 leading-tight">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
