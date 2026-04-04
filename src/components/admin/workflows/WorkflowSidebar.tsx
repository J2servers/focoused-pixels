import { memo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Zap, Search, Mail, MessageSquare, Clock, GitBranch,
  Settings2, SearchCheck, CalendarClock, Repeat, Gift,
  Activity as ActivityIcon, UserPlus, Copy, Trash2,
  CreditCard, RefreshCw, Heart, Truck, Loader2,
  ChevronRight, ShoppingCart, Package, Star,
} from 'lucide-react';
import {
  DRAGGABLE_NODES, TRIGGER_EVENTS, PRESET_CATEGORIES, PRESETS,
  type WorkflowMeta, type WorkflowExecution, type PresetDef,
  timeAgo,
} from '@/hooks/useWorkflows';

const NODE_ICONS: Record<string, React.ElementType> = {
  send_email: Mail, send_whatsapp: MessageSquare, delay: Clock,
  condition: GitBranch, check_status: SearchCheck, schedule: CalendarClock,
  loop: Repeat, update_order_status: Settings2, create_coupon: Gift,
  http_webhook: ActivityIcon, add_tag: UserPlus, wait_for_event: Zap,
};

const NODE_COLORS: Record<string, { text: string; bg: string }> = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  teal: { text: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
};

const CAT_ICONS: Record<string, React.ElementType> = {
  vendas: CreditCard, recuperacao: RefreshCw, pos_venda: Heart, leads: UserPlus, logistica: Truck,
};

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

const DIFF_COLORS: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Fácil', cls: 'bg-green-500/10 text-green-400 border-green-700' },
  medium: { label: 'Médio', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-700' },
  advanced: { label: 'Avançado', cls: 'bg-red-500/10 text-red-400 border-red-700' },
};

export type SidebarTab = 'nodes' | 'presets' | 'saved' | 'history';

interface Props {
  tab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onAddNode: (type: string) => void;
  onNewWorkflow: (triggerEvent: string) => void;
  onLoadPreset: (preset: PresetDef) => void;
  onLoadWorkflow: (wf: WorkflowMeta & { steps: any[] }) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onLoadExecutions: (workflowId?: string) => void;
  workflows: (WorkflowMeta & { steps: any[] })[];
  executions: WorkflowExecution[];
  currentWorkflowId?: string;
  loading: boolean;
  loadingExecs: boolean;
  metrics: { total: number; active: number; totalExecs: number };
}

function WorkflowSidebar({
  tab, onTabChange, onAddNode, onNewWorkflow, onLoadPreset,
  onLoadWorkflow, onDeleteWorkflow, onToggleActive, onLoadExecutions,
  workflows, executions, currentWorkflowId, loading, loadingExecs, metrics,
}: Props) {
  const [presetCategory, setPresetCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.category === presetCategory);
  const filteredWorkflows = searchQuery
    ? workflows.filter(wf => wf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : workflows;

  const tabs: { key: SidebarTab; label: string; icon: React.ElementType }[] = [
    { key: 'nodes', label: 'Nós', icon: Plus },
    { key: 'presets', label: 'Modelos', icon: Zap },
    { key: 'saved', label: 'Salvos', icon: Settings2 },
    { key: 'history', label: 'Logs', icon: ActivityIcon },
  ];

  return (
    <div className="w-72 shrink-0 border-r border-[hsl(var(--admin-card-border)/0.5)] flex flex-col bg-[hsl(var(--admin-bg)/0.5)]">
      {/* KPI Bar */}
      <div className="grid grid-cols-3 gap-px bg-[hsl(var(--admin-card-border)/0.2)] border-b border-[hsl(var(--admin-card-border)/0.3)]">
        {[
          { label: 'Total', value: metrics.total, color: 'text-white' },
          { label: 'Ativos', value: metrics.active, color: 'text-green-400' },
          { label: 'Execuções', value: metrics.totalExecs, color: 'text-[hsl(var(--admin-accent-purple))]' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[hsl(var(--admin-bg)/0.5)] px-3 py-2.5 text-center">
            <p className="text-[9px] font-medium uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">{kpi.label}</p>
            <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--admin-card-border)/0.5)]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { onTabChange(t.key); if (t.key === 'history') onLoadExecutions(currentWorkflowId); }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium transition-all ${
              tab === t.key
                ? 'bg-[hsl(var(--admin-accent-purple)/0.1)] text-white border-b-2 border-[hsl(var(--admin-accent-purple))]'
                : 'text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        {/* ─── Nodes Tab ─── */}
        {tab === 'nodes' && (
          <div className="p-3 space-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--admin-text-muted))] mb-2.5">Adicionar ao fluxo</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DRAGGABLE_NODES.map(dn => {
                  const Icon = NODE_ICONS[dn.type] || Zap;
                  const colors = NODE_COLORS[dn.colorKey] || NODE_COLORS.blue;
                  return (
                    <Tooltip key={dn.type}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onAddNode(dn.type)}
                          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer ${colors.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${colors.text}`} />
                          <span className="text-[9px] font-semibold">{dn.label}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p className="text-xs">{dn.description}</p></TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-[hsl(var(--admin-card-border)/0.3)] pt-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--admin-text-muted))] mb-2">Novo workflow por gatilho</p>
              <div className="space-y-0.5">
                {TRIGGER_EVENTS.map(te => {
                  const Icon = TRIGGER_ICONS[te.value] || Zap;
                  return (
                    <button
                      key={te.value}
                      onClick={() => onNewWorkflow(te.value)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors text-[hsl(var(--admin-text-muted))] hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{te.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Presets Tab ─── */}
        {tab === 'presets' && (
          <div className="p-3 space-y-2">
            <div className="space-y-0.5 mb-3">
              <button
                onClick={() => setPresetCategory('all')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${presetCategory === 'all' ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white' : 'text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
              >
                <Zap className="h-3.5 w-3.5" />Todos
                <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5">{PRESETS.length}</Badge>
              </button>
              {PRESET_CATEGORIES.map(cat => {
                const Icon = CAT_ICONS[cat.key] || Zap;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setPresetCategory(cat.key)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${presetCategory === cat.key ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white' : 'text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />{cat.label}
                  </button>
                );
              })}
            </div>

            {filteredPresets.map((p, i) => {
              const diff = DIFF_COLORS[p.difficulty];
              return (
                <button
                  key={i}
                  onClick={() => onLoadPreset(p)}
                  className="w-full text-left rounded-lg border border-[hsl(var(--admin-card-border)/0.5)] bg-[hsl(var(--admin-card))] p-3 hover:border-[hsl(var(--admin-accent-purple)/0.5)] transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                    <span className="text-xs font-medium text-white truncate">{p.name}</span>
                    <ChevronRight className="h-3 w-3 ml-auto text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-accent-purple))]" />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mb-2">{p.description}</p>
                  <div className="flex gap-1 items-center">
                    {p.steps.filter(s => s.type === 'send_whatsapp').length > 0 && (
                      <Badge className="text-[8px] h-4 bg-green-500/10 text-green-400 border-green-700">
                        <MessageSquare className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_whatsapp').length}
                      </Badge>
                    )}
                    {p.steps.filter(s => s.type === 'send_email').length > 0 && (
                      <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-400 border-blue-700">
                        <Mail className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_email').length}
                      </Badge>
                    )}
                    <Badge className={`text-[8px] h-4 ml-auto ${diff.cls}`}>{diff.label}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Saved Tab ─── */}
        {tab === 'saved' && (
          <div className="p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[hsl(var(--admin-text-muted))]" />
              <Input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar workflow..."
                className="h-8 pl-8 text-xs bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border)/0.5)]"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--admin-text-muted))]" /></div>
            ) : filteredWorkflows.length === 0 ? (
              <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-4">{searchQuery ? 'Nenhum resultado' : 'Nenhum workflow salvo'}</p>
            ) : filteredWorkflows.map(wf => (
              <div
                key={wf.id}
                className={`rounded-xl border p-3 transition-all ${currentWorkflowId === wf.id ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.08)]' : 'border-[hsl(var(--admin-card-border)/0.5)] hover:border-[hsl(var(--admin-accent-purple)/0.3)]'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate cursor-pointer" onClick={() => onLoadWorkflow(wf)}>{wf.name}</span>
                  <Switch checked={wf.is_active} onCheckedChange={v => onToggleActive(wf.id!, v)} />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[9px] h-4">
                    {TRIGGER_EVENTS.find(t => t.value === wf.trigger_event)?.label || wf.trigger_event}
                  </Badge>
                  {wf.is_active && <span className="flex items-center gap-1 text-[9px] text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Ativo</span>}
                </div>
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                  {wf.steps?.length || 0} passos • {wf.run_count || 0} exec.
                  {wf.last_run_at && ` • ${timeAgo(wf.last_run_at)}`}
                </p>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => onLoadWorkflow(wf)}>Editar</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => onLoadWorkflow({ ...wf, id: undefined, name: `${wf.name} (cópia)` })}><Copy className="h-3 w-3" /></Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => onDeleteWorkflow(wf.id!)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── History Tab ─── */}
        {tab === 'history' && (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--admin-text-muted))]">Execuções recentes</p>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => onLoadExecutions(currentWorkflowId)}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>

            {loadingExecs ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--admin-text-muted))]" /></div>
            ) : executions.length === 0 ? (
              <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-4">Nenhuma execução encontrada</p>
            ) : executions.map(exec => {
              const wfName = workflows.find(w => w.id === exec.workflow_id)?.name || 'Workflow';
              const statusMap: Record<string, { color: string; label: string }> = {
                pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-700', label: 'Pendente' },
                running: { color: 'bg-blue-500/10 text-blue-400 border-blue-700', label: 'Executando' },
                completed: { color: 'bg-green-500/10 text-green-400 border-green-700', label: 'Concluído' },
                failed: { color: 'bg-red-500/10 text-red-400 border-red-700', label: 'Falhou' },
                paused: { color: 'bg-gray-500/10 text-gray-400 border-gray-700', label: 'Pausado' },
              };
              const s = statusMap[exec.status] || statusMap.pending;
              return (
                <div key={exec.id} className="rounded-xl border border-[hsl(var(--admin-card-border)/0.5)] p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white truncate">{wfName}</span>
                    <Badge className={`text-[8px] h-4 ${s.color}`}>{s.label}</Badge>
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Passo {exec.current_step_index + 1} • {timeAgo(exec.started_at)}</p>
                  {exec.error_message && <p className="text-[10px] text-red-400 truncate">⚠ {exec.error_message}</p>}
                  {exec.step_results && (exec.step_results as any[]).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(exec.step_results as any[]).slice(-3).map((r: any, i: number) => (
                        <Badge key={i} variant="outline" className={`text-[8px] h-4 ${r.status === 'sent' || r.status === 'success' ? 'text-green-400' : r.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {r.channel || r.type}: {r.status}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default memo(WorkflowSidebar);
