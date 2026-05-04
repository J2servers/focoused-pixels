import { toast } from 'sonner';

export const API_BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/crm-webhook`;

export const cardCls = "liquid-glass";
export const inputCls = "liquid-input text-white";
export const mutedText = "text-white/50";
export const btnOutline = "border-white/10 bg-transparent text-white hover:bg-white/[0.06] transition-colors";

export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'pdl_';
  for (let i = 0; i < 40; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

export function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copiado!');
}
