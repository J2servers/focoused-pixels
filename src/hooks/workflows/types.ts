import type { Node, Edge } from '@xyflow/react';

export interface TemplateLite {
  id: string;
  name: string;
  body?: string;
  message_text?: string;
  subject?: string;
}

export type WorkflowStep = Record<string, unknown> & {
  id?: string;
  type: string;
  template_id?: string;
  template_name?: string;
  delay_value?: number;
  delay_unit?: 'minutes' | 'hours' | 'days';
  delay_minutes?: number;
  channel?: 'email' | 'whatsapp';
};

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
  steps?: WorkflowStep[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: string;
  current_step_index: number;
  step_results: unknown[];
  trigger_data: Record<string, unknown>;
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

export interface PresetDef {
  name: string;
  description: string;
  trigger_event: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  steps: WorkflowStep[];
}

export type FlowGraph = { nodes: Node[]; edges: Edge[] };
