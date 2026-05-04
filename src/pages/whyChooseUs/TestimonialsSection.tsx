import { Star } from 'lucide-react';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { SectionHeader } from './themeAndAssets';

interface TestimonialItem { image: string; quote: string; author: string; subtitle: string }

interface Props {
  config: WhyChooseUsConfig;
  testimonials: TestimonialItem[];
  showcaseImages: string[];
}

export function TestimonialsSection({ config, testimonials, showcaseImages }: Props) {
  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: 'var(--wcup-section-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader
              eyebrow={config.testimonials.eyebrow}
              title={config.testimonials.title}
              description={config.testimonials.description}
            />
            <div className="mt-8 grid grid-cols-3 gap-3">
              {showcaseImages.slice(0, 3).map((img, i) => (
                <div key={i} className="rounded-2xl neu-raised overflow-hidden">
                  <img src={img} alt={`Resultado ${i + 1}`} className="h-[150px] w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {testimonials.map((item, idx) => (
              <div key={item.author || idx} className="rounded-2xl neu-flat overflow-hidden" style={{ backgroundColor: 'var(--wcup-card-bg)' }}>
                <div className="grid md:grid-cols-[180px_1fr]">
                  <img src={item.image} alt={item.author} className="h-full min-h-[180px] w-full object-cover" loading="lazy" />
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-0.5 mb-3" style={{ color: 'var(--wcup-accent)' }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="font-semibold leading-relaxed" style={{ color: 'var(--wcup-text)' }}>"{item.quote}"</p>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-sm font-bold" style={{ color: 'var(--wcup-accent)' }}>
                        {item.author.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--wcup-text)' }}>{item.author}</div>
                        <div className="text-xs" style={{ color: 'var(--wcup-text-secondary)' }}>{item.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
