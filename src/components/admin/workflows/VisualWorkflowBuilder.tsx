import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, Mail, MessageSquare, Clock, Zap, ShoppingCart,
  CreditCard, Package, Star, Truck, GitBranch, Play, Pause, Copy,
  ChevronRight, RefreshCw, Heart, UserPlus, Gift, X, Eye,
  GripVertical, Settings2, SearchCheck, CalendarClock, Repeat,
} from 'lucide-react';

import TriggerNode from './nodes/TriggerNode';
import EmailNode from './nodes/EmailNode';
import WhatsAppNode from './nodes/WhatsAppNode';
import DelayNode from './nodes/DelayNode';
import ConditionNode from './nodes/ConditionNode';
import CheckStatusNode from './nodes/CheckStatusNode';
import LoopNode from './nodes/LoopNode';
import ScheduleNode from './nodes/ScheduleNode';

/* ─── types ─── */
interface TemplateLite { id: string; name: string; body?: string; message_text?: string; subject?: string; }

interface WorkflowMeta {
  id?: string;
  name: string;
  description?: string;
  trigger_event: string;
  trigger_delay_minutes: number;
  is_active: boolean;
  run_count?: number;
  last_run_at?: string;
}

const NODE_TYPES = {
  trigger: TriggerNode,
  send_email: EmailNode,
  send_whatsapp: WhatsAppNode,
  delay: DelayNode,
  condition: ConditionNode,
  check_status: CheckStatusNode,
  loop: LoopNode,
  schedule: ScheduleNode,
};

const TRIGGER_EVENTS = [
  { value: 'abandoned_cart', label: 'Carrinho abandonado', icon: ShoppingCart },
  { value: 'order_created', label: 'Pedido criado', icon: Package },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', icon: CreditCard },
  { value: 'boleto_generated', label: 'Boleto gerado', icon: CreditCard },
  { value: 'pix_generated', label: 'PIX gerado', icon: Zap },
  { value: 'post_delivery', label: 'Pós-entrega', icon: Star },
  { value: 'shipping_sent', label: 'Envio despachado', icon: Truck },
];

const DRAGGABLE_NODES = [
  { type: 'send_email', label: 'E-mail', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  { type: 'send_whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  { type: 'delay', label: 'Aguardar', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30' },
  { type: 'check_status', label: 'Verificar Status', icon: SearchCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { type: 'schedule', label: 'Agendar Horário', icon: CalendarClock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { type: 'loop', label: 'Loop / Repetir', icon: Repeat, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
];

const PRESET_CATEGORIES = [
  { key: 'vendas', label: 'Vendas', icon: CreditCard },
  { key: 'recuperacao', label: 'Recuperação', icon: RefreshCw },
  { key: 'pos_venda', label: 'Pós-venda', icon: Heart },
  { key: 'leads', label: 'Leads', icon: UserPlus },
  { key: 'logistica', label: 'Logística', icon: Truck },
];

interface PresetDef {
  name: string;
  description: string;
  trigger_event: string;
  category: string;
  icon: React.ElementType;
  steps: { type: string; template_name?: string; delay_value?: number; delay_unit?: string; condition_label?: string; check_type?: string; schedule_hour?: number; schedule_minute?: number; max_loops?: number; loop_label?: string }[];
}

const PRESETS: PresetDef[] = [
  { name: 'Cobrança boleto diária', description: 'Cobra 8h AM, verifica pagamento, repete até vencer', trigger_event: 'boleto_generated', category: 'vendas', icon: CreditCard, steps: [
    { type: 'send_whatsapp', template_name: 'Boleto gerado' },
    { type: 'send_email', template_name: 'Boleto gerado' },
    { type: 'schedule' as any, schedule_hour: 8, schedule_minute: 0 },
    { type: 'check_status' as any, check_type: 'payment_confirmed', condition_label: 'Pagamento confirmado?' },
    { type: 'send_whatsapp', template_name: 'Lembrete de boleto' },
    { type: 'send_email', template_name: 'Lembrete de boleto' },
    { type: 'loop' as any, max_loops: 5, loop_label: 'Repetir cobrança 5x' },
  ] },
  { name: 'Boleto completo', description: 'WhatsApp + e-mail + lembrete', trigger_event: 'boleto_generated', category: 'vendas', icon: CreditCard, steps: [{ type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' }, { type: 'delay', delay_value: 2, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }] },
  { name: 'Confirmação PIX', description: 'WhatsApp + e-mail após PIX', trigger_event: 'pix_generated', category: 'vendas', icon: Zap, steps: [{ type: 'send_whatsapp', template_name: 'PIX confirmado' }, { type: 'delay', delay_value: 5, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'PIX confirmado' }] },
  { name: 'Pedido confirmado', description: 'Multicanal ao criar pedido', trigger_event: 'order_created', category: 'vendas', icon: Package, steps: [{ type: 'send_whatsapp', template_name: 'Pedido criado' }, { type: 'delay', delay_value: 2, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'Pedido criado' }] },
  { name: 'Pagamento + produção', description: 'Confirmação e produção', trigger_event: 'payment_confirmed', category: 'vendas', icon: CreditCard, steps: [{ type: 'send_whatsapp', template_name: 'Pagamento confirmado' }, { type: 'send_email', template_name: 'Pagamento confirmado' }, { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Produção iniciada' }] },
  { name: 'Recuperação agressiva', description: '3 tentativas em 24h', trigger_event: 'abandoned_cart', category: 'recuperacao', icon: ShoppingCart, steps: [{ type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 2, delay_unit: 'hours' }, { type: 'send_email', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 22, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Lembrete de carrinho com urgência' }] },
  { name: 'Recuperação com verificação', description: 'Verifica carrinho antes de cobrar', trigger_event: 'abandoned_cart', category: 'recuperacao', icon: ShoppingCart, steps: [
    { type: 'delay', delay_value: 1, delay_unit: 'hours' },
    { type: 'check_status' as any, check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_whatsapp', template_name: 'Carrinho abandonado' },
    { type: 'delay', delay_value: 23, delay_unit: 'hours' },
    { type: 'check_status' as any, check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_email', template_name: 'Lembrete de carrinho com urgência' },
  ] },
  { name: 'Pós-entrega + avaliação', description: 'Avaliação e cupom recompra', trigger_event: 'post_delivery', category: 'pos_venda', icon: Star, steps: [{ type: 'send_whatsapp', template_name: 'Pós-venda com avaliação' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Solicitar avaliação' }, { type: 'delay', delay_value: 7, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }] },
  { name: 'Recompra VIP 30d', description: 'Cupom 30 dias após entrega', trigger_event: 'post_delivery', category: 'pos_venda', icon: Gift, steps: [{ type: 'delay', delay_value: 30, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Recompra VIP' }] },
  { name: 'Boas-vindas lead', description: 'Cupom primeira compra', trigger_event: 'order_created', category: 'leads', icon: UserPlus, steps: [{ type: 'send_whatsapp', template_name: 'Boas-vindas com cupom' }, { type: 'delay', delay_value: 1, delay_unit: 'days' }, { type: 'send_email', template_name: 'Boas-vindas' }] },
  { name: 'Notificação de envio', description: 'Aviso com rastreio', trigger_event: 'shipping_sent', category: 'logistica', icon: Truck, steps: [{ type: 'send_whatsapp', template_name: 'Pedido enviado com rastreio' }, { type: 'send_email', template_name: 'Pedido enviado' }] },
];

const uid = () => crypto.randomUUID().slice(0, 8);

const delayToMinutes = (value: number, unit: string) => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

/* ─── Convert steps array ↔ nodes+edges ─── */
function stepsToFlow(steps: any[], triggerEvent: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Trigger node always at top
  const triggerNodeId = 'trigger-0';
  nodes.push({
    id: triggerNodeId,
    type: 'trigger',
    position: { x: 250, y: 40 },
    data: { trigger_event: triggerEvent },
    deletable: false,
  });

  let prevId = triggerNodeId;
  steps.forEach((step, i) => {
    const nodeId = `step-${step.id || uid()}`;
    nodes.push({
      id: nodeId,
      type: step.type,
      position: { x: 250, y: 160 + i * 140 },
      data: { ...step },
    });
    edges.push({
      id: `e-${prevId}-${nodeId}`,
      source: prevId,
      target: nodeId,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
    });
    prevId = nodeId;
  });

  return { nodes, edges };
}

function flowToSteps(nodes: Node[], edges: Edge[]): any[] {
  // Build adjacency from edges
  const children: Record<string, string> = {};
  edges.forEach(e => { children[e.source] = e.target; });

  // Walk from trigger
  const triggerNode = nodes.find(n => n.type === 'trigger');
  if (!triggerNode) return [];

  const steps: any[] = [];
  let currentId = children[triggerNode.id];
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodes.find(n => n.id === currentId);
    if (!node) break;

    const step: any = {
      id: node.id.replace('step-', ''),
      type: node.type,
      ...node.data,
    };

    if (node.type === 'delay') {
      step.delay_minutes = delayToMinutes(step.delay_value || 30, step.delay_unit || 'minutes');
    }
    if (node.type === 'send_email') step.channel = 'email';
    if (node.type === 'send_whatsapp') step.channel = 'whatsapp';

    // Clean data props
    delete step.trigger_event;
    steps.push(step);
    currentId = children[currentId];
  }

  return steps;
}

/* ─── Main Component ─── */
export default function VisualWorkflowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [emailTemplates, setEmailTemplates] = useState<TemplateLite[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<TemplateLite[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflows, setWorkflows] = useState<(WorkflowMeta & { steps: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowMeta | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'nodes' | 'presets' | 'saved'>('nodes');
  const [presetCategory, setPresetCategory] = useState('all');

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: wf }, { data: et }, { data: wt }] = await Promise.all([
      supabase.from('automation_workflows').select('*').order('created_at', { ascending: false }),
      supabase.from('email_templates').select('id, name, subject, body').eq('is_active', true),
      supabase.from('whatsapp_templates').select('id, name, message_text').eq('is_active', true),
    ]);
    setWorkflows((wf || []).map((w: any) => ({ ...w, steps: (w.steps || []) as any[] })));
    setEmailTemplates((et || []) as TemplateLite[]);
    setWhatsTemplates((wt || []).map((t: any) => ({ ...t })) as TemplateLite[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  /* ─── Add node from sidebar drag/click ─── */
  const addNode = useCallback((type: string, extraData?: any) => {
    const newId = `step-${uid()}`;
    const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    const newNode: Node = {
      id: newId,
      type,
      position: { x: 250, y: maxY + 140 },
      data: {
        id: newId.replace('step-', ''),
        type,
        template_id: '',
        template_name: '',
        delay_value: 30,
        delay_unit: 'minutes',
        delay_minutes: 30,
        condition_label: 'Pagamento confirmado?',
        ...extraData,
      },
    };

    setNodes(nds => [...nds, newNode]);

    // Auto-connect to last node
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
    if (lastNode) {
      setEdges(eds => addEdge({
        id: `e-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
      }, eds));
    }
  }, [nodes, setNodes, setEdges]);

  /* ─── New workflow ─── */
  const newWorkflow = useCallback((triggerEvent = 'abandoned_cart') => {
    const trigger: Node = {
      id: 'trigger-0',
      type: 'trigger',
      position: { x: 250, y: 40 },
      data: { trigger_event: triggerEvent },
      deletable: false,
    };
    setNodes([trigger]);
    setEdges([]);
    setCurrentWorkflow({
      name: '',
      description: '',
      trigger_event: triggerEvent,
      trigger_delay_minutes: 0,
      is_active: false,
    });
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  /* ─── Load preset ─── */
  const loadPreset = useCallback((preset: PresetDef) => {
    const steps = preset.steps.map(s => ({
      ...s,
      id: uid(),
      template_id: '',
      channel: s.type === 'send_email' ? 'email' : s.type === 'send_whatsapp' ? 'whatsapp' : undefined,
      delay_minutes: s.delay_value ? delayToMinutes(s.delay_value, s.delay_unit || 'minutes') : undefined,
    }));
    const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(steps, preset.trigger_event);
    setNodes(flowNodes);
    setEdges(flowEdges);
    setCurrentWorkflow({
      name: preset.name,
      description: preset.description,
      trigger_event: preset.trigger_event,
      trigger_delay_minutes: 0,
      is_active: false,
    });
    setSelectedNode(null);
    toast.success(`Preset "${preset.name}" carregado`);
  }, [setNodes, setEdges]);

  /* ─── Load saved workflow ─── */
  const loadWorkflow = useCallback((wf: WorkflowMeta & { steps: any[] }) => {
    const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(wf.steps, wf.trigger_event);
    setNodes(flowNodes);
    setEdges(flowEdges);
    setCurrentWorkflow({ ...wf });
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  /* ─── Save ─── */
  const saveWorkflow = useCallback(async () => {
    if (!currentWorkflow) return toast.error('Nenhum workflow aberto');
    if (!currentWorkflow.name) return toast.error('Informe o nome');

    const steps = flowToSteps(nodes, edges);
    if (steps.length === 0) return toast.error('Adicione ao menos um passo');

    // Get trigger from trigger node
    const triggerNode = nodes.find(n => n.type === 'trigger');
    const triggerEvent = (triggerNode?.data?.trigger_event as string) || currentWorkflow.trigger_event;

    const payload = {
      name: currentWorkflow.name,
      description: currentWorkflow.description || null,
      trigger_event: triggerEvent,
      trigger_delay_minutes: currentWorkflow.trigger_delay_minutes,
      steps: steps as any,
      is_active: currentWorkflow.is_active,
    };

    const action = currentWorkflow.id
      ? supabase.from('automation_workflows').update(payload).eq('id', currentWorkflow.id)
      : supabase.from('automation_workflows').insert(payload);

    const { error } = await action;
    if (error) return toast.error('Erro ao salvar workflow');
    toast.success('Workflow salvo!');
    loadData();
  }, [currentWorkflow, nodes, edges, loadData]);

  /* ─── Delete ─── */
  const deleteWorkflow = useCallback(async (id: string) => {
    await supabase.from('automation_workflows').delete().eq('id', id);
    toast.success('Workflow excluído');
    if (currentWorkflow?.id === id) {
      setCurrentWorkflow(null);
      setNodes([]);
      setEdges([]);
    }
    loadData();
  }, [currentWorkflow, setNodes, setEdges, loadData]);

  /* ─── Toggle active ─── */
  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await supabase.from('automation_workflows').update({ is_active: active }).eq('id', id);
    loadData();
  }, [loadData]);

  /* ─── Update selected node data ─── */
  const updateSelectedNode = useCallback((patch: Record<string, any>) => {
    if (!selectedNode) return;
    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...patch } } : null);
  }, [selectedNode, setNodes]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === 'trigger') return;
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.category === presetCategory);

  /* ─── Render ─── */
  return (
    <div className="flex rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
      {/* ─── Left Sidebar ─── */}
      <div className="w-64 shrink-0 border-r border-[hsl(var(--admin-card-border)/0.5)] flex flex-col bg-[hsl(var(--admin-bg)/0.5)]">
        {/* Tabs */}
        <div className="flex border-b border-[hsl(var(--admin-card-border)/0.5)]">
          {[
            { key: 'nodes' as const, label: 'Nós', icon: Plus },
            { key: 'presets' as const, label: 'Modelos', icon: Zap },
            { key: 'saved' as const, label: 'Salvos', icon: Settings2 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${
                sidebarTab === tab.key
                  ? 'bg-[hsl(var(--admin-accent-purple)/0.15)] text-white border-b-2 border-[hsl(var(--admin-accent-purple))]'
                  : 'text-[hsl(var(--admin-text-muted))] hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {/* ─── Nodes Tab ─── */}
          {sidebarTab === 'nodes' && (
            <div className="p-3 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Arraste ou clique para adicionar</p>
              <div className="grid grid-cols-2 gap-2">
                {DRAGGABLE_NODES.map(dn => (
                  <button
                    key={dn.type}
                    onClick={() => addNode(dn.type)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all hover:scale-105 cursor-pointer ${dn.bg}`}
                  >
                    <dn.icon className={`h-6 w-6 ${dn.color}`} />
                    <span className="text-[11px] font-medium">{dn.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[hsl(var(--admin-card-border)/0.3)]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-2">Gatilhos</p>
                <div className="space-y-1">
                  {TRIGGER_EVENTS.map(te => (
                    <button
                      key={te.value}
                      onClick={() => newWorkflow(te.value)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors text-[hsl(var(--admin-text-muted))] hover:text-white"
                    >
                      <te.icon className="h-3.5 w-3.5" />
                      <span>{te.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Presets Tab ─── */}
          {sidebarTab === 'presets' && (
            <div className="p-3 space-y-2">
              <div className="space-y-0.5 mb-3">
                <button
                  onClick={() => setPresetCategory('all')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${presetCategory === 'all' ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white' : 'text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                >
                  <Zap className="h-3.5 w-3.5" />Todos
                  <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5">{PRESETS.length}</Badge>
                </button>
                {PRESET_CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setPresetCategory(cat.key)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${presetCategory === cat.key ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white' : 'text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >
                    <cat.icon className="h-3.5 w-3.5" />{cat.label}
                  </button>
                ))}
              </div>

              {filteredPresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left rounded-lg border border-[hsl(var(--admin-card-border)/0.5)] bg-[hsl(var(--admin-card))] p-3 hover:border-[hsl(var(--admin-accent-purple)/0.5)] transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p.icon className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                    <span className="text-xs font-medium text-white">{p.name}</span>
                    <ChevronRight className="h-3 w-3 ml-auto text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-accent-purple))]" />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{p.description}</p>
                  <div className="flex gap-1 mt-1.5">
                    {p.steps.filter(s => s.type === 'send_whatsapp').length > 0 && <Badge className="text-[8px] h-4 bg-green-500/10 text-green-400 border-green-700"><MessageSquare className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_whatsapp').length}</Badge>}
                    {p.steps.filter(s => s.type === 'send_email').length > 0 && <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-400 border-blue-700"><Mail className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_email').length}</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ─── Saved Tab ─── */}
          {sidebarTab === 'saved' && (
            <div className="p-3 space-y-2">
              {loading ? <p className="text-xs text-[hsl(var(--admin-text-muted))]">Carregando...</p> : workflows.length === 0 ? (
                <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-4">Nenhum workflow salvo</p>
              ) : workflows.map(wf => (
                <div
                  key={wf.id}
                  className={`rounded-lg border p-3 cursor-pointer transition-all ${currentWorkflow?.id === wf.id ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.1)]' : 'border-[hsl(var(--admin-card-border)/0.5)] hover:border-[hsl(var(--admin-accent-purple)/0.3)]'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white truncate cursor-pointer" onClick={() => loadWorkflow(wf)}>{wf.name}</span>
                    <Switch checked={wf.is_active} onCheckedChange={v => toggleActive(wf.id!, v)} />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{wf.steps.length} passos • {wf.run_count || 0} exec.</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => loadWorkflow(wf)}>Editar</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => {
                      loadWorkflow({ ...wf, id: undefined, name: `${wf.name} (cópia)` });
                    }}><Copy className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => deleteWorkflow(wf.id!)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ─── Canvas ─── */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        {!currentWorkflow ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <Zap className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--admin-accent-purple)/0.3)]" />
              <h3 className="text-lg font-semibold text-white mb-2">Editor Visual de Workflows</h3>
              <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-6">Selecione um modelo pronto, abra um workflow salvo ou crie um do zero</p>
              <Button onClick={() => newWorkflow()} className="gap-2">
                <Plus className="h-4 w-4" />Novo Workflow
              </Button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            deleteKeyCode="Delete"
            className="bg-[hsl(var(--admin-bg))]"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--admin-card-border) / 0.3)" />
            <Controls className="!bg-[hsl(var(--admin-card))] !border-[hsl(var(--admin-card-border))] !shadow-lg [&>button]:!bg-[hsl(var(--admin-card))] [&>button]:!border-[hsl(var(--admin-card-border))] [&>button]:!text-white [&>button:hover]:!bg-[hsl(var(--admin-sidebar-hover))]" />

            {/* Top panel: workflow meta */}
            <Panel position="top-left" className="flex items-center gap-2 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur border border-[hsl(var(--admin-card-border))] rounded-xl px-4 py-2.5 shadow-lg">
              <Input
                value={currentWorkflow.name}
                onChange={e => setCurrentWorkflow({ ...currentWorkflow, name: e.target.value })}
                placeholder="Nome do workflow"
                className="h-8 w-48 text-sm bg-transparent border-none focus-visible:ring-0 px-0 font-semibold"
              />
              <div className="h-5 w-px bg-[hsl(var(--admin-card-border))]" />
              <Select
                value={currentWorkflow.trigger_event}
                onValueChange={v => {
                  setCurrentWorkflow({ ...currentWorkflow, trigger_event: v });
                  setNodes(nds => nds.map(n => n.type === 'trigger' ? { ...n, data: { ...n.data, trigger_event: v } } : n));
                }}
              >
                <SelectTrigger className="h-8 w-44 text-xs border-none bg-transparent"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-5 w-px bg-[hsl(var(--admin-card-border))]" />
              <div className="flex items-center gap-2">
                <Switch checked={currentWorkflow.is_active} onCheckedChange={v => setCurrentWorkflow({ ...currentWorkflow, is_active: v })} />
                <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">{currentWorkflow.is_active ? 'Ativo' : 'Inativo'}</span>
              </div>
              <Button size="sm" onClick={saveWorkflow} className="h-8 gap-1.5 ml-2">
                <Save className="h-3.5 w-3.5" />Salvar
              </Button>
            </Panel>
          </ReactFlow>
        )}
      </div>

      {/* ─── Right Panel: Node Config ─── */}
      {selectedNode && currentWorkflow && (
        <div className="w-72 shrink-0 border-l border-[hsl(var(--admin-card-border)/0.5)] flex flex-col bg-[hsl(var(--admin-bg)/0.5)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--admin-card-border)/0.5)]">
            <h4 className="text-sm font-semibold text-white">Configurar Nó</h4>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedNode(null)}><X className="h-3.5 w-3.5" /></Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Trigger config */}
              {selectedNode.type === 'trigger' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Evento gatilho</label>
                  <Select
                    value={(selectedNode.data.trigger_event as string) || 'abandoned_cart'}
                    onValueChange={v => {
                      updateSelectedNode({ trigger_event: v });
                      setCurrentWorkflow({ ...currentWorkflow, trigger_event: v });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_EVENTS.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Delay config */}
              {selectedNode.type === 'delay' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Tempo de espera</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={(selectedNode.data.delay_value as number) || 30}
                      onChange={e => updateSelectedNode({ delay_value: parseInt(e.target.value) || 1 })}
                    />
                    <Select
                      value={(selectedNode.data.delay_unit as string) || 'minutes'}
                      onValueChange={v => updateSelectedNode({ delay_unit: v })}
                    >
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutos</SelectItem>
                        <SelectItem value="hours">Horas</SelectItem>
                        <SelectItem value="days">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Email/WhatsApp config */}
              {(selectedNode.type === 'send_email' || selectedNode.type === 'send_whatsapp') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Template</label>
                    <Select
                      value={(selectedNode.data.template_id as string) || ''}
                      onValueChange={v => {
                        const list = selectedNode.type === 'send_email' ? emailTemplates : whatsTemplates;
                        const tpl = list.find(t => t.id === v);
                        updateSelectedNode({ template_id: v, template_name: tpl?.name || '' });
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
                      <SelectContent>
                        {(selectedNode.type === 'send_email' ? emailTemplates : whatsTemplates).map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template preview */}
                  {selectedNode.data.template_id && (() => {
                    const list = selectedNode.type === 'send_email' ? emailTemplates : whatsTemplates;
                    const tpl = list.find(t => t.id === (selectedNode.data.template_id as string));
                    if (!tpl) return null;
                    const content = selectedNode.type === 'send_email'
                      ? (tpl.body || '').replace(/<[^>]*>/g, '').slice(0, 500)
                      : (tpl.message_text || '').slice(0, 500);
                    const vars = (content.match(/\{\{[^}]+\}\}/g) || []).filter((v, i, a) => a.indexOf(v) === i);

                    return (
                      <div className="space-y-3">
                        {selectedNode.type === 'send_email' && tpl.subject && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Assunto</label>
                            <p className="text-xs mt-1 text-white">{tpl.subject}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Preview
                          </label>
                          <div className="mt-1 rounded-lg border border-dashed border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] p-3 max-h-48 overflow-y-auto">
                            <p className="text-[11px] whitespace-pre-wrap leading-relaxed text-[hsl(var(--admin-text-muted))]">{content}</p>
                          </div>
                        </div>
                        {vars.length > 0 && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Variáveis usadas</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vars.map(v => <Badge key={v} variant="secondary" className="text-[9px] font-mono">{v}</Badge>)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Condition config */}
              {selectedNode.type === 'condition' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Condição</label>
                  <Input
                    value={(selectedNode.data.condition_label as string) || ''}
                    onChange={e => updateSelectedNode({ condition_label: e.target.value })}
                    placeholder="Ex: Pagamento confirmado?"
                  />
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                    Saída SIM (verde) e NÃO (vermelho) permitem ramificações condicionais no fluxo.
                  </p>
                </div>
              )}

              {/* Check Status config */}
              {selectedNode.type === 'check_status' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Verificação automática</label>
                  <Select
                    value={(selectedNode.data.check_type as string) || 'payment_confirmed'}
                    onValueChange={v => updateSelectedNode({ check_type: v, condition_label: { payment_confirmed: 'Pagamento confirmado?', boleto_expired: 'Boleto vencido?', order_shipped: 'Pedido enviado?', cart_recovered: 'Carrinho recuperado?' }[v] || v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_confirmed">Pagamento confirmado?</SelectItem>
                      <SelectItem value="boleto_expired">Boleto vencido?</SelectItem>
                      <SelectItem value="order_shipped">Pedido enviado?</SelectItem>
                      <SelectItem value="cart_recovered">Carrinho recuperado?</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                    O motor verifica o status real no banco. SIM = condição verdadeira, NÃO = continua o fluxo.
                  </p>
                </div>
              )}

              {/* Schedule config */}
              {selectedNode.type === 'schedule' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Horário agendado (BRT)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      className="w-20"
                      value={(selectedNode.data.schedule_hour as number) ?? 8}
                      onChange={e => updateSelectedNode({ schedule_hour: parseInt(e.target.value) || 0 })}
                      placeholder="Hora"
                    />
                    <span className="text-lg text-[hsl(var(--admin-text-muted))] self-center">:</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      className="w-20"
                      value={(selectedNode.data.schedule_minute as number) ?? 0}
                      onChange={e => updateSelectedNode({ schedule_minute: parseInt(e.target.value) || 0 })}
                      placeholder="Min"
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                    O fluxo pausa e continua no próximo dia no horário definido (fuso BRT).
                  </p>
                </div>
              )}

              {/* Loop config */}
              {selectedNode.type === 'loop' && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Máximo de repetições</label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={(selectedNode.data.max_loops as number) || 5}
                    onChange={e => updateSelectedNode({ max_loops: parseInt(e.target.value) || 1, loop_label: `Repetir até ${e.target.value}x` })}
                  />
                  <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Descrição</label>
                  <Input
                    value={(selectedNode.data.loop_label as string) || ''}
                    onChange={e => updateSelectedNode({ loop_label: e.target.value })}
                    placeholder="Ex: Repetir cobrança 5x"
                  />
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                    O loop volta ao início do bloco (antes da verificação) até atingir o limite. Saída REPETE continua o ciclo, saída FIM encerra.
                  </p>
                </div>
              )}

              {/* Delete button */}
              {selectedNode.type !== 'trigger' && (
                <div className="pt-3 border-t border-[hsl(var(--admin-card-border)/0.3)]">
                  <Button variant="destructive" size="sm" className="w-full gap-2" onClick={deleteSelectedNode}>
                    <Trash2 className="h-3.5 w-3.5" />Remover nó
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
