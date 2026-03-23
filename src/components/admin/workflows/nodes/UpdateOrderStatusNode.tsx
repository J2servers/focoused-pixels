import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ClipboardEdit } from 'lucide-react';

function UpdateOrderStatusNode({ data, selected }: NodeProps) {
  const status = (data.new_order_status as string) || 'processing';
  const labels: Record<string, string> = {
    pending: 'Pendente', processing: 'Em produção', shipped: 'Enviado',
    delivered: 'Entregue', cancelled: 'Cancelado',
  };
  return (
    <div className={`relative rounded-2xl border-2 border-indigo-500/30 bg-indigo-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-indigo-500/20 shadow-sm">
          <ClipboardEdit className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Atualizar Pedido</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{labels[status] || status}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(UpdateOrderStatusNode);
