import { Monitor } from 'lucide-react';
import { LoginSettings, cardSurface } from './types';

export function LivePreview({ settings }: { settings: LoginSettings }) {
  return (
    <div className={cardSurface}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
          <Monitor className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-white font-semibold">Pré-visualização ao Vivo</h3>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-[16/7]">
        {settings.login_bg_image ? (
          <img src={settings.login_bg_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a12]" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12]/80 via-[#1a1408]/40 to-[#0a0a12]/80" />

        <div className="relative z-10 flex items-center justify-center h-full px-8 gap-12">
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

          <div className="w-[200px] h-[120px] rounded-xl border border-[#e8a817]/15 bg-white/[0.04] backdrop-blur-xl p-4 flex flex-col justify-center gap-2">
            <div className="w-full h-4 rounded bg-white/80" />
            <div className="w-full h-4 rounded bg-white/80" />
            <div className="w-full h-5 rounded bg-[#0f0f1a] mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
