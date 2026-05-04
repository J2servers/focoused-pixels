export interface LoginSettings {
  login_logo: string | null;
  login_bg_image: string | null;
  login_title: string | null;
  login_subtitle: string | null;
  login_logo_height: number;
  login_title_size: number;
  login_subtitle_size: number;
  login_brand_text: string | null;
}

export const DEFAULT_LOGIN_SETTINGS: LoginSettings = {
  login_logo: null,
  login_bg_image: null,
  login_title: 'Painel de Controle',
  login_subtitle: 'Acesse o centro de comando do seu negócio.',
  login_logo_height: 48,
  login_title_size: 48,
  login_subtitle_size: 14,
  login_brand_text: null,
};

export const cardSurface = "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 space-y-4";
export const inputSurface = "border-white/[0.08] bg-white/[0.04] text-white";
