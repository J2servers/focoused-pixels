import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

export function CategoriesGrid() {
  const { data: categories = [] } = useCategories();
  const parents = categories.filter(c => !c.parent_id).slice(0, 8);

  if (parents.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
              <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">Explore</span>
            </div>
            <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
              Categorias
            </h2>
          </div>
          <Link to="/categorias" className="hidden md:inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/80 text-sm hover:border-[hsl(var(--primary))/0.4] transition-all">
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {parents.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-[hsl(var(--primary))/0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.24)] hover:-translate-y-2 hover:border-[hsl(var(--primary))/0.4] hover:shadow-[0_24px_48px_hsl(var(--primary)/0.16)] transition-all duration-500"
              >
                {cat.image_url && (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a] via-[#050d1a]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-semibold text-base mb-1">{cat.name}</h3>
                  <span className="text-white/40 text-xs font-mono tracking-wide uppercase flex items-center gap-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                    Explorar <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
