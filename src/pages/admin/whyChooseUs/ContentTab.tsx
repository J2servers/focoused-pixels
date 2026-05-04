import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cloneConfig } from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import type { TabProps } from './types';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export function ContentTab({ config, setConfig }: TabProps) {
  const updateSection = <T extends keyof WhyChooseUsConfig>(section: T, value: WhyChooseUsConfig[T]) =>
    setConfig((c) => ({ ...c, [section]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Storytelling</CardTitle><CardDescription>Seção que explica o valor emocional do produto.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Eyebrow</Label><Input value={config.story.eyebrow} onChange={(e) => updateSection('story', { ...config.story, eyebrow: e.target.value })} /></div>
            <div className="space-y-2"><Label>Título</Label><Input value={config.story.title} onChange={(e) => updateSection('story', { ...config.story, title: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Título destacado</Label><Input value={config.story.highlightedTitle} onChange={(e) => updateSection('story', { ...config.story, highlightedTitle: e.target.value })} /></div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {config.story.items.map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Label>Card {i + 1} — Título</Label>
                <Input value={item.title} onChange={(e) => { const n = cloneConfig(config); n.story.items[i].title = e.target.value; setConfig(n); }} />
                <Label>Descrição</Label>
                <Textarea value={item.description} onChange={(e) => { const n = cloneConfig(config); n.story.items[i].description = e.target.value; setConfig(n); }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tecnologia</CardTitle><CardDescription>Seção escura que mostra a tecnologia utilizada na produção.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Eyebrow</Label><Input value={config.technology.eyebrow} onChange={(e) => updateSection('technology', { ...config.technology, eyebrow: e.target.value })} /></div>
            <div className="space-y-2"><Label>Título</Label><Input value={config.technology.title} onChange={(e) => updateSection('technology', { ...config.technology, title: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={config.technology.description} onChange={(e) => updateSection('technology', { ...config.technology, description: e.target.value })} /></div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Bullets de tecnologia</Label>
            <div className="space-y-2 mt-2">
              {config.technology.bullets.map((bullet, i) => (
                <Textarea key={i} value={bullet.text} onChange={(e) => { const n = cloneConfig(config); n.technology.bullets[i].text = e.target.value; setConfig(n); }} placeholder={`Bullet ${i + 1}`} className="min-h-[50px]" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {config.technology.items.map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-4">
                <Label>Tecnologia {i + 1} — Título</Label>
                <Input value={item.title} onChange={(e) => { const n = cloneConfig(config); n.technology.items[i].title = e.target.value; setConfig(n); }} />
                <Label>Descrição</Label>
                <Textarea value={item.description} onChange={(e) => { const n = cloneConfig(config); n.technology.items[i].description = e.target.value; setConfig(n); }} />
                <Label>Frase de destaque</Label>
                <Input value={item.highlight} onChange={(e) => { const n = cloneConfig(config); n.technology.items[i].highlight = e.target.value; setConfig(n); }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
