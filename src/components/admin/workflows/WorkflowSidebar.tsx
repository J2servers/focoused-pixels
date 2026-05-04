import { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KpiStrip } from './sidebar/KpiStrip';
import { TabNav } from './sidebar/TabNav';
import { NodesTab } from './sidebar/NodesTab';
import { PresetsTab } from './sidebar/PresetsTab';
import { SavedTab } from './sidebar/SavedTab';
import { HistoryTab } from './sidebar/HistoryTab';
import type { SidebarTab } from './sidebar/constants';
import type { WorkflowMeta, WorkflowExecution, PresetDef } from '@/hooks/useWorkflows';

export type { SidebarTab };

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
  const handleTabChange = (t: SidebarTab) => {
    onTabChange(t);
    if (t === 'history') onLoadExecutions(currentWorkflowId);
  };

  return (
    <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col bg-gradient-to-b from-[hsl(var(--admin-bg))] to-[hsl(var(--admin-bg)/0.95)]">
      <KpiStrip metrics={metrics} />
      <TabNav tab={tab} onChange={handleTabChange} />
      <ScrollArea className="flex-1">
        {tab === 'nodes' && <NodesTab onAddNode={onAddNode} onNewWorkflow={onNewWorkflow} />}
        {tab === 'presets' && <PresetsTab onLoadPreset={onLoadPreset} />}
        {tab === 'saved' && (
          <SavedTab
            workflows={workflows}
            currentWorkflowId={currentWorkflowId}
            loading={loading}
            onLoadWorkflow={onLoadWorkflow}
            onDeleteWorkflow={onDeleteWorkflow}
            onToggleActive={onToggleActive}
          />
        )}
        {tab === 'history' && (
          <HistoryTab
            executions={executions}
            workflows={workflows}
            loading={loadingExecs}
            currentWorkflowId={currentWorkflowId}
            onReload={onLoadExecutions}
          />
        )}
      </ScrollArea>
    </div>
  );
}

export default memo(WorkflowSidebar);
