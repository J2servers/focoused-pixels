import { Sparkles, CheckCircle2, Star, ArrowRight, ShieldCheck, BadgeCheck, HeartHandshake, Gem } from 'lucide-react';
import { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { resolvePreviewImage, heroNeon } from './WhyChooseUsHelpers';

const CTA_ICONS = [BadgeCheck, HeartHandshake, Gem];

export const LivePreview = ({ config }: { config: WhyChooseUsConfig }) => {
  const t = config.theme;
  const heroImg = resolvePreviewImage(config.hero.imageMain, heroNeon);

  return (
    <div
      className="rounded-xl overflow-hidden text-sm border border-white/10"
      style={{ fontFamily: t.bodyFont, backgroundColor: t.pageBackground, color: t.textPrimary }}
    >
      {/* Hero preview */}
      <div className="p-4" style={{ backgroundColor: t.pageBackground }}>
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-3 w-3" style={{ color: t.accent }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: t.accent }}>{config.hero.badge}</span>
        </div>
        <div className="grid gap-3 grid-cols-[1fr_100px]">
          <div>
            <h3 className="text-base font-black leading-tight" style={{ fontFamily: t.headingFont, color: t.textPrimary }}>
              {config.hero.title}
            </h3>
            <p className="text-xs font-bold mt-1" style={{ color: t.accent }}>{config.hero.highlightedTitle}</p>
            <p className="text-[10px] mt-2 leading-relaxed" style={{ color: t.textSecondary }}>{config.hero.description.slice(0, 120)}…</p>
            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 rounded-lg text-[10px] font-semibold" style={{ backgroundColor: t.buttonPrimaryBackground, color: t.buttonPrimaryText }}>
                {config.hero.primaryCtaLabel}
              </span>
              <span
                className="px-3 py-1 rounded-lg text-[10px] font-semibold border"
                style={{ backgroundColor: t.buttonSecondaryBackground, color: t.buttonSecondaryText, borderColor: t.cardBorder }}
              >
                {config.hero.secondaryCtaLabel}
              </span>
            </div>
          </div>
          {heroImg && <img src={heroImg} alt="" className="w-full h-[80px] object-cover rounded-lg" />}
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {config.metrics.map((m, i) => (
            <div key={i} className="rounded-lg p-1.5 text-center" style={{ backgroundColor: t.cardBackground, border: `1px solid ${t.cardBorder}` }}>
              <div className="text-[10px] font-black" style={{ color: t.accent }}>{m.value}</div>
              <div className="text-[8px]" style={{ color: t.textSecondary }}>{m.label.slice(0, 30)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story section */}
      <div className="p-4" style={{ backgroundColor: t.sectionBackground }}>
        <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: t.accent }}>{config.story.eyebrow}</p>
        <h4 className="text-xs font-bold" style={{ fontFamily: t.headingFont }}>{config.story.title}</h4>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {config.story.items.map((item, i) => (
            <div key={i} className="rounded-lg p-2" style={{ backgroundColor: t.cardBackground, border: `1px solid ${t.cardBorder}` }}>
              <div className="w-5 h-5 rounded flex items-center justify-center mb-1" style={{ backgroundColor: t.accentSoft, color: t.accent }}>
                <Sparkles className="h-3 w-3" />
              </div>
              <p className="text-[9px] font-bold">{item.title}</p>
              <p className="text-[8px] mt-0.5" style={{ color: t.textSecondary }}>{item.description.slice(0, 60)}…</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech section (dark) */}
      <div className="p-4" style={{ backgroundColor: t.darkSectionBackground, color: t.textOnDark }}>
        <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: t.accent }}>{config.technology.eyebrow}</p>
        <h4 className="text-xs font-bold" style={{ fontFamily: t.headingFont }}>{config.technology.title.slice(0, 60)}…</h4>
        <div className="mt-2 space-y-1">
          {config.technology.bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" style={{ color: t.accent }} />
              <span className="text-[8px] opacity-80">{b.text.slice(0, 60)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final (dark) */}
      <div className="p-4" style={{ backgroundColor: t.darkSectionBackground, color: t.textOnDark }}>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-wider font-semibold mb-1" style={{ color: t.accent }}>{config.finalCta.eyebrow}</p>
          <h4 className="text-xs font-bold" style={{ fontFamily: t.headingFont }}>
            {config.finalCta.title}
            <span className="block mt-0.5" style={{ color: t.accent }}>{config.finalCta.highlightedTitle.slice(0, 50)}…</span>
          </h4>
          <div className="mt-2 space-y-1">
            {config.finalCta.bullets.slice(0, 3).map((b, i) => {
              const Icon = CTA_ICONS[i % 3];
              return (
                <div key={i} className="flex items-start gap-1.5">
                  <Icon className="h-3 w-3 shrink-0 mt-0.5" style={{ color: t.accent }} />
                  <span className="text-[8px] opacity-80">{b.text.slice(0, 50)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 rounded-lg text-[10px] font-semibold" style={{ backgroundColor: t.buttonPrimaryBackground, color: t.buttonPrimaryText }}>
              {config.finalCta.primaryCtaLabel}
            </span>
            <span className="px-3 py-1 rounded-lg text-[10px] font-semibold border border-white/30" style={{ color: t.textOnDark }}>
              {config.finalCta.secondaryCtaLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
