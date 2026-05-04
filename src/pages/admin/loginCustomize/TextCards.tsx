import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Type, Image as ImageIcon, Ruler } from 'lucide-react';
import { LoginSettings, cardSurface, inputSurface } from './types';

type UpdateFn = <K extends keyof LoginSettings>(k: K, v: LoginSettings[K]) => void;

export function BrandTextCard({ settings, update }: { settings: LoginSettings; update: UpdateFn }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
          <Type className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Texto ao Lado da Logo</h3>
      </div>
      <p className="text-white/40 text-xs">Texto que aparece ao lado do logotipo. Deixe vazio para usar o nome da empresa.</p>
      <Input value={settings.login_brand_text || ''} onChange={(e) => update('login_brand_text', e.target.value || null)} className={inputSurface} placeholder="Ex: Minha Empresa" />
    </div>
  );
}

export function BackgroundCard({ settings, update }: { settings: LoginSettings; update: UpdateFn }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Imagem de Fundo</h3>
      </div>
      <p className="text-white/40 text-xs">A imagem que será exibida como plano de fundo da tela de login.</p>
      <ImageUpload value={settings.login_bg_image || ''} onChange={(url) => update('login_bg_image', url)} folder="login" />
      {settings.login_bg_image && (
        <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.05] aspect-video relative">
          <img src={settings.login_bg_image} alt="Background Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white/60 text-[10px] tracking-widest uppercase font-mono">Preview do Fundo</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TitleCard({ settings, update }: { settings: LoginSettings; update: UpdateFn }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
          <Type className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Título Principal</h3>
      </div>
      <Input value={settings.login_title || ''} onChange={(e) => update('login_title', e.target.value)} className={inputSurface} placeholder="Ex: Painel de Controle" />
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-white/50 text-xs flex items-center gap-1"><Ruler className="h-3 w-3" /> Tamanho do Título</Label>
          <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_title_size}px</span>
        </div>
        <Slider value={[settings.login_title_size]} onValueChange={([v]) => update('login_title_size', v)} min={24} max={72} step={2} className="w-full" />
      </div>
      <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/[0.05]">
        <p className="text-white font-extrabold leading-tight" style={{ fontSize: `${Math.min(settings.login_title_size, 40)}px` }}>
          {settings.login_title || 'Painel de Controle'}
        </p>
      </div>
    </div>
  );
}

export function SubtitleCard({ settings, update }: { settings: LoginSettings; update: UpdateFn }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Type className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Subtítulo / Descrição</h3>
      </div>
      <Textarea value={settings.login_subtitle || ''} onChange={(e) => update('login_subtitle', e.target.value)} className={`${inputSurface} min-h-[80px]`} placeholder="Ex: Acesse o centro de comando..." />
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-white/50 text-xs flex items-center gap-1"><Ruler className="h-3 w-3" /> Tamanho do Subtítulo</Label>
          <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_subtitle_size}px</span>
        </div>
        <Slider value={[settings.login_subtitle_size]} onValueChange={([v]) => update('login_subtitle_size', v)} min={10} max={24} step={1} className="w-full" />
      </div>
      <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/[0.05]">
        <p className="text-white/50 leading-relaxed" style={{ fontSize: `${settings.login_subtitle_size}px` }}>
          {settings.login_subtitle || 'Acesse o centro de comando do seu negócio.'}
        </p>
      </div>
    </div>
  );
}
