import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkflowStep {
  id: string;
  type: "send_email" | "send_whatsapp" | "delay" | "condition" | "check_status" | "schedule" | "loop";
  template_id?: string;
  template_name?: string;
  channel?: "email" | "whatsapp";
  delay_minutes?: number;
  delay_value?: number;
  delay_unit?: string;
  condition_label?: string;
  check_type?: string; // payment_confirmed, boleto_expired, order_shipped, cart_recovered
  schedule_hour?: number;
  schedule_minute?: number;
  max_loops?: number;
  loop_label?: string;
  // For branching: which handle was followed
  source_handle?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action } = body;

    // ─── ACTION: trigger ───
    if (action === "trigger") {
      const { trigger_event, trigger_data } = body;
      if (!trigger_event) throw new Error("Missing trigger_event");

      console.log(`[WorkflowEngine] Trigger: ${trigger_event}`);

      const { data: workflows, error: wfError } = await supabase
        .from("automation_workflows")
        .select("*")
        .eq("trigger_event", trigger_event)
        .eq("is_active", true);

      if (wfError) throw wfError;
      if (!workflows || workflows.length === 0) {
        console.log(`[WorkflowEngine] No active workflows for ${trigger_event}`);
        return jsonResp({ success: true, message: "No workflows to trigger", count: 0 });
      }

      const executions = [];
      for (const wf of workflows) {
        const steps = (wf.steps || []) as WorkflowStep[];
        if (steps.length === 0) continue;

        const firstStep = steps[0];
        let initialDelayMs = (wf.trigger_delay_minutes || 0) * 60 * 1000;

        // If first step is delay, use it
        if (firstStep.type === "delay") {
          initialDelayMs = (firstStep.delay_minutes || 0) * 60 * 1000;
        }
        // If first step is schedule, calculate time until scheduled hour
        if (firstStep.type === "schedule") {
          initialDelayMs = calcScheduleDelay(firstStep.schedule_hour ?? 8, firstStep.schedule_minute ?? 0);
        }

        const nextRunAt = new Date(Date.now() + initialDelayMs).toISOString();
        const startIdx = (firstStep.type === "delay" || firstStep.type === "schedule") ? 1 : 0;

        const { data: exec, error: execError } = await supabase
          .from("workflow_executions")
          .insert({
            workflow_id: wf.id,
            trigger_data: trigger_data || {},
            current_step_index: startIdx,
            status: "pending",
            next_run_at: nextRunAt,
            step_results: [],
          })
          .select()
          .single();

        if (execError) {
          console.error(`[WorkflowEngine] Error creating execution for ${wf.name}:`, execError);
          continue;
        }

        await supabase
          .from("automation_workflows")
          .update({ run_count: (wf.run_count || 0) + 1, last_run_at: new Date().toISOString() })
          .eq("id", wf.id);

        executions.push(exec);
        console.log(`[WorkflowEngine] Created execution ${exec.id} for workflow ${wf.name}`);
      }

      return jsonResp({ success: true, count: executions.length, executions: executions.map(e => e.id) });
    }

    // ─── ACTION: process ───
    if (action === "process") {
      console.log("[WorkflowEngine] Processing pending executions...");

      const { data: pendingExecs, error: pendingError } = await supabase
        .from("workflow_executions")
        .select("*, automation_workflows(*)")
        .in("status", ["pending", "running"])
        .lte("next_run_at", new Date().toISOString())
        .order("next_run_at", { ascending: true })
        .limit(20);

      if (pendingError) throw pendingError;
      if (!pendingExecs || pendingExecs.length === 0) {
        return jsonResp({ success: true, processed: 0 });
      }

      let processed = 0;
      let errors = 0;

      for (const exec of pendingExecs) {
        try {
          const workflow = exec.automation_workflows;
          if (!workflow) {
            await supabase.from("workflow_executions").update({ status: "failed", error_message: "Workflow not found" }).eq("id", exec.id);
            continue;
          }

          const steps = (workflow.steps || []) as WorkflowStep[];
          const currentIdx = exec.current_step_index;
          const triggerData = exec.trigger_data as Record<string, any>;
          const stepResults = (exec.step_results || []) as any[];

          if (currentIdx >= steps.length) {
            await supabase.from("workflow_executions").update({
              status: "completed",
              completed_at: new Date().toISOString(),
            }).eq("id", exec.id);
            processed++;
            continue;
          }

          const step = steps[currentIdx];
          let stepResult: Record<string, any> = {
            step_index: currentIdx,
            type: step.type,
            timestamp: new Date().toISOString(),
          };

          // ─── DELAY ───
          if (step.type === "delay") {
            const delayMs = (step.delay_minutes || 0) * 60 * 1000;
            stepResult.status = "completed";
            stepResult.delay_minutes = step.delay_minutes;

            await updateExec(supabase, exec.id, {
              status: "running",
              current_step_index: currentIdx + 1,
              next_run_at: new Date(Date.now() + delayMs).toISOString(),
              step_results: [...stepResults, stepResult],
            });
            processed++;
            continue;
          }

          // ─── SCHEDULE ───
          if (step.type === "schedule") {
            const delayMs = calcScheduleDelay(step.schedule_hour ?? 8, step.schedule_minute ?? 0);
            stepResult.status = "completed";
            stepResult.schedule_hour = step.schedule_hour;

            await updateExec(supabase, exec.id, {
              status: "running",
              current_step_index: currentIdx + 1,
              next_run_at: new Date(Date.now() + delayMs).toISOString(),
              step_results: [...stepResults, stepResult],
            });
            processed++;
            continue;
          }

          // ─── CHECK_STATUS (condition based on real data) ───
          if (step.type === "check_status" || step.type === "condition") {
            const checkType = step.check_type || step.condition_label || "payment_confirmed";
            const passed = await evaluateCondition(supabase, checkType, triggerData);

            stepResult.status = "completed";
            stepResult.check_type = checkType;
            stepResult.result = passed;

            // Find which branch to follow based on edges stored in steps
            // For now: if passed (YES) → skip next step and go to step+1
            // If not passed (NO) → continue to step+1
            // The visual builder stores branch info, but in flat steps:
            // - "yes_next_index" and "no_next_index" in step data
            const yesIdx = (step as any).yes_next_index ?? currentIdx + 1;
            const noIdx = (step as any).no_next_index ?? currentIdx + 1;
            const nextIdx = passed ? yesIdx : noIdx;

            if (nextIdx >= steps.length) {
              await updateExec(supabase, exec.id, {
                status: "completed",
                completed_at: new Date().toISOString(),
                step_results: [...stepResults, stepResult],
              });
            } else {
              await updateExec(supabase, exec.id, {
                status: "running",
                current_step_index: nextIdx,
                next_run_at: new Date().toISOString(),
                step_results: [...stepResults, stepResult],
              });
            }
            processed++;
            continue;
          }

          // ─── LOOP ───
          if (step.type === "loop") {
            const maxLoops = step.max_loops || 5;
            // Count how many times we've been at this loop step
            const loopCount = stepResults.filter(r => r.step_index === currentIdx && r.type === "loop").length;

            stepResult.status = "completed";
            stepResult.loop_iteration = loopCount + 1;
            stepResult.max_loops = maxLoops;

            if (loopCount >= maxLoops) {
              // Exit loop - go to next step after loop
              console.log(`[WorkflowEngine] Loop limit reached (${maxLoops}x) for exec ${exec.id}`);
              const exitIdx = (step as any).exit_next_index ?? currentIdx + 1;
              if (exitIdx >= steps.length) {
                await updateExec(supabase, exec.id, {
                  status: "completed",
                  completed_at: new Date().toISOString(),
                  step_results: [...stepResults, stepResult],
                });
              } else {
                await updateExec(supabase, exec.id, {
                  status: "running",
                  current_step_index: exitIdx,
                  next_run_at: new Date().toISOString(),
                  step_results: [...stepResults, stepResult],
                });
              }
            } else {
              // Continue loop - go to loop_next_index (the beginning of the loop body)
              const loopIdx = (step as any).loop_next_index ?? 0;
              // Default: jump back to step after last check_status before this loop
              const targetIdx = loopIdx > 0 ? loopIdx : Math.max(0, currentIdx - (steps.slice(0, currentIdx).reverse().findIndex(s => s.type === "check_status" || s.type === "schedule") + 1));

              await updateExec(supabase, exec.id, {
                status: "running",
                current_step_index: targetIdx > 0 ? targetIdx : 0,
                next_run_at: new Date().toISOString(),
                step_results: [...stepResults, stepResult],
              });
            }
            processed++;
            continue;
          }

          // ─── SEND EMAIL ───
          if (step.type === "send_email") {
            const result = await sendEmail(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };
          }
          // ─── SEND WHATSAPP ───
          else if (step.type === "send_whatsapp") {
            const result = await sendWhatsApp(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };
          }

          // Advance to next step
          const nextIdx = currentIdx + 1;
          let nextRunAt = new Date().toISOString();

          // Peek at next step for scheduling
          if (nextIdx < steps.length) {
            const nextStep = steps[nextIdx];
            if (nextStep.type === "delay") {
              const delayMs = (nextStep.delay_minutes || 0) * 60 * 1000;
              nextRunAt = new Date(Date.now() + delayMs).toISOString();
              // Skip the delay step
              await updateExec(supabase, exec.id, {
                status: nextIdx + 1 >= steps.length ? "completed" : "running",
                current_step_index: nextIdx + 1,
                next_run_at: nextRunAt,
                step_results: [...stepResults, stepResult, { step_index: nextIdx, type: "delay", status: "completed", delay_minutes: nextStep.delay_minutes, timestamp: new Date().toISOString() }],
                completed_at: nextIdx + 1 >= steps.length ? new Date().toISOString() : null,
              });
            } else if (nextStep.type === "schedule") {
              const schedDelayMs = calcScheduleDelay(nextStep.schedule_hour ?? 8, nextStep.schedule_minute ?? 0);
              nextRunAt = new Date(Date.now() + schedDelayMs).toISOString();
              await updateExec(supabase, exec.id, {
                status: nextIdx + 1 >= steps.length ? "completed" : "running",
                current_step_index: nextIdx + 1,
                next_run_at: nextRunAt,
                step_results: [...stepResults, stepResult, { step_index: nextIdx, type: "schedule", status: "completed", schedule_hour: nextStep.schedule_hour, timestamp: new Date().toISOString() }],
                completed_at: nextIdx + 1 >= steps.length ? new Date().toISOString() : null,
              });
            } else {
              await updateExec(supabase, exec.id, {
                status: "running",
                current_step_index: nextIdx,
                next_run_at: nextRunAt,
                step_results: [...stepResults, stepResult],
              });
            }
          } else {
            await updateExec(supabase, exec.id, {
              status: "completed",
              current_step_index: nextIdx,
              completed_at: new Date().toISOString(),
              step_results: [...stepResults, stepResult],
            });
          }

          processed++;
          console.log(`[WorkflowEngine] Exec ${exec.id}: Step ${currentIdx} (${step.type}) done`);
        } catch (e) {
          console.error(`[WorkflowEngine] Error processing exec ${exec.id}:`, e);
          const msg = e instanceof Error ? e.message : "Unknown error";
          await supabase.from("workflow_executions").update({ status: "failed", error_message: msg }).eq("id", exec.id);
          errors++;
        }
      }

      return jsonResp({ success: true, processed, errors, total: pendingExecs.length });
    }

    // ─── ACTION: status ───
    if (action === "status") {
      const { execution_id } = body;
      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*, automation_workflows(name, trigger_event)")
        .eq("id", execution_id)
        .single();
      if (error) throw error;
      return jsonResp({ success: true, execution: data });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("[WorkflowEngine] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Utility ───

function jsonResp(data: any) {
  return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function updateExec(supabase: any, id: string, updates: Record<string, any>) {
  await supabase.from("workflow_executions").update(updates).eq("id", id);
}

/**
 * Calculate delay in ms until next occurrence of HH:MM in BRT (UTC-3)
 */
function calcScheduleDelay(hour: number, minute: number): number {
  const now = new Date();
  // BRT = UTC-3
  const brtOffset = -3 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const brtMinutes = utcMinutes + brtOffset;
  const targetMinutes = hour * 60 + minute;

  let diffMinutes = targetMinutes - (brtMinutes >= 0 ? brtMinutes : brtMinutes + 1440);
  if (diffMinutes <= 0) diffMinutes += 1440; // next day

  return diffMinutes * 60 * 1000;
}

/**
 * Evaluate a condition based on check_type and trigger_data
 */
async function evaluateCondition(supabase: any, checkType: string, triggerData: Record<string, any>): Promise<boolean> {
  const orderId = triggerData.order_id || triggerData.id;

  switch (checkType) {
    case "payment_confirmed":
    case "Pagamento confirmado?": {
      if (!orderId) return false;
      const { data: order } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("id", orderId)
        .maybeSingle();
      return order?.payment_status === "paid" || order?.payment_status === "approved";
    }
    case "boleto_expired":
    case "Boleto vencido?": {
      if (!orderId) return false;
      const { data: order } = await supabase
        .from("orders")
        .select("created_at, payment_method")
        .eq("id", orderId)
        .maybeSingle();
      if (!order || order.payment_method !== "boleto") return false;
      const { data: payConfig } = await supabase.from("payment_credentials").select("boleto_extra_days").limit(1).maybeSingle();
      const extraDays = payConfig?.boleto_extra_days || 3;
      const created = new Date(order.created_at);
      created.setDate(created.getDate() + extraDays);
      return new Date() > created;
    }
    case "order_shipped":
    case "Pedido enviado?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("order_status").eq("id", orderId).maybeSingle();
      return order?.order_status === "shipped" || order?.order_status === "delivered";
    }
    case "cart_recovered":
    case "Carrinho recuperado?": {
      const sessionId = triggerData.session_id;
      if (!sessionId) return false;
      const { data: session } = await supabase.from("abandoned_cart_sessions").select("recovered").eq("session_id", sessionId).maybeSingle();
      return session?.recovered === true;
    }
    default:
      console.log(`[WorkflowEngine] Unknown check_type: ${checkType}, defaulting to false`);
      return false;
  }
}

// ─── Send Email ───
async function sendEmail(supabase: any, supabaseUrl: string, serviceKey: string, step: WorkflowStep, triggerData: Record<string, any>): Promise<Record<string, any>> {
  try {
    let subject = "";
    let htmlBody = "";

    if (step.template_id) {
      const { data: tpl } = await supabase.from("email_templates").select("subject, body, variables").eq("id", step.template_id).maybeSingle();
      if (tpl) { subject = replaceVars(tpl.subject, triggerData); htmlBody = replaceVars(tpl.body, triggerData); }
    }

    if (!htmlBody && step.template_name) {
      const { data: tpl } = await supabase.from("email_templates").select("subject, body").eq("name", step.template_name).eq("is_active", true).maybeSingle();
      if (tpl) { subject = replaceVars(tpl.subject, triggerData); htmlBody = replaceVars(tpl.body, triggerData); }
    }

    if (!htmlBody) return { status: "skipped", reason: "No email template found" };

    const email = triggerData.customer_email || triggerData.email;
    if (!email) return { status: "skipped", reason: "No customer email" };

    const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: email, subject: subject || "Notificação", html: htmlBody, from_name: triggerData.company_name || "Pincel de Luz" }),
    });

    const result = await resp.json();
    return { status: result?.success ? "sent" : "failed", channel: "email", response: result };
  } catch (e) {
    return { status: "error", channel: "email", error: e instanceof Error ? e.message : "Unknown" };
  }
}

// ─── Send WhatsApp ───
async function sendWhatsApp(supabase: any, supabaseUrl: string, serviceKey: string, step: WorkflowStep, triggerData: Record<string, any>): Promise<Record<string, any>> {
  try {
    let messageText = "";

    if (step.template_id) {
      const { data: tpl } = await supabase.from("whatsapp_templates").select("message_text").eq("id", step.template_id).maybeSingle();
      if (tpl) messageText = replaceVars(tpl.message_text, triggerData);
    }

    if (!messageText && step.template_name) {
      const { data: tpl } = await supabase.from("whatsapp_templates").select("message_text").eq("name", step.template_name).eq("is_active", true).maybeSingle();
      if (tpl) messageText = replaceVars(tpl.message_text, triggerData);
    }

    if (!messageText) return { status: "skipped", reason: "No whatsapp template found" };

    const phone = triggerData.customer_phone || triggerData.phone;
    if (!phone) return { status: "skipped", reason: "No customer phone" };

    const digits = phone.replace(/\D/g, "");
    const cleanPhone = digits.startsWith("55") ? digits : `55${digits}`;

    const resp = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ action: "sendText", number: cleanPhone, text: messageText, recipientName: triggerData.customer_name || "Cliente", orderNumber: triggerData.order_number || "" }),
    });

    const result = await resp.json();
    return { status: result?.success ? "sent" : "failed", channel: "whatsapp", response: result };
  } catch (e) {
    return { status: "error", channel: "whatsapp", error: e instanceof Error ? e.message : "Unknown" };
  }
}

function replaceVars(template: string, vars: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    if (typeof value === "string" || typeof value === "number") {
      result = result.replaceAll(`{{${key}}}`, String(value));
      result = result.replaceAll(`{${key}}`, String(value));
    }
  }
  return result;
}
