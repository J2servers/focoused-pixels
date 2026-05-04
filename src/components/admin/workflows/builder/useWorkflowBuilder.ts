import { useState, useCallback, useEffect } from 'react';
import {
  addEdge, useNodesState, useEdgesState,
  type Connection, type Edge, type Node, MarkerType, useReactFlow,
} from '@xyflow/react';
import { toast } from 'sonner';
import {
  useWorkflows, stepsToFlow, flowToSteps, validateWorkflow,
  type WorkflowMeta, type PresetDef, type ValidationIssue,
} from '@/hooks/useWorkflows';

const uid = () => crypto.randomUUID().slice(0, 8);

export const EDGE_DEFAULTS = {
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

type StepData = { id?: string; type?: string; delay_value?: number; delay_unit?: string; [k: string]: unknown };

export function useWorkflowBuilder() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowMeta | null>(null);
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
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const wf = useWorkflows();

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
    const issues = validateWorkflow(nodes, edges, currentWorkflow, wf.emailTemplates, wf.whatsTemplates);
    const errors = issues.filter(i => i.type === 'error');
    if (errors.length > 0) {
      setValidationIssues(issues);
      setShowValidation(true);
      return toast.error(`${errors.length} erro(s) encontrado(s)`);
    }
    setSaving(true);
    const result = await wf.saveWorkflow(currentWorkflow, nodes, edges);
    setSaving(false);
    if (result.success) {
      if (!currentWorkflow.id && result.id) {
        setCurrentWorkflow(prev => prev ? { ...prev, id: result.id } : prev);
      }
      setHasUnsavedChanges(false);
    }
  }, [currentWorkflow, nodes, edges, wf]);

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
    const steps = preset.steps.map((s: StepData) => ({
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

  const loadWorkflow = useCallback((wfData: WorkflowMeta & { steps: StepData[] }) => {
    const { nodes: n, edges: e } = stepsToFlow(wfData.steps || [], wfData.trigger_event);
    setNodes(n);
    setEdges(e);
    setCurrentWorkflow({ ...wfData });
    setSelectedNode(null);
    setHasUnsavedChanges(false);
    setUndoStack([]);
    setRedoStack([]);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [setNodes, setEdges, fitView]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;
    await wf.deleteWorkflow(deleteConfirmId);
    if (currentWorkflow?.id === deleteConfirmId) {
      setCurrentWorkflow(null);
      setNodes([]);
      setEdges([]);
    }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, currentWorkflow, setNodes, setEdges, wf]);

  const handleTest = useCallback(async () => {
    if (!currentWorkflow) return false;
    setTestingWorkflow(true);
    const ok = await wf.testWorkflow(currentWorkflow);
    setTestingWorkflow(false);
    return ok;
  }, [currentWorkflow, wf]);

  const updateSelectedNode = useCallback((patch: Record<string, unknown>) => {
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
      const node = nodes.find(n => n.id === `step-${step.id}` || (n.data as StepData)?.id === step.id);
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
      const steps = data.steps.map((s: StepData) => ({ ...s, id: uid() }));
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

  return {
    wf,
    nodes, edges, onNodesChange, onEdgesChange,
    selectedNode, setSelectedNode,
    currentWorkflow, setCurrentWorkflow,
    deleteConfirmId, setDeleteConfirmId,
    showValidation, setShowValidation, validationIssues,
    saving, testingWorkflow, hasUnsavedChanges, setHasUnsavedChanges,
    showMiniMap, setShowMiniMap,
    showImportDialog, setShowImportDialog,
    showDescDialog, setShowDescDialog,
    importJson, setImportJson,
    undoStack, redoStack,
    onConnect, undo, redo,
    handleSave, addNode, newWorkflow, loadPreset, loadWorkflow,
    confirmDelete, handleTest, updateSelectedNode, deleteSelectedNode,
    autoLayout, exportWorkflow, importWorkflow,
  };
}
