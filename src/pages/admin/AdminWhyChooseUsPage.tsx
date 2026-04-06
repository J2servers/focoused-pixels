import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanyInfoAdmin, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig, WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { Loader2, Palette, Save, Type, Image as ImageIcon, Link2, Eye, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  fontPresets, cloneConfig, resolvePreviewImage,
  galleryFallbacks, testimonialFallbacks, showcaseFallbacks,
  heroNeon, heroQrCode, heroCrachas,
  ImageConfigRow, ColorField,
} from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import { LivePreview } from '@/components/admin/whychooseus/WhyChooseUsPreview';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminWhyChooseUsPage = () => {
  const { data: companyInfo, isLoading } = useCompanyInfoAdmin();
  const updateCompany = useUpdateCompanyInfo();
  const [config, setConfig] = useState<WhyChooseUsConfig>(defaultWhyChooseUsConfig);

  useEffect(() => {
    if (!companyInfo) return;
    setConfig(mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo.why_choose_us_config));
  }, [companyInfo]);

  const updateTheme = (field: keyof WhyChooseUsConfig['theme'], value: string) => {
    setConfig((c) => ({ ...c, theme: { ...c.theme, [field]: value } }));
  };
  const updateHero = (field: keyof WhyChooseUsConfig['hero'], value: string) => {
    setConfig((c) => ({ ...c, hero: { ...c.hero, [field]: value } }));
  };
  const updateSection = <T extends keyof WhyChooseUsConfig>(section: T, value: WhyChooseUsConfig[T]) => {
    setConfig((c) => ({ ...c, [section]: value }));
  };

  const handleSave = async () => {
    try {
      await updateCompany.mutateAsync({
        id: companyInfo?.id || null,
        data: {
          company_name: companyInfo?.company_name || 'Pincel de Luz Personalizados',
          why_choose_us_config: config as unknown as Record<string, unknown>,
        },
      });
      toast.success('Página "Por que escolher" atualizada com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar configurações';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Página Por Que Escolher" requireEditor>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Página Por Que Escolher" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="✨ Guia da Página 'Por Que Escolher'"
          description="Edite os diferenciais exibidos na página institucional."
          steps={[
            { title: "Editar itens", description: "Clique em cada card para editar título, descrição e ícone do diferencial." },
            { title: "Adicionar item", description: "Crie novos diferenciais para destacar os pontos fortes da sua empresa." },
            { title: "Reordenar", description: "Arraste os itens para definir a ordem de exibição na página." },
            { title: "Preview", description: "Visualize como a página ficará para os visitantes em tempo real." },
          ]}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Controle total da página comercial</h2>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">
              Cada alteração aqui reflete em tempo real na página <code className="text-purple-400">/por-que-escolher</code>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/por-que-escolher" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Ver ao vivo
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={updateCompany.isPending}>
              {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar alterações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="theme"><Palette className="h-4 w-4 mr-1.5" /> Tema</TabsTrigger>
            <TabsTrigger value="hero"><Type className="h-4 w-4 mr-1.5" /> Hero</TabsTrigger>
            <TabsTrigger value="content"><Sparkles className="h-4 w-4 mr-1.5" /> Conteúdo</TabsTrigger>
            <TabsTrigger value="gallery"><ImageIcon className="h-4 w-4 mr-1.5" /> Galeria</TabsTrigger>
            <TabsTrigger value="cta"><Link2 className="h-4 w-4 mr-1.5" /> CTA Final</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1.5" /> Preview</TabsTrigger>
          </TabsList>

          {/* THEME TAB */}
          <TabsContent value="theme">
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Cores e tipografia</CardTitle>
                  <CardDescription>Cada cor definida aqui é aplicada na página pública em tempo real após salvar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundos</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <ColorField label="Fundo principal" value={config.theme.pageBackground} onChange={(v) => updateTheme('pageBackground', v)} />
                      <ColorField label="Fundo alternado (seções)" value={config.theme.sectionBackground} onChange={(v) => updateTheme('sectionBackground', v)} />
                      <ColorField label="Fundo escuro" value={config.theme.darkSectionBackground} onChange={(v) => updateTheme('darkSectionBackground', v)} />
                      <ColorField label="Fundo dos cards" value={config.theme.cardBackground} onChange={(v) => updateTheme('cardBackground', v)} />
                      <ColorField label="Borda dos cards" value={config.theme.cardBorder} onChange={(v) => updateTheme('cardBorder', v)} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Textos</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <ColorField label="Texto principal" value={config.theme.textPrimary} onChange={(v) => updateTheme('textPrimary', v)} />
                      <ColorField label="Texto secundário" value={config.theme.textSecondary} onChange={(v) => updateTheme('textSecondary', v)} />
                      <ColorField label="Texto em fundo escuro" value={config.theme.textOnDark} onChange={(v) => updateTheme('textOnDark', v)} />
                      <ColorField label="Texto mutado escuro" value={config.theme.textMutedOnDark} onChange={(v) => updateTheme('textMutedOnDark', v)} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Destaque / Accent</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ColorField label="Cor de destaque" value={config.theme.accent} onChange={(v) => updateTheme('accent', v)} />
                      <ColorField label="Destaque suave (fundo ícones)" value={config.theme.accentSoft} onChange={(v) => updateTheme('accentSoft', v)} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Botões</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <ColorField label="Fundo botão primário" value={config.theme.buttonPrimaryBackground} onChange={(v) => updateTheme('buttonPrimaryBackground', v)} />
                      <ColorField label="Texto botão primário" value={config.theme.buttonPrimaryText} onChange={(v) => updateTheme('buttonPrimaryText', v)} />
                      <ColorField label="Fundo botão secundário" value={config.theme.buttonSecondaryBackground} onChange={(v) => updateTheme('buttonSecondaryBackground', v)} />
                      <ColorField label="Texto botão secundário" value={config.theme.buttonSecondaryText} onChange={(v) => updateTheme('buttonSecondaryText', v)} />
                    </div>
                    <div className="mt-3 flex gap-3 items-center p-4 rounded-lg border">
                      <span className="px-5 py-2 rounded-xl text-sm font-semibold shadow-md" style={{ backgroundColor: config.theme.buttonPrimaryBackground, color: config.theme.buttonPrimaryText }}>
                        {config.hero.primaryCtaLabel}
                      </span>
                      <span className="px-5 py-2 rounded-xl text-sm font-semibold border-2" style={{ backgroundColor: config.theme.buttonSecondaryBackground, color: config.theme.buttonSecondaryText, borderColor: config.theme.cardBorder }}>
                        {config.hero.secondaryCtaLabel}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">← Preview dos botões</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tipografia</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Fonte dos títulos</Label>
                        <Input value={config.theme.headingFont} onChange={(e) => updateTheme('headingFont', e.target.value)} />
                        <div className="flex flex-wrap gap-1.5">
                          {fontPresets.map((font) => (
                            <Button key={font} type="button" variant="outline" size="sm" className="text-xs" onClick={() => updateTheme('headingFont', font)}>
                              {font.split(',')[0].replace(/"/g, '')}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Fonte do corpo</Label>
                        <Input value={config.theme.bodyFont} onChange={(e) => updateTheme('bodyFont', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tamanho título hero</Label>
                        <Input value={config.theme.heroTitleSize} onChange={(e) => updateTheme('heroTitleSize', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tamanho títulos de seção</Label>
                        <Input value={config.theme.sectionTitleSize} onChange={(e) => updateTheme('sectionTitleSize', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview em tempo real</p>
                <LivePreview config={config} />
              </div>
            </div>
          </TabsContent>

          {/* HERO TAB */}
          <TabsContent value="hero">
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
                  {([['imageMain', 'imageMainTitle', 'Imagem principal', heroNeon], ['imageSecondary', 'imageSecondaryTitle', 'Imagem secundária', heroQrCode], ['imageTertiary', 'imageTertiaryTitle', 'Imagem terciária', heroCrachas]] as const).map(([imageField, titleField, label, fallback]) => (
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
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content">
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
          </TabsContent>

          {/* GALLERY TAB */}
          <TabsContent value="gallery">
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
          </TabsContent>

          {/* CTA FINAL TAB */}
          <TabsContent value="cta">
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
          </TabsContent>

          {/* PREVIEW TAB */}
          <TabsContent value="preview">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Preview completo</CardTitle></CardHeader>
              <CardContent>
                <LivePreview config={config} />
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/por-que-escolher" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Abrir página real</Link>
                  </Button>
                  <Button onClick={handleSave} disabled={updateCompany.isPending}>
                    {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar e publicar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWhyChooseUsPage;
