import {
  Mail, MessageSquare, Clock, GitBranch, Settings2, SearchCheck,
  CalendarClock, Repeat, Gift, Globe, UserPlus, Zap,
  CreditCard, RefreshCw, Heart, Truck, ShoppingCart, Package, Star,
} from 'lucide-react';

export const NODE_ICONS: Record<string, React.ElementType> = {
  send_email: Mail, send_whatsapp: MessageSquare, delay: Clock,
  condition: GitBranch, check_status: SearchCheck, schedule: CalendarClock,
  loop: Repeat, update_order_status: Settings2, create_coupon: Gift,
  http_webhook: Globe, add_tag: UserPlus, wait_for_event: Zap,
};

export const NODE_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    glow: 'hover:shadow-blue-500/10' },
  green:   { text: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20',   glow: 'hover:shadow-green-500/10' },
  orange:  { text: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',  glow: 'hover:shadow-orange-500/10' },
  violet:  { text: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20',  glow: 'hover:shadow-violet-500/10' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', glow: 'hover:shadow-emerald-500/10' },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',    glow: 'hover:shadow-cyan-500/10' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   glow: 'hover:shadow-amber-500/10' },
  indigo:  { text: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',  glow: 'hover:shadow-indigo-500/10' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    glow: 'hover:shadow-rose-500/10' },
  teal:    { text: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20',    glow: 'hover:shadow-teal-500/10' },
  sky:     { text: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20',     glow: 'hover:shadow-sky-500/10' },
};

export const CAT_ICONS: Record<string, React.ElementType> = {
  vendas: CreditCard, recuperacao: RefreshCw, pos_venda: Heart, leads: UserPlus, logistica: Truck,
};

export const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

export const DIFF_COLORS: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Fácil', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
  medium: { label: 'Médio', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  advanced: { label: 'Avançado', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export type SidebarTab = 'nodes' | 'presets' | 'saved' | 'history';
