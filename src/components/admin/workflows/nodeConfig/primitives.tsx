import {
  ShoppingCart, CreditCard, Zap, Package, Star, Truck, Mail, MessageSquare,
  Clock, GitBranch, SearchCheck, CalendarClock, Repeat, Settings2, Gift,
  Globe, UserPlus, Timer,
} from 'lucide-react';

export const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

export const NODE_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  trigger: { label: 'Gatilho', icon: Zap, color: 'text-violet-400' },
  send_email: { label: 'E-mail', icon: Mail, color: 'text-blue-400' },
  send_whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400' },
  delay: { label: 'Aguardar', icon: Clock, color: 'text-orange-400' },
  condition: { label: 'Condição', icon: GitBranch, color: 'text-violet-400' },
  check_status: { label: 'Verificar', icon: SearchCheck, color: 'text-emerald-400' },
  schedule: { label: 'Agendar', icon: CalendarClock, color: 'text-cyan-400' },
  loop: { label: 'Loop', icon: Repeat, color: 'text-amber-400' },
  update_order_status: { label: 'Atualizar Pedido', icon: Settings2, color: 'text-indigo-400' },
  create_coupon: { label: 'Criar Cupom', icon: Gift, color: 'text-amber-400' },
  http_webhook: { label: 'Webhook', icon: Globe, color: 'text-rose-400' },
  add_tag: { label: 'Tag Lead', icon: UserPlus, color: 'text-teal-400' },
  wait_for_event: { label: 'Aguardar Evento', icon: Timer, color: 'text-sky-400' },
};

export function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-white">{label}</label>
        {hint && <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-medium text-white/40 block mt-2 mb-1">{children}</label>;
}
