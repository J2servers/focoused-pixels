import type { WhyChooseUsConfig, WhyChooseUsImageCard } from '@/lib/whyChooseUsConfig';
import { SectionHeader } from './themeAndAssets';

interface Props {
  config: WhyChooseUsConfig;
  gallery: WhyChooseUsImageCard[];
}

export function GallerySection({ config, gallery }: Props) {
  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: 'var(--wcup-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <SectionHeader
            eyebrow={config.gallery.eyebrow}
            title={config.gallery.title}
            highlight={config.gallery.highlightedTitle}
          />
          <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--wcup-text-secondary)' }}>{config.gallery.description}</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger-children">
          {gallery.map((item, idx) => (
            <article key={item.title || idx} className="rounded-2xl neu-raised overflow-hidden group">
              <div className="relative overflow-hidden">
                <img src={item.image} alt={item.title} className="h-[240px] w-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                {item.tag && (
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--wcup-accent)', color: 'var(--wcup-btn-primary-text)' }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="p-5" style={{ backgroundColor: 'var(--wcup-card-bg)' }}>
                <h3 className="font-bold mb-1" style={{ color: 'var(--wcup-text)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--wcup-text-secondary)' }}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
