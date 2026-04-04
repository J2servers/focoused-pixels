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
  ChevronRight, ShoppingCart, Package, Star, Globe,
  LayoutGrid, List, Filter,
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
  http_webhook: Globe, add_tag: UserPlus, wait_for_event: Zap,
};

const NODE_COLORS: Record<string, { text: string; bg: string; glow: string }> = {
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    glow: 'hover:shadow-blue-500/10' },
  green:   { text: 'text-green-400',   bg: 'bg-green-500/10 border-green-500/20',   glow: 'hover:shadow-green-500/10' },
  orange:  { text: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20',  glow: 'hover:shadow-orange-500/10' },
  violet:  { text: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20',  glow: 'hover:shadow-violet-500/10' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', glow: 'hover:shadow-emerald-500/10' },
  cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',    glow: 'hover:shadow-cyan-500/10' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   glow: 'hover:shadow-amber-500/10' },
  indigo:  { text: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',  glow: 'hover:shadow-indigo-500/10' },
  rose:    { text: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    glow: 'hover:shadow-rose-500/10' },
  teal:    { text: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20',    glow: 'hover:shadow-teal-500/10' },
  sky:     { text: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20',     glow: 'hover:shadow-sky-500/10' },
};

const CAT_ICONS: Record<string, React.ElementType> = {
  vendas: CreditCard, recuperacao: RefreshCw, pos_venda: Heart, leads: UserPlus, logistica: Truck,
};

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

const DIFF_COLORS: Record<string, { label: string; cls: string }> = {
  easy: { label: 'Fácil', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
  medium: { label: 'Médio', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  advanced: { label: 'Avançado', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
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
  const [nodeView, setNodeView] = useState<'grid' | 'list'>('grid');

  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.category === presetCategory);
  const filteredWorkflows = searchQuery
    ? workflows.filter(wf => wf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : workflows;

  const tabs: { key: SidebarTab; label: string; icon: React.ElementType }[] = [
    { key: 'nodes', label: 'Blocos', icon: Plus },
    { key: 'presets', label: 'Modelos', icon: Zap },
    { key: 'saved', label: 'Salvos', icon: Settings2 },
    { key: 'history', label: 'Logs', icon: ActivityIcon },
  ];

  return (
    <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col bg-gradient-to-b from-[hsl(var(--admin-bg))] to-[hsl(var(--admin-bg)/0.95)]">
      {/* ── KPI Strip ── */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: metrics.total, icon: LayoutGrid, color: 'text-white', accent: 'from-white/5 to-white/[0.02]' },
            { label: 'Ativos', value: metrics.active, icon: Zap, color: 'text-emerald-400', accent: 'from-emerald-500/10 to-emerald-500/[0.02]' },
            { label: 'Execuções', value: metrics.totalExecs, icon: ActivityIcon, color: 'text-violet-400', accent: 'from-violet-500/10 to-violet-500/[0.02]' },
          ].map(kpi => (
            <div key={kpi.label} className={`relative rounded-xl bg-gradient-to-b ${kpi.accent} border border-white/[0.06] px-3 py-3 text-center overflow-hidden`}>
              <kpi.icon className={`absolute -right-1 -top-1 h-8 w-8 ${kpi.color} opacity-[0.06]`} />
              <p className={`text-xl font-bold ${kpi.color} tabular-nums`}>{kpi.value}</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/40 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex border-b border-white/[0.06]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { onTabChange(t.key); if (t.key === 'history') onLoadExecutions(currentWorkflowId); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-all relative ${
              tab === t.key
                ? 'text-white'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
            {tab === t.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        {/* ─── Nodes Tab ─── */}
        {tab === 'nodes' && (
          <div className="p-4 space-y-5">
            {/* Section: Add to Flow */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Adicionar ao fluxo</h4>
                <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
                  <button onClick={() => setNodeView('grid')} className={`p-1 rounded-md transition-all ${nodeView === 'grid' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
                    <LayoutGrid className="h-3 w-3" />
                  </button>
                  <button onClick={() => setNodeView('list')} className={`p-1 rounded-md transition-all ${nodeView === 'list' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
                    <List className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {nodeView === 'grid' ? (
                <div className="grid grid-cols-3 gap-2">
                  {DRAGGABLE_NODES.map(dn => {
                    const Icon = NODE_ICONS[dn.type] || Zap;
                    const colors = NODE_COLORS[dn.colorKey] || NODE_COLORS.blue;
                    return (
                      <Tooltip key={dn.type}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onAddNode(dn.type)}
                            className={`group flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-[1.04] active:scale-95 cursor-pointer hover:shadow-lg ${colors.bg} ${colors.glow}`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                              <Icon className={`h-4 w-4 ${colors.text}`} />
                            </div>
                            <span className="text-[9px] font-semibold text-white/70 group-hover:text-white transition-colors">{dn.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs max-w-[200px]">{dn.description}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  {DRAGGABLE_NODES.map(dn => {
                    const Icon = NODE_ICONS[dn.type] || Zap;
                    const colors = NODE_COLORS[dn.colorKey] || NODE_COLORS.blue;
                    return (
                      <button
                        key={dn.type}
                        onClick={() => onAddNode(dn.type)}
                        className="w-full flex items-center gap-3 rounded-lg border border-transparent hover:border-white/[0.06] px-3 py-2 transition-all hover:bg-white/[0.03] group"
                      >
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${colors.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-medium text-white/80 group-hover:text-white truncate">{dn.label}</p>
                          <p className="text-[10px] text-white/30 truncate">{dn.description}</p>
                        </div>
                        <Plus className="h-3 w-3 text-white/20 group-hover:text-white/50 ml-auto shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Quick Create by Trigger */}
            <div className="pt-1">
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Criar por gatilho</h4>
              <div className="space-y-0.5">
                {TRIGGER_EVENTS.map(te => {
                  const Icon = TRIGGER_ICONS[te.value] || Zap;
                  return (
                    <button
                      key={te.value}
                      onClick={() => onNewWorkflow(te.value)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-white/[0.04] transition-all text-white/50 hover:text-white group"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{te.label}</span>
                      <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── Presets Tab ─── */}
        {tab === 'presets' && (
          <div className="p-4 space-y-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5 mb-1">
              <button
                onClick={() => setPresetCategory('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${presetCategory === 'all' ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-transparent text-white/40 border-white/[0.06] hover:text-white/60'}`}
              >
                Todos ({PRESETS.length})
              </button>
              {PRESET_CATEGORIES.map(cat => {
                const Icon = CAT_ICONS[cat.key] || Zap;
                const count = PRESETS.filter(p => p.category === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setPresetCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${presetCategory === cat.key ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-transparent text-white/40 border-white/[0.06] hover:text-white/60'}`}
                  >
                    <Icon className="h-3 w-3" />{cat.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Preset Cards */}
            {filteredPresets.map((p, i) => {
              const diff = DIFF_COLORS[p.difficulty];
              const whatsCount = p.steps.filter(s => s.type === 'send_whatsapp').length;
              const emailCount = p.steps.filter(s => s.type === 'send_email').length;
              return (
                <button
                  key={i}
                  onClick={() => onLoadPreset(p)}
                  className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Zap className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white truncate">{p.name}</span>
                        <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-violet-400 ml-auto shrink-0 transition-colors" />
                      </div>
                      <p className="text-[10px] text-white/40 mb-2.5 line-clamp-2">{p.description}</p>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {whatsCount > 0 && (
                          <Badge className="text-[8px] h-[18px] bg-green-500/10 text-green-400 border-green-500/20 gap-0.5">
                            <MessageSquare className="h-2.5 w-2.5" />{whatsCount}
                          </Badge>
                        )}
                        {emailCount > 0 && (
                          <Badge className="text-[8px] h-[18px] bg-blue-500/10 text-blue-400 border-blue-500/20 gap-0.5">
                            <Mail className="h-2.5 w-2.5" />{emailCount}
                          </Badge>
                        )}
                        <Badge className="text-[8px] h-[18px] bg-white/5 text-white/40 border-white/[0.06]">
                          {p.steps.length} passos
                        </Badge>
                        <Badge className={`text-[8px] h-[18px] ml-auto ${diff.cls}`}>{diff.label}</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Saved Tab ─── */}
        {tab === 'saved' && (
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
            ) : filteredWorkflows.length === 0 ? (
              <div className="text-center py-12">
                <Settings2 className="h-8 w-8 text-white/10 mx-auto mb-3" />
                <p className="text-xs text-white/30">{searchQuery ? 'Nenhum resultado' : 'Nenhum workflow salvo'}</p>
              </div>
            ) : filteredWorkflows.map(wf => (
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
        )}

        {/* ─── History Tab ─── */}
        {tab === 'history' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Execuções recentes</h4>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-white/30 hover:text-white" onClick={() => onLoadExecutions(currentWorkflowId)}>
                <RefreshCw className={`h-3.5 w-3.5 ${loadingExecs ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingExecs ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-white/20" /></div>
            ) : executions.length === 0 ? (
              <div className="text-center py-12">
                <ActivityIcon className="h-8 w-8 text-white/10 mx-auto mb-3" />
                <p className="text-xs text-white/30">Nenhuma execução encontrada</p>
              </div>
            ) : executions.map(exec => {
              const wfName = workflows.find(w => w.id === exec.workflow_id)?.name || 'Workflow';
              const statusMap: Record<string, { color: string; dotColor: string; label: string }> = {
                pending:   { color: 'bg-yellow-500/8 border-yellow-500/20', dotColor: 'bg-yellow-400', label: 'Pendente' },
                running:   { color: 'bg-blue-500/8 border-blue-500/20',   dotColor: 'bg-blue-400',   label: 'Executando' },
                completed: { color: 'bg-emerald-500/8 border-emerald-500/20', dotColor: 'bg-emerald-400', label: 'Concluído' },
                failed:    { color: 'bg-red-500/8 border-red-500/20',     dotColor: 'bg-red-400',     label: 'Falhou' },
                paused:    { color: 'bg-gray-500/8 border-gray-500/20',   dotColor: 'bg-gray-400',   label: 'Pausado' },
              };
              const s = statusMap[exec.status] || statusMap.pending;
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
        )}
      </ScrollArea>
    </div>
  );
}

export default memo(WorkflowSidebar);
export type { SidebarTab };
