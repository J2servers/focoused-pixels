import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NavigationBar() {
  const { data: categories = [], isLoading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Build hierarchy: parent categories with their subcategories
  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter(c => !c.parent_id);
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: categories.filter(c => c.parent_id === parent.id)
    }));
  }, [categories]);

  if (isLoading) {
    return (
      <nav className="bg-background border-b border-border hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 h-12">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background border-b border-border hidden lg:block relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center flex-wrap">
          {categoryTree.map((category) => (
            <div 
              key={category.id} 
              className="relative"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {category.subcategories && category.subcategories.length > 0 ? (
                <>
                  <Link 
                    to={`/categoria/${category.slug}`}
                    className="flex h-12 items-center gap-1 px-4 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      hoveredCategory === category.id && "rotate-180"
                    )} />
                  </Link>
                  
                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {hoveredCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-1 z-50"
                      >
                        <div className="bg-card border border-border rounded-lg shadow-xl p-4 min-w-[300px]">
                          {/* Category Header */}
                          <Link
                            to={`/categoria/${category.slug}`}
                            className="block mb-3 pb-3 border-b border-border"
                          >
                            <span className="text-sm font-bold text-primary hover:underline">
                              Ver todos em {category.name}
                            </span>
                          </Link>
                          
                          {/* Subcategories Grid */}
                          <div className="grid grid-cols-1 gap-1">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/categoria/${category.slug}/${sub.slug}`}
                                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                              >
                                {sub.image_url && (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                                    <img 
                                      src={sub.image_url} 
                                      alt={sub.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                  </div>
                                )}
                                <div>
                                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {sub.name}
                                  </span>
                                  {sub.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {sub.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link 
                  to={`/categoria/${category.slug}`}
                  className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              )}
            </div>
          ))}
          <Link 
            to="/rastreio"
            className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors"
          >
            Rastreio
          </Link>
        </div>
      </div>
    </nav>
  );
}
