import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { WorkflowStep, ExecutionRow, StepResult, TriggerData } from "./types.ts";
import { calcScheduleDelay } from "./time.ts";

export const MAX_RETRIES = 2;
export const RETRY_DELAY_MS = 5 * 60 * 1000;
export const EXECUTION_TIMEOUT_HOURS = 72;

export async function updateExec(supabase: SupabaseClient, id: string, updates: Record<string, unknown>) {
  await supabase.from("workflow_executions").update(updates).eq("id", id);
}

export async function failExec(supabase: SupabaseClient, id: string, errorMessage: string) {
  await supabase.from("workflow_executions").update({
    status: "failed",
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  }).eq("id", id);
}

export async function advanceToNext(
  supabase: SupabaseClient,
  exec: ExecutionRow,
  currentIdx: number,
  steps: WorkflowStep[],
  stepResults: StepResult[],
  stepResult: StepResult,
) {
  const nextIdx = currentIdx + 1;
  const nowIso = new Date().toISOString();

  if (nextIdx < steps.length) {
    const nextStep = steps[nextIdx];
    if (nextStep.type === "delay") {
      const delayMs = (nextStep.delay_minutes || 0) * 60 * 1000;
      await updateExec(supabase, exec.id, {
        status: nextIdx + 1 >= steps.length ? "completed" : "running",
        current_step_index: nextIdx + 1,
        next_run_at: new Date(Date.now() + delayMs).toISOString(),
        step_results: [...stepResults, stepResult, { step_index: nextIdx, type: "delay", status: "completed", delay_minutes: nextStep.delay_minutes, timestamp: nowIso }],
        completed_at: nextIdx + 1 >= steps.length ? nowIso : null,
      });
    } else if (nextStep.type === "schedule") {
      const schedDelayMs = calcScheduleDelay(nextStep.schedule_hour ?? 8, nextStep.schedule_minute ?? 0);
      await updateExec(supabase, exec.id, {
        status: nextIdx + 1 >= steps.length ? "completed" : "running",
        current_step_index: nextIdx + 1,
        next_run_at: new Date(Date.now() + schedDelayMs).toISOString(),
        step_results: [...stepResults, stepResult, { step_index: nextIdx, type: "schedule", status: "completed", schedule_hour: nextStep.schedule_hour, timestamp: nowIso }],
        completed_at: nextIdx + 1 >= steps.length ? nowIso : null,
      });
    } else {
      await updateExec(supabase, exec.id, {
        status: "running",
        current_step_index: nextIdx,
        next_run_at: nowIso,
        step_results: [...stepResults, stepResult],
      });
    }
  } else {
    await updateExec(supabase, exec.id, {
      status: "completed",
      current_step_index: nextIdx,
      completed_at: nowIso,
      step_results: [...stepResults, stepResult],
    });
  }
}

export async function notifyAdminError(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceKey: string,
  exec: ExecutionRow,
  errorDetail: string,
) {
  try {
    const workflowName = exec.automation_workflows?.name || "Desconhecido";
    const triggerData = exec.trigger_data || ({} as TriggerData);
    const orderNumber = triggerData.order_number || triggerData.order_id || "N/A";

    await supabase.from("webhook_logs").insert({
      direction: "internal",
      endpoint: "workflow-error-alert",
      event_type: "workflow_step_failed",
      source: "execute-workflow",
      request_body: {
        workflow_name: workflowName,
        execution_id: exec.id,
        order_number: orderNumber,
        customer_name: triggerData.customer_name || "N/A",
        error: errorDetail,
      },
      status_code: 500,
      processed: false,
      error_message: errorDetail,
    });

    const { data: company } = await supabase
      .from("company_info")
      .select("email, notification_email, company_name")
      .limit(1)
      .maybeSingle();
    const adminEmail = company?.notification_email || company?.email;
    if (!adminEmail) return;

    const alertHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:24px;">
          <h2 style="color:#dc2626;margin:0 0 16px;">⚠️ Falha no Workflow Automático</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-weight:bold;">Workflow:</td><td>${workflowName}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Pedido:</td><td>${orderNumber}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Cliente:</td><td>${triggerData.customer_name || "N/A"}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Erro:</td><td style="color:#dc2626;">${errorDetail}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Horário:</td><td>${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td></tr>
          </table>
        </div>
      </div>`;

    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: adminEmail, subject: `⚠️ Falha: ${workflowName}`, html: alertHtml, from_name: company?.company_name || "Sistema" }),
    });
  } catch {
    // swallow — failure to notify must not crash the runner
  }
}

export async function logFailure(supabase: SupabaseClient, exec: ExecutionRow, step: WorkflowStep, result: Record<string, unknown>) {
  try {
    await supabase.from("webhook_logs").insert({
      direction: "outbound",
      endpoint: `workflow-${step.type}`,
      event_type: "send_failed_max_retries",
      source: "execute-workflow",
      request_body: { execution_id: exec.id, step_type: step.type, template_name: step.template_name || step.template_id || "N/A", trigger_data: exec.trigger_data },
      response_body: result,
      status_code: 500,
      processed: false,
      error_message: (result.error as string) || (result.reason as string) || "Max retries exhausted",
    });
  } catch {
    // swallow
  }
}
