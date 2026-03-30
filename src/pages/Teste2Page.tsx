/**
 * Teste2Page - Motor UX Dark Glassmorphism
 * Design premium com tema escuro, acentos neon e cards de vidro
 * 100% integrado ao backend admin
 * Refatorado em componentes modulares
 */

import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  GlassNav,
  DarkHero,
  TrustMarquee,
  CategoriesGrid,
  FeaturedSection,
  SocialProofSection,
  DifferentialsSection,
  NewsletterSection,
  CTASection,
  DarkFooter,
  DarkVideoStories,
} from '@/components/teste2';

const Teste2Page = () => {
  const settings = useSiteSettings();

  return (
    <div className="min-h-screen bg-[#050d1a] text-white overflow-x-hidden"
      style={{
        background: `
          radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 26%),
          radial-gradient(circle at 12% 18%, rgba(139,167,191,0.08), transparent 20%),
          linear-gradient(180deg, #050d1a 0%, #081321 48%, #07101c 100%)
        `,
      }}
    >
      <GlassNav companyName={settings.companyName} logo={settings.raw?.header_logo || null} />
      <DarkHero />
      <TrustMarquee />
      <CategoriesGrid />
      <FeaturedSection />
      <SocialProofSection />
      <DarkVideoStories />
      <DifferentialsSection />
      <NewsletterSection />
      <CTASection />
      <DarkFooter />
    </div>
  );
};

export default Teste2Page;
