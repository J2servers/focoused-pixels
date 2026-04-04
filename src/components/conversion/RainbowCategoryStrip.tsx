/**
 * RainbowCategoryStrip - Visibly angled parallelogram cards with neumorphism
 * Uses transform skew on container + counter-skew on content
 * drop-shadow instead of box-shadow to respect skewed shape
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

        {/* Skewed parallelogram grid */}
        <div className="flex gap-4 px-6">
          {categories.map((cat, i) => {
            const hsl = RAINBOW[i % RAINBOW.length];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.18, y: -14, zIndex: 30 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="flex-1 min-w-0 relative z-10 cursor-pointer"
                style={{
                  filter: `
                    drop-shadow(6px 6px 12px hsl(var(--neu-dark) / var(--neu-intensity)))
                    drop-shadow(-4px -4px 10px hsl(var(--neu-light) / var(--neu-intensity)))
                    drop-shadow(0 0 8px hsl(${hsl} / 0.15))
                  `,
                }}
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group relative block h-[220px] md:h-[260px] lg:h-[300px] overflow-hidden rounded-lg"
                  style={{
                    transform: 'skewX(-10deg)',
                    border: `2px solid hsl(${hsl} / 0.4)`,
                  }}
                >
                  {/* Counter-skew wrapper - keeps image & text straight */}
                  <div
                    className="absolute inset-[-20%] flex items-center justify-center"
                    style={{ transform: 'skewX(10deg)' }}
                  >
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Neon top line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: `hsl(${hsl})`,
                      boxShadow: `0 0 10px hsl(${hsl} / 0.7), 0 2px 16px hsl(${hsl} / 0.3)`,
                    }}
                  />

                  {/* Category name - counter-skewed so text is straight */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{ transform: 'skewX(10deg)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `hsl(${hsl})`,
                          boxShadow: `0 0 8px hsl(${hsl}), 0 0 16px hsl(${hsl} / 0.4)`,
                        }}
                      />
                      <h3 className="text-white font-bold text-xs md:text-sm lg:text-base leading-tight drop-shadow-lg line-clamp-1">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 30px -6px hsl(${hsl} / 0.25)`,
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
