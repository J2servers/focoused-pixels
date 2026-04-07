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
      <div className="flex items-center justify-between px-3 mb-2">
        <h2 className="text-sm font-bold text-foreground">Categorias</h2>
        <Link to="/categorias" className="text-xs text-primary font-medium flex items-center">
          Ver todas <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: showLeft ? 1 : 0 }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-1 transition-opacity duration-300"
          style={{ opacity: showRight ? 1 : 0 }}
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground animate-bounce-x" />
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-1.5 px-2">
            {parents.map((cat) => (
              <div key={cat.id} className="w-[78px] flex-shrink-0">
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="block group h-full active:scale-[0.98] transition-all duration-200"
                >
                  <div
                    className="relative rounded-lg overflow-hidden h-full flex flex-col"
                    style={{
                      boxShadow: '0 1px 2px hsl(var(--neu-dark) / 0.08)',
                      border: '0.4px solid hsl(270 80% 60% / 0.2)',
                    }}
                  >
                    {/* Neon top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[1px] z-10"
                      style={{
                        background: 'hsl(270 80% 60%)',
                      }}
                    />

                    {/* Image */}
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
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="p-1.5 bg-card">
                      <p className="text-[9px] font-semibold text-foreground leading-tight line-clamp-2 text-center">
                        {cat.name}
                      </p>
                    </div>

                    {/* Inner neumorphic highlight */}
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        boxShadow: `
                          inset 0 2px 4px hsl(0 0% 100% / 0.06),
                          inset 0 -2px 6px hsl(0 0% 0% / 0.1)
                        `,
                      }}
                    />
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
