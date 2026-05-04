import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { FlowGraph, WorkflowStep } from './types';

const uid = () => crypto.randomUUID().slice(0, 8);

const EDGE_STYLE = {
  type: 'smoothstep' as const,
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2, stroke: 'hsl(var(--primary) / 0.5)' },
};

export const delayToMinutes = (value: number, unit: string): number => {
  if (unit === 'hours') return value * 60;
  if (unit === 'days') return value * 1440;
  return value;
};

export function stepsToFlow(steps: WorkflowStep[], triggerEvent: string): FlowGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const triggerNodeId = 'trigger-0';
  nodes.push({
    id: triggerNodeId,
    type: 'trigger',
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

export function flowToSteps(nodes: Node[], edges: Edge[]): WorkflowStep[] {
  const children: Record<string, string> = {};
  edges.forEach((e) => { children[e.source] = e.target; });

  const triggerNode = nodes.find((n) => n.type === 'trigger');
  if (!triggerNode) return [];

  const steps: WorkflowStep[] = [];
  let currentId = children[triggerNode.id];
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;

    const data = node.data as Record<string, unknown>;
    const step: WorkflowStep = {
      id: node.id.replace('step-', ''),
      type: node.type ?? 'unknown',
      ...data,
    };
    if (node.type === 'delay') {
      step.delay_minutes = delayToMinutes(
        (step.delay_value as number) || 30,
        (step.delay_unit as string) || 'minutes',
      );
    }
    if (node.type === 'send_email') step.channel = 'email';
    if (node.type === 'send_whatsapp') step.channel = 'whatsapp';
    delete (step as Record<string, unknown>).trigger_event;
    steps.push(step);
    currentId = children[currentId];
  }

  return steps;
}
