import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail } from 'lucide-react';

function EmailNode({ data, selected }: NodeProps) {
  const templateName = (data.template_name as string) || 'Sem template';
  return (
    <div className={`relative rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-blue-500/20 shadow-sm">
          <Mail className="h-5 w-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">E-mail</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{templateName}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(EmailNode);
