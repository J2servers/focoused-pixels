import { CheckCircle2, Zap, Cpu, Ruler } from 'lucide-react';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

const TECH_ICONS = [Zap, Cpu, Ruler];

export function TechnologySection({ config }: { config: WhyChooseUsConfig }) {
  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: 'var(--wcup-dark-bg)', color: 'var(--wcup-text-on-dark)' }}>
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--wcup-accent)' }}>{config.technology.eyebrow}</p>
            <h2
              className="font-bold tracking-tight"
              style={{ fontSize: config.theme.sectionTitleSize, fontFamily: config.theme.headingFont, color: 'var(--wcup-text-on-dark)' }}
            >
              {config.technology.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed opacity-70">{config.technology.description}</p>
            <div className="mt-8 space-y-3">
              {config.technology.bullets.map(b => (
                <div key={b.text} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--wcup-accent)' }} />
                  <p className="text-sm leading-relaxed opacity-80">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {config.technology.items.map((item, i) => {
              const Icon = TECH_ICONS[i] || Cpu;
              return (
                <div key={item.title || i} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0" style={{ color: 'var(--wcup-accent)' }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed opacity-70">{item.description}</p>
                      <p className="mt-3 text-xs font-semibold" style={{ color: 'var(--wcup-accent)' }}>{item.highlight}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
