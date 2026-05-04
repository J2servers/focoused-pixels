import type { Node, Edge } from '@xyflow/react';
import { flowToSteps } from './flowConverters';
import type { TemplateLite, ValidationIssue, WorkflowMeta } from './types';

export function validateWorkflow(
  nodes: Node[],
  edges: Edge[],
  meta: WorkflowMeta,
  emailTemplates: TemplateLite[],
  whatsTemplates: TemplateLite[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!meta.name.trim()) issues.push({ type: 'error', message: 'Nome do workflow é obrigatório' });

  const actionNodes = nodes.filter((n) => n.type !== 'trigger');
  if (actionNodes.length === 0) issues.push({ type: 'error', message: 'Adicione ao menos um passo ao workflow' });

  const connectedIds = new Set<string>();
  edges.forEach((e) => { connectedIds.add(e.source); connectedIds.add(e.target); });
  actionNodes.forEach((n) => {
    if (!connectedIds.has(n.id)) {
      issues.push({ type: 'warning', message: `Nó "${n.type}" está desconectado`, nodeId: n.id });
    }
  });

  actionNodes.forEach((n) => {
    const data = n.data as Record<string, unknown>;
    const templateId = data.template_id as string | undefined;
    if (n.type === 'send_email' && !templateId) issues.push({ type: 'warning', message: 'Nó de e-mail sem template', nodeId: n.id });
    if (n.type === 'send_whatsapp' && !templateId) issues.push({ type: 'warning', message: 'Nó de WhatsApp sem template', nodeId: n.id });
    if (n.type === 'send_email' && templateId && !emailTemplates.find((t) => t.id === templateId)) {
      issues.push({ type: 'error', message: 'Template de e-mail não encontrado', nodeId: n.id });
    }
    if (n.type === 'send_whatsapp' && templateId && !whatsTemplates.find((t) => t.id === templateId)) {
      issues.push({ type: 'error', message: 'Template de WhatsApp não encontrado', nodeId: n.id });
    }
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
