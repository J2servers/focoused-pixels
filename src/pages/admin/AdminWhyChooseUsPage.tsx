import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanyInfoAdmin, useUpdateCompanyInfo } from '@/hooks/useCompanyInfo';
import { defaultWhyChooseUsConfig, mergeWhyChooseUsConfig, WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';
import { Loader2, Palette, Save, Type, Image as ImageIcon, Link2, Eye, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { ThemeTab } from './whyChooseUs/ThemeTab';
import { HeroTab } from './whyChooseUs/HeroTab';
import { ContentTab } from './whyChooseUs/ContentTab';
import { GalleryTab } from './whyChooseUs/GalleryTab';
import { CtaTab } from './whyChooseUs/CtaTab';
import { PreviewTab } from './whyChooseUs/PreviewTab';

const AdminWhyChooseUsPage = () => {
  const { data: companyInfo, isLoading } = useCompanyInfoAdmin();
  const updateCompany = useUpdateCompanyInfo();
  const [config, setConfig] = useState<WhyChooseUsConfig>(defaultWhyChooseUsConfig);

  useEffect(() => {
    if (!companyInfo) return;
    setConfig(mergeWhyChooseUsConfig(defaultWhyChooseUsConfig, companyInfo.why_choose_us_config));
  }, [companyInfo]);

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
            <p className="text-sm text-white/50">
              Cada alteração aqui reflete em tempo real na página <code className="text-purple-400">/por-que-escolher</code>
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="admin-btn admin-btn-view" asChild>
              <Link to="/por-que-escolher" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Ver ao vivo
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={updateCompany.isPending} className="admin-btn admin-btn-save">
              {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar alterações
            </Button>
          </div>
        </div>

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="admin-tabs-vivid flex flex-wrap gap-1">
            <TabsTrigger value="theme"><Palette className="h-4 w-4 mr-1.5" /> Tema</TabsTrigger>
            <TabsTrigger value="hero"><Type className="h-4 w-4 mr-1.5" /> Hero</TabsTrigger>
            <TabsTrigger value="content"><Sparkles className="h-4 w-4 mr-1.5" /> Conteúdo</TabsTrigger>
            <TabsTrigger value="gallery"><ImageIcon className="h-4 w-4 mr-1.5" /> Galeria</TabsTrigger>
            <TabsTrigger value="cta"><Link2 className="h-4 w-4 mr-1.5" /> CTA Final</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="h-4 w-4 mr-1.5" /> Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="theme"><ThemeTab config={config} setConfig={setConfig} /></TabsContent>
          <TabsContent value="hero"><HeroTab config={config} setConfig={setConfig} /></TabsContent>
          <TabsContent value="content"><ContentTab config={config} setConfig={setConfig} /></TabsContent>
          <TabsContent value="gallery"><GalleryTab config={config} setConfig={setConfig} /></TabsContent>
          <TabsContent value="cta"><CtaTab config={config} setConfig={setConfig} /></TabsContent>
          <TabsContent value="preview"><PreviewTab config={config} isSaving={updateCompany.isPending} onSave={handleSave} /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWhyChooseUsPage;
