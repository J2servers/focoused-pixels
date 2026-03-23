import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Gift } from 'lucide-react';

function CreateCouponNode({ data, selected }: NodeProps) {
  const value = (data.coupon_value as number) || 10;
  const type = (data.coupon_type as string) || 'percentage';
  const label = type === 'percentage' ? `${value}% OFF` : `R$ ${value}`;
  return (
    <div className={`relative rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-amber-500/20 shadow-sm">
          <Gift className="h-5 w-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Criar Cupom</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(CreateCouponNode);
