import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Repeat } from 'lucide-react';

function LoopNode({ data, selected }: NodeProps) {
  const maxLoops = (data.max_loops as number) || 5;
  const label = (data.loop_label as string) || `Repetir até ${maxLoops}x`;

  return (
    <div className={`relative rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-amber-500/20 shadow-sm">
          <Repeat className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Loop</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="loop" style={{ left: '30%' }} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background" />
      <Handle type="source" position={Position.Bottom} id="exit" style={{ left: '70%' }} className="!w-3 !h-3 !bg-gray-500 !border-2 !border-background" />
      <div className="absolute -bottom-5 left-[30%] -translate-x-1/2 text-[9px] font-bold text-amber-400">REPETE</div>
      <div className="absolute -bottom-5 left-[70%] -translate-x-1/2 text-[9px] font-bold text-gray-400">FIM</div>
    </div>
  );
}

export default memo(LoopNode);
