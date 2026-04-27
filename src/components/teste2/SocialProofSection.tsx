import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function SocialProofSection() {
  const { data: reviews = [] } = useQuery({
    queryKey: ['approved-reviews-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews_public')
        .select('*')
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  if (reviews.length === 0) return null;

  return (
    <section className="relative py-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary))/0.04] blur-[100px] pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3 justify-center">
            <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
              Avaliações
            </span>
            <span className="w-9 h-px bg-gradient-to-l from-transparent to-[hsl(var(--primary))]" />
          </div>
          <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
            O Que Dizem<br />
            <span className="text-[hsl(var(--primary))]">Nossos Clientes</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl hover:border-[hsl(var(--primary))/0.2] transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-[hsl(var(--primary))/0.3] mb-4" />
              
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < review.rating ? 'text-[hsl(var(--primary))] fill-current' : 'text-white/20'}`}
                  />
                ))}
              </div>

              {review.title && (
                <h4 className="text-white font-semibold text-sm mb-2">{review.title}</h4>
              )}
              <p className="text-white/50 text-sm leading-relaxed line-clamp-4 mb-4">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary))/0.15] flex items-center justify-center text-[hsl(var(--primary))] font-bebas text-lg">
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="block text-white text-sm font-medium">{review.customer_name}</span>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-[hsl(var(--primary))] text-[10px] font-mono tracking-wider uppercase">
                      <CheckCircle className="h-3 w-3" /> Compra verificada
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

