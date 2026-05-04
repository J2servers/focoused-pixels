import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link2 } from 'lucide-react';
import { cloneConfig } from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import type { TabProps } from './types';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export function CtaTab({ config, setConfig }: TabProps) {
  const updateSection = <T extends keyof WhyChooseUsConfig>(section: T, value: WhyChooseUsConfig[T]) =>
    setConfig((c) => ({ ...c, [section]: value }));

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> CTA Final</CardTitle><CardDescription>Última seção de conversão.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Eyebrow</Label><Input value={config.finalCta.eyebrow} onChange={(e) => updateSection('finalCta', { ...config.finalCta, eyebrow: e.target.value })} /></div>
          <div className="space-y-2"><Label>Título</Label><Input value={config.finalCta.title} onChange={(e) => updateSection('finalCta', { ...config.finalCta, title: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Título destacado</Label><Input value={config.finalCta.highlightedTitle} onChange={(e) => updateSection('finalCta', { ...config.finalCta, highlightedTitle: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={config.finalCta.description} onChange={(e) => updateSection('finalCta', { ...config.finalCta, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Texto botão primário</Label><Input value={config.finalCta.primaryCtaLabel} onChange={(e) => updateSection('finalCta', { ...config.finalCta, primaryCtaLabel: e.target.value })} /></div>
          <div className="space-y-2"><Label>Link botão primário</Label><Input value={config.finalCta.primaryCtaHref} onChange={(e) => updateSection('finalCta', { ...config.finalCta, primaryCtaHref: e.target.value })} /></div>
          <div className="space-y-2"><Label>Texto botão secundário</Label><Input value={config.finalCta.secondaryCtaLabel} onChange={(e) => updateSection('finalCta', { ...config.finalCta, secondaryCtaLabel: e.target.value })} /></div>
          <div className="space-y-2"><Label>Link botão secundário</Label><Input value={config.finalCta.secondaryCtaHref} onChange={(e) => updateSection('finalCta', { ...config.finalCta, secondaryCtaHref: e.target.value })} /></div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Argumentos (bullets)</p>
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {config.finalCta.bullets.map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Label>Bullet {i + 1}</Label>
                <Textarea value={item.text} onChange={(e) => { const n = cloneConfig(config); n.finalCta.bullets[i].text = e.target.value; setConfig(n); }} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
