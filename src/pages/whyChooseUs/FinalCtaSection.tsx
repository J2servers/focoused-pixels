import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BadgeCheck, HeartHandshake, Gem } from 'lucide-react';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { safeHref } from './themeAndAssets';

const CTA_ICONS = [BadgeCheck, HeartHandshake, Gem];

export function FinalCtaSection({ config }: { config: WhyChooseUsConfig }) {
  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: 'var(--wcup-dark-bg)', color: 'var(--wcup-text-on-dark)' }}>
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--wcup-accent)' }}>{config.finalCta.eyebrow}</p>
              <h2
                className="font-bold tracking-tight"
                style={{ fontSize: config.theme.sectionTitleSize, fontFamily: config.theme.headingFont }}
              >
                {config.finalCta.title}
                <span className="block mt-1" style={{ color: 'var(--wcup-accent)' }}>{config.finalCta.highlightedTitle}</span>
              </h2>
              <p className="mt-5 text-sm leading-relaxed opacity-70">{config.finalCta.description}</p>
            </div>

            <div className="grid gap-3">
              {config.finalCta.bullets.map((b, i) => {
                const Icon = CTA_ICONS[i % 3];
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: 'var(--wcup-accent)' }} />
                    <p className="text-sm leading-relaxed opacity-80">{b.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <Link to={safeHref(config.finalCta.primaryCtaHref, '/pagamento')}>
              <Button
                size="lg"
                className="min-w-[220px] border-0 shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: 'var(--wcup-btn-primary-bg)', color: 'var(--wcup-btn-primary-text)' }}
              >
                {config.finalCta.primaryCtaLabel}
              </Button>
            </Link>
            <Link to={safeHref(config.finalCta.secondaryCtaHref, '/minha-area')}>
              <Button
                size="lg" variant="outline"
                className="min-w-[220px] group border-2 hover:brightness-110 hover:-translate-y-0.5 transition-all bg-purple-50 text-purple-50"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
              >
                {config.finalCta.secondaryCtaLabel}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
