import { Sparkles, Ruler, Truck } from 'lucide-react';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { SectionHeader } from './themeAndAssets';

const STORY_ICONS = [Sparkles, Ruler, Truck];

export function StorySection({ config }: { config: WhyChooseUsConfig }) {
  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: 'var(--wcup-section-bg)' }}>
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={config.story.eyebrow}
          title={config.story.title}
          highlight={config.story.highlightedTitle}
        />
        <div className="mt-10 grid md:grid-cols-3 gap-4 lg:gap-6 stagger-children">
          {config.story.items.map((item, i) => {
            const Icon = STORY_ICONS[i] || Sparkles;
            return (
              <article
                key={item.title || i}
                className="rounded-2xl neu-flat p-6"
                style={{ backgroundColor: 'var(--wcup-card-bg)', borderColor: 'var(--wcup-card-border)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--wcup-accent-soft)', color: 'var(--wcup-accent)' }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--wcup-text)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--wcup-text-secondary)' }}>{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
