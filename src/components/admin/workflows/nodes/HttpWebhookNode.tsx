import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';

function HttpWebhookNode({ data, selected }: NodeProps) {
  const method = (data.webhook_method as string) || 'POST';
  const url = (data.webhook_url as string) || 'https://...';
  const shortUrl = url.length > 25 ? url.slice(0, 25) + '...' : url;
  return (
    <div className={`relative rounded-2xl border-2 border-rose-500/30 bg-rose-500/10 px-5 py-4 min-w-[200px] shadow-lg transition-all ${selected ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-rose-500/20 shadow-sm">
          <Globe className="h-5 w-5 text-rose-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Webhook {method}</p>
          <p className="text-[11px] font-medium truncate max-w-[140px] text-[hsl(var(--admin-text-muted))]">{shortUrl}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(HttpWebhookNode);
