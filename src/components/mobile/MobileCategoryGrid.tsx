import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

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

export function MobileCategoryGrid() {
  const { data: categories = [] } = useCategories();
  const parents = categories.filter(c => !c.parent_id).slice(0, 8);

  if (parents.length === 0) return null;

  return (
    <section className="py-5 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Categorias</h2>
        <Link to="/categorias" className="text-sm text-primary font-semibold flex items-center gap-0.5">
          Ver todas <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {parents.map((cat, i) => {
          const hsl = RAINBOW[i % RAINBOW.length];
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block aspect-square rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-200"
                style={{
                  boxShadow: `
                    6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)),
                    -4px -4px 10px hsl(var(--neu-light) / var(--neu-intensity)),
                    inset 0 1px 0 hsl(0 0% 100% / 0.12),
                    0 0 0 1.5px hsl(${hsl} / 0.2)
                  `,
                }}
              >
                {/* Image */}
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                )}

                {/* Gradient for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Neon top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2.5px]"
                  style={{
                    background: `hsl(${hsl})`,
                    boxShadow: `0 0 8px hsl(${hsl} / 0.5)`,
                  }}
                />

                {/* Inner neumorphic highlight */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: `
                      inset 0 2px 4px hsl(0 0% 100% / 0.08),
                      inset 0 -2px 6px hsl(0 0% 0% / 0.15)
                    `,
                  }}
                />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `hsl(${hsl})`,
                        boxShadow: `0 0 6px hsl(${hsl})`,
                      }}
                    />
                    <h3 className="text-white font-bold text-sm leading-tight drop-shadow-lg line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
