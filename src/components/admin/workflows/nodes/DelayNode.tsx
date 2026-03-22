import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

const unitLabel = (u: string, v: number) => {
  const map: Record<string, [string, string]> = { minutes: ['min', 'min'], hours: ['hora', 'horas'], days: ['dia', 'dias'] };
  return v === 1 ? (map[u]?.[0] || u) : (map[u]?.[1] || u);
};

function DelayNode({ data, selected }: NodeProps) {
  const value = (data.delay_value as number) || 30;
  const unit = (data.delay_unit as string) || 'minutes';

  return (
    <div className={`relative rounded-2xl border-2 border-orange-500/30 bg-orange-500/10 px-5 py-4 min-w-[180px] shadow-lg transition-all ${selected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-orange-500/20 shadow-sm">
          <Clock className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Aguardar</p>
          <p className="text-sm font-semibold">{value} {unitLabel(unit, value)}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(DelayNode);
