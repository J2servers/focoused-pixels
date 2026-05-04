import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import type { WorkflowStep, ExecutionRow, StepResult, TriggerData } from "../_shared/workflow/types.ts";
import { calcScheduleDelay, isQuietHours } from "../_shared/workflow/time.ts";
import { evaluateCondition } from "../_shared/workflow/conditions.ts";
import { sendEmail, sendWhatsApp } from "../_shared/workflow/senders.ts";
import { replaceVars } from "../_shared/workflow/templates.ts";
import {
  MAX_RETRIES, RETRY_DELAY_MS, EXECUTION_TIMEOUT_HOURS,
  updateExec, failExec, advanceToNext, notifyAdminError, logFailure,
} from "../_shared/workflow/runner.ts";

const DEFAULT_COOLDOWN_MINUTES = 60;

function jsonResp(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-info",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}

async function processStep(
  supabase: SupabaseClient, supabaseUrl: string, serviceKey: string,
  exec: ExecutionRow, step: WorkflowStep, currentIdx: number,
  steps: WorkflowStep[], stepResults: StepResult[], triggerData: TriggerData,
): Promise<void> {
  let stepResult: StepResult = { step_index: currentIdx, type: step.type, timestamp: new Date().toISOString() };

  if (step.type === "delay") {
    const delayMs = (step.delay_minutes || 0) * 60 * 1000;
    stepResult.status = "completed"; stepResult.delay_minutes = step.delay_minutes;
    await updateExec(supabase, exec.id, { status: "running", current_step_index: currentIdx + 1, next_run_at: new Date(Date.now() + delayMs).toISOString(), step_results: [...stepResults, stepResult] });
    return;
  }
  if (step.type === "schedule") {
    const delayMs = calcScheduleDelay(step.schedule_hour ?? 8, step.schedule_minute ?? 0);
    stepResult.status = "completed"; stepResult.schedule_hour = step.schedule_hour;
    await updateExec(supabase, exec.id, { status: "running", current_step_index: currentIdx + 1, next_run_at: new Date(Date.now() + delayMs).toISOString(), step_results: [...stepResults, stepResult] });
    return;
  }
  if (step.type === "check_status" || step.type === "condition") {
    const checkType = step.check_type || step.condition_label || "payment_confirmed";
    const passed = await evaluateCondition(supabase, checkType, triggerData);
    stepResult.status = "completed"; stepResult.check_type = checkType; stepResult.result = passed;
    const nextIdx = passed ? (step.yes_next_index ?? currentIdx + 1) : (step.no_next_index ?? currentIdx + 1);
    if (nextIdx >= steps.length) {
      await updateExec(supabase, exec.id, { status: "completed", completed_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
    } else {
      await updateExec(supabase, exec.id, { status: "running", current_step_index: nextIdx, next_run_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
    }
    return;
  }
  if (step.type === "loop") {
    const maxLoops = step.max_loops || 5;
    const loopCount = stepResults.filter((r) => r.step_index === currentIdx && r.type === "loop").length;
    stepResult.status = "completed"; stepResult.loop_iteration = loopCount + 1; stepResult.max_loops = maxLoops;
    if (loopCount >= maxLoops) {
      const exitIdx = step.exit_next_index ?? currentIdx + 1;
      if (exitIdx >= steps.length) await updateExec(supabase, exec.id, { status: "completed", completed_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
      else await updateExec(supabase, exec.id, { status: "running", current_step_index: exitIdx, next_run_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
    } else {
      const loopIdx = step.loop_next_index ?? 0;
      const targetIdx = loopIdx > 0 ? loopIdx : 0;
      await updateExec(supabase, exec.id, { status: "running", current_step_index: targetIdx, next_run_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
    }
    return;
  }
  if (step.type === "update_order_status") {
    const orderId = (triggerData.order_id || (triggerData as Record<string, unknown>).id) as string | undefined;
    if (orderId) {
      const updates: Record<string, string> = {};
      if (step.new_order_status) updates.order_status = step.new_order_status;
      if (step.new_payment_status) updates.payment_status = step.new_payment_status;
      if (Object.keys(updates).length > 0) {
        const { error: updateErr } = await supabase.from("orders").update(updates).eq("id", orderId);
        stepResult.status = updateErr ? "failed" : "success"; stepResult.updates = updates;
        if (updateErr) stepResult.error = updateErr.message;
      } else { stepResult.status = "skipped"; stepResult.reason = "No status changes configured"; }
    } else { stepResult.status = "skipped"; stepResult.reason = "No order_id in trigger data"; }
    await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    return;
  }
  if (step.type === "create_coupon") {
    const prefix = step.coupon_prefix || "AUTO";
    const code = `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    const durationDays = step.coupon_duration_days || 7;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const { error: couponErr } = await supabase.from("coupons").insert({
      code, description: `Cupom automático`, type: step.coupon_type || "percentage",
      value: step.coupon_value || 10, usage_limit: 1, usage_count: 0, is_active: true,
      start_date: new Date().toISOString(), end_date: expiresAt,
    });
    stepResult.status = couponErr ? "failed" : "success"; stepResult.coupon_code = code;
    stepResult.coupon_value = step.coupon_value || 10; stepResult.expires_at = expiresAt;
    if (couponErr) stepResult.error = couponErr.message;
    triggerData.coupon_code = code; triggerData.coupon_value = `${step.coupon_value || 10}`;
    await supabase.from("workflow_executions").update({ trigger_data: triggerData }).eq("id", exec.id);
    await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    return;
  }
  if (step.type === "http_webhook") {
    const webhookUrl = step.webhook_url;
    if (!webhookUrl) { stepResult.status = "skipped"; stepResult.reason = "No webhook URL"; }
    else {
      try {
        const method = (step.webhook_method || "POST").toUpperCase();
        const headers: Record<string, string> = { "Content-Type": "application/json", ...(step.webhook_headers || {}) };
        const bodyStr = replaceVars(step.webhook_body_template || JSON.stringify(triggerData), triggerData);
        const resp = await fetch(webhookUrl, { method, headers, body: method !== "GET" ? bodyStr : undefined });
        const responseText = await resp.text();
        stepResult.status = resp.ok ? "success" : "failed"; stepResult.status_code = resp.status; stepResult.response_preview = responseText.slice(0, 500);
      } catch (e) { stepResult.status = "failed"; stepResult.error = e instanceof Error ? e.message : "Unknown"; }
    }
    await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    return;
  }
  if (step.type === "add_tag") {
    const email = triggerData.customer_email;
    const tagName = step.tag_name || "workflow-touched";
    const tagAction = step.tag_action || "add";
    if (email) {
      const { data: lead } = await supabase.from("leads").select("id, tags").eq("email", email).maybeSingle();
      if (lead) {
        const currentTags = (lead.tags || []) as string[];
        const newTags = tagAction === "remove" ? currentTags.filter((t) => t !== tagName) : (currentTags.includes(tagName) ? currentTags : [...currentTags, tagName]);
        await supabase.from("leads").update({ tags: newTags }).eq("id", lead.id);
        stepResult.status = "success"; stepResult.tag = tagName; stepResult.action = tagAction;
      } else { stepResult.status = "skipped"; stepResult.reason = "Lead not found"; }
    } else { stepResult.status = "skipped"; stepResult.reason = "No customer email"; }
    await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    return;
  }
  if (step.type === "wait_for_event") {
    const waitEvent = step.wait_event || "payment_confirmed";
    const timeoutMinutes = step.wait_timeout_minutes || 1440;
    const eventMet = await evaluateCondition(supabase, waitEvent, triggerData);
    if (eventMet) {
      stepResult.status = "completed"; stepResult.event = waitEvent; stepResult.result = "event_received";
      await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    } else {
      const waitStartResults = stepResults.filter((r) => r.step_index === currentIdx && r.type === "wait_for_event");
      const firstWait = waitStartResults.length > 0 ? waitStartResults[0] : null;
      const waitStartTime = firstWait ? new Date(firstWait.timestamp).getTime() : Date.now();
      if (Date.now() - waitStartTime > timeoutMinutes * 60 * 1000) {
        stepResult.status = "timeout"; stepResult.event = waitEvent; stepResult.result = "timeout";
        await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
      } else {
        stepResult.status = "waiting"; stepResult.event = waitEvent; stepResult.check_count = waitStartResults.length + 1;
        await updateExec(supabase, exec.id, { status: "running", next_run_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), step_results: [...stepResults, stepResult] });
      }
    }
    return;
  }
  if (step.type === "send_email" || step.type === "send_whatsapp") {
    const result = step.type === "send_email"
      ? await sendEmail(supabase, supabaseUrl, serviceKey, step, triggerData)
      : await sendWhatsApp(supabase, supabaseUrl, serviceKey, step, triggerData);
    stepResult = { ...stepResult, ...(result as Record<string, unknown>) };
    if (result.status === "failed" || result.status === "error") {
      const prevRetries = stepResults.filter((r) => r.step_index === currentIdx && (r.status === "failed" || r.status === "error")).length;
      if (prevRetries < MAX_RETRIES) {
        stepResult.retry_attempt = prevRetries + 1;
        await updateExec(supabase, exec.id, { status: "running", next_run_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString(), step_results: [...stepResults, stepResult] });
        return;
      }
      await notifyAdminError(supabase, supabaseUrl, serviceKey, exec, `${step.type} falhou após ${MAX_RETRIES} tentativas: ${(result as Record<string, unknown>).error || (result as Record<string, unknown>).reason || "erro"}`);
      await logFailure(supabase, exec, step, result as Record<string, unknown>);
    }
    await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
    return;
  }
  await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const __pre = handlePreflight(req);
  if (__pre) return __pre;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    let authorized = token === serviceKey;
    if (!authorized && token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { data: isAdmin } = await supabase.rpc("has_admin_access", { _user_id: user.id });
        if (isAdmin) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "trigger") {
      const { trigger_event, trigger_data } = body;
      if (!trigger_event) throw new Error("Missing trigger_event");
      const { data: workflows } = await supabase.from("automation_workflows").select("*").eq("trigger_event", trigger_event).eq("is_active", true);
      if (!workflows || workflows.length === 0) return jsonResp({ success: true, message: "No workflows", count: 0 });

      const customerKey = trigger_data?.customer_email || trigger_data?.customer_phone || trigger_data?.session_id || "";
      const orderId = trigger_data?.order_id || trigger_data?.order_number || "";
      const executions: unknown[] = [];

      for (const wf of workflows) {
        const steps = (wf.steps || []) as WorkflowStep[];
        if (steps.length === 0) continue;

        if (customerKey) {
          const cooldownCutoff = new Date(Date.now() - DEFAULT_COOLDOWN_MINUTES * 60 * 1000).toISOString();
          const { data: existingExec } = await supabase.from("workflow_executions").select("id, trigger_data").eq("workflow_id", wf.id).gte("started_at", cooldownCutoff).limit(10);
          const isDuplicate = existingExec?.some((ex: { trigger_data?: Record<string, unknown> }) => {
            const td = ex.trigger_data || {};
            const exKey = td.customer_email || td.customer_phone || td.session_id || "";
            const exOrder = td.order_id || td.order_number || "";
            return exKey === customerKey && exOrder === orderId;
          });
          if (isDuplicate) continue;
        }

        const firstStep = steps[0];
        let initialDelayMs = (wf.trigger_delay_minutes || 0) * 60 * 1000;
        if (firstStep.type === "delay") initialDelayMs = (firstStep.delay_minutes || 0) * 60 * 1000;
        if (firstStep.type === "schedule") initialDelayMs = calcScheduleDelay(firstStep.schedule_hour ?? 8, firstStep.schedule_minute ?? 0);
        const startIdx = (firstStep.type === "delay" || firstStep.type === "schedule") ? 1 : 0;

        const { data: exec } = await supabase.from("workflow_executions").insert({
          workflow_id: wf.id, trigger_data: trigger_data || {}, current_step_index: startIdx,
          status: "pending", next_run_at: new Date(Date.now() + initialDelayMs).toISOString(), step_results: [],
        }).select().single();

        await supabase.from("automation_workflows").update({ run_count: (wf.run_count || 0) + 1, last_run_at: new Date().toISOString() }).eq("id", wf.id);
        if (exec) executions.push(exec);
      }
      return jsonResp({ success: true, count: executions.length });
    }

    if (action === "process") {
      const timeoutCutoff = new Date(Date.now() - EXECUTION_TIMEOUT_HOURS * 60 * 60 * 1000).toISOString();
      const { data: stuckExecs } = await supabase.from("workflow_executions").select("id").in("status", ["pending", "running"]).lte("started_at", timeoutCutoff);
      for (const stuck of (stuckExecs || [])) await failExec(supabase, stuck.id, `Timed out after ${EXECUTION_TIMEOUT_HOURS}h`);

      const { data: pendingExecs } = await supabase.from("workflow_executions").select("*, automation_workflows(*)").in("status", ["pending", "running"]).lte("next_run_at", new Date().toISOString()).order("next_run_at", { ascending: true }).limit(20);
      if (!pendingExecs || pendingExecs.length === 0) return jsonResp({ success: true, processed: 0, timedOut: stuckExecs?.length || 0 });

      let processed = 0, errors = 0;
      for (const exec of pendingExecs as ExecutionRow[]) {
        try {
          if (exec.status === "paused") continue;
          const workflow = exec.automation_workflows;
          if (!workflow) { await failExec(supabase, exec.id, "Workflow not found"); continue; }
          const steps = (workflow.steps || []) as WorkflowStep[];
          const currentIdx = exec.current_step_index;
          const triggerData = (exec.trigger_data || {}) as TriggerData;
          const stepResults = (exec.step_results || []) as StepResult[];

          if (currentIdx >= steps.length) {
            await updateExec(supabase, exec.id, { status: "completed", completed_at: new Date().toISOString() });
            processed++; continue;
          }
          const step = steps[currentIdx];
          if ((step.type === "send_email" || step.type === "send_whatsapp") && isQuietHours()) {
            const nextMorning = calcScheduleDelay(8, 0);
            await updateExec(supabase, exec.id, {
              status: "running", next_run_at: new Date(Date.now() + nextMorning).toISOString(),
              step_results: [...stepResults, { step_index: currentIdx, type: "quiet_hours_delay", status: "delayed", reason: "Quiet hours", timestamp: new Date().toISOString() }],
            });
            processed++; continue;
          }
          await processStep(supabase, supabaseUrl, serviceKey, exec, step, currentIdx, steps, stepResults, triggerData);
          processed++;
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown";
          await failExec(supabase, exec.id, msg);
          await notifyAdminError(supabase, supabaseUrl, serviceKey, exec as ExecutionRow, `Erro fatal: ${msg}`);
          errors++;
        }
      }
      return jsonResp({ success: true, processed, errors, total: pendingExecs.length });
    }

    if (action === "status") {
      const { data, error } = await supabase.from("workflow_executions").select("*, automation_workflows(name, trigger_event)").eq("id", body.execution_id).single();
      if (error) throw error;
      return jsonResp({ success: true, execution: data });
    }
    if (action === "pause") { await updateExec(supabase, body.execution_id, { status: "paused" }); return jsonResp({ success: true }); }
    if (action === "resume") { await updateExec(supabase, body.execution_id, { status: "running", next_run_at: new Date().toISOString() }); return jsonResp({ success: true }); }
    if (action === "cancel") { await updateExec(supabase, body.execution_id, { status: "cancelled", completed_at: new Date().toISOString(), error_message: "Cancelled by admin" }); return jsonResp({ success: true }); }
    if (action === "rerun") {
      const { data: oldExec } = await supabase.from("workflow_executions").select("*").eq("id", body.execution_id).single();
      if (!oldExec) throw new Error("Execution not found");
      const { data: newExec } = await supabase.from("workflow_executions").insert({
        workflow_id: oldExec.workflow_id, trigger_data: oldExec.trigger_data, current_step_index: 0,
        status: "pending", next_run_at: new Date().toISOString(), step_results: [],
      }).select().single();
      return jsonResp({ success: true, new_execution_id: newExec?.id });
    }
    if (action === "manual_trigger") {
      const { data: wf } = await supabase.from("automation_workflows").select("*").eq("id", body.workflow_id).single();
      if (!wf) throw new Error("Workflow not found");
      const { data: exec } = await supabase.from("workflow_executions").insert({
        workflow_id: wf.id, trigger_data: body.trigger_data || {}, current_step_index: 0,
        status: "pending", next_run_at: new Date().toISOString(), step_results: [],
      }).select().single();
      await supabase.from("automation_workflows").update({ run_count: (wf.run_count || 0) + 1, last_run_at: new Date().toISOString() }).eq("id", wf.id);
      return jsonResp({ success: true, execution_id: exec?.id });
    }
    if (action === "stats") {
      const q = supabase.from("workflow_executions").select("status, completed_at, started_at, step_results");
      if (body.workflow_id) q.eq("workflow_id", body.workflow_id);
      const { data: allExecs } = await q.limit(500);
      const execs = (allExecs || []) as Array<{ status: string; completed_at?: string; started_at: string; step_results?: StepResult[] }>;
      const stats = {
        total: execs.length,
        completed: execs.filter((e) => e.status === "completed").length,
        failed: execs.filter((e) => e.status === "failed").length,
        running: execs.filter((e) => e.status === "running" || e.status === "pending").length,
        paused: execs.filter((e) => e.status === "paused").length,
        cancelled: execs.filter((e) => e.status === "cancelled").length,
        avg_duration_seconds: 0, total_emails_sent: 0, total_whatsapp_sent: 0, total_coupons_created: 0, success_rate: 0,
      };
      const completedExecs = execs.filter((e) => e.status === "completed" && e.completed_at && e.started_at);
      if (completedExecs.length > 0) {
        const total = completedExecs.reduce((s, e) => s + (new Date(e.completed_at!).getTime() - new Date(e.started_at).getTime()) / 1000, 0);
        stats.avg_duration_seconds = Math.round(total / completedExecs.length);
      }
      for (const e of execs) {
        const r = e.step_results || [];
        stats.total_emails_sent += r.filter((x) => x.channel === "email" && x.status === "sent").length;
        stats.total_whatsapp_sent += r.filter((x) => x.channel === "whatsapp" && x.status === "sent").length;
        stats.total_coupons_created += r.filter((x) => x.type === "create_coupon" && x.status === "success").length;
      }
      stats.success_rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return jsonResp({ success: true, stats });
    }
    if (action === "bulk") {
      const { operation, workflow_ids } = body;
      if (!operation || !Array.isArray(workflow_ids)) throw new Error("Missing operation or workflow_ids");
      if (operation === "activate") { await supabase.from("automation_workflows").update({ is_active: true }).in("id", workflow_ids); return jsonResp({ success: true }); }
      if (operation === "deactivate") { await supabase.from("automation_workflows").update({ is_active: false }).in("id", workflow_ids); return jsonResp({ success: true }); }
      if (operation === "delete") {
        await supabase.from("workflow_executions").update({ status: "cancelled", completed_at: new Date().toISOString() }).in("workflow_id", workflow_ids).in("status", ["pending", "running"]);
        await supabase.from("automation_workflows").delete().in("id", workflow_ids);
        return jsonResp({ success: true });
      }
      throw new Error(`Unknown bulk operation: ${operation}`);
    }
    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
