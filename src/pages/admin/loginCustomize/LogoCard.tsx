import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Shield, Ruler } from 'lucide-react';
import { LoginSettings, cardSurface } from './types';

export function LogoCard({ settings, update }: { settings: LoginSettings; update: <K extends keyof LoginSettings>(k: K, v: LoginSettings[K]) => void }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Logo da Marca</h3>
      </div>
      <p className="text-white/40 text-xs">O logo que aparece na tela de login.</p>
      <ImageUpload value={settings.login_logo || ''} onChange={(url) => update('login_logo', url)} folder="login" />
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <Label className="text-white/50 text-xs flex items-center gap-1"><Ruler className="h-3 w-3" /> Altura da Logo</Label>
          <span className="text-[#e8a817] font-mono text-xs font-bold">{settings.login_logo_height}px</span>
        </div>
        <Slider value={[settings.login_logo_height]} onValueChange={([v]) => update('login_logo_height', v)} min={24} max={120} step={4} className="w-full" />
      </div>
      {settings.login_logo && (
        <div className="mt-3 p-4 rounded-xl bg-black/30 border border-white/[0.05] flex items-center justify-center">
          <img src={settings.login_logo} alt="Preview" style={{ height: `${settings.login_logo_height}px` }} className="object-contain" />
        </div>
      )}
    </div>
  );
}
