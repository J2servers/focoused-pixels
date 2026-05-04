import { useMemo } from 'react';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant,
  Panel, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Save, Download, Upload, Undo2, Redo2, Loader2,
  TestTube2, Maximize2, Map, Settings,
} from 'lucide-react';

import WorkflowSidebar from './WorkflowSidebar';
import WorkflowNodeConfig from './WorkflowNodeConfig';
import { useWorkflowBuilder } from './builder/useWorkflowBuilder';
import { ToolbarBtn, ToolbarDivider } from './builder/ToolbarPrimitives';
import { WorkflowEmptyState } from './builder/WorkflowEmptyState';
import {
  DeleteWorkflowDialog, ValidationDialog,
  WorkflowSettingsDialog, ImportWorkflowDialog,
} from './builder/BuilderDialogs';
import { NODE_TYPES } from './builder/nodeTypes';

function WorkflowBuilderInner() {
  const b = useWorkflowBuilder();
  const nodeTypes = useMemo(() => NODE_TYPES, []);

  const handleTest = async () => {
    const ok = await b.handleTest();
    if (ok) b.wf.loadExecutions(b.currentWorkflow!.id!);
  };

  return (
    <TooltipProvider>
      <div className="flex rounded-2xl border border-white/[0.06] bg-[hsl(var(--admin-card))] overflow-hidden shadow-2xl shadow-black/20" style={{ height: 'calc(100vh - 180px)', minHeight: 600 }}>
        <WorkflowSidebar
          tab={'nodes'}
          onTabChange={() => {}}
          onAddNode={b.addNode}
          onNewWorkflow={b.newWorkflow}
          onLoadPreset={b.loadPreset}
          onLoadWorkflow={b.loadWorkflow}
          onDeleteWorkflow={id => b.setDeleteConfirmId(id)}
          onToggleActive={b.wf.toggleActive}
          onLoadExecutions={b.wf.loadExecutions}
          workflows={b.wf.workflows}
          executions={b.wf.executions}
          currentWorkflowId={b.currentWorkflow?.id}
          loading={b.wf.loading}
          loadingExecs={b.wf.loadingExecs}
          metrics={b.wf.metrics}
        />

        <div className="flex-1 relative">
          {!b.currentWorkflow ? (
            <WorkflowEmptyState
              onNew={() => b.newWorkflow()}
              onImport={() => b.setShowImportDialog(true)}
            />
          ) : (
            <ReactFlow
              nodes={b.nodes} edges={b.edges}
              onNodesChange={b.onNodesChange} onEdgesChange={b.onEdgesChange}
              onConnect={b.onConnect}
              onNodeClick={(_, node) => b.setSelectedNode(node)}
              onPaneClick={() => b.setSelectedNode(null)}
              nodeTypes={nodeTypes}
              fitView snapToGrid snapGrid={[20, 20]} deleteKeyCode="Delete"
              className="bg-[hsl(var(--admin-bg))]"
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(0 0% 100% / 0.04)" />
              <Controls className="!bg-[hsl(var(--admin-card))] !border-white/[0.06] !shadow-xl !rounded-xl [&>button]:!bg-[hsl(var(--admin-card))] [&>button]:!border-white/[0.06] [&>button]:!text-white/50 [&>button:hover]:!bg-white/[0.06] [&>button:hover]:!text-white" />

              {b.showMiniMap && (
                <MiniMap
                  nodeStrokeColor="hsl(0 0% 100% / 0.1)"
                  nodeColor="hsl(270 60% 60% / 0.2)"
                  maskColor="hsl(var(--admin-bg) / 0.85)"
                  className="!bg-[hsl(var(--admin-card))] !border-white/[0.06] !rounded-xl"
                />
              )}

              <Panel position="top-left" className="flex items-center gap-2.5 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2.5 shadow-2xl shadow-black/20">
                <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                <Input
                  value={b.currentWorkflow.name}
                  onChange={e => { b.setCurrentWorkflow({ ...b.currentWorkflow!, name: e.target.value }); b.setHasUnsavedChanges(true); }}
                  placeholder="Nome do workflow..."
                  className="h-8 w-56 text-sm font-bold bg-transparent border-none focus-visible:ring-0 px-1 text-white placeholder:text-white/20"
                />
                {b.hasUnsavedChanges && <Badge className="text-[8px] h-[18px] bg-amber-500/10 text-amber-400 border-amber-500/20 shrink-0">Alterado</Badge>}
                {b.currentWorkflow.is_active && <Badge className="text-[8px] h-[18px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">Ativo</Badge>}
              </Panel>

              <Panel position="top-right" className="flex items-center gap-1 bg-[hsl(var(--admin-card)/0.95)] backdrop-blur-xl border border-white/[0.08] rounded-xl px-2.5 py-1.5 shadow-2xl shadow-black/20">
                <ToolbarBtn icon={Undo2} tooltip="Desfazer (Ctrl+Z)" onClick={b.undo} disabled={b.undoStack.length === 0} />
                <ToolbarBtn icon={Redo2} tooltip="Refazer (Ctrl+Y)" onClick={b.redo} disabled={b.redoStack.length === 0} />
                <ToolbarDivider />
                <ToolbarBtn icon={Maximize2} tooltip="Auto-layout" onClick={b.autoLayout} />
                <ToolbarBtn icon={Map} tooltip="MiniMap" onClick={() => b.setShowMiniMap(!b.showMiniMap)} active={b.showMiniMap} />
                <ToolbarBtn icon={Settings} tooltip="Configurações" onClick={() => b.setShowDescDialog(true)} />
                <ToolbarDivider />
                <ToolbarBtn icon={Download} tooltip="Exportar JSON" onClick={b.exportWorkflow} />
                <ToolbarBtn
                  icon={b.testingWorkflow ? Loader2 : TestTube2}
                  tooltip="Testar workflow"
                  onClick={handleTest}
                  disabled={b.testingWorkflow || !b.currentWorkflow?.id}
                  spin={b.testingWorkflow}
                />

                <Button size="sm" onClick={b.handleSave} disabled={b.saving} className="admin-btn admin-btn-save !min-h-0 !py-1.5 !px-4 h-8 gap-2 ml-1.5 text-[11px]">
                  {b.saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Salvar
                </Button>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {b.selectedNode && b.currentWorkflow && (
          <WorkflowNodeConfig
            selectedNode={b.selectedNode}
            currentWorkflow={b.currentWorkflow}
            emailTemplates={b.wf.emailTemplates}
            whatsTemplates={b.wf.whatsTemplates}
            onUpdate={b.updateSelectedNode}
            onUpdateWorkflow={patch => b.setCurrentWorkflow(b.currentWorkflow ? { ...b.currentWorkflow, ...patch } : null)}
            onDelete={b.deleteSelectedNode}
            onClose={() => b.setSelectedNode(null)}
          />
        )}

        <DeleteWorkflowDialog
          open={!!b.deleteConfirmId}
          onCancel={() => b.setDeleteConfirmId(null)}
          onConfirm={b.confirmDelete}
        />
        <ValidationDialog
          open={b.showValidation}
          onClose={() => b.setShowValidation(false)}
          issues={b.validationIssues}
        />
        <WorkflowSettingsDialog
          open={b.showDescDialog}
          onClose={() => b.setShowDescDialog(false)}
          current={b.currentWorkflow}
          setCurrent={b.setCurrentWorkflow}
        />
        <ImportWorkflowDialog
          open={b.showImportDialog}
          onClose={() => b.setShowImportDialog(false)}
          importJson={b.importJson}
          setImportJson={b.setImportJson}
          onImport={b.importWorkflow}
        />
      </div>
    </TooltipProvider>
  );
}

export default function VisualWorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
