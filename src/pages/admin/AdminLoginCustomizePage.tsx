import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, Shield, Image, Type, Save, Ruler, Monitor } from 'lucide-react';

interface LoginSettings {
  login_logo: string | null;
  login_bg_image: string | null;
  login_title: string | null;
  login_subtitle: string | null;
  login_logo_height: number;
  login_title_size: number;
  login_subtitle_size: number;
  login_brand_text: string | null;
}

const AdminLoginCustomizePage = () => {
  const [settings, setSettings] = useState<LoginSettings>({
    login_logo: null,
    login_bg_image: null,
    login_title: 'Painel de Controle',
    login_subtitle: 'Acesse o centro de comando do seu negócio.',
    login_logo_height: 48,
    login_title_size: 48,
    login_subtitle_size: 14,
    login_brand_text: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

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
        login_title: (d.login_title as string) || 'Painel de Controle',
        login_subtitle: (d.login_subtitle as string) || 'Acesse o centro de comando do seu negócio.',
        login_logo_height: (d.login_logo_height as number) || 48,
        login_title_size: (d.login_title_size as number) || 48,
        login_subtitle_size: (d.login_subtitle_size as number) || 14,
        login_brand_text: (d.login_brand_text as string) || null,
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
        login_logo_height: settings.login_logo_height,
        login_title_size: settings.login_title_size,
        login_subtitle_size: settings.login_subtitle_size,
        login_brand_text: settings.login_brand_text,
      } as Record<string, unknown>)
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) toast.error('Erro ao salvar.');
    else toast.success('✅ Configurações da tela de login salvas!');
    setIsSaving(false);
  };

  const update = (key: keyof LoginSettings, value: unknown) =>
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
          {/* Logo */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Logo da Marca</h3>
            </div>
            <p className="text-white/40 text-xs">O logo que aparece na tela de login.</p>
            <ImageUpload
              value={settings.login_logo || ''}
              onChange={(url) => update('login_logo', url)}
              folder="login"
            />

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Altura da Logo
                </Label>
                <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_logo_height}px</span>
              </div>
              <Slider
                value={[settings.login_logo_height]}
                onValueChange={([v]) => update('login_logo_height', v)}
                min={24}
                max={120}
                step={4}
                className="w-full"
              />
            </div>

            {/* Preview da logo */}
            {settings.login_logo && (
              <div className="mt-3 p-4 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-center">
                <img
                  src={settings.login_logo}
                  alt="Preview"
                  style={{ height: `${settings.login_logo_height}px` }}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* BG Image */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Image className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Imagem de Fundo</h3>
            </div>
            <p className="text-white/40 text-xs">A imagem que será exibida como plano de fundo da tela de login.</p>
            <ImageUpload
              value={settings.login_bg_image || ''}
              onChange={(url) => update('login_bg_image', url)}
              folder="login"
            />

            {/* Preview do background */}
            {settings.login_bg_image && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.05] aspect-video relative">
                <img
                  src={settings.login_bg_image}
                  alt="Background Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white/60 text-[10px] tracking-widest uppercase font-mono">Preview do Fundo</span>
                </div>
              </div>
            )}
          </div>

          {/* Título */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Type className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Título Principal</h3>
            </div>
            <Input
              value={settings.login_title || ''}
              onChange={(e) => update('login_title', e.target.value)}
              className="border-white/[0.08] bg-white/[0.04] text-white"
              placeholder="Ex: Painel de Controle"
            />

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Tamanho do Título
                </Label>
                <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_title_size}px</span>
              </div>
              <Slider
                value={[settings.login_title_size]}
                onValueChange={([v]) => update('login_title_size', v)}
                min={24}
                max={72}
                step={2}
                className="w-full"
              />
            </div>

            {/* Preview do título */}
            <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/[0.05]">
              <p className="text-white font-extrabold leading-tight" style={{ fontSize: `${Math.min(settings.login_title_size, 40)}px` }}>
                {settings.login_title || 'Painel de Controle'}
              </p>
            </div>
          </div>

          {/* Subtítulo */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Type className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Subtítulo / Descrição</h3>
            </div>
            <Textarea
              value={settings.login_subtitle || ''}
              onChange={(e) => update('login_subtitle', e.target.value)}
              className="border-white/[0.08] bg-white/[0.04] text-white min-h-[80px]"
              placeholder="Ex: Acesse o centro de comando..."
            />

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-white/50 text-xs flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Tamanho do Subtítulo
                </Label>
                <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_subtitle_size}px</span>
              </div>
              <Slider
                value={[settings.login_subtitle_size]}
                onValueChange={([v]) => update('login_subtitle_size', v)}
                min={10}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            {/* Preview do subtítulo */}
            <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/[0.05]">
              <p className="text-white/50 leading-relaxed" style={{ fontSize: `${settings.login_subtitle_size}px` }}>
                {settings.login_subtitle || 'Acesse o centro de comando do seu negócio.'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
              <Monitor className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-white font-semibold">Pré-visualização ao Vivo</h3>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-[16/7]">
            {/* BG */}
            {settings.login_bg_image ? (
              <img src={settings.login_bg_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#0a0a12]" />
            )}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12]/80 via-[#1a1408]/40 to-[#0a0a12]/80" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full px-8 gap-12">
              {/* Left */}
              <div className="flex flex-col max-w-[40%]">
                <div className="flex items-center gap-2 mb-3">
                  {settings.login_logo ? (
                    <img src={settings.login_logo} alt="" style={{ height: `${Math.min(settings.login_logo_height * 0.6, 40)}px` }} className="object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#e8a817] to-[#c8951a]" />
                  )}
                </div>
                <p className="text-white font-extrabold leading-tight" style={{ fontSize: `${Math.min(settings.login_title_size * 0.45, 24)}px` }}>
                  {settings.login_title || 'Painel de Controle'}
                </p>
                <p className="text-white/50 mt-1" style={{ fontSize: `${Math.min(settings.login_subtitle_size * 0.7, 11)}px` }}>
                  {settings.login_subtitle || 'Acesse o centro de comando.'}
                </p>
              </div>

              {/* Right - fake card */}
              <div className="w-[200px] h-[120px] rounded-xl border border-[#e8a817]/15 bg-white/[0.04] backdrop-blur-xl p-4 flex flex-col justify-center gap-2">
                <div className="w-full h-4 rounded bg-white/80" />
                <div className="w-full h-4 rounded bg-white/80" />
                <div className="w-full h-5 rounded bg-[#0f0f1a] mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
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
