import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useProducts';

export function MobileCategoryGrid() {
  const { data: categories = [] } = useCategories();
  const parents = categories.filter(c => !c.parent_id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRight, setShowRight] = useState(true);
  const [showLeft, setShowLeft] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      handleScroll();
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [parents]);

  if (parents.length === 0) return null;

  return (
    <section className="py-1.5">
      <div className="flex items-center justify-between px-3 mb-1.5">
        <h2 className="text-xs font-bold text-foreground">Categorias</h2>
        <Link to="/categorias" className="text-[10px] text-primary font-medium flex items-center">
          Ver todas <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: showLeft ? 1 : 0 }}
        />
        <div
          className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1 transition-opacity duration-300"
          style={{ opacity: showRight ? 1 : 0 }}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground animate-bounce-x" />
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-1.5 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-1.5 px-3">
            {parents.map((cat) => (
              <div key={cat.id} className="w-[75px] flex-shrink-0">
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="block group h-full active:scale-[0.98] transition-all duration-200"
                >
                  <div
                    className="relative rounded-lg overflow-hidden h-full flex flex-col"
                    style={{
                      boxShadow: '1px 1px 3px hsl(var(--neu-dark) / 0.1), -1px -1px 3px hsl(var(--neu-light) / 0.15)',
                      border: '0.5px solid hsl(270 80% 60% / 0.2)',
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[1px] z-10"
                      style={{ background: 'hsl(270 80% 60%)' }}
                    />
                    <div className="aspect-square relative overflow-hidden flex-shrink-0 bg-muted">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1 bg-card">
                      <p className="text-[8px] font-semibold text-foreground leading-tight line-clamp-2 text-center">
                        {cat.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
