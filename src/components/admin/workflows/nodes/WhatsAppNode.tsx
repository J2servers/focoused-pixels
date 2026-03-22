import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

function WhatsAppNode({ data, selected }: NodeProps) {
  const templateName = (data.template_name as string) || 'Sem template';
  return (
    <div className={`relative rounded-2xl border-2 border-green-500/30 bg-green-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-green-500/20 shadow-sm">
          <MessageSquare className="h-5 w-5 text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">WhatsApp</p>
          <p className="text-sm font-medium truncate max-w-[140px]">{templateName}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-green-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(WhatsAppNode);
