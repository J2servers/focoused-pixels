import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Hourglass } from 'lucide-react';

const EVENT_LABELS: Record<string, string> = {
  payment_confirmed: 'Pagamento confirmado',
  order_shipped: 'Pedido enviado',
  cart_recovered: 'Carrinho recuperado',
  boleto_expired: 'Boleto vencido',
};

function WaitForEventNode({ data, selected }: NodeProps) {
  const event = (data.wait_event as string) || 'payment_confirmed';
  const timeout = (data.wait_timeout_minutes as number) || 1440;
  const timeoutLabel = timeout >= 1440 ? `${Math.round(timeout / 1440)}d` : timeout >= 60 ? `${Math.round(timeout / 60)}h` : `${timeout}min`;
  return (
    <div className={`relative rounded-2xl border-2 border-sky-500/30 bg-sky-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-sky-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-sky-500/20 shadow-sm">
          <Hourglass className="h-5 w-5 text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Aguardar Evento</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{EVENT_LABELS[event] || event}</p>
          <p className="text-[9px] text-[hsl(var(--admin-text-muted))]">Timeout: {timeoutLabel}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-sky-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(WaitForEventNode);
