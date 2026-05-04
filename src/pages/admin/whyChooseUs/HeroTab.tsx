import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Type } from 'lucide-react';
import {
  cloneConfig, resolvePreviewImage,
  heroNeon, heroQrCode, heroCrachas,
  ImageConfigRow,
} from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import type { TabProps } from './types';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export function HeroTab({ config, setConfig }: TabProps) {
  const updateHero = (field: keyof WhyChooseUsConfig['hero'], value: string) =>
    setConfig((c) => ({ ...c, hero: { ...c.hero, [field]: value } }));

  type ImageField = 'imageMain' | 'imageSecondary' | 'imageTertiary';
  type TitleField = 'imageMainTitle' | 'imageSecondaryTitle' | 'imageTertiaryTitle';
  const heroImages: Array<[ImageField, TitleField, string, string]> = [
    ['imageMain', 'imageMainTitle', 'Imagem principal', heroNeon],
    ['imageSecondary', 'imageSecondaryTitle', 'Imagem secundária', heroQrCode],
    ['imageTertiary', 'imageTertiaryTitle', 'Imagem terciária', heroCrachas],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5" /> Hero, CTAs e métricas</CardTitle>
        <CardDescription>Primeira dobra da página — máximo impacto visual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Badge</Label><Input value={config.hero.badge} onChange={(e) => updateHero('badge', e.target.value)} /></div>
          <div className="space-y-2"><Label>Título principal</Label><Input value={config.hero.title} onChange={(e) => updateHero('title', e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Título destacado</Label><Input value={config.hero.highlightedTitle} onChange={(e) => updateHero('highlightedTitle', e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Descrição principal</Label><Textarea value={config.hero.description} onChange={(e) => updateHero('description', e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Descrição secundária</Label><Textarea value={config.hero.secondaryDescription} onChange={(e) => updateHero('secondaryDescription', e.target.value)} /></div>
          <div className="space-y-2"><Label>Texto CTA principal</Label><Input value={config.hero.primaryCtaLabel} onChange={(e) => updateHero('primaryCtaLabel', e.target.value)} /></div>
          <div className="space-y-2"><Label>Link CTA principal</Label><Input value={config.hero.primaryCtaHref} onChange={(e) => updateHero('primaryCtaHref', e.target.value)} /></div>
          <div className="space-y-2"><Label>Texto CTA secundário</Label><Input value={config.hero.secondaryCtaLabel} onChange={(e) => updateHero('secondaryCtaLabel', e.target.value)} /></div>
          <div className="space-y-2"><Label>Link CTA secundário</Label><Input value={config.hero.secondaryCtaHref} onChange={(e) => updateHero('secondaryCtaHref', e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Imagens do hero</p>
          {heroImages.map(([imageField, titleField, label, fallback]) => (
            <ImageConfigRow key={imageField} label={label} value={config.hero[imageField]} previewSrc={resolvePreviewImage(config.hero[imageField], fallback)} onChange={(url) => updateHero(imageField, url || '')}>
              <Input value={config.hero[titleField]} onChange={(e) => updateHero(titleField, e.target.value)} placeholder="Alt text / legenda" />
            </ImageConfigRow>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Indicadores rápidos</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.metrics.map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Label>Valor {i + 1}</Label>
                <Input value={item.value} onChange={(e) => { const n = cloneConfig(config); n.metrics[i].value = e.target.value; setConfig(n); }} />
                <Label>Texto {i + 1}</Label>
                <Textarea value={item.label} onChange={(e) => { const n = cloneConfig(config); n.metrics[i].label = e.target.value; setConfig(n); }} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
