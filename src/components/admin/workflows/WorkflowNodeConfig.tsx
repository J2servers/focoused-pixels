import { memo } from 'react';
import { type Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Trash2 } from 'lucide-react';
import type { TemplateLite, WorkflowMeta } from '@/hooks/useWorkflows';
import { NODE_TYPE_META } from './nodeConfig/primitives';
import { NodeBody } from './nodeConfig/NodeBody';

type NodeData = Record<string, unknown>;

interface Props {
  selectedNode: Node;
  currentWorkflow: WorkflowMeta;
  emailTemplates: TemplateLite[];
  whatsTemplates: TemplateLite[];
  onUpdate: (patch: NodeData) => void;
  onUpdateWorkflow: (patch: Partial<WorkflowMeta>) => void;
  onDelete: () => void;
  onClose: () => void;
}

function WorkflowNodeConfig({ selectedNode, emailTemplates, whatsTemplates, onUpdate, onUpdateWorkflow, onDelete, onClose }: Props) {
  const { type, data } = selectedNode;
  const meta = NODE_TYPE_META[type || ''] || NODE_TYPE_META.trigger;
  const Icon = meta.icon;

  return (
    <div className="w-[340px] shrink-0 border-l border-white/[0.06] flex flex-col bg-gradient-to-b from-[hsl(var(--admin-bg))] to-[hsl(var(--admin-bg)/0.95)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <Icon className={`h-4 w-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{meta.label}</h4>
          <p className="text-[10px] text-white/30 font-mono">{selectedNode.id.slice(0, 16)}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-white/30 hover:text-white shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          <NodeBody
            type={type || ''}
            data={data as NodeData}
            emailTemplates={emailTemplates}
            whatsTemplates={whatsTemplates}
            onUpdate={onUpdate}
            onUpdateWorkflow={onUpdateWorkflow}
          />

          {type !== 'trigger' && (
            <div className="pt-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
              <Button className="admin-btn admin-btn-delete w-full !min-h-0 h-9 gap-2 text-xs" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />Deletar
              </Button>
              <p className="text-[10px] text-white/25 mt-2 text-center">Nós adjacentes serão reconectados automaticamente.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default memo(WorkflowNodeConfig);
