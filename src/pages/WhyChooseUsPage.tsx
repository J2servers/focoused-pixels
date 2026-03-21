import { Link } from 'react-router-dom';
import { DynamicTopBar } from '@/components/layout/DynamicTopBar';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { TrustBar } from '@/components/conversion';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, CheckCircle2, Cpu, Gem, HeartHandshake, Ruler, ShieldCheck, Sparkles, Star, Truck, Zap, ArrowRight } from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
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
  {
    image: heroNeon,
    title: 'Letreiros com presença de marca',
    description: 'Projetos pensados para chamar atenção no ambiente e criar lembrança imediata.',
    tag: 'Impacto visual',
  },
  {
    image: heroCrachas,
    title: 'Peças corporativas com acabamento forte',
    description: 'Crachás, identificação e comunicação visual que elevam a percepção da empresa.',
    tag: 'Corporativo',
  },
  {
    image: heroQrCode,
    title: 'Produtos funcionais com design comercial',
    description: 'QR Codes, displays e sinalização com cara profissional e leitura fácil.',
    tag: 'Venda inteligente',
  },
  {
    image: bandejaAcrilico,
    title: 'Peças que viram presente memorável',
    description: 'Objetos afetivos e decorativos que parecem pensados nos mínimos detalhes.',
    tag: 'Presente premium',
  },
  {
    image: brochesEspelhados,
    title: 'Acabamentos que brilham sem parecer exagerados',
    description: 'Espelhados e camadas que transformam a peça em algo desejável.',
    tag: 'Valor percebido',
  },
  {
    image: displayQrCode,
    title: 'Personalização que também vende',
    description: 'Quando o produto não só é bonito, mas também ajuda o cliente final a converter.',
    tag: 'Conversão',
  },
];

const fallbackTestimonials = [
  {
    image: portaMaternidade,
    quote: 'Eu queria algo delicado e especial. Quando chegou, parecia exatamente aquela memória que eu queria guardar para sempre.',
    author: 'Mariana, presente afetivo',
    subtitle: 'Cliente satisfeita com o acabamento final',
  },
  {
    image: placaPortaEscritorio,
    quote: 'A peça ficou profissional de verdade. Colocamos no escritório e a percepção da nossa marca mudou no mesmo dia.',
    author: 'Rafael, ambiente comercial',
    subtitle: 'Cliente satisfeito com o acabamento final',
  },
  {
    image: chaveirosPersonalizados,
    quote: 'Os clientes comentaram, fotografaram e pediram mais. Foi o tipo de produto que gera conversa e aproxima as pessoas da marca.',
    author: 'Camila, ação promocional',
    subtitle: 'Cliente satisfeita com o acabamento final',
  },
];

const fallbackShowcase = [letreiro3dLed, espelhoDecorativo, crachasAcrilico];

const fallbackHeroImages = {
  main: heroNeon,
  secondary: heroQrCode,
  tertiary: heroCrachas,
};

const resolveImage = (value: string | undefined, fallback: string) => {
  if (!value || value.startsWith('@/')) return fallback;
  return value;
};

const safeHref = (href: string | undefined, fallback: string) => {
  if (!href?.trim()) return fallback;
  return href;
};

const WhyChooseUsPage = () => {
  const { data: companyInfo } = useCompanyInfo();
  const config = mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo?.why_choose_us_config);
  const theme = config.theme;

  const hasCustomGallery = config.gallery.items.some((item) => item.title.trim() || item.image.trim() || item.description.trim());
  const gallery = hasCustomGallery
    ? config.gallery.items.map((item, index) => ({ ...item, image: resolveImage(item.image, fallbackGallery[index]?.image || heroNeon) }))
    : fallbackGallery;

  const hasCustomTestimonials = config.testimonials.items.some((item) => item.quote.trim() || item.author.trim() || item.image.trim());
  const testimonials = hasCustomTestimonials
    ? config.testimonials.items.map((item, index) => ({ ...item, image: resolveImage(item.image, fallbackTestimonials[index]?.image || portaMaternidade) }))
    : fallbackTestimonials;

  const hasCustomShowcase = config.testimonials.showcaseImages.some((image) => image.trim());
  const showcaseImages = hasCustomShowcase
    ? config.testimonials.showcaseImages.map((image, index) => resolveImage(image, fallbackShowcase[index] || letreiro3dLed))
    : fallbackShowcase;

  const heroImages = {
    main: resolveImage(config.hero.imageMain, fallbackHeroImages.main),
    secondary: resolveImage(config.hero.imageSecondary, fallbackHeroImages.secondary),
    tertiary: resolveImage(config.hero.imageTertiary, fallbackHeroImages.tertiary),
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: theme.pageBackground,
        color: theme.textPrimary,
        fontFamily: theme.bodyFont,
      }}
    >
      <DynamicTopBar />
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        <section className="border-b" style={{ borderColor: theme.cardBorder, background: theme.pageBackground }}>
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-3xl">
                <div
                  className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: theme.cardBorder, background: theme.accentSoft, color: theme.accent }}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {config.hero.badge}
                </div>
                <h1
                  className="max-w-4xl font-black leading-[0.98] tracking-[-0.04em]"
                  style={{ fontFamily: theme.headingFont, fontSize: theme.heroTitleSize, color: theme.textPrimary }}
                >
                  {config.hero.title}
                  <span className="block mt-3" style={{ color: theme.accent }}>
                    {config.hero.highlightedTitle}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 md:text-lg" style={{ color: theme.textSecondary }}>
                  {config.hero.description}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-8 md:text-lg" style={{ color: theme.textSecondary }}>
                  {config.hero.secondaryDescription}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={safeHref(config.hero.primaryCtaHref, '/checkout')}>
                    <Button
                      size="lg"
                      className="min-w-[220px] border-0"
                      style={{ background: theme.buttonPrimaryBackground, color: theme.buttonPrimaryText }}
                    >
                      {config.hero.primaryCtaLabel}
                    </Button>
                  </Link>
                  <Link to={safeHref(config.hero.secondaryCtaHref, '/categorias')}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="min-w-[220px]"
                      style={{
                        background: theme.buttonSecondaryBackground,
                        color: theme.buttonSecondaryText,
                        borderColor: theme.accent,
                      }}
                    >
                      {config.hero.secondaryCtaLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {config.metrics.map((item) => (
                    <div
                      key={`${item.value}-${item.label}`}
                      className="rounded-3xl border p-4 shadow-sm"
                      style={{ background: theme.cardBackground, borderColor: theme.cardBorder }}
                    >
                      <div className="text-2xl font-black tracking-[-0.04em]" style={{ color: theme.textPrimary, fontFamily: theme.headingFont }}>
                        {item.value}
                      </div>
                      <div className="mt-2 text-sm leading-6" style={{ color: theme.textSecondary }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-[30px] border shadow-sm sm:translate-y-6" style={{ borderColor: theme.cardBorder }}>
                  <img src={heroImages.main} alt={config.hero.imageMainTitle} className="h-full min-h-[240px] w-full object-cover" />
                  <div className="p-5" style={{ background: theme.cardBackground }}>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>Destaque visual</div>
                    <div className="mt-2 text-xl font-bold" style={{ color: theme.textPrimary }}>{config.hero.imageMainTitle}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[30px] border shadow-sm" style={{ borderColor: theme.cardBorder }}>
                    <img src={heroImages.secondary} alt={config.hero.imageSecondaryTitle} className="h-[220px] w-full object-cover" />
                    <div className="p-4" style={{ background: theme.cardBackground }}>
                      <div className="text-lg font-bold" style={{ color: theme.textPrimary }}>{config.hero.imageSecondaryTitle}</div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[30px] border shadow-sm" style={{ borderColor: theme.cardBorder }}>
                    <img src={heroImages.tertiary} alt={config.hero.imageTertiaryTitle} className="h-[220px] w-full object-cover" />
                    <div className="p-4" style={{ background: theme.cardBackground }}>
                      <div className="text-lg font-bold" style={{ color: theme.textPrimary }}>{config.hero.imageTertiaryTitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ background: theme.pageBackground }}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>{config.story.eyebrow}</p>
              <h2
                className="mt-4 font-black tracking-[-0.04em]"
                style={{ fontFamily: theme.headingFont, fontSize: theme.sectionTitleSize, color: theme.textPrimary }}
              >
                {config.story.title}
                <span className="block mt-2" style={{ color: theme.accent }}>{config.story.highlightedTitle}</span>
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {config.story.items.map((item, index) => (
                <Card key={item.title} className="rounded-[28px] shadow-sm" style={{ background: theme.cardBackground, borderColor: theme.cardBorder }}>
                  <CardContent className="p-7">
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: theme.accentSoft, color: theme.accent }}
                    >
                      {index === 0 ? <Sparkles className="h-5 w-5" /> : index === 1 ? <Ruler className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>{item.title}</h3>
                    <p className="mt-3 text-sm leading-7" style={{ color: theme.textSecondary }}>{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ background: theme.darkSectionBackground }}>
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accentSoft }}>{config.technology.eyebrow}</p>
                <h2
                  className="mt-4 font-black tracking-[-0.04em]"
                  style={{ fontFamily: theme.headingFont, fontSize: theme.sectionTitleSize, color: theme.textOnDark }}
                >
                  {config.technology.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8" style={{ color: theme.textMutedOnDark }}>
                  {config.technology.description}
                </p>
                <div className="mt-8 space-y-3">
                  {config.technology.bullets.map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" style={{ color: theme.accentSoft }} />
                      <p className="text-sm leading-7" style={{ color: theme.textMutedOnDark }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {config.technology.items.map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-[28px] border p-6 shadow-sm"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)', color: theme.accentSoft }}>
                        {index === 0 ? <Zap className="h-5 w-5" /> : index === 1 ? <Cpu className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: theme.textOnDark }}>{item.title}</h3>
                        <p className="mt-3 text-sm leading-7" style={{ color: theme.textMutedOnDark }}>{item.description}</p>
                        <p className="mt-4 text-sm font-semibold" style={{ color: theme.accentSoft }}>{item.highlight}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ background: theme.sectionBackground }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>{config.gallery.eyebrow}</p>
                <h2
                  className="mt-3 font-black tracking-[-0.04em]"
                  style={{ fontFamily: theme.headingFont, fontSize: theme.sectionTitleSize, color: theme.textPrimary }}
                >
                  {config.gallery.title}
                  <span className="block mt-2" style={{ color: theme.accent }}>{config.gallery.highlightedTitle}</span>
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7" style={{ color: theme.textSecondary }}>
                {config.gallery.description}
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {gallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-[28px] border shadow-sm" style={{ background: theme.cardBackground, borderColor: theme.cardBorder }}>
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.title} className="h-[280px] w-full object-cover" loading="lazy" />
                    {item.tag ? (
                      <div
                        className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{ background: theme.accentSoft, color: theme.accent }}
                      >
                        {item.tag}
                      </div>
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>{item.title}</h3>
                    <p className="mt-3 text-sm leading-7" style={{ color: theme.textSecondary }}>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ background: theme.pageBackground }}>
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accent }}>{config.testimonials.eyebrow}</p>
                <h2
                  className="mt-4 font-black tracking-[-0.04em]"
                  style={{ fontFamily: theme.headingFont, fontSize: theme.sectionTitleSize, color: theme.textPrimary }}
                >
                  {config.testimonials.title}
                </h2>
                <p className="mt-5 text-base leading-8" style={{ color: theme.textSecondary }}>
                  {config.testimonials.description}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  {showcaseImages.slice(0, 3).map((image, index) => (
                    <div key={`${image}-${index}`} className="overflow-hidden rounded-[24px] border shadow-sm" style={{ borderColor: theme.cardBorder }}>
                      <img src={image} alt={`Resultado entregue ${index + 1}`} className="h-[170px] w-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {testimonials.map((item) => (
                  <Card key={item.author} className="overflow-hidden rounded-[28px] shadow-sm" style={{ background: theme.cardBackground, borderColor: theme.cardBorder }}>
                    <div className="grid md:grid-cols-[220px_1fr]">
                      <img src={item.image} alt={item.author} className="h-full min-h-[220px] w-full object-cover" loading="lazy" />
                      <CardContent className="flex flex-col justify-between p-6">
                        <div>
                          <div className="mb-4 flex items-center gap-1" style={{ color: theme.accent }}>
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star key={index} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <p className="text-lg font-semibold leading-8" style={{ color: theme.textPrimary }}>"{item.quote}"</p>
                        </div>
                        <div className="mt-6 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: theme.accentSoft, color: theme.accent }}>
                            {item.author.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: theme.textPrimary }}>{item.author}</div>
                            <div className="text-sm" style={{ color: theme.textSecondary }}>{item.subtitle}</div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ background: theme.darkSectionBackground }}>
          <div className="container mx-auto px-4">
            <div className="rounded-[34px] border p-7 md:p-10 shadow-sm" style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: theme.accentSoft }}>{config.finalCta.eyebrow}</p>
                  <h2
                    className="mt-4 font-black tracking-[-0.04em]"
                    style={{ fontFamily: theme.headingFont, fontSize: theme.sectionTitleSize, color: theme.textOnDark }}
                  >
                    {config.finalCta.title}
                    <span className="block mt-2" style={{ color: theme.accentSoft }}>{config.finalCta.highlightedTitle}</span>
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8" style={{ color: theme.textMutedOnDark }}>
                    {config.finalCta.description}
                  </p>
                </div>

                <div className="grid gap-3">
                  {config.finalCta.bullets.map((item, index) => (
                    <div key={`${item.text}-${index}`} className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                      {index % 3 === 0 ? <BadgeCheck className="mt-1 h-5 w-5 shrink-0" style={{ color: theme.accentSoft }} /> : index % 3 === 1 ? <HeartHandshake className="mt-1 h-5 w-5 shrink-0" style={{ color: theme.accentSoft }} /> : <Gem className="mt-1 h-5 w-5 shrink-0" style={{ color: theme.accentSoft }} />}
                      <p className="text-sm leading-7" style={{ color: theme.textMutedOnDark }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t pt-8 sm:flex-row" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                <Link to={safeHref(config.finalCta.primaryCtaHref, '/checkout')}>
                  <Button
                    size="lg"
                    className="min-w-[220px] border-0"
                    style={{ background: theme.accentSoft, color: theme.darkSectionBackground }}
                  >
                    {config.finalCta.primaryCtaLabel}
                  </Button>
                </Link>
                <Link to={safeHref(config.finalCta.secondaryCtaHref, '/minha-area')}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-[220px]"
                    style={{ borderColor: theme.accentSoft, color: theme.textOnDark, background: 'transparent' }}
                  >
                    {config.finalCta.secondaryCtaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default WhyChooseUsPage;
