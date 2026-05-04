import type { WhyChooseUsTheme } from '@/lib/whyChooseUsConfig';
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

export const fallbackGallery = [
  { image: heroNeon, title: 'Letreiros com presença de marca', description: 'Projetos pensados para chamar atenção no ambiente.', tag: 'Impacto visual' },
  { image: heroCrachas, title: 'Peças corporativas com acabamento forte', description: 'Crachás e comunicação visual que elevam a percepção.', tag: 'Corporativo' },
  { image: heroQrCode, title: 'Produtos funcionais com design comercial', description: 'QR Codes, displays e sinalização profissional.', tag: 'Venda inteligente' },
  { image: bandejaAcrilico, title: 'Peças que viram presente memorável', description: 'Objetos afetivos pensados nos mínimos detalhes.', tag: 'Presente premium' },
  { image: brochesEspelhados, title: 'Acabamentos que brilham sem exagero', description: 'Espelhados e camadas que transformam a peça.', tag: 'Valor percebido' },
  { image: displayQrCode, title: 'Personalização que também vende', description: 'Produto bonito que ajuda o cliente a converter.', tag: 'Conversão' },
];

export const fallbackTestimonials = [
  { image: portaMaternidade, quote: 'Quando chegou, parecia exatamente a memória que eu queria guardar para sempre.', author: 'Mariana', subtitle: 'Presente afetivo' },
  { image: placaPortaEscritorio, quote: 'A peça ficou profissional de verdade. A percepção da marca mudou no mesmo dia.', author: 'Rafael', subtitle: 'Ambiente comercial' },
  { image: chaveirosPersonalizados, quote: 'Os clientes comentaram, fotografaram e pediram mais. Gera conversa e aproxima da marca.', author: 'Camila', subtitle: 'Ação promocional' },
];

export const fallbackShowcase = [letreiro3dLed, espelhoDecorativo, crachasAcrilico];
export const fallbackHeroImages = { main: heroNeon, secondary: heroQrCode, tertiary: heroCrachas };

export const resolveImage = (v: string | undefined, fb: string) => (!v || v.startsWith('@/') ? fb : v);
export const safeHref = (h: string | undefined, fb: string) => (h?.trim() ? h : fb);

export function buildThemeStyles(theme: WhyChooseUsTheme): React.CSSProperties {
  return {
    '--wcup-bg': theme.pageBackground,
    '--wcup-section-bg': theme.sectionBackground,
    '--wcup-dark-bg': theme.darkSectionBackground,
    '--wcup-card-bg': theme.cardBackground,
    '--wcup-card-border': theme.cardBorder,
    '--wcup-text': theme.textPrimary,
    '--wcup-text-secondary': theme.textSecondary,
    '--wcup-text-on-dark': theme.textOnDark,
    '--wcup-text-muted-dark': theme.textMutedOnDark,
    '--wcup-accent': theme.accent,
    '--wcup-accent-soft': theme.accentSoft,
    '--wcup-btn-primary-bg': theme.buttonPrimaryBackground,
    '--wcup-btn-primary-text': theme.buttonPrimaryText,
    '--wcup-btn-secondary-bg': theme.buttonSecondaryBackground,
    '--wcup-btn-secondary-text': theme.buttonSecondaryText,
    fontFamily: theme.bodyFont,
  } as React.CSSProperties;
}

export function SectionHeader({
  eyebrow, title, highlight, description, center,
}: { eyebrow?: string; title: string; highlight?: string; description?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--wcup-accent)' }}>{eyebrow}</p>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: 'var(--wcup-text)' }}>
        {title}
        {highlight && <span className="block mt-1" style={{ color: 'var(--wcup-accent)' }}>{highlight}</span>}
      </h2>
      {description && (
        <p className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: 'var(--wcup-text-secondary)' }}>{description}</p>
      )}
    </div>
  );
}
