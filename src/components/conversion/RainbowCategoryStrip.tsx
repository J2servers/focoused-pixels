/**
 * RainbowCategoryStrip - Heavily angled parallelogram category cards
 * Inspired by LG Content Store bottom menu style
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const RAINBOW = [
  '330 80% 60%',
  '160 70% 45%',
  '220 80% 60%',
  '25 90% 55%',
  '270 80% 60%',
  '45 90% 55%',
  '185 80% 50%',
  '340 75% 55%',
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
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Categorias</h2>
            <p className="text-sm text-muted-foreground mt-1">Escolha sua base e personalize em poucos passos</p>
          </div>
          <Link to="/categorias">
            <motion.span whileHover={{ x: 4 }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Ver todas <ArrowRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>

        {/* Angled parallelogram strip */}
        <div className="flex items-stretch gap-0 mx-auto overflow-hidden rounded-2xl"
          style={{
            border: '2px solid hsl(270 80% 60% / 0.3)',
            boxShadow: '0 0 30px -8px hsl(270 80% 60% / 0.2)',
          }}
        >
          {categories.map((cat, i) => {
            const hsl = RAINBOW[i % RAINBOW.length];
            const isFirst = i === 0;
            const isLast = i === categories.length - 1;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative flex-1 min-w-0"
                style={{
                  clipPath: isFirst
                    ? 'polygon(0 0, 100% 0, calc(100% - 28px) 100%, 0 100%)'
                    : isLast
                    ? 'polygon(28px 0, 100% 0, 100% 100%, 0 100%)'
                    : 'polygon(28px 0, 100% 0, calc(100% - 28px) 100%, 0 100%)',
                  marginLeft: i === 0 ? 0 : '-14px',
                }}
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group relative block h-[200px] md:h-[240px] lg:h-[280px] overflow-hidden"
                >
                  {/* Full image */}
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}

                  {/* Gradient for text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Colored neon line at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: `hsl(${hsl})`,
                      boxShadow: `0 0 12px hsl(${hsl} / 0.7), 0 0 24px hsl(${hsl} / 0.3)`,
                    }}
                  />

                  {/* Neon side separator */}
                  {!isFirst && (
                    <div
                      className="absolute top-0 bottom-0 left-0 w-[2px]"
                      style={{
                        background: `linear-gradient(180deg, hsl(${hsl} / 0.6), transparent)`,
                        boxShadow: `0 0 6px hsl(${hsl} / 0.4)`,
                      }}
                    />
                  )}

                  {/* Category name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="text-white font-bold text-xs md:text-sm lg:text-base leading-tight drop-shadow-lg line-clamp-2">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hsl} / 0.15), transparent)`,
                      boxShadow: `inset 0 0 40px -10px hsl(${hsl} / 0.3)`,
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
