import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
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
      className="hidden lg:block relative z-40"
      role="navigation"
      aria-label="Categorias de produtos"
      style={{
        background: 'hsl(var(--background))',
        boxShadow: `0 6px 18px hsl(var(--neu-dark) / 0.28),
                    inset 0 2px 0 hsl(var(--neu-light) / 0.6),
                    inset 0 -1px 0 hsl(var(--neu-dark) / 0.1)`,
        borderBottom: '1px solid hsl(var(--neon-primary) / 0.2)',
        borderTop: '1px solid hsl(var(--neon-primary) / 0.08)',
      }}
    >
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px" style={{
        background: 'linear-gradient(90deg, transparent, hsl(var(--neon-primary) / 0.35), hsl(var(--neon-cyan) / 0.2), hsl(var(--neon-primary) / 0.35), transparent)',
      }} />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1">
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
                      "relative flex h-12 items-center gap-1.5 px-5 text-sm font-bold uppercase tracking-[0.08em] transition-all duration-300",
                      hoveredCategory === category.id ? "text-primary" : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {category.name}
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      hoveredCategory === category.id && "rotate-180 text-primary"
                    )} />

                    {/* Active indicator */}
                    <span
                      className={cn(
                        "absolute bottom-1 left-3 right-3 h-[3px] rounded-full origin-center transition-all duration-300",
                        hoveredCategory === category.id ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                      )}
                      style={{
                        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--neon-cyan)))',
                        boxShadow: '0 0 10px hsl(var(--neon-primary) / 0.7), 0 0 20px hsl(var(--neon-primary) / 0.3)',
                      }}
                    />
                  </Link>
                  
                  {/* Dropdown - CSS transition */}
                  <div
                    className={cn(
                      "absolute left-0 top-full pt-3 z-50 transition-all duration-200",
                      hoveredCategory === category.id
                        ? "opacity-100 translate-y-0 pointer-events-auto visible"
                        : "opacity-0 translate-y-2 pointer-events-none invisible"
                    )}
                  >
                    <div
                      className="rounded-3xl p-5 min-w-[320px]"
                      style={{
                        background: 'hsl(var(--background))',
                        boxShadow: `10px 10px 28px hsl(var(--neu-dark) / var(--neu-intensity)),
                                   -10px -10px 28px hsl(var(--neu-light) / var(--neu-intensity)),
                                   inset 0 2px 0 hsl(var(--neu-light) / 0.5),
                                   inset 0 -1px 0 hsl(var(--neu-dark) / 0.1)`,
                        border: '1.5px solid hsl(var(--neon-primary) / 0.35)',
                      }}
                    >
                      <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full" style={{
                        background: 'linear-gradient(90deg, transparent, hsl(var(--neon-primary) / 0.5), transparent)',
                      }} />

                      <Link
                        to={`/categoria/${category.slug}`}
                        className="block mb-4 pb-3"
                        style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.15)' }}
                      >
                        <span className="text-sm font-bold text-primary hover:underline">
                          Ver todos em {category.name}
                        </span>
                      </Link>
                      
                      <div className="grid grid-cols-1 gap-1.5">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/categoria/${category.slug}/${sub.slug}`}
                            className="group flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border border-transparent hover:border-[hsl(var(--neon-primary)/0.25)] hover:shadow-[inset_3px_3px_8px_hsl(var(--neu-dark)/0.4),inset_-3px_-3px_8px_hsl(var(--neu-light)/0.6)]"
                          >
                            {sub.image_url && (
                              <div
                                className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
                                style={{
                                  boxShadow: `inset 3px 3px 6px hsl(var(--neu-dark) / 0.5),
                                             inset -3px -3px 6px hsl(var(--neu-light) / 0.6)`,
                                  border: '1.5px solid hsl(var(--neon-primary) / 0.2)',
                                }}
                              >
                                <img 
                                  src={sub.image_url} 
                                  alt={sub.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-semibold group-hover:text-primary transition-colors duration-200">
                                {sub.name}
                              </span>
                              {sub.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {sub.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link 
                  to={`/categoria/${category.slug}`}
                  className="relative flex h-12 items-center px-5 text-sm font-bold uppercase tracking-[0.08em] text-foreground/80 hover:text-foreground transition-all duration-300 group"
                >
                  {category.name}
                  <span className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{
                    boxShadow: '0 0 8px hsl(var(--neon-primary) / 0.5)',
                  }} />
                </Link>
              )}
            </div>
          ))}
          <Link 
            to="/rastreio"
            className="relative flex h-12 items-center px-5 text-sm font-bold uppercase tracking-[0.08em] text-foreground/80 hover:text-foreground transition-all duration-300 group"
          >
            Rastreio
            <span className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{
              boxShadow: '0 0 8px hsl(var(--neon-primary) / 0.5)',
            }} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
