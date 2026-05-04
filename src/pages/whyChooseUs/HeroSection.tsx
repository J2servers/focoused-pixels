import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { safeHref } from './themeAndAssets';

interface Props {
  config: WhyChooseUsConfig;
  heroImages: { main: string; secondary: string; tertiary: string };
}

export function HeroSection({ config, heroImages }: Props) {
  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full neu-flat px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] mb-6"
              style={{ color: 'var(--wcup-accent)' }}
            >
              <ShieldCheck className="h-4 w-4" />
              {config.hero.badge}
            </div>
            <h1
              className="font-black tracking-tight leading-[1.05]"
              style={{ fontSize: config.theme.heroTitleSize, fontFamily: config.theme.headingFont, color: 'var(--wcup-text)' }}
            >
              {config.hero.title}
              <span className="block mt-2" style={{ color: 'var(--wcup-accent)' }}>{config.hero.highlightedTitle}</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed max-w-2xl" style={{ color: 'var(--wcup-text-secondary)' }}>{config.hero.description}</p>
            <p className="mt-3 text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--wcup-text-secondary)' }}>{config.hero.secondaryDescription}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to={safeHref(config.hero.primaryCtaHref, '/pagamento')}>
                <Button
                  size="lg"
                  className="min-w-[220px] border-0 shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: 'var(--wcup-btn-primary-bg)', color: 'var(--wcup-btn-primary-text)' }}
                >
                  {config.hero.primaryCtaLabel}
                </Button>
              </Link>
              <Link to={safeHref(config.hero.secondaryCtaHref, '/categorias')}>
                <Button
                  size="lg" variant="outline"
                  className="min-w-[220px] group border-2 hover:brightness-110 hover:-translate-y-0.5 transition-all"
                  style={{
                    backgroundColor: 'var(--wcup-btn-secondary-bg)',
                    color: 'var(--wcup-btn-secondary-text)',
                    borderColor: 'var(--wcup-card-border)',
                  }}
                >
                  {config.hero.secondaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 xl:grid-cols-4 gap-3">
              {config.metrics.map(m => (
                <div key={m.value} className="rounded-2xl neu-concave p-4 text-center">
                  <div className="text-xl font-black" style={{ color: 'var(--wcup-accent)' }}>{m.value}</div>
                  <div className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--wcup-text-secondary)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 sm:row-span-2 rounded-2xl neu-raised overflow-hidden group">
              <img src={heroImages.main} alt={config.hero.imageMainTitle} className="h-full min-h-[280px] w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl neu-raised overflow-hidden group">
              <img src={heroImages.secondary} alt={config.hero.imageSecondaryTitle} className="h-[200px] w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl neu-raised overflow-hidden group">
              <img src={heroImages.tertiary} alt={config.hero.imageTertiaryTitle} className="h-[200px] w-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
