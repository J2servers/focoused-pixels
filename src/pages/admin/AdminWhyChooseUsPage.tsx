import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout, ImageUpload } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyInfo, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig, WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { Loader2, Palette, Save, Sparkles, Type, Image as ImageIcon, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import heroNeon from '@/assets/hero/hero-neon.jpg';
import heroCrachas from '@/assets/hero/hero-crachas.jpg';
import heroQrCode from '@/assets/hero/hero-qrcode.jpg';
import letreiro3dLed from '@/assets/products/letreiro-3d-led.jpg';
import displayQrCode from '@/assets/products/display-qr-code.jpg';
import bandejaAcrilico from '@/assets/products/bandeja-acrilico.jpg';
import brochesEspelhados from '@/assets/products/broches-espelhados.jpg';
import portaMaternidade from '@/assets/products/porta-maternidade.jpg';
import placaPortaEscritorio from '@/assets/products/placa-porta-escritorio.jpg';
import chaveirosPersonalizados from '@/assets/products/chaveiros-personalizados.jpg';

const fontPresets = [
  'Georgia, "Times New Roman", serif',
  '"Trebuchet MS", "Segoe UI", sans-serif',
  '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  '"Gill Sans", "Trebuchet MS", sans-serif',
  '"Palatino Linotype", "Book Antiqua", Palatino, serif',
];

const cloneConfig = (config: WhyChooseUsConfig) => structuredClone(config);

const adminImageFallbacks: Record<string, string> = {
  '@/assets/hero/hero-neon.jpg': heroNeon,
  '@/assets/hero/hero-crachas.jpg': heroCrachas,
  '@/assets/hero/hero-qrcode.jpg': heroQrCode,
};

const galleryFallbacks = [heroNeon, heroCrachas, heroQrCode, bandejaAcrilico, brochesEspelhados, displayQrCode];
const testimonialFallbacks = [portaMaternidade, placaPortaEscritorio, chaveirosPersonalizados];
const showcaseFallbacks = [letreiro3dLed, heroNeon, heroCrachas];

const resolvePreviewImage = (value?: string | null, fallback?: string) => {
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

const ImageConfigRow = ({
  label,
  value,
  previewSrc,
  onChange,
  folder = 'why-choose-us',
  placeholder = 'Enviar imagem',
  aspectRatio = 'aspect-[4/3]',
  children,
}: ImageConfigRowProps) => (
  <div className="rounded-xl border p-4">
    <div className="grid gap-4 lg:grid-cols-[220px,1fr] lg:items-start">
      <div className="space-y-2">
        <Label>{label}</Label>
        <ImageUpload
          value={value}
          previewSrc={previewSrc}
          onChange={onChange}
          folder={folder}
          placeholder={placeholder}
          aspectRatio={aspectRatio}
          className="max-w-[220px]"
        />
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  </div>
);

const AdminWhyChooseUsPage = () => {
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();
  const [config, setConfig] = useState<WhyChooseUsConfig>(defaultWhyChooseUsConfig);

  useEffect(() => {
    if (!companyInfo) return;
    setConfig(mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo.why_choose_us_config));
  }, [companyInfo]);

  const updateTheme = (field: keyof WhyChooseUsConfig['theme'], value: string) => {
    setConfig((current) => ({ ...current, theme: { ...current.theme, [field]: value } }));
  };

  const updateHero = (field: keyof WhyChooseUsConfig['hero'], value: string) => {
    setConfig((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  };

  const updateSection = <T extends keyof WhyChooseUsConfig>(section: T, value: WhyChooseUsConfig[T]) => {
    setConfig((current) => ({ ...current, [section]: value }));
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
      toast.success('Página "Por que escolher" atualizada com sucesso');
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Controle total da página comercial</h2>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">
              Ajuste contraste, textos, fonte, tamanhos, links e imagens da página <code>/por-que-escolher</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/por-que-escolher" target="_blank" rel="noreferrer">
                Ver página
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={updateCompany.isPending}>
              {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Tema e contraste</CardTitle>
            <CardDescription>Defina cores de fundo, textos, botões e fontes com foco em leitura e impacto visual.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['pageBackground', 'Fundo principal'],
              ['sectionBackground', 'Fundo alternado'],
              ['darkSectionBackground', 'Fundo escuro'],
              ['cardBackground', 'Fundo dos cards'],
              ['cardBorder', 'Borda dos cards'],
              ['textPrimary', 'Texto principal'],
              ['textSecondary', 'Texto secundário'],
              ['textOnDark', 'Texto em fundo escuro'],
              ['textMutedOnDark', 'Texto secundário escuro'],
              ['accent', 'Cor de destaque'],
              ['accentSoft', 'Destaque suave'],
              ['buttonPrimaryBackground', 'Botão primário'],
              ['buttonPrimaryText', 'Texto botão primário'],
              ['buttonSecondaryBackground', 'Botão secundário'],
              ['buttonSecondaryText', 'Texto botão secundário'],
            ].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.theme[field as keyof WhyChooseUsConfig['theme']] as string}
                    onChange={(e) => updateTheme(field as keyof WhyChooseUsConfig['theme'], e.target.value)}
                    className="w-14 h-10 p-1"
                  />
                  <Input
                    value={config.theme[field as keyof WhyChooseUsConfig['theme']] as string}
                    onChange={(e) => updateTheme(field as keyof WhyChooseUsConfig['theme'], e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="space-y-2 xl:col-span-2">
              <Label>Fonte dos títulos</Label>
              <Input value={config.theme.headingFont} onChange={(e) => updateTheme('headingFont', e.target.value)} />
              <div className="flex flex-wrap gap-2">
                {fontPresets.map((font) => (
                  <Button key={font} type="button" variant="outline" size="sm" onClick={() => updateTheme('headingFont', font)}>
                    Aplicar preset
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label>Fonte do corpo</Label>
              <Input value={config.theme.bodyFont} onChange={(e) => updateTheme('bodyFont', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tamanho do título principal</Label>
              <Input value={config.theme.heroTitleSize} onChange={(e) => updateTheme('heroTitleSize', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tamanho dos títulos de seção</Label>
              <Input value={config.theme.sectionTitleSize} onChange={(e) => updateTheme('sectionTitleSize', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5" /> Hero e CTAs</CardTitle>
            <CardDescription>Controle principal da primeira dobra da página.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input value={config.hero.badge} onChange={(e) => updateHero('badge', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Título principal</Label>
                <Input value={config.hero.title} onChange={(e) => updateHero('title', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título destacado</Label>
                <Input value={config.hero.highlightedTitle} onChange={(e) => updateHero('highlightedTitle', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição principal</Label>
                <Textarea value={config.hero.description} onChange={(e) => updateHero('description', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição secundária</Label>
                <Textarea value={config.hero.secondaryDescription} onChange={(e) => updateHero('secondaryDescription', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Texto CTA principal</Label>
                <Input value={config.hero.primaryCtaLabel} onChange={(e) => updateHero('primaryCtaLabel', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Link CTA principal</Label>
                <Input value={config.hero.primaryCtaHref} onChange={(e) => updateHero('primaryCtaHref', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Texto CTA secundário</Label>
                <Input value={config.hero.secondaryCtaLabel} onChange={(e) => updateHero('secondaryCtaLabel', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Link CTA secundário</Label>
                <Input value={config.hero.secondaryCtaHref} onChange={(e) => updateHero('secondaryCtaHref', e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              {[
                ['imageMain', 'imageMainTitle', 'Imagem principal'],
                ['imageSecondary', 'imageSecondaryTitle', 'Imagem secundaria'],
                ['imageTertiary', 'imageTertiaryTitle', 'Imagem terciaria'],
              ].map(([imageField, titleField, label], index) => (
                <ImageConfigRow
                  key={imageField}
                  label={label}
                  value={config.hero[imageField as keyof WhyChooseUsConfig['hero']] as string}
                  previewSrc={resolvePreviewImage(
                    config.hero[imageField as keyof WhyChooseUsConfig['hero']] as string,
                    [heroNeon, heroQrCode, heroCrachas][index],
                  )}
                  onChange={(url) => updateHero(imageField as keyof WhyChooseUsConfig['hero'], url || '')}
                  folder="why-choose-us"
                  placeholder="Enviar imagem da hero"
                >
                  <Input
                    value={config.hero[titleField as keyof WhyChooseUsConfig['hero']] as string}
                    onChange={(e) => updateHero(titleField as keyof WhyChooseUsConfig['hero'], e.target.value)}
                    placeholder="Legenda da imagem"
                  />
                </ImageConfigRow>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores rápidos</CardTitle>
            <CardDescription>Números exibidos logo abaixo do hero.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {config.metrics.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <Label>Valor {index + 1}</Label>
                <Input
                  value={item.value}
                  onChange={(e) => {
                    const next = cloneConfig(config);
                    next.metrics[index].value = e.target.value;
                    setConfig(next);
                  }}
                />
                <Label>Texto {index + 1}</Label>
                <Textarea
                  value={item.label}
                  onChange={(e) => {
                    const next = cloneConfig(config);
                    next.metrics[index].label = e.target.value;
                    setConfig(next);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storytelling e tecnologia</CardTitle>
            <CardDescription>Seções que explicam o valor do sistema e da produção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow storytelling</Label>
                <Input
                  value={config.story.eyebrow}
                  onChange={(e) => updateSection('story', { ...config.story, eyebrow: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Título storytelling</Label>
                <Input
                  value={config.story.title}
                  onChange={(e) => updateSection('story', { ...config.story, title: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título destacado storytelling</Label>
                <Input
                  value={config.story.highlightedTitle}
                  onChange={(e) => updateSection('story', { ...config.story, highlightedTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {config.story.items.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Label>Título do card {index + 1}</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.story.items[index].title = e.target.value;
                      setConfig(next);
                    }}
                  />
                  <Label>Descrição do card {index + 1}</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.story.items[index].description = e.target.value;
                      setConfig(next);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow tecnologia</Label>
                <Input
                  value={config.technology.eyebrow}
                  onChange={(e) => updateSection('technology', { ...config.technology, eyebrow: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Título tecnologia</Label>
                <Input
                  value={config.technology.title}
                  onChange={(e) => updateSection('technology', { ...config.technology, title: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição tecnologia</Label>
                <Textarea
                  value={config.technology.description}
                  onChange={(e) => updateSection('technology', { ...config.technology, description: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {config.technology.items.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Label>Título da tecnologia {index + 1}</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.technology.items[index].title = e.target.value;
                      setConfig(next);
                    }}
                  />
                  <Label>Descrição</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.technology.items[index].description = e.target.value;
                      setConfig(next);
                    }}
                  />
                  <Label>Frase de destaque</Label>
                  <Input
                    value={item.highlight}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.technology.items[index].highlight = e.target.value;
                      setConfig(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Galeria e depoimentos</CardTitle>
            <CardDescription>Controle as imagens, títulos e textos das provas visuais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow galeria</Label>
                <Input value={config.gallery.eyebrow} onChange={(e) => updateSection('gallery', { ...config.gallery, eyebrow: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Título galeria</Label>
                <Input value={config.gallery.title} onChange={(e) => updateSection('gallery', { ...config.gallery, title: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título destacado galeria</Label>
                <Input value={config.gallery.highlightedTitle} onChange={(e) => updateSection('gallery', { ...config.gallery, highlightedTitle: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição galeria</Label>
                <Textarea value={config.gallery.description} onChange={(e) => updateSection('gallery', { ...config.gallery, description: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              {config.gallery.items.map((item, index) => (
                <ImageConfigRow
                  key={index}
                  label={`Imagem da galeria ${index + 1}`}
                  value={item.image}
                  previewSrc={resolvePreviewImage(item.image, galleryFallbacks[index])}
                  onChange={(url) => {
                    const next = cloneConfig(config);
                    next.gallery.items[index].image = url || '';
                    setConfig(next);
                  }}
                  folder="why-choose-us"
                >
                  <Input value={item.tag || ''} onChange={(e) => {
                    const next = cloneConfig(config);
                    next.gallery.items[index].tag = e.target.value;
                    setConfig(next);
                  }} placeholder="Tag" />
                  <Input value={item.title} onChange={(e) => {
                    const next = cloneConfig(config);
                    next.gallery.items[index].title = e.target.value;
                    setConfig(next);
                  }} placeholder="Titulo" />
                  <Textarea value={item.description} onChange={(e) => {
                    const next = cloneConfig(config);
                    next.gallery.items[index].description = e.target.value;
                    setConfig(next);
                  }} placeholder="Descricao" />
                </ImageConfigRow>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2"> 
              <div className="space-y-2">
                <Label>Eyebrow depoimentos</Label>
                <Input value={config.testimonials.eyebrow} onChange={(e) => updateSection('testimonials', { ...config.testimonials, eyebrow: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Título depoimentos</Label>
                <Input value={config.testimonials.title} onChange={(e) => updateSection('testimonials', { ...config.testimonials, title: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição depoimentos</Label>
                <Textarea value={config.testimonials.description} onChange={(e) => updateSection('testimonials', { ...config.testimonials, description: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              {config.testimonials.showcaseImages.map((image, index) => (
                <ImageConfigRow
                  key={`showcase-${index}`}
                  label={`Imagem de apoio ${index + 1}`}
                  value={image}
                  previewSrc={resolvePreviewImage(image, showcaseFallbacks[index])}
                  onChange={(url) => {
                    const next = cloneConfig(config);
                    next.testimonials.showcaseImages[index] = url || '';
                    setConfig(next);
                  }}
                  folder="why-choose-us"
                  placeholder="Imagem de vitrine"
                />
              ))}
            </div>

            <div className="space-y-4">
              {config.testimonials.items.map((item, index) => (
                <ImageConfigRow
                  key={index}
                  label={`Foto do depoimento ${index + 1}`}
                  value={item.image}
                  previewSrc={resolvePreviewImage(item.image, testimonialFallbacks[index])}
                  onChange={(url) => {
                    const next = cloneConfig(config);
                    next.testimonials.items[index].image = url || '';
                    setConfig(next);
                  }}
                  folder="why-choose-us"
                >
                  <Input
                    value={item.author}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.testimonials.items[index].author = e.target.value;
                      setConfig(next);
                    }}
                    placeholder="Autor"
                  />
                  <Input
                    value={item.subtitle}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.testimonials.items[index].subtitle = e.target.value;
                      setConfig(next);
                    }}
                    placeholder="Subtitulo"
                  />
                  <Textarea
                    value={item.quote}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.testimonials.items[index].quote = e.target.value;
                      setConfig(next);
                    }}
                    placeholder="Depoimento"
                  />
                </ImageConfigRow>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> CTA final</CardTitle>
            <CardDescription>Última dobra da página, usada para conversão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Eyebrow CTA final</Label>
                <Input value={config.finalCta.eyebrow} onChange={(e) => updateSection('finalCta', { ...config.finalCta, eyebrow: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Título CTA final</Label>
                <Input value={config.finalCta.title} onChange={(e) => updateSection('finalCta', { ...config.finalCta, title: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título destacado CTA final</Label>
                <Input value={config.finalCta.highlightedTitle} onChange={(e) => updateSection('finalCta', { ...config.finalCta, highlightedTitle: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição CTA final</Label>
                <Textarea value={config.finalCta.description} onChange={(e) => updateSection('finalCta', { ...config.finalCta, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Texto botão principal</Label>
                <Input value={config.finalCta.primaryCtaLabel} onChange={(e) => updateSection('finalCta', { ...config.finalCta, primaryCtaLabel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Link botão principal</Label>
                <Input value={config.finalCta.primaryCtaHref} onChange={(e) => updateSection('finalCta', { ...config.finalCta, primaryCtaHref: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Texto botão secundário</Label>
                <Input value={config.finalCta.secondaryCtaLabel} onChange={(e) => updateSection('finalCta', { ...config.finalCta, secondaryCtaLabel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Link botão secundário</Label>
                <Input value={config.finalCta.secondaryCtaHref} onChange={(e) => updateSection('finalCta', { ...config.finalCta, secondaryCtaHref: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {config.finalCta.bullets.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Label>Bullet {index + 1}</Label>
                  <Textarea
                    value={item.text}
                    onChange={(e) => {
                      const next = cloneConfig(config);
                      next.finalCta.bullets[index].text = e.target.value;
                      setConfig(next);
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWhyChooseUsPage;



