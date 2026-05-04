import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Settings2, Loader2, Copy, Trash2 } from 'lucide-react';
import { TRIGGER_EVENTS, timeAgo, type WorkflowMeta, type WorkflowStep } from '@/hooks/useWorkflows';

interface Props {
  workflows: (WorkflowMeta & { steps: WorkflowStep[] })[];
  currentWorkflowId?: string;
  loading: boolean;
  onLoadWorkflow: (wf: WorkflowMeta & { steps: WorkflowStep[] }) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function SavedTab({ workflows, currentWorkflowId, loading, onLoadWorkflow, onDeleteWorkflow, onToggleActive }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = searchQuery
    ? workflows.filter(wf => wf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : workflows;

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
        <Input
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar workflow..."
          className="h-9 pl-9 text-xs bg-white/[0.03] border-white/[0.06] focus:border-violet-500/30 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-white/20" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Settings2 className="h-8 w-8 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/30">{searchQuery ? 'Nenhum resultado' : 'Nenhum workflow salvo'}</p>
        </div>
      ) : filtered.map(wf => (
        <div
          key={wf.id}
          className={`rounded-xl border p-4 transition-all cursor-pointer ${
            currentWorkflowId === wf.id
              ? 'border-violet-500/40 bg-violet-500/[0.06] shadow-lg shadow-violet-500/5'
              : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.03]'
          }`}
          onClick={() => onLoadWorkflow(wf)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white truncate flex-1 mr-2">{wf.name}</span>
            <Switch
              checked={wf.is_active}
              onCheckedChange={v => { v !== wf.is_active && onToggleActive(wf.id!, v); }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <Badge variant="outline" className="text-[9px] h-[18px] border-white/[0.08] text-white/50">
              {TRIGGER_EVENTS.find(t => t.value === wf.trigger_event)?.label || wf.trigger_event}
            </Badge>
            {wf.is_active && (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Ativo
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/30">
              {wf.steps?.length || 0} passos • {wf.run_count || 0} exec.
              {wf.last_run_at && ` • ${timeAgo(wf.last_run_at)}`}
            </p>
            <div className="flex gap-0.5">
              <Button size="icon" variant="ghost" className="h-6 w-6 text-white/20 hover:text-white" onClick={e => { e.stopPropagation(); onLoadWorkflow({ ...wf, id: undefined, name: `${wf.name} (cópia)` }); }}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-white/20 hover:text-red-400" onClick={e => { e.stopPropagation(); onDeleteWorkflow(wf.id!); }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
