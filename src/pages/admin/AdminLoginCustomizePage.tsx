import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, Shield, Image, Type, Save } from 'lucide-react';

interface LoginSettings {
  login_logo: string | null;
  login_bg_image: string | null;
  login_title: string | null;
  login_subtitle: string | null;
}

const AdminLoginCustomizePage = () => {
  const [settings, setSettings] = useState<LoginSettings>({
    login_logo: null,
    login_bg_image: null,
    login_title: 'Painel de Controle',
    login_subtitle: 'Acesse o centro de comando do seu negócio com segurança máxima.',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('company_info')
      .select('login_logo, login_bg_image, login_title, login_subtitle')
      .limit(1)
      .single();
    if (data) {
      setSettings({
        login_logo: (data as Record<string, unknown>).login_logo as string | null,
        login_bg_image: (data as Record<string, unknown>).login_bg_image as string | null,
        login_title: (data as Record<string, unknown>).login_title as string | null,
        login_subtitle: (data as Record<string, unknown>).login_subtitle as string | null,
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('company_info')
      .update({
        login_logo: settings.login_logo,
        login_bg_image: settings.login_bg_image,
        login_title: settings.login_title,
        login_subtitle: settings.login_subtitle,
      } as Record<string, unknown>)
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) toast.error('Erro ao salvar.');
    else toast.success('Configurações da tela de login salvas!');
    setIsSaving(false);
  };

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
      <div className="space-y-6 max-w-4xl">
        <AdminPageGuide
          title="🔐 Personalização da Tela de Login"
          description="Configure a aparência visual da página de acesso ao painel administrativo."
          steps={[
            { title: "Logo da marca", description: "Envie o logotipo que aparecerá na tela de login do admin." },
            { title: "Imagem de fundo", description: "Opcional: envie uma imagem que será exibida como fundo (o 3D continuará sendo a base)." },
            { title: "Título e subtítulo", description: "Personalize os textos de boas-vindas que aparecem ao lado do formulário." },
            { title: "Pré-visualizar", description: "Acesse a rota de login para ver as mudanças em tempo real." },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Logo */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Logo da Marca</h3>
            </div>
            <p className="text-white/40 text-xs">O logo que aparece na tela de login ao lado esquerdo e no card mobile.</p>
            <ImageUpload
              value={settings.login_logo || ''}
              onChange={(url) => setSettings({ ...settings, login_logo: url })}
              bucket="admin-uploads"
              folder="login"
            />
          </div>

          {/* BG Image */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Image className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Imagem de Fundo</h3>
            </div>
            <p className="text-white/40 text-xs">Opcional. Se definida, será sobreposta ao efeito 3D como background.</p>
            <ImageUpload
              value={settings.login_bg_image || ''}
              onChange={(url) => setSettings({ ...settings, login_bg_image: url })}
              bucket="admin-uploads"
              folder="login"
            />
          </div>

          {/* Title */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Type className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Título Principal</h3>
            </div>
            <Label className="text-white/40 text-xs">Texto grande exibido à esquerda do formulário.</Label>
            <Input
              value={settings.login_title || ''}
              onChange={(e) => setSettings({ ...settings, login_title: e.target.value })}
              className="border-white/[0.08] bg-white/[0.04] text-white"
              placeholder="Ex: Painel de Controle"
            />
          </div>

          {/* Subtitle */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Type className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Subtítulo / Descrição</h3>
            </div>
            <Label className="text-white/40 text-xs">Texto descritivo abaixo do título.</Label>
            <Textarea
              value={settings.login_subtitle || ''}
              onChange={(e) => setSettings({ ...settings, login_subtitle: e.target.value })}
              className="border-white/[0.08] bg-white/[0.04] text-white min-h-[80px]"
              placeholder="Ex: Acesse o centro de comando..."
            />
          </div>
        </div>

        {/* Preview & Save */}
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
