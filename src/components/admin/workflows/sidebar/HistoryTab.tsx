import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, Activity as ActivityIcon } from 'lucide-react';
import { timeAgo, type WorkflowMeta, type WorkflowExecution } from '@/hooks/useWorkflows';

interface Props {
  executions: WorkflowExecution[];
  workflows: (WorkflowMeta & { steps: any[] })[];
  loading: boolean;
  currentWorkflowId?: string;
  onReload: (workflowId?: string) => void;
}

const STATUS_MAP: Record<string, { color: string; dotColor: string; label: string }> = {
  pending:   { color: 'bg-yellow-500/8 border-yellow-500/20', dotColor: 'bg-yellow-400', label: 'Pendente' },
  running:   { color: 'bg-blue-500/8 border-blue-500/20',   dotColor: 'bg-blue-400',   label: 'Executando' },
  completed: { color: 'bg-emerald-500/8 border-emerald-500/20', dotColor: 'bg-emerald-400', label: 'Concluído' },
  failed:    { color: 'bg-red-500/8 border-red-500/20',     dotColor: 'bg-red-400',     label: 'Falhou' },
  paused:    { color: 'bg-gray-500/8 border-gray-500/20',   dotColor: 'bg-gray-400',   label: 'Pausado' },
};

export function HistoryTab({ executions, workflows, loading, currentWorkflowId, onReload }: Props) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Execuções recentes</h4>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-white/30 hover:text-white" onClick={() => onReload(currentWorkflowId)}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-white/20" /></div>
      ) : executions.length === 0 ? (
        <div className="text-center py-12">
          <ActivityIcon className="h-8 w-8 text-white/10 mx-auto mb-3" />
          <p className="text-xs text-white/30">Nenhuma execução encontrada</p>
        </div>
      ) : executions.map(exec => {
        const wfName = workflows.find(w => w.id === exec.workflow_id)?.name || 'Workflow';
        const s = STATUS_MAP[exec.status] || STATUS_MAP.pending;
        return (
          <div key={exec.id} className={`rounded-xl border p-3.5 space-y-2 ${s.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white truncate">{wfName}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/60">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor} ${exec.status === 'running' ? 'animate-pulse' : ''}`} />
                {s.label}
              </span>
            </div>
            <p className="text-[10px] text-white/30">Passo {exec.current_step_index + 1} • {timeAgo(exec.started_at)}</p>
            {exec.error_message && <p className="text-[10px] text-red-400 truncate">⚠ {exec.error_message}</p>}
            {exec.step_results && (exec.step_results as any[]).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(exec.step_results as any[]).slice(-3).map((r: any, i: number) => (
                  <Badge key={i} variant="outline" className={`text-[8px] h-[18px] ${r.status === 'sent' || r.status === 'success' ? 'text-emerald-400 border-emerald-500/20' : r.status === 'failed' ? 'text-red-400 border-red-500/20' : 'text-yellow-400 border-yellow-500/20'}`}>
                    {r.channel || r.type}: {r.status}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
