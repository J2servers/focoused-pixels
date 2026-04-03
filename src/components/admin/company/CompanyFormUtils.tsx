import { type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/admin';

interface LogoEditorRowProps {
  label: string;
  description: string;
  value: string;
  onChange: (url: string | null) => void;
  children: ReactNode;
}

export const LogoEditorRow = ({ label, description, value, onChange, children }: LogoEditorRowProps) => (
  <div className="rounded-2xl border p-4">
    <div className="grid gap-4 lg:grid-cols-[220px,1fr] lg:items-start">
      <div className="space-y-2">
        <Label>{label}</Label>
        <ImageUpload
          value={value}
          onChange={onChange}
          folder="logos"
          className="max-w-[220px]"
          aspectRatio="aspect-[4/3]"
          placeholder="Enviar logo"
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </div>
  </div>
);

export const clamp = (value: number | null | undefined, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export const sanitizeNumber = (value: number | null | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeHexColor = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const candidate = value.trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate) ? candidate : fallback;
};

export const hexToHsl = (hex: string) => {
  const normalized = hex.replace('#', '');
  const chunk = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const r = parseInt(chunk.slice(0, 2), 16) / 255;
  const g = parseInt(chunk.slice(2, 4), 16) / 255;
  const b = parseInt(chunk.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};
