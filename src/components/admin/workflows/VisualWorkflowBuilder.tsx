import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant,
  addEdge, useNodesState, useEdgesState,
  type Connection, type Edge, type Node, MarkerType, Panel,
  useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Plus, Save, Zap, X, Download, Upload, AlertTriangle,
  Undo2, Redo2, Loader2, TestTube2, Maximize2, Map, Settings,
  Workflow, Sparkles,
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

import WorkflowSidebar, { type SidebarTab } from './WorkflowSidebar';
import WorkflowNodeConfig from './WorkflowNodeConfig';
import {
  useWorkflows, stepsToFlow, flowToSteps, validateWorkflow,
  type WorkflowMeta, type PresetDef, type ValidationIssue,
} from '@/hooks/useWorkflows';

const NODE_TYPES = {
  trigger: TriggerNode, send_email: EmailNode, send_whatsapp: WhatsAppNode,
  delay: DelayNode, condition: ConditionNode, check_status: CheckStatusNode,
  loop: LoopNode, schedule: ScheduleNode, update_order_status: UpdateOrderStatusNode,
  create_coupon: CreateCouponNode, http_webhook: HttpWebhookNode,
  add_tag: AddTagNode, wait_for_event: WaitForEventNode,
};

const uid = () => crypto.randomUUID().slice(0, 8);

const EDGE_DEFAULTS = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2, stroke: 'hsl(270 60% 60% / 0.4)' },
};

const delayToMinutes = (value: number, unit: string) => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

/* ─── Inner Component ─── */
function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowMeta | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('nodes');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [saving, setSaving] = useState(false);
  const [testingWorkflow, setTestingWorkflow] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDescDialog, setShowDescDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Undo/Redo
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const {
    loading, workflows, emailTemplates, whatsTemplates,
    executions, loadingExecs, loadExecutions,
    saveWorkflow: hookSave, deleteWorkflow: hookDelete,
    toggleActive, testWorkflow: hookTest, metrics, reload,
  } = useWorkflows();

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

  const handleSave = useCallback(async () => {
    if (!currentWorkflow) return toast.error('Nenhum workflow aberto');
    const issues = validateWorkflow(nodes, edges, currentWorkflow, emailTemplates, whatsTemplates);
    const errors = issues.filter(i => i.type === 'error');
    if (errors.length > 0) {
      setValidationIssues(issues);
      setShowValidation(true);
      return toast.error(`${errors.length} erro(s) encontrado(s)`);
    }
    setSaving(true);
    const result = await hookSave(currentWorkflow, nodes, edges);
    setSaving(false);
    if (result.success) {
      if (!currentWorkflow.id && result.id) {
        setCurrentWorkflow(prev => prev ? { ...prev, id: result.id } : prev);
      }
      setHasUnsavedChanges(false);
    }
  }, [currentWorkflow, nodes, edges, hookSave, emailTemplates, whatsTemplates]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, handleSave]);

  const onConnect = useCallback((params: Connection) => {
    pushUndo();
    setEdges(eds => addEdge({ ...params, ...EDGE_DEFAULTS }, eds));
  }, [setEdges, pushUndo]);

  const onNodeClick = useCallback((_: any, node: Node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const addNode = useCallback((type: string) => {
    pushUndo();
    const newId = `step-${uid()}`;
    const maxY = nodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    const newNode: Node = {
      id: newId, type,
      position: { x: 300, y: maxY + 150 },
      data: {
        id: newId.replace('step-', ''), type,
        template_id: '', template_name: '',
        delay_value: 30, delay_unit: 'minutes', delay_minutes: 30,
        condition_label: 'Pagamento confirmado?',
      },
    };
    setNodes(nds => [...nds, newNode]);
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
    if (lastNode) {
      setEdges(eds => addEdge({ id: `e-${lastNode.id}-${newId}`, source: lastNode.id, target: newId, ...EDGE_DEFAULTS }, eds));
    }
  }, [nodes, setNodes, setEdges, pushUndo]);

  const newWorkflow = useCallback((triggerEvent = 'abandoned_cart') => {
    setNodes([{
      id: 'trigger-0', type: 'trigger',
      position: { x: 300, y: 40 },
      data: { trigger_event: triggerEvent },
      deletable: false,
    }]);
    setEdges([]);
    setCurrentWorkflow({ name: '', description: '', trigger_event: triggerEvent, trigger_delay_minutes: 0, is_active: false });
    setSelectedNode(null);
    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
  }, [setNodes, setEdges]);

  const loadPreset = useCallback((preset: PresetDef) => {
    const steps = preset.steps.map((s: any) => ({
      ...s, id: uid(), template_id: '',
      channel: s.type === 'send_email' ? 'email' : s.type === 'send_whatsapp' ? 'whatsapp' : undefined,
      delay_minutes: s.delay_value ? delayToMinutes(s.delay_value, s.delay_unit || 'minutes') : undefined,
    }));
    const { nodes: n, edges: e } = stepsToFlow(steps, preset.trigger_event);
    setNodes(n);
    setEdges(e);
    setCurrentWorkflow({ name: preset.name, description: preset.description, trigger_event: preset.trigger_event, trigger_delay_minutes: 0, is_active: false });
    setSelectedNode(null);
    setHasUnsavedChanges(true);
    toast.success(`Modelo "${preset.name}" carregado`);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  const loadWorkflow = useCallback((wf: WorkflowMeta & { steps: any[] }) => {
    const { nodes: n, edges: e } = stepsToFlow(wf.steps || [], wf.trigger_event);
    setNodes(n);
    setEdges(e);
    setCurrentWorkflow({ ...wf });
    setSelectedNode(null);
    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    await hookDelete(deleteConfirmId);
    if (currentWorkflow?.id === deleteConfirmId) {
      setCurrentWorkflow(null);
      setNodes([]);
      setEdges([]);
    }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, currentWorkflow, setNodes, setEdges, hookDelete]);

  const handleTest = useCallback(async () => {
    if (!currentWorkflow) return;
    setTestingWorkflow(true);
    const ok = await hookTest(currentWorkflow);
    if (ok) setSidebarTab('history');
    setTestingWorkflow(false);
  }, [currentWorkflow, hookTest]);

  const updateSelectedNode = useCallback((patch: Record<string, any>) => {
    if (!selectedNode) return;
    pushUndo();
    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...patch } } : null);
  }, [selectedNode, setNodes, pushUndo]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === 'trigger') return;
    pushUndo();
    const inEdge = edges.find(e => e.target === selectedNode.id);
    const outEdge = edges.find(e => e.source === selectedNode.id);
    let newEdges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);
    if (inEdge && outEdge) {
      newEdges = [...newEdges, { id: `e-${inEdge.source}-${outEdge.target}`, source: inEdge.source, target: outEdge.target, ...EDGE_DEFAULTS }];
    }
    setEdges(newEdges);
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, edges, setNodes, setEdges, pushUndo]);

  const autoLayout = useCallback(() => {
    pushUndo();
    const steps = flowToSteps(nodes, edges);
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (!triggerNode) return;
    const newNodes = [{ ...triggerNode, position: { x: 300, y: 40 } }];
    let prevId = triggerNode.id;
    const newEdges: Edge[] = [];
    steps.forEach((step, i) => {
      const node = nodes.find(n => n.id === `step-${step.id}` || n.data.id === step.id);
      if (node) {
        newNodes.push({ ...node, position: { x: 300, y: 180 + i * 150 } });
        newEdges.push({ id: `e-${prevId}-${node.id}`, source: prevId, target: node.id, ...EDGE_DEFAULTS });
        prevId = node.id;
      }
    });
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodes, edges, setNodes, setEdges, fitView, pushUndo]);

  const exportWorkflow = useCallback(() => {
    if (!currentWorkflow) return;
    const steps = flowToSteps(nodes, edges);
    const blob = new Blob([JSON.stringify({ ...currentWorkflow, steps, exported_at: new Date().toISOString(), version: '1.0' }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workflow-${currentWorkflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    toast.success('Workflow exportado');
  }, [currentWorkflow, nodes, edges]);

  const importWorkflow = useCallback(() => {
    try {
      const data = JSON.parse(importJson);
      if (!data.trigger_event || !data.steps) throw new Error('Formato inválido');
      const steps = data.steps.map((s: any) => ({ ...s, id: uid() }));
      const { nodes: n, edges: e } = stepsToFlow(steps, data.trigger_event);
      setNodes(n);
      setEdges(e);
      setCurrentWorkflow({ name: data.name || 'Importado', description: data.description || '', trigger_event: data.trigger_event, trigger_delay_minutes: data.trigger_delay_minutes || 0, is_active: false });
      setShowImportDialog(false);
      setImportJson('');
      setHasUnsavedChanges(true);
      toast.success('Workflow importado');
    } catch { toast.error('JSON inválido'); }
  }, [importJson, setNodes, setEdges]);

  return (
    <TooltipProvider>
      <div className="flex rounded-2xl border border-white/[0.06] bg-[hsl(var(--admin-card))] overflow-hidden shadow-2xl shadow-black/20" style={{ height: 'calc(100vh - 180px)', minHeight: 600 }}>
        {/* ─── Sidebar ─── */}
        <WorkflowSidebar
          tab={sidebarTab}
          onTabChange={setSidebarTab}
          onAddNode={addNode}
          onNewWorkflow={newWorkflow}
          onLoadPreset={loadPreset}
          onLoadWorkflow={loadWorkflow}
          onDeleteWorkflow={id => setDeleteConfirmId(id)}
          onToggleActive={toggleActive}
          onLoadExecutions={loadExecutions}
          workflows={workflows}
          executions={executions}
          currentWorkflowId={currentWorkflow?.id}
          loading={loading}
          loadingExecs={loadingExecs}
          metrics={metrics}
        />

        {/* ─── Canvas Area ─── */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {!currentWorkflow ? (
            /* ── Empty State ── */
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--admin-bg))] via-[hsl(var(--admin-bg))] to-violet-950/10">
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              
              <div className="relative text-center max-w-lg px-8">
                {/* Icon */}
                <div className="relative mx-auto w-28 h-28 mb-10">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl animate-pulse" />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20" />
                  <div className="absolute inset-4 rounded-2xl bg-[hsl(var(--admin-card))] flex items-center justify-center border border-white/[0.06]">
                    <Workflow className="h-12 w-12 text-violet-400" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Centro de Automação</h2>
                <p className="text-sm text-white/40 mb-10 leading-relaxed max-w-sm mx-auto">
                  Automatize comunicações com seus clientes usando fluxos visuais inteligentes. Selecione um modelo pronto ou crie do zero.
                </p>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button onClick={() => newWorkflow()} size="lg" className="gap-2.5 h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/20 text-sm font-semibold">
                    <Plus className="h-4 w-4" />Novo Workflow
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setShowImportDialog(true)} className="gap-2.5 h-12 px-8 rounded-xl border-white/[0.08] hover:bg-white/[0.04] text-sm font-semibold">
                    <Upload className="h-4 w-4" />Importar JSON
                  </Button>
                </div>

                {/* Quick tips */}
                <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {[
                    { icon: Sparkles, label: 'Modelos prontos', desc: 'Use a aba Modelos' },
                    { icon: Zap, label: 'Atalhos', desc: 'Ctrl+S, Ctrl+Z' },
                    { icon: TestTube2, label: 'Teste seguro', desc: 'Simule antes de ativar' },
                  ].map(tip => (
                    <div key={tip.label} className="text-center">
                      <tip.icon className="h-5 w-5 text-white/15 mx-auto mb-2" />
                      <p className="text-[10px] font-semibold text-white/30">{tip.label}</p>
                      <p className="text-[9px] text-white/15">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes} edges={edges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView snapToGrid snapGrid={[20, 20]} deleteKeyCode="Delete"
              className="bg-[hsl(var(--admin-bg))]"
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(0 0% 100% / 0.04)" />
              <Controls className="!bg-[hsl(var(--admin-card))] !border-white/[0.06] !shadow-xl !rounded-xl [&>button]:!bg-[hsl(var(--admin-card))] [&>button]:!border-white/[0.06] [&>button]:!text-white/50 [&>button:hover]:!bg-white/[0.06] [&>button:hover]:!text-white" />

              {showMiniMap && (
                <MiniMap
                  nodeStrokeColor="hsl(0 0% 100% / 0.1)"
                  nodeColor="hsl(270 60% 60% / 0.2)"
                  maskColor="hsl(var(--admin-bg) / 0.85)"
                  className="!bg-[hsl(var(--admin-card))] !border-white/[0.06] !rounded-xl"
                />
              )}

              {/* ── Top-left: Name & Status ── */}
              <Panel position="top-left" className="flex items-center gap-2.5 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/20">
                <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                <Input
                  value={currentWorkflow.name}
                  onChange={e => { setCurrentWorkflow({ ...currentWorkflow, name: e.target.value }); setHasUnsavedChanges(true); }}
                  placeholder="Nome do workflow..."
                  className="h-8 w-56 text-sm font-bold bg-transparent border-none focus-visible:ring-0 px-1 text-white placeholder:text-white/20"
                />
                {hasUnsavedChanges && <Badge className="text-[8px] h-[18px] bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">Alterado</Badge>}
                {currentWorkflow.is_active && <Badge className="text-[8px] h-[18px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">Ativo</Badge>}
              </Panel>

              {/* ── Top-right: Toolbar ── */}
              <Panel position="top-right" className="flex items-center gap-1 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur-xl border border-white/[0.08] rounded-xl px-2.5 py-1.5 shadow-2xl shadow-black/20">
                <ToolbarBtn icon={Undo2} tooltip="Desfazer (Ctrl+Z)" onClick={undo} disabled={undoStack.length === 0} />
                <ToolbarBtn icon={Redo2} tooltip="Refazer (Ctrl+Y)" onClick={redo} disabled={redoStack.length === 0} />
                <ToolbarDivider />
                <ToolbarBtn icon={Maximize2} tooltip="Auto-layout" onClick={autoLayout} />
                <ToolbarBtn icon={Map} tooltip="MiniMap" onClick={() => setShowMiniMap(!showMiniMap)} active={showMiniMap} />
                <ToolbarBtn icon={Settings} tooltip="Configurações" onClick={() => setShowDescDialog(true)} />
                <ToolbarDivider />
                <ToolbarBtn icon={Download} tooltip="Exportar JSON" onClick={exportWorkflow} />
                <ToolbarBtn
                  icon={testingWorkflow ? Loader2 : TestTube2}
                  tooltip="Testar workflow"
                  onClick={handleTest}
                  disabled={testingWorkflow || !currentWorkflow?.id}
                  spin={testingWorkflow}
                />

                <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 gap-2 ml-1.5 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-lg shadow-violet-500/15 px-4">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Salvar
                </Button>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {/* ─── Right Panel: Node Config ─── */}
        {selectedNode && currentWorkflow && (
          <WorkflowNodeConfig
            selectedNode={selectedNode}
            currentWorkflow={currentWorkflow}
            emailTemplates={emailTemplates}
            whatsTemplates={whatsTemplates}
            onUpdate={updateSelectedNode}
            onUpdateWorkflow={patch => setCurrentWorkflow(prev => prev ? { ...prev, ...patch } : prev)}
            onDelete={deleteSelectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* ─── Dialogs ─── */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent className="border-white/[0.08]">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. Todas as execuções pendentes serão canceladas.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showValidation} onOpenChange={setShowValidation}>
          <DialogContent className="max-w-md border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" />Validação</DialogTitle>
              <DialogDescription>Corrija os problemas antes de salvar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {validationIssues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${issue.type === 'error' ? 'bg-red-500/5 text-red-400 border border-red-500/10' : 'bg-amber-500/5 text-amber-400 border border-amber-500/10'}`}>
                  {issue.type === 'error' ? <X className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowValidation(false)}>Fechar</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDescDialog} onOpenChange={setShowDescDialog}>
          <DialogContent className="max-w-md border-white/[0.08]">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-violet-400" />Configurações do Workflow</DialogTitle></DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60">Descrição</label>
                <Textarea
                  value={currentWorkflow?.description || ''}
                  onChange={e => currentWorkflow && setCurrentWorkflow({ ...currentWorkflow, description: e.target.value })}
                  placeholder="Descreva o objetivo deste workflow..." rows={3}
                  className="border-white/[0.06]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60">Delay inicial (minutos)</label>
                <Input type="number" min={0} value={currentWorkflow?.trigger_delay_minutes || 0}
                  onChange={e => currentWorkflow && setCurrentWorkflow({ ...currentWorkflow, trigger_delay_minutes: parseInt(e.target.value) || 0 })}
                  className="border-white/[0.06]"
                />
                <p className="text-[10px] text-white/30">Tempo de espera antes de iniciar o primeiro passo.</p>
              </div>
            </div>
            <DialogFooter><Button onClick={() => setShowDescDialog(false)}>Fechar</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-violet-400" />Importar Workflow</DialogTitle>
              <DialogDescription>Cole o JSON de um workflow exportado.</DialogDescription>
            </DialogHeader>
            <Textarea value={importJson} onChange={e => setImportJson(e.target.value)}
              placeholder='{"name": "...", "trigger_event": "...", "steps": [...]}' rows={8} className="font-mono text-xs border-white/[0.06]" />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportJson(''); }}>Cancelar</Button>
              <Button onClick={importWorkflow} disabled={!importJson.trim()} className="bg-gradient-to-r from-violet-600 to-violet-500">Importar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* ─── Toolbar helpers ─── */
function ToolbarBtn({ icon: Icon, tooltip, onClick, disabled, active, spin }: { icon: React.ElementType; tooltip: string; onClick: () => void; disabled?: boolean; active?: boolean; spin?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon" variant="ghost"
          className={`h-8 w-8 rounded-lg ${active ? 'bg-violet-500/15 text-violet-400' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'} disabled:opacity-20`}
          onClick={onClick} disabled={disabled}
        >
          <Icon className={`h-3.5 w-3.5 ${spin ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-white/[0.06] mx-0.5" />;
}

export default function VisualWorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
