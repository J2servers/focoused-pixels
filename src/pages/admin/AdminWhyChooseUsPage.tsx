import { useState, useEffect } from 'react';
import { AdminLayout, ImageUpload } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanyInfo, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, type WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { toast } from 'sonner';
import { Save, Loader2, Plus, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminWhyChooseUsPage = () => {
  const { data: company } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();
  const [config, setConfig] = useState<WhyChooseUsConfig>(defaultWhyChooseUsConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company?.why_choose_us_config) {
      setConfig({ ...defaultWhyChooseUsConfig, ...(company.why_choose_us_config as any) });
    }
  }, [company]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCompany.mutateAsync({ why_choose_us_config: config as any });
      toast.success('Página salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar');
    }
    setIsSaving(false);
  };

  const updateHero = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const updateTech = (index: number, key: string, value: string) => {
    setConfig(prev => {
      const items = [...prev.technologies.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, technologies: { ...prev.technologies, items } };
    });
  };

  const updateMetric = (index: number, key: string, value: string) => {
    setConfig(prev => {
      const items = [...prev.metrics.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, metrics: { ...prev.metrics, items } };
    });
  };

  const updateStep = (index: number, key: string, value: string) => {
    setConfig(prev => {
      const steps = [...prev.process.steps];
      steps[index] = { ...steps[index], [key]: value };
      return { ...prev, process: { ...prev.process, steps } };
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editor — Por que Escolher</h1>
            <p className="text-muted-foreground">Configure a landing page de conversão</p>
          </div>
          <div className="flex gap-2">
            <Link to="/por-que-escolher" target="_blank">
              <Button variant="outline"><Eye className="h-4 w-4 mr-2" />Preview</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero">
          <TabsList className="flex-wrap">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="tech">Tecnologias</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="process">Processo</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Seção Hero</CardTitle>
                  <Switch checked={config.hero.enabled} onCheckedChange={v => updateHero('enabled', v)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Headline</Label><Input value={config.hero.headline} onChange={e => updateHero('headline', e.target.value)} /></div>
                <div><Label>Subtítulo</Label><Textarea value={config.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Texto do CTA</Label><Input value={config.hero.ctaText} onChange={e => updateHero('ctaText', e.target.value)} /></div>
                  <div><Label>Link do CTA</Label><Input value={config.hero.ctaLink} onChange={e => updateHero('ctaLink', e.target.value)} /></div>
                </div>
                <div>
                  <Label>Imagem de Fundo</Label>
                  <ImageUpload value={config.hero.backgroundImage} onChange={v => updateHero('backgroundImage', v)} bucket="admin-uploads" folder="why-choose" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tech">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tecnologias</CardTitle>
                  <Switch checked={config.technologies.enabled} onCheckedChange={v => setConfig(p => ({ ...p, technologies: { ...p.technologies, enabled: v } }))} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {config.technologies.items.map((tech, i) => (
                  <div key={i} className="border rounded-xl p-4 space-y-3">
                    <div><Label>Título</Label><Input value={tech.title} onChange={e => updateTech(i, 'title', e.target.value)} /></div>
                    <div><Label>Descrição</Label><Textarea value={tech.description} onChange={e => updateTech(i, 'description', e.target.value)} /></div>
                    <div><Label>Imagem</Label><ImageUpload value={tech.image} onChange={v => updateTech(i, 'image', v)} bucket="admin-uploads" folder="why-choose" /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Métricas de Autoridade</CardTitle>
                  <Switch checked={config.metrics.enabled} onCheckedChange={v => setConfig(p => ({ ...p, metrics: { ...p.metrics, enabled: v } }))} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.metrics.items.map((m, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div><Label>Valor</Label><Input value={m.value} onChange={e => updateMetric(i, 'value', e.target.value)} /></div>
                    <div><Label>Label</Label><Input value={m.label} onChange={e => updateMetric(i, 'label', e.target.value)} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Processo de Compra</CardTitle>
                  <Switch checked={config.process.enabled} onCheckedChange={v => setConfig(p => ({ ...p, process: { ...p.process, enabled: v } }))} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Título da Seção</Label><Input value={config.process.title} onChange={e => setConfig(p => ({ ...p, process: { ...p.process, title: e.target.value } }))} /></div>
                {config.process.steps.map((step, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 border rounded-lg p-3">
                    <div><Label>Etapa {i + 1}</Label><Input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} /></div>
                    <div><Label>Descrição</Label><Input value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Galeria de Projetos</CardTitle>
                  <Switch checked={config.gallery.enabled} onCheckedChange={v => setConfig(p => ({ ...p, gallery: { ...p.gallery, enabled: v } }))} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Título</Label><Input value={config.gallery.title} onChange={e => setConfig(p => ({ ...p, gallery: { ...p.gallery, title: e.target.value } }))} /></div>
                <div className="grid grid-cols-3 gap-4">
                  {config.gallery.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="rounded-lg aspect-square object-cover w-full" />
                      <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => {
                        setConfig(p => ({ ...p, gallery: { ...p.gallery, images: p.gallery.images.filter((_, idx) => idx !== i) } }));
                      }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
                <ImageUpload value="" onChange={v => {
                  if (v) setConfig(p => ({ ...p, gallery: { ...p.gallery, images: [...p.gallery.images, v] } }));
                }} bucket="admin-uploads" folder="why-choose" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style">
            <Card>
              <CardHeader><CardTitle>Estilo Global</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Fonte da Página</Label>
                  <Input value={config.font} onChange={e => setConfig(p => ({ ...p, font: e.target.value }))} placeholder="Inter, Arial, etc" />
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
