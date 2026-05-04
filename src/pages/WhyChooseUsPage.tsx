/**
 * WhyChooseUsPage — Tema Neumorphism (machined)
 * Aplica config.theme do admin como CSS custom properties.
 */
import { useMemo } from 'react';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { TrustBar, GuaranteesSection } from '@/components/conversion';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

import {
  buildThemeStyles, fallbackGallery, fallbackTestimonials,
  fallbackShowcase, fallbackHeroImages, resolveImage,
} from './whyChooseUs/themeAndAssets';
import heroNeon from '@/assets/hero/hero-neon.jpg';
import letreiro3dLed from '@/assets/products/letreiro-3d-led.jpg';
import portaMaternidade from '@/assets/products/porta-maternidade.jpg';

import { HeroSection } from './whyChooseUs/HeroSection';
import { StorySection } from './whyChooseUs/StorySection';
import { TechnologySection } from './whyChooseUs/TechnologySection';
import { GallerySection } from './whyChooseUs/GallerySection';
import { TestimonialsSection } from './whyChooseUs/TestimonialsSection';
import { FinalCtaSection } from './whyChooseUs/FinalCtaSection';

const WhyChooseUsPage = () => {
  const { data: companyInfo } = useCompanyInfo();
  const config = mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo?.why_choose_us_config);
  const themeStyles = useMemo(() => buildThemeStyles(config.theme), [config.theme]);

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
    <div className="min-h-screen flex flex-col page-enter" style={themeStyles}>
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1" style={{ backgroundColor: 'var(--wcup-bg)', color: 'var(--wcup-text)' }}>
        <HeroSection config={config} heroImages={heroImages} />
        <StorySection config={config} />
        <TechnologySection config={config} />
        <GallerySection config={config} gallery={gallery} />
        <TestimonialsSection config={config} testimonials={testimonials} showcaseImages={showcaseImages} />
        <FinalCtaSection config={config} />
        <GuaranteesSection />
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default WhyChooseUsPage;
