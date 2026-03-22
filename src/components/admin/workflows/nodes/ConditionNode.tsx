import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

function ConditionNode({ data, selected }: NodeProps) {
  const label = (data.condition_label as string) || 'Condição';
  return (
    <div className={`relative rounded-2xl border-2 border-violet-500/30 bg-violet-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-violet-500/20 shadow-sm">
          <GitBranch className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Condição</p>
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

export default memo(ConditionNode);
