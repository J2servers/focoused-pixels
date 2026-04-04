/**
 * RainbowCategoryStrip - Premium Neumorphism angled category cards
 * Individual cards with deep neumorphic shadows and subtle angular cuts
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat, i) => {
            const hsl = RAINBOW[i % RAINBOW.length];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group relative block overflow-hidden transition-all duration-500 hover:-translate-y-1"
                  style={{
                    borderRadius: '20px 20px 20px 4px',
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)',
                  }}
                >
                  {/* Neumorphism outer shell */}
                  <div
                    className="relative aspect-[3/4] overflow-hidden"
                    style={{
                      borderRadius: '20px 20px 20px 4px',
                      boxShadow: `
                        8px 8px 20px hsl(var(--neu-dark) / var(--neu-intensity)),
                        -6px -6px 16px hsl(var(--neu-light) / var(--neu-intensity)),
                        inset 0 1px 0 hsl(0 0% 100% / 0.15),
                        0 0 0 1.5px hsl(${hsl} / 0.25)
                      `,
                    }}
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
                        <span className="text-5xl">📦</span>
                      </div>
                    )}

                    {/* Gradient overlay for text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* Neon accent line - top */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `hsl(${hsl})`,
                        boxShadow: `0 0 10px hsl(${hsl} / 0.6), 0 2px 20px hsl(${hsl} / 0.25)`,
                      }}
                    />

                    {/* Neon accent line - diagonal cut corner */}
                    <div
                      className="absolute bottom-0 right-0 w-[26px] h-[26px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, transparent 48%, hsl(${hsl}) 49%, hsl(${hsl}) 51%, transparent 52%)`,
                        filter: `drop-shadow(0 0 4px hsl(${hsl} / 0.5))`,
                      }}
                    />

                    {/* Inner neumorphic inset glow */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: `
                          inset 0 0 30px -8px hsl(${hsl} / 0.2),
                          0 0 20px -4px hsl(${hsl} / 0.3)
                        `,
                      }}
                    />

                    {/* Category name + neon dot */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: `hsl(${hsl})`,
                            boxShadow: `0 0 6px hsl(${hsl}), 0 0 12px hsl(${hsl} / 0.4)`,
                          }}
                        />
                        <h3 className="text-white font-bold text-sm lg:text-base leading-tight drop-shadow-lg line-clamp-2">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
