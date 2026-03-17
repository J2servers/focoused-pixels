import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NavigationBar() {
  const { data: categories = [], isLoading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categoryTree = useMemo(() => {
    const parentCategories = categories.filter(c => !c.parent_id);
    return parentCategories.map(parent => ({
      ...parent,
      subcategories: categories.filter(c => c.parent_id === parent.id)
    }));
  }, [categories]);

  if (isLoading) {
    return (
      <nav className="hidden lg:block" style={{
        background: 'hsl(var(--background))',
        boxShadow: '0 4px 12px hsl(var(--neu-dark) / 0.2), inset 0 1px 0 hsl(var(--neu-light) / 0.5)',
        borderBottom: '1px solid hsl(var(--neon-primary) / 0.1)',
      }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 h-12">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="hidden lg:block relative z-50"
      style={{
        background: 'hsl(var(--background))',
        boxShadow: '0 4px 14px hsl(var(--neu-dark) / 0.25), inset 0 1px 0 hsl(var(--neu-light) / 0.5), inset 0 -1px 0 hsl(var(--neu-dark) / 0.08)',
        borderBottom: '1px solid hsl(var(--neon-primary) / 0.12)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
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
                    className={cn(
                      "flex h-12 items-center gap-1 px-5 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 relative",
                      hoveredCategory === category.id ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                  >
                    {category.name}
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      hoveredCategory === category.id && "rotate-180"
                    )} />

                    {/* Active underline */}
                    {hoveredCategory === category.id && (
                      <motion.div
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                        style={{
                          background: 'hsl(var(--primary))',
                          boxShadow: '0 0 8px hsl(var(--neon-primary) / 0.6)',
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                  
                  <AnimatePresence>
                    {hoveredCategory === category.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full pt-2 z-50"
                      >
                        <div
                          className="rounded-2xl p-4 min-w-[300px]"
                          style={{
                            background: 'hsl(var(--background))',
                            boxShadow: '8px 8px 20px hsl(var(--neu-dark) / var(--neu-intensity)), -8px -8px 20px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.4)',
                            border: '1px solid hsl(var(--neon-primary) / 0.25)',
                          }}
                        >
                          <Link
                            to={`/categoria/${category.slug}`}
                            className="block mb-3 pb-3"
                            style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.12)' }}
                          >
                            <span className="text-sm font-bold text-primary hover:underline">
                              Ver todos em {category.name}
                            </span>
                          </Link>
                          
                          <div className="grid grid-cols-1 gap-1">
                            {category.subcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/categoria/${category.slug}/${sub.slug}`}
                                className="group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-muted/30"
                              >
                                {sub.image_url && (
                                  <div
                                    className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                                    style={{
                                      boxShadow: 'inset 2px 2px 4px hsl(var(--neu-dark) / 0.4), inset -2px -2px 4px hsl(var(--neu-light) / 0.5)',
                                      border: '1px solid hsl(var(--neon-primary) / 0.15)',
                                    }}
                                  >
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
                  className="flex h-12 items-center px-5 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors relative group"
                >
                  {category.name}
                </Link>
              )}
            </div>
          ))}
          <Link 
            to="/rastreio"
            className="flex h-12 items-center px-5 text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors"
          >
            Rastreio
          </Link>
        </div>
      </div>
    </nav>
  );
}
