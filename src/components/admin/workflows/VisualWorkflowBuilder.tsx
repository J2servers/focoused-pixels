import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
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
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, Mail, MessageSquare, Clock, Zap, ShoppingCart,
  CreditCard, Package, Star, Truck, GitBranch, Play, Pause, Copy,
  ChevronRight, RefreshCw, Heart, UserPlus, Gift, X, Eye,
  Settings2, SearchCheck, CalendarClock, Repeat,
  Download, Upload, AlertTriangle, CheckCircle2, History,
  Search, LayoutGrid, FileJson, Maximize2, Undo2, Redo2,
  Activity, Info, Loader2, TestTube2,
} from 'lucide-react';

import TriggerNode from './nodes/TriggerNode';
import EmailNode from './nodes/EmailNode';
import WhatsAppNode from './nodes/WhatsAppNode';
import DelayNode from './nodes/DelayNode';
import ConditionNode from './nodes/ConditionNode';
import CheckStatusNode from './nodes/CheckStatusNode';
import LoopNode from './nodes/LoopNode';
import ScheduleNode from './nodes/ScheduleNode';
import UpdateOrderStatusNode from './nodes/UpdateOrderStatusNode';
import CreateCouponNode from './nodes/CreateCouponNode';
import HttpWebhookNode from './nodes/HttpWebhookNode';
import AddTagNode from './nodes/AddTagNode';
import WaitForEventNode from './nodes/WaitForEventNode';

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
  created_at?: string;
  updated_at?: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  current_step_index: number;
  step_results: any[];
  trigger_data: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  next_run_at: string;
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
  update_order_status: UpdateOrderStatusNode,
  create_coupon: CreateCouponNode,
  http_webhook: HttpWebhookNode,
  add_tag: AddTagNode,
  wait_for_event: WaitForEventNode,
};

const TRIGGER_EVENTS = [
  { value: 'abandoned_cart', label: 'Carrinho abandonado', icon: ShoppingCart, description: 'Quando um carrinho é abandonado' },
  { value: 'order_created', label: 'Pedido criado', icon: Package, description: 'Quando um novo pedido é criado' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', icon: CreditCard, description: 'Quando pagamento é confirmado' },
  { value: 'boleto_generated', label: 'Boleto gerado', icon: CreditCard, description: 'Quando um boleto é gerado' },
  { value: 'pix_generated', label: 'PIX gerado', icon: Zap, description: 'Quando um PIX é gerado' },
  { value: 'post_delivery', label: 'Pós-entrega', icon: Star, description: 'Após confirmação de entrega' },
  { value: 'shipping_sent', label: 'Envio despachado', icon: Truck, description: 'Quando o pedido é enviado' },
];

const DRAGGABLE_NODES = [
  { type: 'send_email', label: 'E-mail', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', description: 'Enviar e-mail ao cliente' },
  { type: 'send_whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', description: 'Enviar WhatsApp' },
  { type: 'delay', label: 'Aguardar', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', description: 'Esperar um tempo' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/30', description: 'Ramificação condicional' },
  { type: 'check_status', label: 'Verificar', icon: SearchCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', description: 'Verificar status real' },
  { type: 'schedule', label: 'Agendar', icon: CalendarClock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', description: 'Agendar para horário' },
  { type: 'loop', label: 'Loop', icon: Repeat, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', description: 'Repetir bloco N vezes' },
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
  difficulty: 'easy' | 'medium' | 'advanced';
  steps: any[];
}

const PRESETS: PresetDef[] = [
  { name: 'Cobrança boleto diária', description: 'Cobra 8h AM, verifica pagamento, repete até vencer', trigger_event: 'boleto_generated', category: 'vendas', icon: CreditCard, difficulty: 'advanced', steps: [
    { type: 'send_whatsapp', template_name: 'Boleto gerado' },
    { type: 'send_email', template_name: 'Boleto gerado' },
    { type: 'schedule', schedule_hour: 8, schedule_minute: 0 },
    { type: 'check_status', check_type: 'payment_confirmed', condition_label: 'Pagamento confirmado?' },
    { type: 'send_whatsapp', template_name: 'Lembrete de boleto' },
    { type: 'send_email', template_name: 'Lembrete de boleto' },
    { type: 'loop', max_loops: 5, loop_label: 'Repetir cobrança 5x' },
  ] },
  { name: 'Boleto completo', description: 'WhatsApp + e-mail + lembrete', trigger_event: 'boleto_generated', category: 'vendas', icon: CreditCard, difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' }, { type: 'delay', delay_value: 2, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }] },
  { name: 'Confirmação PIX', description: 'WhatsApp + e-mail após PIX', trigger_event: 'pix_generated', category: 'vendas', icon: Zap, difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'PIX confirmado' }, { type: 'delay', delay_value: 5, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'PIX confirmado' }] },
  { name: 'Pedido confirmado', description: 'Multicanal ao criar pedido', trigger_event: 'order_created', category: 'vendas', icon: Package, difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Pedido criado' }, { type: 'delay', delay_value: 2, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'Pedido criado' }] },
  { name: 'Pagamento + produção', description: 'Confirmação e produção', trigger_event: 'payment_confirmed', category: 'vendas', icon: CreditCard, difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Pagamento confirmado' }, { type: 'send_email', template_name: 'Pagamento confirmado' }, { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Produção iniciada' }] },
  { name: 'Recuperação agressiva', description: '3 tentativas em 24h', trigger_event: 'abandoned_cart', category: 'recuperacao', icon: ShoppingCart, difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 2, delay_unit: 'hours' }, { type: 'send_email', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 22, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Lembrete de carrinho com urgência' }] },
  { name: 'Recuperação com verificação', description: 'Verifica carrinho antes de cobrar', trigger_event: 'abandoned_cart', category: 'recuperacao', icon: ShoppingCart, difficulty: 'advanced', steps: [
    { type: 'delay', delay_value: 1, delay_unit: 'hours' },
    { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_whatsapp', template_name: 'Carrinho abandonado' },
    { type: 'delay', delay_value: 23, delay_unit: 'hours' },
    { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_email', template_name: 'Lembrete de carrinho com urgência' },
  ] },
  { name: 'Pós-entrega + avaliação', description: 'Avaliação e cupom recompra', trigger_event: 'post_delivery', category: 'pos_venda', icon: Star, difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Pós-venda com avaliação' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Solicitar avaliação' }, { type: 'delay', delay_value: 7, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }] },
  { name: 'Recompra VIP 30d', description: 'Cupom 30 dias após entrega', trigger_event: 'post_delivery', category: 'pos_venda', icon: Gift, difficulty: 'easy', steps: [{ type: 'delay', delay_value: 30, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Recompra VIP' }] },
  { name: 'Boas-vindas lead', description: 'Cupom primeira compra', trigger_event: 'order_created', category: 'leads', icon: UserPlus, difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Boas-vindas com cupom' }, { type: 'delay', delay_value: 1, delay_unit: 'days' }, { type: 'send_email', template_name: 'Boas-vindas' }] },
  { name: 'Notificação de envio', description: 'Aviso com rastreio', trigger_event: 'shipping_sent', category: 'logistica', icon: Truck, difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Pedido enviado com rastreio' }, { type: 'send_email', template_name: 'Pedido enviado' }] },
];

const uid = () => crypto.randomUUID().slice(0, 8);

const delayToMinutes = (value: number, unit: string) => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

const DIFFICULTY_COLORS: Record<string, { label: string; class: string }> = {
  easy: { label: 'Fácil', class: 'bg-green-500/10 text-green-400 border-green-700' },
  medium: { label: 'Médio', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-700' },
  advanced: { label: 'Avançado', class: 'bg-red-500/10 text-red-400 border-red-700' },
};

/* ─── Convert steps array ↔ nodes+edges ─── */
function stepsToFlow(steps: any[], triggerEvent: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

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
  const children: Record<string, string> = {};
  edges.forEach(e => { children[e.source] = e.target; });

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

    delete step.trigger_event;
    steps.push(step);
    currentId = children[currentId];
  }

  return steps;
}

/* ─── Validation ─── */
interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

function validateWorkflow(nodes: Node[], edges: Edge[], meta: WorkflowMeta, emailTemplates: TemplateLite[], whatsTemplates: TemplateLite[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!meta.name.trim()) issues.push({ type: 'error', message: 'Nome do workflow é obrigatório' });

  const actionNodes = nodes.filter(n => n.type !== 'trigger');
  if (actionNodes.length === 0) issues.push({ type: 'error', message: 'Adicione ao menos um passo ao workflow' });

  // Check disconnected nodes
  const connectedIds = new Set<string>();
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
  actionNodes.forEach(n => {
    if (!connectedIds.has(n.id)) {
      issues.push({ type: 'warning', message: `Nó "${n.type}" está desconectado`, nodeId: n.id });
    }
  });

  // Check email/whatsapp nodes without templates
  actionNodes.forEach(n => {
    if (n.type === 'send_email' && !n.data.template_id) {
      issues.push({ type: 'warning', message: 'Nó de e-mail sem template selecionado', nodeId: n.id });
    }
    if (n.type === 'send_whatsapp' && !n.data.template_id) {
      issues.push({ type: 'warning', message: 'Nó de WhatsApp sem template selecionado', nodeId: n.id });
    }
  });

  // Check template existence
  actionNodes.forEach(n => {
    if (n.type === 'send_email' && n.data.template_id) {
      if (!emailTemplates.find(t => t.id === n.data.template_id)) {
        issues.push({ type: 'error', message: 'Template de e-mail não encontrado ou desativado', nodeId: n.id });
      }
    }
    if (n.type === 'send_whatsapp' && n.data.template_id) {
      if (!whatsTemplates.find(t => t.id === n.data.template_id)) {
        issues.push({ type: 'error', message: 'Template de WhatsApp não encontrado ou desativado', nodeId: n.id });
      }
    }
  });

  // Warn if no delay between consecutive sends
  const steps = flowToSteps(nodes, edges);
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const curr = steps[i];
    if ((prev.type === 'send_email' || prev.type === 'send_whatsapp') &&
        (curr.type === 'send_email' || curr.type === 'send_whatsapp')) {
      issues.push({ type: 'warning', message: `Envios consecutivos sem delay (passos ${i} e ${i + 1})` });
    }
  }

  return issues;
}

/* ─── Time formatting ─── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

/* ─── Inner Component (needs ReactFlowProvider) ─── */
function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [emailTemplates, setEmailTemplates] = useState<TemplateLite[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<TemplateLite[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflows, setWorkflows] = useState<(WorkflowMeta & { steps: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowMeta | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'nodes' | 'presets' | 'saved' | 'history'>('nodes');
  const [presetCategory, setPresetCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDescDialog, setShowDescDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [testingWorkflow, setTestingWorkflow] = useState(false);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-20), { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack([]);
    setHasUnsavedChanges(true);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { nodes: [...nodes], edges: [...edges] }]);
    setUndoStack(u => u.slice(0, -1));
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { nodes: [...nodes], edges: [...edges] }]);
    setRedoStack(r => r.slice(0, -1));
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveWorkflow(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

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

  const loadExecutions = useCallback(async (workflowId?: string) => {
    setLoadingExecs(true);
    const query = supabase
      .from('workflow_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (workflowId) query.eq('workflow_id', workflowId);
    const { data } = await query;
    setExecutions((data || []) as WorkflowExecution[]);
    setLoadingExecs(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onConnect = useCallback((params: Connection) => {
    pushUndo();
    setEdges(eds => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
    }, eds));
  }, [setEdges, pushUndo]);

  const onNodeClick = useCallback((_: any, node: Node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  /* ─── Add node ─── */
  const addNode = useCallback((type: string, extraData?: any) => {
    pushUndo();
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
  }, [nodes, setNodes, setEdges, pushUndo]);

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
    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
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
    setHasUnsavedChanges(true);
    toast.success(`Modelo "${preset.name}" carregado`);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  /* ─── Load saved workflow ─── */
  const loadWorkflow = useCallback((wf: WorkflowMeta & { steps: any[] }) => {
    const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(wf.steps, wf.trigger_event);
    setNodes(flowNodes);
    setEdges(flowEdges);
    setCurrentWorkflow({ ...wf });
    setSelectedNode(null);
    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  /* ─── Save with validation ─── */
  const saveWorkflow = useCallback(async () => {
    if (!currentWorkflow) return toast.error('Nenhum workflow aberto');

    const issues = validateWorkflow(nodes, edges, currentWorkflow, emailTemplates, whatsTemplates);
    const errors = issues.filter(i => i.type === 'error');

    if (errors.length > 0) {
      setValidationIssues(issues);
      setShowValidation(true);
      return toast.error(`${errors.length} erro(s) encontrado(s)`);
    }

    setSaving(true);
    const steps = flowToSteps(nodes, edges);
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
      : supabase.from('automation_workflows').insert(payload).select().single();

    const { data, error } = await action;
    setSaving(false);

    if (error) return toast.error('Erro ao salvar: ' + error.message);

    // Show warnings after successful save
    const warnings = issues.filter(i => i.type === 'warning');
    if (warnings.length > 0) {
      toast.warning(`Salvo com ${warnings.length} aviso(s)`);
    } else {
      toast.success('Workflow salvo com sucesso!');
    }

    if (!currentWorkflow.id && data) {
      setCurrentWorkflow(prev => prev ? { ...prev, id: (data as any).id } : prev);
    }

    setHasUnsavedChanges(false);
    loadData();
  }, [currentWorkflow, nodes, edges, loadData, emailTemplates, whatsTemplates]);

  /* ─── Delete with confirmation ─── */
  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    await supabase.from('automation_workflows').delete().eq('id', deleteConfirmId);
    toast.success('Workflow excluído');
    if (currentWorkflow?.id === deleteConfirmId) {
      setCurrentWorkflow(null);
      setNodes([]);
      setEdges([]);
    }
    setDeleteConfirmId(null);
    loadData();
  }, [deleteConfirmId, currentWorkflow, setNodes, setEdges, loadData]);

  /* ─── Toggle active ─── */
  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await supabase.from('automation_workflows').update({ is_active: active }).eq('id', id);
    toast.success(active ? 'Workflow ativado' : 'Workflow desativado');
    loadData();
  }, [loadData]);

  /* ─── Test workflow ─── */
  const testWorkflow = useCallback(async () => {
    if (!currentWorkflow?.id) return toast.error('Salve o workflow antes de testar');
    setTestingWorkflow(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: {
          action: 'trigger',
          trigger_event: currentWorkflow.trigger_event,
          trigger_data: {
            customer_name: 'Teste Workflow',
            customer_email: 'teste@exemplo.com',
            customer_phone: '11999999999',
            order_number: 'TEST-' + Date.now(),
            amount: '99.90',
            is_test: true,
          },
        },
      });
      if (error) throw error;
      toast.success(`Teste disparado! ${data?.count || 0} workflow(s) acionado(s)`);
      loadExecutions(currentWorkflow.id);
      setSidebarTab('history');
    } catch (err: any) {
      toast.error('Erro no teste: ' + (err.message || 'Desconhecido'));
    }
    setTestingWorkflow(false);
  }, [currentWorkflow, loadExecutions]);

  /* ─── Export/Import ─── */
  const exportWorkflow = useCallback(() => {
    if (!currentWorkflow) return;
    const steps = flowToSteps(nodes, edges);
    const exportData = {
      name: currentWorkflow.name,
      description: currentWorkflow.description,
      trigger_event: currentWorkflow.trigger_event,
      trigger_delay_minutes: currentWorkflow.trigger_delay_minutes,
      steps,
      exported_at: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${currentWorkflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exportado');
  }, [currentWorkflow, nodes, edges]);

  const importWorkflow = useCallback(() => {
    try {
      const data = JSON.parse(importJson);
      if (!data.trigger_event || !data.steps) throw new Error('Formato inválido');

      const steps = data.steps.map((s: any) => ({ ...s, id: uid() }));
      const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(steps, data.trigger_event);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setCurrentWorkflow({
        name: data.name || 'Workflow importado',
        description: data.description || '',
        trigger_event: data.trigger_event,
        trigger_delay_minutes: data.trigger_delay_minutes || 0,
        is_active: false,
      });
      setShowImportDialog(false);
      setImportJson('');
      setHasUnsavedChanges(true);
      toast.success('Workflow importado com sucesso');
    } catch {
      toast.error('JSON inválido');
    }
  }, [importJson, setNodes, setEdges]);

  /* ─── Update selected node data ─── */
  const updateSelectedNode = useCallback((patch: Record<string, any>) => {
    if (!selectedNode) return;
    pushUndo();
    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...patch } } : null);
  }, [selectedNode, setNodes, pushUndo]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === 'trigger') return;
    pushUndo();
    // Reconnect edges through the deleted node
    const inEdge = edges.find(e => e.target === selectedNode.id);
    const outEdge = edges.find(e => e.source === selectedNode.id);
    let newEdges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);

    if (inEdge && outEdge) {
      newEdges = [...newEdges, {
        id: `e-${inEdge.source}-${outEdge.target}`,
        source: inEdge.source,
        target: outEdge.target,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
      }];
    }

    setEdges(newEdges);
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, edges, setNodes, setEdges, pushUndo]);

  /* ─── Auto-layout ─── */
  const autoLayout = useCallback(() => {
    pushUndo();
    const steps = flowToSteps(nodes, edges);
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) return;

    const newNodes = [{ ...triggerNode, position: { x: 250, y: 40 } }];
    let prevId = triggerNode.id;
    const newEdges: Edge[] = [];

    steps.forEach((step, i) => {
      const node = nodes.find(n => n.id === `step-${step.id}` || n.data.id === step.id);
      if (node) {
        newNodes.push({ ...node, position: { x: 250, y: 160 + i * 140 } });
        newEdges.push({
          id: `e-${prevId}-${node.id}`,
          source: prevId,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
        });
        prevId = node.id;
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodes, edges, setNodes, setEdges, fitView, pushUndo]);

  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.category === presetCategory);

  const filteredWorkflows = searchQuery
    ? workflows.filter(wf => wf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : workflows;

  /* ─── Stats ─── */
  const activeCount = workflows.filter(w => w.is_active).length;
  const totalExecs = workflows.reduce((sum, w) => sum + (w.run_count || 0), 0);

  /* ─── Render ─── */
  return (
    <TooltipProvider>
      <div className="flex rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 500 }}>
        {/* ─── Left Sidebar ─── */}
        <div className="w-64 shrink-0 border-r border-[hsl(var(--admin-card-border)/0.5)] flex flex-col bg-[hsl(var(--admin-bg)/0.5)]">
          {/* Stats bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--admin-card-border)/0.3)] bg-[hsl(var(--admin-accent-purple)/0.05)]">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Workflows</p>
                <p className="text-sm font-bold text-white">{workflows.length}</p>
              </div>
              <div className="w-px h-6 bg-[hsl(var(--admin-card-border)/0.3)]" />
              <div className="text-center">
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Ativos</p>
                <p className="text-sm font-bold text-green-400">{activeCount}</p>
              </div>
              <div className="w-px h-6 bg-[hsl(var(--admin-card-border)/0.3)]" />
              <div className="text-center">
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Exec.</p>
                <p className="text-sm font-bold text-[hsl(var(--admin-accent-purple))]">{totalExecs}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[hsl(var(--admin-card-border)/0.5)]">
            {[
              { key: 'nodes' as const, label: 'Nós', icon: Plus },
              { key: 'presets' as const, label: 'Modelos', icon: Zap },
              { key: 'saved' as const, label: 'Salvos', icon: Settings2 },
              { key: 'history' as const, label: 'Logs', icon: History },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setSidebarTab(tab.key);
                  if (tab.key === 'history') loadExecutions(currentWorkflow?.id);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] transition-colors ${
                  sidebarTab === tab.key
                    ? 'bg-[hsl(var(--admin-accent-purple)/0.15)] text-white border-b-2 border-[hsl(var(--admin-accent-purple))]'
                    : 'text-[hsl(var(--admin-text-muted))] hover:text-white'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1">
            {/* ─── Nodes Tab ─── */}
            {sidebarTab === 'nodes' && (
              <div className="p-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Clique para adicionar</p>
                <div className="grid grid-cols-2 gap-2">
                  {DRAGGABLE_NODES.map(dn => (
                    <Tooltip key={dn.type}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => addNode(dn.type)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all hover:scale-105 cursor-pointer ${dn.bg}`}
                        >
                          <dn.icon className={`h-5 w-5 ${dn.color}`} />
                          <span className="text-[10px] font-medium">{dn.label}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>{dn.description}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <div className="pt-3 border-t border-[hsl(var(--admin-card-border)/0.3)]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-2">Novo workflow por gatilho</p>
                  <div className="space-y-1">
                    {TRIGGER_EVENTS.map(te => (
                      <Tooltip key={te.value}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => newWorkflow(te.value)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors text-[hsl(var(--admin-text-muted))] hover:text-white"
                          >
                            <te.icon className="h-3.5 w-3.5" />
                            <span>{te.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>{te.description}</p></TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Keyboard shortcuts */}
                <div className="pt-3 border-t border-[hsl(var(--admin-card-border)/0.3)]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-2">Atalhos</p>
                  <div className="space-y-1 text-[10px] text-[hsl(var(--admin-text-muted))]">
                    <div className="flex justify-between"><span>Desfazer</span><kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-card-border)/0.3)] text-[9px]">Ctrl+Z</kbd></div>
                    <div className="flex justify-between"><span>Refazer</span><kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-card-border)/0.3)] text-[9px]">Ctrl+Y</kbd></div>
                    <div className="flex justify-between"><span>Salvar</span><kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-card-border)/0.3)] text-[9px]">Ctrl+S</kbd></div>
                    <div className="flex justify-between"><span>Deletar nó</span><kbd className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-card-border)/0.3)] text-[9px]">Delete</kbd></div>
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

                {filteredPresets.map((p, i) => {
                  const diff = DIFFICULTY_COLORS[p.difficulty];
                  return (
                    <button
                      key={i}
                      onClick={() => loadPreset(p)}
                      className="w-full text-left rounded-lg border border-[hsl(var(--admin-card-border)/0.5)] bg-[hsl(var(--admin-card))] p-3 hover:border-[hsl(var(--admin-accent-purple)/0.5)] transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p.icon className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                        <span className="text-xs font-medium text-white truncate">{p.name}</span>
                        <ChevronRight className="h-3 w-3 ml-auto text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-accent-purple))]" />
                      </div>
                      <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mb-2">{p.description}</p>
                      <div className="flex gap-1 items-center">
                        {p.steps.filter(s => s.type === 'send_whatsapp').length > 0 && <Badge className="text-[8px] h-4 bg-green-500/10 text-green-400 border-green-700"><MessageSquare className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_whatsapp').length}</Badge>}
                        {p.steps.filter(s => s.type === 'send_email').length > 0 && <Badge className="text-[8px] h-4 bg-blue-500/10 text-blue-400 border-blue-700"><Mail className="h-2 w-2 mr-0.5" />{p.steps.filter(s => s.type === 'send_email').length}</Badge>}
                        <Badge className={`text-[8px] h-4 ml-auto ${diff.class}`}>{diff.label}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── Saved Tab ─── */}
            {sidebarTab === 'saved' && (
              <div className="p-3 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[hsl(var(--admin-text-muted))]" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar workflow..."
                    className="h-8 pl-8 text-xs bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border)/0.5)]"
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--admin-text-muted))]" />
                  </div>
                ) : filteredWorkflows.length === 0 ? (
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-4">
                    {searchQuery ? 'Nenhum resultado' : 'Nenhum workflow salvo'}
                  </p>
                ) : filteredWorkflows.map(wf => (
                  <div
                    key={wf.id}
                    className={`rounded-lg border p-3 transition-all ${currentWorkflow?.id === wf.id ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.1)]' : 'border-[hsl(var(--admin-card-border)/0.5)] hover:border-[hsl(var(--admin-accent-purple)/0.3)]'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white truncate cursor-pointer" onClick={() => loadWorkflow(wf)}>{wf.name}</span>
                      <Switch checked={wf.is_active} onCheckedChange={v => toggleActive(wf.id!, v)} />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px] h-4">
                        {TRIGGER_EVENTS.find(t => t.value === wf.trigger_event)?.label || wf.trigger_event}
                      </Badge>
                      {wf.is_active && <span className="flex items-center gap-1 text-[9px] text-green-400"><Activity className="h-2.5 w-2.5" />Ativo</span>}
                    </div>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                      {wf.steps.length} passos • {wf.run_count || 0} exec.
                      {wf.last_run_at && ` • ${timeAgo(wf.last_run_at)}`}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => loadWorkflow(wf)}>Editar</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => {
                        loadWorkflow({ ...wf, id: undefined, name: `${wf.name} (cópia)` });
                      }}><Copy className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-destructive" onClick={() => setDeleteConfirmId(wf.id!)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── History Tab ─── */}
            {sidebarTab === 'history' && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">Execuções recentes</p>
                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => loadExecutions(currentWorkflow?.id)}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>

                {loadingExecs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--admin-text-muted))]" />
                  </div>
                ) : executions.length === 0 ? (
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] text-center py-4">Nenhuma execução encontrada</p>
                ) : executions.map(exec => {
                  const wfName = workflows.find(w => w.id === exec.workflow_id)?.name || 'Workflow';
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-700',
                    running: 'bg-blue-500/10 text-blue-400 border-blue-700',
                    completed: 'bg-green-500/10 text-green-400 border-green-700',
                    failed: 'bg-red-500/10 text-red-400 border-red-700',
                    paused: 'bg-gray-500/10 text-gray-400 border-gray-700',
                  };
                  const statusLabels: Record<string, string> = {
                    pending: 'Pendente', running: 'Executando', completed: 'Concluído', failed: 'Falhou', paused: 'Pausado',
                  };

                  return (
                    <div key={exec.id} className="rounded-lg border border-[hsl(var(--admin-card-border)/0.5)] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white truncate">{wfName}</span>
                        <Badge className={`text-[8px] h-4 ${statusColors[exec.status] || statusColors.pending}`}>
                          {statusLabels[exec.status] || exec.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                        Passo {exec.current_step_index + 1} • {timeAgo(exec.started_at)}
                      </p>
                      {exec.error_message && (
                        <p className="text-[10px] text-red-400 truncate">⚠ {exec.error_message}</p>
                      )}
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

        {/* ─── Canvas ─── */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {!currentWorkflow ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple)/0.3)] to-[hsl(var(--admin-accent-blue)/0.3)] animate-pulse" />
                  <div className="absolute inset-2 rounded-xl bg-[hsl(var(--admin-card))] flex items-center justify-center">
                    <Zap className="h-8 w-8 text-[hsl(var(--admin-accent-purple))]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Editor Visual de Workflows</h3>
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-6">
                  Automatize comunicações com seus clientes. Selecione um modelo pronto ou crie do zero.
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button onClick={() => newWorkflow()} className="gap-2">
                    <Plus className="h-4 w-4" />Novo Workflow
                  </Button>
                  <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
                    <Upload className="h-4 w-4" />Importar JSON
                  </Button>
                </div>
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

              {showMiniMap && (
                <MiniMap
                  nodeStrokeColor="hsl(var(--admin-card-border))"
                  nodeColor="hsl(var(--admin-accent-purple) / 0.3)"
                  maskColor="hsl(var(--admin-bg) / 0.8)"
                  className="!bg-[hsl(var(--admin-card))] !border-[hsl(var(--admin-card-border))]"
                />
              )}

              {/* Top panel: workflow meta */}
              <Panel position="top-left" className="flex items-center gap-2 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur border border-[hsl(var(--admin-card-border))] rounded-xl px-3 py-2 shadow-lg">
                <Input
                  value={currentWorkflow.name}
                  onChange={e => { setCurrentWorkflow({ ...currentWorkflow, name: e.target.value }); setHasUnsavedChanges(true); }}
                  placeholder="Nome do workflow"
                  className="h-7 w-40 text-xs bg-transparent border-none focus-visible:ring-0 px-0 font-semibold"
                />
                <div className="h-4 w-px bg-[hsl(var(--admin-card-border))]" />
                <Select
                  value={currentWorkflow.trigger_event}
                  onValueChange={v => {
                    setCurrentWorkflow({ ...currentWorkflow, trigger_event: v });
                    setNodes(nds => nds.map(n => n.type === 'trigger' ? { ...n, data: { ...n.data, trigger_event: v } } : n));
                    setHasUnsavedChanges(true);
                  }}
                >
                  <SelectTrigger className="h-7 w-40 text-[11px] border-none bg-transparent"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-4 w-px bg-[hsl(var(--admin-card-border))]" />
                <Switch checked={currentWorkflow.is_active} onCheckedChange={v => { setCurrentWorkflow({ ...currentWorkflow, is_active: v }); setHasUnsavedChanges(true); }} />
                <span className={`text-[10px] ${currentWorkflow.is_active ? 'text-green-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                  {currentWorkflow.is_active ? 'Ativo' : 'Inativo'}
                </span>
                {hasUnsavedChanges && <span className="text-[9px] text-yellow-400 ml-1">● Não salvo</span>}
              </Panel>

              {/* Top-right toolbar */}
              <Panel position="top-right" className="flex items-center gap-1 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur border border-[hsl(var(--admin-card-border))] rounded-xl px-2 py-1.5 shadow-lg">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={undo} disabled={undoStack.length === 0}>
                      <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={redo} disabled={redoStack.length === 0}>
                      <Redo2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refazer (Ctrl+Y)</TooltipContent>
                </Tooltip>
                <div className="w-px h-4 bg-[hsl(var(--admin-card-border)/0.3)]" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={autoLayout}>
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Auto-organizar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => fitView({ padding: 0.2, duration: 300 })}>
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Ajustar zoom</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className={`h-7 w-7 ${showMiniMap ? 'text-[hsl(var(--admin-accent-purple))]' : ''}`} onClick={() => setShowMiniMap(!showMiniMap)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Minimapa</TooltipContent>
                </Tooltip>
                <div className="w-px h-4 bg-[hsl(var(--admin-card-border)/0.3)]" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowDescDialog(true)}>
                      <Info className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Descrição</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={exportWorkflow}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exportar JSON</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowImportDialog(true)}>
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Importar JSON</TooltipContent>
                </Tooltip>
                <div className="w-px h-4 bg-[hsl(var(--admin-card-border)/0.3)]" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={testWorkflow} disabled={testingWorkflow || !currentWorkflow?.id}>
                      {testingWorkflow ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TestTube2 className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Testar workflow</TooltipContent>
                </Tooltip>
                <Button size="sm" onClick={saveWorkflow} disabled={saving} className="h-7 gap-1.5 ml-1 text-[11px]">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Salvar
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
                {/* Node type badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{selectedNode.type?.replace('send_', '').replace('_', ' ').toUpperCase()}</Badge>
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">ID: {selectedNode.id.slice(0, 12)}</span>
                </div>

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
                          <SelectItem key={t.value} value={t.value}>
                            <span className="flex items-center gap-2"><t.icon className="h-3.5 w-3.5" />{t.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                      {TRIGGER_EVENTS.find(t => t.value === (selectedNode.data.trigger_event as string))?.description}
                    </p>
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
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                      O workflow pausará por este período antes de continuar ao próximo passo.
                    </p>
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
                      {(selectedNode.type === 'send_email' ? emailTemplates : whatsTemplates).length === 0 && (
                        <p className="text-[10px] text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Nenhum template encontrado. Crie um na aba de Templates.
                        </p>
                      )}
                    </div>

                    {/* Template preview */}
                    {selectedNode.data.template_id && (() => {
                      const list = selectedNode.type === 'send_email' ? emailTemplates : whatsTemplates;
                      const tpl = list.find(t => t.id === (selectedNode.data.template_id as string));
                      if (!tpl) return (
                        <p className="text-[10px] text-red-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Template não encontrado ou desativado
                        </p>
                      );
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
                              <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Variáveis</label>
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
                      Saída SIM (verde) e NÃO (vermelho) permitem ramificações condicionais.
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
                      Verifica status real no banco de dados.
                    </p>
                  </div>
                )}

                {/* Schedule config */}
                {selectedNode.type === 'schedule' && (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Horário (BRT)</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number" min={0} max={23} className="w-20"
                        value={(selectedNode.data.schedule_hour as number) ?? 8}
                        onChange={e => updateSelectedNode({ schedule_hour: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-lg text-[hsl(var(--admin-text-muted))]">:</span>
                      <Input
                        type="number" min={0} max={59} className="w-20"
                        value={(selectedNode.data.schedule_minute as number) ?? 0}
                        onChange={e => updateSelectedNode({ schedule_minute: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">
                      Pausa e continua no próximo dia no horário definido.
                    </p>
                  </div>
                )}

                {/* Loop config */}
                {selectedNode.type === 'loop' && (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Máx. repetições</label>
                    <Input
                      type="number" min={1} max={30}
                      value={(selectedNode.data.max_loops as number) || 5}
                      onChange={e => updateSelectedNode({ max_loops: parseInt(e.target.value) || 1, loop_label: `Repetir até ${e.target.value}x` })}
                    />
                    <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Descrição</label>
                    <Input
                      value={(selectedNode.data.loop_label as string) || ''}
                      onChange={e => updateSelectedNode({ loop_label: e.target.value })}
                      placeholder="Ex: Repetir cobrança 5x"
                    />
                  </div>
                )}

                {/* Delete button */}
                {selectedNode.type !== 'trigger' && (
                  <div className="pt-3 border-t border-[hsl(var(--admin-card-border)/0.3)]">
                    <Button variant="destructive" size="sm" className="w-full gap-2" onClick={deleteSelectedNode}>
                      <Trash2 className="h-3.5 w-3.5" />Remover nó
                    </Button>
                    <p className="text-[9px] text-[hsl(var(--admin-text-muted))] mt-1.5 text-center">
                      Os nós adjacentes serão reconectados automaticamente.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ─── Dialogs ─── */}

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todas as execuções pendentes deste workflow serão canceladas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Validation dialog */}
        <Dialog open={showValidation} onOpenChange={setShowValidation}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />Validação do Workflow
              </DialogTitle>
              <DialogDescription>Corrija os problemas antes de salvar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validationIssues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${issue.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {issue.type === 'error' ? <X className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowValidation(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Description dialog */}
        <Dialog open={showDescDialog} onOpenChange={setShowDescDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Descrição do Workflow</DialogTitle>
            </DialogHeader>
            <Textarea
              value={currentWorkflow?.description || ''}
              onChange={e => currentWorkflow && setCurrentWorkflow({ ...currentWorkflow, description: e.target.value })}
              placeholder="Descreva o objetivo deste workflow..."
              rows={4}
            />
            <div className="space-y-2">
              <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Delay inicial (minutos)</label>
              <Input
                type="number" min={0}
                value={currentWorkflow?.trigger_delay_minutes || 0}
                onChange={e => currentWorkflow && setCurrentWorkflow({ ...currentWorkflow, trigger_delay_minutes: parseInt(e.target.value) || 0 })}
              />
              <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Tempo de espera antes de iniciar o primeiro passo após o gatilho.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowDescDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Importar Workflow</DialogTitle>
              <DialogDescription>Cole o JSON de um workflow exportado.</DialogDescription>
            </DialogHeader>
            <Textarea
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              placeholder='{"name": "...", "trigger_event": "...", "steps": [...]}'
              rows={8}
              className="font-mono text-xs"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportJson(''); }}>Cancelar</Button>
              <Button onClick={importWorkflow} disabled={!importJson.trim()}>Importar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* ─── Export wrapped with provider ─── */
export default function VisualWorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
