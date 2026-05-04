import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon } from 'lucide-react';
import {
  cloneConfig, resolvePreviewImage,
  galleryFallbacks, testimonialFallbacks, showcaseFallbacks,
  ImageConfigRow,
} from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import type { TabProps } from './types';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export function GalleryTab({ config, setConfig }: TabProps) {
  const updateSection = <T extends keyof WhyChooseUsConfig>(section: T, value: WhyChooseUsConfig[T]) =>
    setConfig((c) => ({ ...c, [section]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Galeria de resultados</CardTitle><CardDescription>Imagens de prova social e acabamentos.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Eyebrow</Label><Input value={config.gallery.eyebrow} onChange={(e) => updateSection('gallery', { ...config.gallery, eyebrow: e.target.value })} /></div>
            <div className="space-y-2"><Label>Título</Label><Input value={config.gallery.title} onChange={(e) => updateSection('gallery', { ...config.gallery, title: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Título destacado</Label><Input value={config.gallery.highlightedTitle} onChange={(e) => updateSection('gallery', { ...config.gallery, highlightedTitle: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={config.gallery.description} onChange={(e) => updateSection('gallery', { ...config.gallery, description: e.target.value })} /></div>
          </div>
          <div className="space-y-4">
            {config.gallery.items.map((item, i) => (
              <ImageConfigRow key={i} label={`Galeria ${i + 1}`} value={item.image} previewSrc={resolvePreviewImage(item.image, galleryFallbacks[i])} onChange={(url) => { const n = cloneConfig(config); n.gallery.items[i].image = url || ''; setConfig(n); }}>
                <Input value={item.tag || ''} onChange={(e) => { const n = cloneConfig(config); n.gallery.items[i].tag = e.target.value; setConfig(n); }} placeholder="Tag" />
                <Input value={item.title} onChange={(e) => { const n = cloneConfig(config); n.gallery.items[i].title = e.target.value; setConfig(n); }} placeholder="Título" />
                <Textarea value={item.description} onChange={(e) => { const n = cloneConfig(config); n.gallery.items[i].description = e.target.value; setConfig(n); }} placeholder="Descrição" />
              </ImageConfigRow>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Depoimentos</CardTitle><CardDescription>Provas sociais e resultados reais.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Eyebrow</Label><Input value={config.testimonials.eyebrow} onChange={(e) => updateSection('testimonials', { ...config.testimonials, eyebrow: e.target.value })} /></div>
            <div className="space-y-2"><Label>Título</Label><Input value={config.testimonials.title} onChange={(e) => updateSection('testimonials', { ...config.testimonials, title: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Descrição</Label><Textarea value={config.testimonials.description} onChange={(e) => updateSection('testimonials', { ...config.testimonials, description: e.target.value })} /></div>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Imagens de apoio</p>
            {config.testimonials.showcaseImages.map((image, i) => (
              <ImageConfigRow key={`showcase-${i}`} label={`Vitrine ${i + 1}`} value={image} previewSrc={resolvePreviewImage(image, showcaseFallbacks[i])} onChange={(url) => { const n = cloneConfig(config); n.testimonials.showcaseImages[i] = url || ''; setConfig(n); }} />
            ))}
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Depoimentos</p>
            {config.testimonials.items.map((item, i) => (
              <ImageConfigRow key={i} label={`Depoimento ${i + 1}`} value={item.image} previewSrc={resolvePreviewImage(item.image, testimonialFallbacks[i])} onChange={(url) => { const n = cloneConfig(config); n.testimonials.items[i].image = url || ''; setConfig(n); }}>
                <Input value={item.author} onChange={(e) => { const n = cloneConfig(config); n.testimonials.items[i].author = e.target.value; setConfig(n); }} placeholder="Nome do autor" />
                <Input value={item.subtitle} onChange={(e) => { const n = cloneConfig(config); n.testimonials.items[i].subtitle = e.target.value; setConfig(n); }} placeholder="Subtítulo" />
                <Textarea value={item.quote} onChange={(e) => { const n = cloneConfig(config); n.testimonials.items[i].quote = e.target.value; setConfig(n); }} placeholder="Texto do depoimento" />
              </ImageConfigRow>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
