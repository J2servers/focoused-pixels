import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, Save } from 'lucide-react';
import { LoginSettings, DEFAULT_LOGIN_SETTINGS } from './loginCustomize/types';
import { LogoCard } from './loginCustomize/LogoCard';
import { BrandTextCard, BackgroundCard, TitleCard, SubtitleCard } from './loginCustomize/TextCards';
import { LivePreview } from './loginCustomize/LivePreview';

const AdminLoginCustomizePage = () => {
  const [settings, setSettings] = useState<LoginSettings>(DEFAULT_LOGIN_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('company_info')
      .select('login_logo, login_bg_image, login_title, login_subtitle, login_logo_height, login_title_size, login_subtitle_size, login_brand_text')
      .limit(1)
      .single();
    if (data) {
      const d = data as Record<string, unknown>;
      setSettings({
        login_logo: (d.login_logo as string) || null,
        login_bg_image: (d.login_bg_image as string) || null,
        login_title: (d.login_title as string) || DEFAULT_LOGIN_SETTINGS.login_title,
        login_subtitle: (d.login_subtitle as string) || DEFAULT_LOGIN_SETTINGS.login_subtitle,
        login_logo_height: (d.login_logo_height as number) || DEFAULT_LOGIN_SETTINGS.login_logo_height,
        login_title_size: (d.login_title_size as number) || DEFAULT_LOGIN_SETTINGS.login_title_size,
        login_subtitle_size: (d.login_subtitle_size as number) || DEFAULT_LOGIN_SETTINGS.login_subtitle_size,
        login_brand_text: (d.login_brand_text as string) || null,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('company_info')
      .update(settings as unknown as Record<string, unknown>)
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) toast.error('Erro ao salvar.');
    else toast.success('✅ Configurações da tela de login salvas!');
    setIsSaving(false);
  };

  const update = <K extends keyof LoginSettings>(key: K, value: LoginSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  if (isLoading) {
    return (
      <AdminLayout title="Tela de Login">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#e8a817]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Personalizar Tela de Login">
      <div className="space-y-6 max-w-5xl">
        <AdminPageGuide
          title="🔐 Personalização da Tela de Login"
          description="Configure a aparência visual da página de acesso ao painel administrativo. Todas as alterações são refletidas em tempo real."
          steps={[
            { title: "Logo da marca", description: "Envie o logotipo e controle seu tamanho." },
            { title: "Imagem de fundo", description: "Defina a imagem de fundo da tela de login." },
            { title: "Textos", description: "Personalize título, subtítulo e seus tamanhos." },
            { title: "Pré-visualizar", description: "Clique em 'Pré-visualizar' para ver as mudanças." },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <LogoCard settings={settings} update={update} />
          <BrandTextCard settings={settings} update={update} />
          <BackgroundCard settings={settings} update={update} />
          <TitleCard settings={settings} update={update} />
          <SubtitleCard settings={settings} update={update} />
        </div>

        <LivePreview settings={settings} />

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving} className="admin-btn admin-btn-save">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Configurações
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/gateway-x7k9m2', '_blank')}
            className="border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06]"
          >
            <Eye className="h-4 w-4 mr-2" />
            Pré-visualizar Login
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLoginCustomizePage;
