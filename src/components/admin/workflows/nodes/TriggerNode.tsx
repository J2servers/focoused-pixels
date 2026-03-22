import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ShoppingCart, CreditCard, Zap, Package, Star, Truck } from 'lucide-react';

const TRIGGER_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  abandoned_cart: { icon: ShoppingCart, color: 'text-orange-400', bg: 'border-orange-500/30 bg-orange-500/10' },
  order_created: { icon: Package, color: 'text-blue-400', bg: 'border-blue-500/30 bg-blue-500/10' },
  payment_confirmed: { icon: CreditCard, color: 'text-green-400', bg: 'border-green-500/30 bg-green-500/10' },
  boleto_generated: { icon: CreditCard, color: 'text-yellow-400', bg: 'border-yellow-500/30 bg-yellow-500/10' },
  pix_generated: { icon: Zap, color: 'text-purple-400', bg: 'border-purple-500/30 bg-purple-500/10' },
  post_delivery: { icon: Star, color: 'text-pink-400', bg: 'border-pink-500/30 bg-pink-500/10' },
  shipping_sent: { icon: Truck, color: 'text-cyan-400', bg: 'border-cyan-500/30 bg-cyan-500/10' },
};

const TRIGGER_LABELS: Record<string, string> = {
  abandoned_cart: 'Carrinho abandonado',
  order_created: 'Pedido criado',
  payment_confirmed: 'Pagamento confirmado',
  boleto_generated: 'Boleto gerado',
  pix_generated: 'PIX gerado',
  post_delivery: 'Pós-entrega',
  shipping_sent: 'Envio despachado',
};

function TriggerNode({ data, selected }: NodeProps) {
  const event = (data.trigger_event as string) || 'abandoned_cart';
  const info = TRIGGER_ICONS[event] || TRIGGER_ICONS.abandoned_cart;
  const Icon = info.icon;

  return (
    <div className={`relative rounded-2xl border-2 px-5 py-4 min-w-[200px] shadow-lg transition-all ${info.bg} ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 bg-background/80 shadow-sm`}>
          <Icon className={`h-5 w-5 ${info.color}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gatilho</p>
          <p className="text-sm font-semibold">{TRIGGER_LABELS[event] || event}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background" />
    </div>
  );
}

export default memo(TriggerNode);
