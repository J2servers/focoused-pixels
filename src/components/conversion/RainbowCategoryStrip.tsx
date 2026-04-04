/**
 * RainbowCategoryStrip - Glass Neumorphism Mega Menu style category cards
 * Rainbow-colored angled strips with neon purple borders and glass effects
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';

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

        {/* Rainbow Strip Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {categories.map((cat, i) => {
            const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="group relative block overflow-hidden rounded-2xl transition-all duration-500"
                  style={{
                    border: `1.5px solid ${color.border}`,
                    boxShadow: `
                      0 0 0 0.5px ${color.border},
                      0 4px 20px -4px hsl(${color.glow} / 0.15),
                      inset 0 1px 0 hsl(0 0% 100% / 0.12),
                      inset 0 -1px 0 hsl(0 0% 0% / 0.08),
                      6px 6px 16px hsl(var(--neu-dark) / var(--neu-intensity)),
                      -4px -4px 12px hsl(var(--neu-light) / var(--neu-intensity))
                    `,
                  }}
                >
                  {/* Glass background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${color.bg} backdrop-blur-xl`}
                  />
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

                  {/* Angled accent strip */}
                  <div
                    className={`absolute -left-4 top-0 bottom-0 w-16 ${color.accent} opacity-[0.08] -skew-x-12`}
                  />

                  {/* Category image (subtle) */}
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700"
                      loading="lazy"
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-4 md:p-5 flex items-center justify-between min-h-[80px] md:min-h-[96px]">
                    <div className="flex items-center gap-3">
                      {/* Neon dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: color.border,
                          boxShadow: `0 0 8px ${color.border}, 0 0 16px hsl(${color.glow} / 0.4)`,
                        }}
                      />
                      <span className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {cat.name}
                      </span>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
                    />
                  </div>

                  {/* Hover glow border */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `
                        inset 0 0 0 1.5px hsl(280 70% 60% / 0.6),
                        0 0 24px -4px hsl(280 70% 60% / 0.3)
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
