/**
 * RainbowCategoryStrip - Angled skewed category cards like LG Content Store
 * Each card is a skewed parallelogram with full visible image and rainbow neon borders
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const RAINBOW = [
  { border: '330 80% 60%', label: 'bg-pink-500' },
  { border: '160 70% 45%', label: 'bg-emerald-500' },
  { border: '220 80% 60%', label: 'bg-blue-500' },
  { border: '25 90% 55%', label: 'bg-orange-500' },
  { border: '270 80% 60%', label: 'bg-violet-500' },
  { border: '45 90% 55%', label: 'bg-amber-400' },
  { border: '185 80% 50%', label: 'bg-cyan-400' },
  { border: '340 75% 55%', label: 'bg-rose-400' },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

export function RainbowCategoryStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Categorias
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha sua base e personalize em poucos passos
            </p>
          </div>
          <Link to="/categorias">
            <motion.span
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>

        {/* Angled Strip Row */}
        <div className="flex gap-2 -mx-2">
          {categories.map((cat, i) => {
            const color = RAINBOW[i % RAINBOW.length];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="flex-1 min-w-0"
                style={{ transform: 'skewX(-6deg)' }}
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group relative block h-[180px] md:h-[220px] lg:h-[260px] overflow-hidden rounded-xl transition-all duration-500"
                  style={{
                    border: `2px solid hsl(${color.border})`,
                    boxShadow: `
                      0 0 12px -2px hsl(${color.border} / 0.35),
                      inset 0 0 20px -8px hsl(${color.border} / 0.15)
                    `,
                  }}
                >
                  {/* Full image - no glass overlay */}
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      style={{ transform: 'skewX(6deg) scale(1.15)' }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <span className="text-4xl" style={{ transform: 'skewX(6deg)' }}>📦</span>
                    </div>
                  )}

                  {/* Bottom gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Neon top edge glow */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, hsl(${color.border}), transparent)`,
                      boxShadow: `0 0 8px hsl(${color.border} / 0.6)`,
                    }}
                  />

                  {/* Category name - unskewed so text is straight */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-3 md:p-4"
                    style={{ transform: 'skewX(6deg)' }}
                  >
                    <h3 className="text-white font-bold text-xs md:text-sm lg:text-base leading-tight drop-shadow-lg line-clamp-2">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Hover neon glow */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{
                      boxShadow: `
                        inset 0 0 0 2px hsl(280 70% 60% / 0.5),
                        0 0 20px -2px hsl(280 70% 60% / 0.4)
                      `,
                    }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
