export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
export const AUTO_POPUP_DELAY = 60 * 1000;
export const TEASER_DURATION = 8 * 1000;
export const BUBBLE_VISIBLE_DURATION = 5 * 1000;
export const AUTO_POPUP_MESSAGE =
  "Olá! 👋 Sou a Luna, consultora aqui da loja. Posso te ajudar a achar o produto ideal? Temos letreiros neon, displays, crachás e muito mais! ✨";
export const REDIRECT_REGEX = /\[REDIRECT:(\/[^\]\s]+)\]/i;
