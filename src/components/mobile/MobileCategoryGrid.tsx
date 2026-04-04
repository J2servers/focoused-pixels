import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';
import { useRef, useState, useEffect } from 'react';

const RAINBOW_COLORS = [
  { bg: 'from-pink-500/20 to-pink-600/10', border: 'hsl(330 80% 60%)', glow: '330 80% 60%', accent: 'bg-pink-500' },
  { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'hsl(160 70% 45%)', glow: '160 70% 45%', accent: 'bg-emerald-500' },
  { bg: 'from-blue-500/20 to-blue-600/10', border: 'hsl(220 80% 60%)', glow: '220 80% 60%', accent: 'bg-blue-500' },
  { bg: 'from-orange-500/20 to-orange-600/10', border: 'hsl(25 90% 55%)', glow: '25 90% 55%', accent: 'bg-orange-500' },
  { bg: 'from-violet-500/20 to-violet-600/10', border: 'hsl(270 80% 60%)', glow: '270 80% 60%', accent: 'bg-violet-500' },
  { bg: 'from-amber-400/20 to-yellow-500/10', border: 'hsl(45 90% 55%)', glow: '45 90% 55%', accent: 'bg-amber-400' },
  { bg: 'from-cyan-400/20 to-teal-500/10', border: 'hsl(185 80% 50%)', glow: '185 80% 50%', accent: 'bg-cyan-400' },
  { bg: 'from-rose-400/20 to-fuchsia-500/10', border: 'hsl(340 75% 55%)', glow: '340 75% 55%', accent: 'bg-rose-400' },
];

export function MobileCategoryGrid() {
  const { data: categories = [] } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRight, setShowRight] = useState(true);

  const parents = categories.filter(c => !c.parent_id).slice(0, 8);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
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
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-foreground">Categorias</h2>
        <Link to="/categorias" className="text-sm text-primary font-medium flex items-center">
          Ver todas <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
        {/* Right fade indicator */}
        <motion.div
          animate={{ opacity: showRight ? 1 : 0 }}
          className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none flex items-center justify-end pr-1"
        >
          <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-2.5 px-4">
            {parents.map((cat, i) => {
              const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex-shrink-0"
                >
                  <Link
                    to={`/categoria/${cat.slug}`}
                    className="group relative flex items-center gap-2.5 px-4 py-3 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.97]"
                    style={{
                      border: `1.5px solid ${color.border}`,
                      boxShadow: `0 0 0 0.5px ${color.border}, 0 2px 10px -2px hsl(${color.glow} / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.1)`,
                      minWidth: '140px',
                    }}
                  >
                    {/* Glass bg */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} backdrop-blur-xl`} />
                    <div className="absolute inset-0 bg-background/65" />

                    {/* Skewed accent */}
                    <div className={`absolute -left-3 top-0 bottom-0 w-10 ${color.accent} opacity-[0.07] -skew-x-12`} />

                    {/* Neon dot */}
                    <div
                      className="relative z-10 w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: color.border,
                        boxShadow: `0 0 6px ${color.border}`,
                      }}
                    />
                    <span className="relative z-10 text-xs font-semibold text-foreground whitespace-nowrap">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
