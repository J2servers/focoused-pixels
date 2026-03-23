import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { SearchCheck } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  payment_confirmed: 'Pagamento confirmado?',
  boleto_expired: 'Boleto vencido?',
  order_shipped: 'Pedido enviado?',
  cart_recovered: 'Carrinho recuperado?',
};

function CheckStatusNode({ data, selected }: NodeProps) {
  const check = (data.check_type as string) || 'payment_confirmed';
  const label = STATUS_LABELS[check] || (data.condition_label as string) || check;

  return (
    <div className={`relative rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 px-5 py-4 min-w-[210px] shadow-lg transition-all ${selected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-emerald-500/20 shadow-sm">
          <SearchCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Verificar Status</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className="!w-3 !h-3 !bg-green-500 !border-2 !border-background" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%' }} className="!w-3 !h-3 !bg-red-500 !border-2 !border-background" />
      <div className="absolute -bottom-5 left-[30%] -translate-x-1/2 text-[9px] font-bold text-green-400">SIM</div>
      <div className="absolute -bottom-5 left-[70%] -translate-x-1/2 text-[9px] font-bold text-red-400">NÃO</div>
    </div>
  );
}

export default memo(CheckStatusNode);
