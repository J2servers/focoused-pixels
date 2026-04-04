import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';

/* ─── Types ─── */
export interface TemplateLite {
  id: string;
  name: string;
  body?: string;
  message_text?: string;
  subject?: string;
}

export interface WorkflowMeta {
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
  steps?: any[];
}

export interface WorkflowExecution {
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

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

/* ─── Constants ─── */
export const TRIGGER_EVENTS = [
  { value: 'abandoned_cart', label: 'Carrinho abandonado', description: 'Quando um carrinho é abandonado' },
  { value: 'order_created', label: 'Pedido criado', description: 'Quando um novo pedido é criado' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Quando pagamento é confirmado' },
  { value: 'boleto_generated', label: 'Boleto gerado', description: 'Quando um boleto é gerado' },
  { value: 'pix_generated', label: 'PIX gerado', description: 'Quando um PIX é gerado' },
  { value: 'post_delivery', label: 'Pós-entrega', description: 'Após confirmação de entrega' },
  { value: 'shipping_sent', label: 'Envio despachado', description: 'Quando o pedido é enviado' },
] as const;

export const DRAGGABLE_NODES = [
  { type: 'send_email', label: 'E-mail', colorKey: 'blue', description: 'Enviar e-mail ao cliente' },
  { type: 'send_whatsapp', label: 'WhatsApp', colorKey: 'green', description: 'Enviar WhatsApp' },
  { type: 'delay', label: 'Aguardar', colorKey: 'orange', description: 'Esperar um tempo' },
  { type: 'condition', label: 'Condição', colorKey: 'violet', description: 'Ramificação condicional' },
  { type: 'check_status', label: 'Verificar', colorKey: 'emerald', description: 'Verificar status real no banco' },
  { type: 'schedule', label: 'Agendar', colorKey: 'cyan', description: 'Agendar para horário específico' },
  { type: 'loop', label: 'Loop', colorKey: 'amber', description: 'Repetir bloco N vezes' },
  { type: 'update_order_status', label: 'Atualizar Pedido', colorKey: 'indigo', description: 'Alterar status do pedido' },
  { type: 'create_coupon', label: 'Criar Cupom', colorKey: 'amber', description: 'Gerar cupom automático' },
  { type: 'http_webhook', label: 'Webhook', colorKey: 'rose', description: 'Chamar API externa via HTTP' },
  { type: 'add_tag', label: 'Tag Lead', colorKey: 'teal', description: 'Adicionar/remover tag do lead' },
  { type: 'wait_for_event', label: 'Aguardar Evento', colorKey: 'sky', description: 'Esperar evento acontecer' },
] as const;

export interface PresetDef {
  name: string;
  description: string;
  trigger_event: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  steps: any[];
}

export const PRESET_CATEGORIES = [
  { key: 'vendas', label: 'Vendas' },
  { key: 'recuperacao', label: 'Recuperação' },
  { key: 'pos_venda', label: 'Pós-venda' },
  { key: 'leads', label: 'Leads' },
  { key: 'logistica', label: 'Logística' },
] as const;

export const PRESETS: PresetDef[] = [
  { name: 'Cobrança boleto diária', description: 'Cobra 8h AM, verifica pagamento, repete até vencer', trigger_event: 'boleto_generated', category: 'vendas', difficulty: 'advanced', steps: [
    { type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' },
    { type: 'schedule', schedule_hour: 8, schedule_minute: 0 }, { type: 'check_status', check_type: 'payment_confirmed', condition_label: 'Pagamento confirmado?' },
    { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }, { type: 'send_email', template_name: 'Lembrete de boleto' },
    { type: 'loop', max_loops: 5, loop_label: 'Repetir cobrança 5x' },
  ] },
  { name: 'Boleto completo', description: 'WhatsApp + e-mail + lembrete', trigger_event: 'boleto_generated', category: 'vendas', difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' }, { type: 'delay', delay_value: 2, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }] },
  { name: 'Confirmação PIX', description: 'WhatsApp + e-mail após PIX', trigger_event: 'pix_generated', category: 'vendas', difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'PIX confirmado' }, { type: 'delay', delay_value: 5, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'PIX confirmado' }] },
  { name: 'Pedido confirmado', description: 'Multicanal ao criar pedido', trigger_event: 'order_created', category: 'vendas', difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Pedido criado' }, { type: 'delay', delay_value: 2, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'Pedido criado' }] },
  { name: 'Pagamento + produção', description: 'Confirmação e produção', trigger_event: 'payment_confirmed', category: 'vendas', difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Pagamento confirmado' }, { type: 'send_email', template_name: 'Pagamento confirmado' }, { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Produção iniciada' }] },
  { name: 'Recuperação agressiva', description: '3 tentativas em 24h', trigger_event: 'abandoned_cart', category: 'recuperacao', difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 2, delay_unit: 'hours' }, { type: 'send_email', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 22, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Lembrete de carrinho com urgência' }] },
  { name: 'Recuperação com verificação', description: 'Verifica carrinho antes de cobrar', trigger_event: 'abandoned_cart', category: 'recuperacao', difficulty: 'advanced', steps: [
    { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 23, delay_unit: 'hours' },
    { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' }, { type: 'send_email', template_name: 'Lembrete de carrinho com urgência' },
  ] },
  { name: 'Pós-entrega + avaliação', description: 'Avaliação e cupom recompra', trigger_event: 'post_delivery', category: 'pos_venda', difficulty: 'medium', steps: [{ type: 'send_whatsapp', template_name: 'Pós-venda com avaliação' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Solicitar avaliação' }, { type: 'delay', delay_value: 7, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }] },
  { name: 'Recompra VIP 30d', description: 'Cupom 30 dias após entrega', trigger_event: 'post_delivery', category: 'pos_venda', difficulty: 'easy', steps: [{ type: 'delay', delay_value: 30, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Recompra VIP' }] },
  { name: 'Boas-vindas lead', description: 'Cupom primeira compra', trigger_event: 'order_created', category: 'leads', difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Boas-vindas com cupom' }, { type: 'delay', delay_value: 1, delay_unit: 'days' }, { type: 'send_email', template_name: 'Boas-vindas' }] },
  { name: 'Notificação de envio', description: 'Aviso com rastreio', trigger_event: 'shipping_sent', category: 'logistica', difficulty: 'easy', steps: [{ type: 'send_whatsapp', template_name: 'Pedido enviado com rastreio' }, { type: 'send_email', template_name: 'Pedido enviado' }] },
];

/* ─── Utilities ─── */
const uid = () => crypto.randomUUID().slice(0, 8);

const EDGE_STYLE = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
};

const delayToMinutes = (value: number, unit: string) => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

export function stepsToFlow(steps: any[], triggerEvent: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const triggerNodeId = 'trigger-0';
  nodes.push({
    id: triggerNodeId, type: 'trigger',
    position: { x: 300, y: 40 },
    data: { trigger_event: triggerEvent },
    deletable: false,
  });

  let prevId = triggerNodeId;
  steps.forEach((step, i) => {
    const nodeId = `step-${step.id || uid()}`;
    nodes.push({ id: nodeId, type: step.type, position: { x: 300, y: 180 + i * 150 }, data: { ...step } });
    edges.push({ id: `e-${prevId}-${nodeId}`, source: prevId, target: nodeId, ...EDGE_STYLE });
    prevId = nodeId;
  });

  return { nodes, edges };
}

export function flowToSteps(nodes: Node[], edges: Edge[]): any[] {
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

    const step: any = { id: node.id.replace('step-', ''), type: node.type, ...node.data };
    if (node.type === 'delay') step.delay_minutes = delayToMinutes(step.delay_value || 30, step.delay_unit || 'minutes');
    if (node.type === 'send_email') step.channel = 'email';
    if (node.type === 'send_whatsapp') step.channel = 'whatsapp';
    delete step.trigger_event;
    steps.push(step);
    currentId = children[currentId];
  }

  return steps;
}

export function validateWorkflow(nodes: Node[], edges: Edge[], meta: WorkflowMeta, emailTemplates: TemplateLite[], whatsTemplates: TemplateLite[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!meta.name.trim()) issues.push({ type: 'error', message: 'Nome do workflow é obrigatório' });

  const actionNodes = nodes.filter(n => n.type !== 'trigger');
  if (actionNodes.length === 0) issues.push({ type: 'error', message: 'Adicione ao menos um passo ao workflow' });

  const connectedIds = new Set<string>();
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
  actionNodes.forEach(n => {
    if (!connectedIds.has(n.id)) issues.push({ type: 'warning', message: `Nó "${n.type}" está desconectado`, nodeId: n.id });
  });

  actionNodes.forEach(n => {
    if (n.type === 'send_email' && !n.data.template_id) issues.push({ type: 'warning', message: 'Nó de e-mail sem template', nodeId: n.id });
    if (n.type === 'send_whatsapp' && !n.data.template_id) issues.push({ type: 'warning', message: 'Nó de WhatsApp sem template', nodeId: n.id });
    if (n.type === 'send_email' && n.data.template_id && !emailTemplates.find(t => t.id === n.data.template_id)) issues.push({ type: 'error', message: 'Template de e-mail não encontrado', nodeId: n.id });
    if (n.type === 'send_whatsapp' && n.data.template_id && !whatsTemplates.find(t => t.id === n.data.template_id)) issues.push({ type: 'error', message: 'Template de WhatsApp não encontrado', nodeId: n.id });
  });

  const steps = flowToSteps(nodes, edges);
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1];
    const curr = steps[i];
    if (['send_email', 'send_whatsapp'].includes(prev.type) && ['send_email', 'send_whatsapp'].includes(curr.type)) {
      issues.push({ type: 'warning', message: `Envios consecutivos sem delay (passos ${i} e ${i + 1})` });
    }
  }

  return issues;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

/* ─── Hook ─── */
export function useWorkflows() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<(WorkflowMeta & { steps: any[] })[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<TemplateLite[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<TemplateLite[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);

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
    const query = supabase.from('workflow_executions').select('*').order('created_at', { ascending: false }).limit(50);
    if (workflowId) query.eq('workflow_id', workflowId);
    const { data } = await query;
    setExecutions((data || []) as WorkflowExecution[]);
    setLoadingExecs(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveWorkflow = useCallback(async (meta: WorkflowMeta, nodes: Node[], edges: Edge[]) => {
    const issues = validateWorkflow(nodes, edges, meta, emailTemplates, whatsTemplates);
    const errors = issues.filter(i => i.type === 'error');
    if (errors.length > 0) return { success: false, issues };

    const steps = flowToSteps(nodes, edges);
    const triggerNode = nodes.find(n => n.type === 'trigger');
    const payload = {
      name: meta.name,
      description: meta.description || null,
      trigger_event: (triggerNode?.data?.trigger_event as string) || meta.trigger_event,
      trigger_delay_minutes: meta.trigger_delay_minutes,
      steps: steps as any,
      is_active: meta.is_active,
    };

    const { data, error } = meta.id
      ? await supabase.from('automation_workflows').update(payload).eq('id', meta.id).select().single()
      : await supabase.from('automation_workflows').insert(payload).select().single();

    if (error) { toast.error('Erro ao salvar: ' + error.message); return { success: false, issues }; }

    const warnings = issues.filter(i => i.type === 'warning');
    if (warnings.length > 0) toast.warning(`Salvo com ${warnings.length} aviso(s)`);
    else toast.success('Workflow salvo com sucesso!');

    loadData();
    return { success: true, issues, id: (data as any)?.id || meta.id };
  }, [emailTemplates, whatsTemplates, loadData]);

  const deleteWorkflow = useCallback(async (id: string) => {
    await supabase.from('automation_workflows').delete().eq('id', id);
    toast.success('Workflow excluído');
    loadData();
  }, [loadData]);

  const toggleActive = useCallback(async (id: string, active: boolean) => {
    await supabase.from('automation_workflows').update({ is_active: active }).eq('id', id);
    toast.success(active ? 'Workflow ativado' : 'Workflow desativado');
    loadData();
  }, [loadData]);

  const testWorkflow = useCallback(async (meta: WorkflowMeta) => {
    if (!meta.id) { toast.error('Salve o workflow antes de testar'); return false; }
    try {
      const { data, error } = await supabase.functions.invoke('execute-workflow', {
        body: {
          action: 'trigger',
          trigger_event: meta.trigger_event,
          trigger_data: {
            customer_name: 'Teste Workflow', customer_email: 'teste@exemplo.com',
            customer_phone: '11999999999', order_number: 'TEST-' + Date.now(),
            amount: '99.90', is_test: true,
          },
        },
      });
      if (error) throw error;
      toast.success(`Teste disparado! ${data?.count || 0} workflow(s) acionado(s)`);
      loadExecutions(meta.id);
      return true;
    } catch (err: any) {
      toast.error('Erro no teste: ' + (err.message || 'Desconhecido'));
      return false;
    }
  }, [loadExecutions]);

  const metrics = useMemo(() => ({
    total: workflows.length,
    active: workflows.filter(w => w.is_active).length,
    totalExecs: workflows.reduce((sum, w) => sum + (w.run_count || 0), 0),
  }), [workflows]);

  return {
    loading, workflows, emailTemplates, whatsTemplates,
    executions, loadingExecs, loadExecutions,
    saveWorkflow, deleteWorkflow, toggleActive, testWorkflow,
    metrics, reload: loadData,
  };
}
