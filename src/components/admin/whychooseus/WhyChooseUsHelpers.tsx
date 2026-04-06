import { type ReactNode } from 'react';
import { ImageUpload } from '@/components/admin';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import heroNeon from '@/assets/hero/hero-neon.jpg';
import heroCrachas from '@/assets/hero/hero-crachas.jpg';
import heroQrCode from '@/assets/hero/hero-qrcode.jpg';
import bandejaAcrilico from '@/assets/products/bandeja-acrilico.jpg';
import brochesEspelhados from '@/assets/products/broches-espelhados.jpg';
import displayQrCode from '@/assets/products/display-qr-code.jpg';
import portaMaternidade from '@/assets/products/porta-maternidade.jpg';
import placaPortaEscritorio from '@/assets/products/placa-porta-escritorio.jpg';
import chaveirosPersonalizados from '@/assets/products/chaveiros-personalizados.jpg';
import letreiro3dLed from '@/assets/products/letreiro-3d-led.jpg';
import espelhoDecorativo from '@/assets/products/espelho-decorativo.jpg';
import crachasAcrilico from '@/assets/products/crachas-acrilico.jpg';
import { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export const fontPresets = [
  'Montserrat, "Segoe UI", sans-serif',
  'Georgia, "Times New Roman", serif',
  '"Trebuchet MS", "Segoe UI", sans-serif',
  '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  'Inter, "Segoe UI", sans-serif',
];

export const cloneConfig = (config: WhyChooseUsConfig) => structuredClone(config);

export const adminImageFallbacks: Record<string, string> = {
  '@/assets/hero/hero-neon.jpg': heroNeon,
  '@/assets/hero/hero-crachas.jpg': heroCrachas,
  '@/assets/hero/hero-qrcode.jpg': heroQrCode,
};

export const galleryFallbacks = [heroNeon, heroCrachas, heroQrCode, bandejaAcrilico, brochesEspelhados, displayQrCode];
export const testimonialFallbacks = [portaMaternidade, placaPortaEscritorio, chaveirosPersonalizados];
export const showcaseFallbacks = [letreiro3dLed, espelhoDecorativo, crachasAcrilico];

export { heroNeon, heroQrCode, heroCrachas };

export const resolvePreviewImage = (value?: string | null, fallback?: string) => {
  if (!value?.trim()) return fallback || null;
  if (value.startsWith('@/')) return adminImageFallbacks[value] || fallback || null;
  return value;
};

interface ImageConfigRowProps {
  label: string;
  value?: string | null;
  previewSrc?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  placeholder?: string;
  aspectRatio?: string;
  children?: ReactNode;
}

export const ImageConfigRow = ({
  label, value, previewSrc, onChange,
  folder = 'why-choose-us', placeholder = 'Enviar imagem',
  aspectRatio = 'aspect-[4/3]', children,
}: ImageConfigRowProps) => (
  <div className="rounded-xl border p-4">
    <div className="grid gap-4 lg:grid-cols-[220px,1fr] lg:items-start">
      <div className="space-y-2">
        <Label>{label}</Label>
        <ImageUpload
          value={value} previewSrc={previewSrc} onChange={onChange}
          folder={folder} placeholder={placeholder} aspectRatio={aspectRatio}
          className="max-w-[220px]"
        />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  </div>
);

export const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="flex gap-2">
      <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-12 h-9 p-0.5 cursor-pointer" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
    </div>
  </div>
);
