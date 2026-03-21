/**
 * WhyChooseUsPage — Tema Neumorphism (machined)
 * Consistente com as demais páginas da loja pública.
 */

import { Link } from 'react-router-dom';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { TrustBar, GuaranteesSection } from '@/components/conversion';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Button } from '@/components/ui/button';
import {
  BadgeCheck, CheckCircle2, Cpu, Gem, HeartHandshake,
  Ruler, ShieldCheck, Sparkles, Star, Truck, Zap, ArrowRight,
} from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

/* ── fallback images ── */
import heroNeon from '@/assets/hero/hero-neon.jpg';
import heroCrachas from '@/assets/hero/hero-crachas.jpg';
import heroQrCode from '@/assets/hero/hero-qrcode.jpg';
import letreiro3dLed from '@/assets/products/letreiro-3d-led.jpg';
import displayQrCode from '@/assets/products/display-qr-code.jpg';
import crachasAcrilico from '@/assets/products/crachas-acrilico.jpg';
import bandejaAcrilico from '@/assets/products/bandeja-acrilico.jpg';
import brochesEspelhados from '@/assets/products/broches-espelhados.jpg';
import placaPortaEscritorio from '@/assets/products/placa-porta-escritorio.jpg';
import espelhoDecorativo from '@/assets/products/espelho-decorativo.jpg';
import portaMaternidade from '@/assets/products/porta-maternidade.jpg';
import chaveirosPersonalizados from '@/assets/products/chaveiros-personalizados.jpg';

const fallbackGallery = [
  { image: heroNeon, title: 'Letreiros com presença de marca', description: 'Projetos pensados para chamar atenção no ambiente.', tag: 'Impacto visual' },
  { image: heroCrachas, title: 'Peças corporativas com acabamento forte', description: 'Crachás e comunicação visual que elevam a percepção.', tag: 'Corporativo' },
  { image: heroQrCode, title: 'Produtos funcionais com design comercial', description: 'QR Codes, displays e sinalização profissional.', tag: 'Venda inteligente' },
  { image: bandejaAcrilico, title: 'Peças que viram presente memorável', description: 'Objetos afetivos pensados nos mínimos detalhes.', tag: 'Presente premium' },
  { image: brochesEspelhados, title: 'Acabamentos que brilham sem exagero', description: 'Espelhados e camadas que transformam a peça.', tag: 'Valor percebido' },
  { image: displayQrCode, title: 'Personalização que também vende', description: 'Produto bonito que ajuda o cliente a converter.', tag: 'Conversão' },
];

const fallbackTestimonials = [
  { image: portaMaternidade, quote: 'Quando chegou, parecia exatamente a memória que eu queria guardar para sempre.', author: 'Mariana', subtitle: 'Presente afetivo' },
  { image: placaPortaEscritorio, quote: 'A peça ficou profissional de verdade. A percepção da marca mudou no mesmo dia.', author: 'Rafael', subtitle: 'Ambiente comercial' },
  { image: chaveirosPersonalizados, quote: 'Os clientes comentaram, fotografaram e pediram mais. Gera conversa e aproxima da marca.', author: 'Camila', subtitle: 'Ação promocional' },
];

const fallbackShowcase = [letreiro3dLed, espelhoDecorativo, crachasAcrilico];
const fallbackHeroImages = { main: heroNeon, secondary: heroQrCode, tertiary: heroCrachas };

const resolveImage = (v: string | undefined, fb: string) => (!v || v.startsWith('@/') ? fb : v);
const safeHref = (h: string | undefined, fb: string) => (h?.trim() ? h : fb);

const STORY_ICONS = [Sparkles, Ruler, Truck];
const TECH_ICONS = [Zap, Cpu, Ruler];
const CTA_ICONS = [BadgeCheck, HeartHandshake, Gem];

/* ── Section Header reusable ── */
function SectionHeader({ eyebrow, title, highlight, description, center }: {
  eyebrow?: string; title: string; highlight?: string; description?: string; center?: boolean;
}) {
  return (
    <div className={center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">{eyebrow}</p>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
        {title}
        {highlight && <span className="block mt-1 text-primary">{highlight}</span>}
      </h2>
      {description && (
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}

const WhyChooseUsPage = () => {
  const { data: companyInfo } = useCompanyInfo();
  const config = mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo?.why_choose_us_config);

  const hasCustomGallery = config.gallery.items.some(i => i.title.trim() || i.image.trim());
  const gallery = hasCustomGallery
    ? config.gallery.items.map((item, i) => ({ ...item, image: resolveImage(item.image, fallbackGallery[i]?.image || heroNeon) }))
    : fallbackGallery;

  const hasCustomTestimonials = config.testimonials.items.some(i => i.quote.trim() || i.author.trim());
  const testimonials = hasCustomTestimonials
    ? config.testimonials.items.map((item, i) => ({ ...item, image: resolveImage(item.image, fallbackTestimonials[i]?.image || portaMaternidade) }))
    : fallbackTestimonials;

  const hasCustomShowcase = config.testimonials.showcaseImages.some(i => i.trim());
  const showcaseImages = hasCustomShowcase
    ? config.testimonials.showcaseImages.map((img, i) => resolveImage(img, fallbackShowcase[i] || letreiro3dLed))
    : fallbackShowcase;

  const heroImages = {
    main: resolveImage(config.hero.imageMain, fallbackHeroImages.main),
    secondary: resolveImage(config.hero.imageSecondary, fallbackHeroImages.secondary),
    tertiary: resolveImage(config.hero.imageTertiary, fallbackHeroImages.tertiary),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background page-enter">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        {/* ═══ HERO ═══ */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full neu-flat px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-6">
                  <ShieldCheck className="h-4 w-4" />
                  {config.hero.badge}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05]">
                  {config.hero.title}
                  <span className="block mt-2 text-primary">{config.hero.highlightedTitle}</span>
                </h1>
                <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-2xl">{config.hero.description}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">{config.hero.secondaryDescription}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={safeHref(config.hero.primaryCtaHref, '/checkout')}>
                    <Button size="lg" className="min-w-[200px]">{config.hero.primaryCtaLabel}</Button>
                  </Link>
                  <Link to={safeHref(config.hero.secondaryCtaHref, '/categorias')}>
                    <Button size="lg" variant="outline" className="min-w-[200px] group">
                      {config.hero.secondaryCtaLabel}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Metrics */}
                <div className="mt-10 grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {config.metrics.map(m => (
                    <div key={m.value} className="rounded-2xl neu-concave p-4 text-center">
                      <div className="text-xl font-black text-primary">{m.value}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Images */}
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

        {/* ═══ STORYTELLING ═══ */}
        <section className="py-12 lg:py-16">
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
                  <article key={item.title} className="rounded-2xl neu-flat p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ TECNOLOGIA ═══ */}
        <section className="py-12 lg:py-16 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">{config.technology.eyebrow}</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{config.technology.title}</h2>
                <p className="mt-5 text-sm leading-relaxed opacity-70">{config.technology.description}</p>
                <div className="mt-8 space-y-3">
                  {config.technology.bullets.map(b => (
                    <div key={b.text} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm leading-relaxed opacity-80">{b.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {config.technology.items.map((item, i) => {
                  const Icon = TECH_ICONS[i] || Cpu;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed opacity-70">{item.description}</p>
                          <p className="mt-3 text-xs font-semibold text-primary">{item.highlight}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GALERIA ═══ */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <SectionHeader
                eyebrow={config.gallery.eyebrow}
                title={config.gallery.title}
                highlight={config.gallery.highlightedTitle}
              />
              <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{config.gallery.description}</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 stagger-children">
              {gallery.map(item => (
                <article key={item.title} className="rounded-2xl neu-raised overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-[240px] w-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    {item.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary/90 text-primary-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEPOIMENTOS ═══ */}
        <section className="py-12 lg:py-16">
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
                {testimonials.map(item => (
                  <div key={item.author} className="rounded-2xl neu-flat overflow-hidden">
                    <div className="grid md:grid-cols-[180px_1fr]">
                      <img src={item.image} alt={item.author} className="h-full min-h-[180px] w-full object-cover" loading="lazy" />
                      <div className="p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-0.5 text-primary mb-3">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <p className="font-semibold leading-relaxed">"{item.quote}"</p>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full neu-convex flex items-center justify-center text-sm font-bold text-primary">
                            {item.author.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{item.author}</div>
                            <div className="text-xs text-muted-foreground">{item.subtitle}</div>
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

        {/* ═══ CTA FINAL ═══ */}
        <section className="py-12 lg:py-16 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10 backdrop-blur-sm">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">{config.finalCta.eyebrow}</p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {config.finalCta.title}
                    <span className="block mt-1 text-primary">{config.finalCta.highlightedTitle}</span>
                  </h2>
                  <p className="mt-5 text-sm leading-relaxed opacity-70">{config.finalCta.description}</p>
                </div>

                <div className="grid gap-3">
                  {config.finalCta.bullets.map((b, i) => {
                    const Icon = CTA_ICONS[i % 3];
                    return (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <p className="text-sm leading-relaxed opacity-80">{b.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 sm:flex-row">
                <Link to={safeHref(config.finalCta.primaryCtaHref, '/checkout')}>
                  <Button size="lg" className="min-w-[200px]">{config.finalCta.primaryCtaLabel}</Button>
                </Link>
                <Link to={safeHref(config.finalCta.secondaryCtaHref, '/minha-area')}>
                  <Button size="lg" variant="outline" className="min-w-[200px] border-white/20 text-background hover:bg-white/10 group">
                    {config.finalCta.secondaryCtaLabel}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Garantias */}
        <GuaranteesSection />
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default WhyChooseUsPage;
