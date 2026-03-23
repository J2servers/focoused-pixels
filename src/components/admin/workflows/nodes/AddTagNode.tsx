import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Tag } from 'lucide-react';

function AddTagNode({ data, selected }: NodeProps) {
  const tagName = (data.tag_name as string) || 'tag';
  const tagAction = (data.tag_action as string) || 'add';
  return (
    <div className={`relative rounded-2xl border-2 border-teal-500/30 bg-teal-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-teal-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-teal-500/20 shadow-sm">
          <Tag className="h-5 w-5 text-teal-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-400">{tagAction === 'remove' ? 'Remover' : 'Adicionar'} Tag</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{tagName}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(AddTagNode);
