import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkflowStep {
  id: string;
  type: "send_email" | "send_whatsapp" | "delay" | "condition" | "check_status" | "schedule" | "loop" | "update_order_status" | "create_coupon" | "http_webhook" | "add_tag" | "wait_for_event";
  template_id?: string;
  template_name?: string;
  channel?: "email" | "whatsapp";
  delay_minutes?: number;
  delay_value?: number;
  delay_unit?: string;
  condition_label?: string;
  check_type?: string;
  schedule_hour?: number;
  schedule_minute?: number;
  max_loops?: number;
  loop_label?: string;
  source_handle?: string;
  yes_next_index?: number;
  no_next_index?: number;
  exit_next_index?: number;
  loop_next_index?: number;
  retry_count?: number;
  // New node data
  new_order_status?: string;
  new_payment_status?: string;
  coupon_type?: string;
  coupon_value?: number;
  coupon_duration_days?: number;
  coupon_prefix?: string;
  webhook_url?: string;
  webhook_method?: string;
  webhook_headers?: Record<string, string>;
  webhook_body_template?: string;
  tag_name?: string;
  tag_action?: string;
  wait_event?: string;
  wait_timeout_minutes?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5 * 60 * 1000;
const EXECUTION_TIMEOUT_HOURS = 72; // Auto-fail stuck executions after 72h
const DEFAULT_COOLDOWN_MINUTES = 60; // Prevent re-triggering same customer within 60min

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

      // ── IMPROVEMENT #1: Deduplication by customer+event ──
      const customerKey = trigger_data?.customer_email || trigger_data?.customer_phone || trigger_data?.session_id || "";
      const orderId = trigger_data?.order_id || trigger_data?.order_number || "";

      const executions = [];
      for (const wf of workflows) {
        const steps = (wf.steps || []) as WorkflowStep[];
        if (steps.length === 0) continue;

        // ── IMPROVEMENT #2: Cooldown - prevent duplicate triggers ──
        if (customerKey) {
          const cooldownMinutes = DEFAULT_COOLDOWN_MINUTES;
          const cooldownCutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();
          const { data: recentExecs } = await supabase
            .from("workflow_executions")
            .select("id")
            .eq("workflow_id", wf.id)
            .gte("started_at", cooldownCutoff)
            .limit(1);

          // Check if same customer already triggered this workflow recently
          if (recentExecs && recentExecs.length > 0) {
            // Check trigger_data for same customer
            const { data: existingExec } = await supabase
              .from("workflow_executions")
              .select("id, trigger_data")
              .eq("workflow_id", wf.id)
              .gte("started_at", cooldownCutoff)
              .limit(10);

            const isDuplicate = existingExec?.some((ex: any) => {
              const td = ex.trigger_data || {};
              const exKey = td.customer_email || td.customer_phone || td.session_id || "";
              const exOrder = td.order_id || td.order_number || "";
              return exKey === customerKey && exOrder === orderId;
            });

            if (isDuplicate) {
              console.log(`[WorkflowEngine] Skipping duplicate trigger for ${customerKey} on workflow ${wf.name}`);
              continue;
            }
          }
        }

        const firstStep = steps[0];
        let initialDelayMs = (wf.trigger_delay_minutes || 0) * 60 * 1000;

        if (firstStep.type === "delay") {
          initialDelayMs = (firstStep.delay_minutes || 0) * 60 * 1000;
        }
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

      // ── IMPROVEMENT #3: Auto-timeout stuck executions ──
      const timeoutCutoff = new Date(Date.now() - EXECUTION_TIMEOUT_HOURS * 60 * 60 * 1000).toISOString();
      const { data: stuckExecs } = await supabase
        .from("workflow_executions")
        .select("id, workflow_id")
        .in("status", ["pending", "running"])
        .lte("started_at", timeoutCutoff);

      if (stuckExecs && stuckExecs.length > 0) {
        for (const stuck of stuckExecs) {
          await failExec(supabase, stuck.id, `Execution timed out after ${EXECUTION_TIMEOUT_HOURS}h`);
          console.log(`[WorkflowEngine] Auto-timed-out execution ${stuck.id}`);
        }
      }

      const { data: pendingExecs, error: pendingError } = await supabase
        .from("workflow_executions")
        .select("*, automation_workflows(*)")
        .in("status", ["pending", "running"])
        .lte("next_run_at", new Date().toISOString())
        .order("next_run_at", { ascending: true })
        .limit(20);

      if (pendingError) throw pendingError;
      if (!pendingExecs || pendingExecs.length === 0) {
        return jsonResp({ success: true, processed: 0, timedOut: stuckExecs?.length || 0 });
      }

      let processed = 0;
      let errors = 0;

      for (const exec of pendingExecs) {
        try {
          // Skip paused executions
          if (exec.status === "paused") continue;

          const workflow = exec.automation_workflows;
          if (!workflow) {
            await failExec(supabase, exec.id, "Workflow not found");
            await notifyAdminError(supabase, supabaseUrl, serviceKey, exec, "Workflow vinculado não encontrado");
            continue;
          }

          const steps = (workflow.steps || []) as WorkflowStep[];
          const currentIdx = exec.current_step_index;
          const triggerData = exec.trigger_data as Record<string, any>;
          const stepResults = (exec.step_results || []) as any[];

          if (currentIdx >= steps.length) {
            await updateExec(supabase, exec.id, {
              status: "completed",
              completed_at: new Date().toISOString(),
            });
            processed++;
            continue;
          }

          const step = steps[currentIdx];

          // ── IMPROVEMENT #4: Quiet hours check ──
          if ((step.type === "send_email" || step.type === "send_whatsapp") && isQuietHours()) {
            // Reschedule to next 8 AM BRT
            const nextMorning = calcScheduleDelay(8, 0);
            await updateExec(supabase, exec.id, {
              status: "running",
              next_run_at: new Date(Date.now() + nextMorning).toISOString(),
              step_results: [...stepResults, {
                step_index: currentIdx,
                type: "quiet_hours_delay",
                status: "delayed",
                reason: "Quiet hours (22h-7h BRT)",
                timestamp: new Date().toISOString(),
              }],
            });
            processed++;
            continue;
          }

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

          // ─── CHECK_STATUS / CONDITION ───
          if (step.type === "check_status" || step.type === "condition") {
            const checkType = step.check_type || step.condition_label || "payment_confirmed";
            const passed = await evaluateCondition(supabase, checkType, triggerData);

            stepResult.status = "completed";
            stepResult.check_type = checkType;
            stepResult.result = passed;

            const yesIdx = step.yes_next_index ?? currentIdx + 1;
            const noIdx = step.no_next_index ?? currentIdx + 1;
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
            const loopCount = stepResults.filter(r => r.step_index === currentIdx && r.type === "loop").length;

            stepResult.status = "completed";
            stepResult.loop_iteration = loopCount + 1;
            stepResult.max_loops = maxLoops;

            if (loopCount >= maxLoops) {
              const exitIdx = step.exit_next_index ?? currentIdx + 1;
              if (exitIdx >= steps.length) {
                await updateExec(supabase, exec.id, { status: "completed", completed_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
              } else {
                await updateExec(supabase, exec.id, { status: "running", current_step_index: exitIdx, next_run_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
              }
            } else {
              const loopIdx = step.loop_next_index ?? 0;
              const targetIdx = loopIdx > 0 ? loopIdx : Math.max(0, currentIdx - (steps.slice(0, currentIdx).reverse().findIndex(s => s.type === "check_status" || s.type === "schedule") + 1));
              await updateExec(supabase, exec.id, { status: "running", current_step_index: targetIdx > 0 ? targetIdx : 0, next_run_at: new Date().toISOString(), step_results: [...stepResults, stepResult] });
            }
            processed++;
            continue;
          }

          // ── IMPROVEMENT #5: UPDATE ORDER STATUS node ──
          if (step.type === "update_order_status") {
            const orderId = triggerData.order_id || triggerData.id;
            if (orderId) {
              const updates: Record<string, string> = {};
              if (step.new_order_status) updates.order_status = step.new_order_status;
              if (step.new_payment_status) updates.payment_status = step.new_payment_status;

              if (Object.keys(updates).length > 0) {
                const { error: updateErr } = await supabase.from("orders").update(updates).eq("id", orderId);
                stepResult.status = updateErr ? "failed" : "success";
                stepResult.updates = updates;
                if (updateErr) stepResult.error = updateErr.message;
              } else {
                stepResult.status = "skipped";
                stepResult.reason = "No status changes configured";
              }
            } else {
              stepResult.status = "skipped";
              stepResult.reason = "No order_id in trigger data";
            }

            await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
            processed++;
            continue;
          }

          // ── IMPROVEMENT #6: CREATE COUPON node ──
          if (step.type === "create_coupon") {
            const prefix = step.coupon_prefix || "AUTO";
            const code = `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
            const durationDays = step.coupon_duration_days || 7;
            const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

            const { error: couponErr } = await supabase.from("coupons").insert({
              code,
              description: `Cupom automático - Workflow ${workflow.name}`,
              type: step.coupon_type || "percentage",
              value: step.coupon_value || 10,
              usage_limit: 1,
              usage_count: 0,
              is_active: true,
              start_date: new Date().toISOString(),
              end_date: expiresAt,
            });

            stepResult.status = couponErr ? "failed" : "success";
            stepResult.coupon_code = code;
            stepResult.coupon_value = step.coupon_value || 10;
            stepResult.coupon_type = step.coupon_type || "percentage";
            stepResult.expires_at = expiresAt;
            if (couponErr) stepResult.error = couponErr.message;

            // Inject coupon into trigger_data for subsequent steps
            triggerData.coupon_code = code;
            triggerData.coupon_value = `${step.coupon_value || 10}`;
            await supabase.from("workflow_executions").update({ trigger_data: triggerData }).eq("id", exec.id);

            await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
            processed++;
            continue;
          }

          // ── IMPROVEMENT #7: HTTP WEBHOOK node ──
          if (step.type === "http_webhook") {
            const webhookUrl = step.webhook_url;
            if (!webhookUrl) {
              stepResult.status = "skipped";
              stepResult.reason = "No webhook URL configured";
            } else {
              try {
                const method = (step.webhook_method || "POST").toUpperCase();
                const headers: Record<string, string> = { "Content-Type": "application/json", ...(step.webhook_headers || {}) };
                let bodyStr = step.webhook_body_template || JSON.stringify(triggerData);
                bodyStr = replaceVars(bodyStr, triggerData);

                const resp = await fetch(webhookUrl, {
                  method,
                  headers,
                  body: method !== "GET" ? bodyStr : undefined,
                });

                const responseText = await resp.text();
                stepResult.status = resp.ok ? "success" : "failed";
                stepResult.status_code = resp.status;
                stepResult.response_preview = responseText.slice(0, 500);
              } catch (e) {
                stepResult.status = "failed";
                stepResult.error = e instanceof Error ? e.message : "Unknown";
              }
            }

            await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
            processed++;
            continue;
          }

          // ── IMPROVEMENT #8: ADD TAG node ──
          if (step.type === "add_tag") {
            const email = triggerData.customer_email;
            const tagName = step.tag_name || "workflow-touched";
            const tagAction = step.tag_action || "add"; // "add" or "remove"

            if (email) {
              const { data: lead } = await supabase.from("leads").select("id, tags").eq("email", email).maybeSingle();
              if (lead) {
                const currentTags = (lead.tags || []) as string[];
                let newTags: string[];
                if (tagAction === "remove") {
                  newTags = currentTags.filter(t => t !== tagName);
                } else {
                  newTags = currentTags.includes(tagName) ? currentTags : [...currentTags, tagName];
                }
                await supabase.from("leads").update({ tags: newTags }).eq("id", lead.id);
                stepResult.status = "success";
                stepResult.tag = tagName;
                stepResult.action = tagAction;
              } else {
                stepResult.status = "skipped";
                stepResult.reason = "Lead not found";
              }
            } else {
              stepResult.status = "skipped";
              stepResult.reason = "No customer email";
            }

            await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
            processed++;
            continue;
          }

          // ── IMPROVEMENT #9: WAIT FOR EVENT node ──
          if (step.type === "wait_for_event") {
            const waitEvent = step.wait_event || "payment_confirmed";
            const timeoutMinutes = step.wait_timeout_minutes || 1440; // 24h default

            // Check if the event condition is met
            const eventMet = await evaluateCondition(supabase, waitEvent, triggerData);

            if (eventMet) {
              stepResult.status = "completed";
              stepResult.event = waitEvent;
              stepResult.result = "event_received";
              await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
            } else {
              // Check if we've exceeded the timeout
              const waitStartResults = stepResults.filter(r => r.step_index === currentIdx && r.type === "wait_for_event");
              const firstWait = waitStartResults.length > 0 ? waitStartResults[0] : null;
              const waitStartTime = firstWait ? new Date(firstWait.timestamp).getTime() : Date.now();
              const elapsed = Date.now() - waitStartTime;

              if (elapsed > timeoutMinutes * 60 * 1000) {
                stepResult.status = "timeout";
                stepResult.event = waitEvent;
                stepResult.result = "timeout";
                // On timeout, skip to next step
                await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
              } else {
                // Re-check in 5 minutes
                stepResult.status = "waiting";
                stepResult.event = waitEvent;
                stepResult.check_count = waitStartResults.length + 1;
                await updateExec(supabase, exec.id, {
                  status: "running",
                  next_run_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                  step_results: [...stepResults, stepResult],
                });
              }
            }
            processed++;
            continue;
          }

          // ─── SEND EMAIL (with retry) ───
          if (step.type === "send_email") {
            const result = await sendEmail(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };

            if (result.status === "failed" || result.status === "error") {
              const prevRetries = stepResults.filter(r => r.step_index === currentIdx && (r.status === "failed" || r.status === "error")).length;

              if (prevRetries < MAX_RETRIES) {
                stepResult.retry_attempt = prevRetries + 1;
                await updateExec(supabase, exec.id, {
                  status: "running",
                  next_run_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
                  step_results: [...stepResults, stepResult],
                });
                processed++;
                continue;
              } else {
                await notifyAdminError(supabase, supabaseUrl, serviceKey, exec,
                  `Email falhou após ${MAX_RETRIES} tentativas: ${result.error || result.reason || "erro desconhecido"}`);
                await logFailure(supabase, exec, step, result);
              }
            }
          }
          // ─── SEND WHATSAPP (with retry) ───
          else if (step.type === "send_whatsapp") {
            const result = await sendWhatsApp(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };

            if (result.status === "failed" || result.status === "error") {
              const prevRetries = stepResults.filter(r => r.step_index === currentIdx && (r.status === "failed" || r.status === "error")).length;

              if (prevRetries < MAX_RETRIES) {
                stepResult.retry_attempt = prevRetries + 1;
                await updateExec(supabase, exec.id, {
                  status: "running",
                  next_run_at: new Date(Date.now() + RETRY_DELAY_MS).toISOString(),
                  step_results: [...stepResults, stepResult],
                });
                processed++;
                continue;
              } else {
                await notifyAdminError(supabase, supabaseUrl, serviceKey, exec,
                  `WhatsApp falhou após ${MAX_RETRIES} tentativas: ${result.error || result.reason || "erro desconhecido"}`);
                await logFailure(supabase, exec, step, result);
              }
            }
          }

          // Advance to next step
          await advanceToNext(supabase, exec, currentIdx, steps, stepResults, stepResult);
          processed++;
          console.log(`[WorkflowEngine] Exec ${exec.id}: Step ${currentIdx} (${step.type}) done`);
        } catch (e) {
          console.error(`[WorkflowEngine] Error processing exec ${exec.id}:`, e);
          const msg = e instanceof Error ? e.message : "Unknown error";
          await failExec(supabase, exec.id, msg);
          await notifyAdminError(supabase, supabaseUrl, serviceKey, exec, `Erro fatal no workflow: ${msg}`);
          errors++;
        }
      }

      return jsonResp({ success: true, processed, errors, total: pendingExecs.length, timedOut: stuckExecs?.length || 0 });
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

    // ── IMPROVEMENT #10: pause execution ──
    if (action === "pause") {
      const { execution_id } = body;
      if (!execution_id) throw new Error("Missing execution_id");
      await updateExec(supabase, execution_id, { status: "paused" });
      console.log(`[WorkflowEngine] Paused execution ${execution_id}`);
      return jsonResp({ success: true, message: "Execution paused" });
    }

    // ── IMPROVEMENT #11: resume execution ──
    if (action === "resume") {
      const { execution_id } = body;
      if (!execution_id) throw new Error("Missing execution_id");
      await updateExec(supabase, execution_id, { status: "running", next_run_at: new Date().toISOString() });
      console.log(`[WorkflowEngine] Resumed execution ${execution_id}`);
      return jsonResp({ success: true, message: "Execution resumed" });
    }

    // ── IMPROVEMENT #12: cancel execution ──
    if (action === "cancel") {
      const { execution_id } = body;
      if (!execution_id) throw new Error("Missing execution_id");
      await updateExec(supabase, execution_id, { status: "cancelled", completed_at: new Date().toISOString(), error_message: "Cancelled by admin" });
      console.log(`[WorkflowEngine] Cancelled execution ${execution_id}`);
      return jsonResp({ success: true, message: "Execution cancelled" });
    }

    // ── IMPROVEMENT #13: rerun failed execution ──
    if (action === "rerun") {
      const { execution_id } = body;
      if (!execution_id) throw new Error("Missing execution_id");

      const { data: oldExec, error: fetchErr } = await supabase
        .from("workflow_executions")
        .select("*, automation_workflows(*)")
        .eq("id", execution_id)
        .single();
      if (fetchErr || !oldExec) throw new Error("Execution not found");

      const { data: newExec, error: createErr } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: oldExec.workflow_id,
          trigger_data: oldExec.trigger_data,
          current_step_index: 0,
          status: "pending",
          next_run_at: new Date().toISOString(),
          step_results: [],
        })
        .select()
        .single();

      if (createErr) throw createErr;
      console.log(`[WorkflowEngine] Re-run created: ${newExec.id} from ${execution_id}`);
      return jsonResp({ success: true, new_execution_id: newExec.id });
    }

    // ── IMPROVEMENT #14: manual trigger for specific order ──
    if (action === "manual_trigger") {
      const { workflow_id, trigger_data } = body;
      if (!workflow_id) throw new Error("Missing workflow_id");

      const { data: wf, error: wfErr } = await supabase
        .from("automation_workflows")
        .select("*")
        .eq("id", workflow_id)
        .single();
      if (wfErr || !wf) throw new Error("Workflow not found");

      const steps = (wf.steps || []) as WorkflowStep[];
      if (steps.length === 0) throw new Error("Workflow has no steps");

      const { data: exec, error: execErr } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: wf.id,
          trigger_data: trigger_data || {},
          current_step_index: 0,
          status: "pending",
          next_run_at: new Date().toISOString(),
          step_results: [],
        })
        .select()
        .single();

      if (execErr) throw execErr;

      await supabase
        .from("automation_workflows")
        .update({ run_count: (wf.run_count || 0) + 1, last_run_at: new Date().toISOString() })
        .eq("id", wf.id);

      console.log(`[WorkflowEngine] Manual trigger: exec ${exec.id} for workflow ${wf.name}`);
      return jsonResp({ success: true, execution_id: exec.id });
    }

    // ── IMPROVEMENT #15: get execution stats ──
    if (action === "stats") {
      const { workflow_id } = body;
      
      let query = supabase.from("workflow_executions").select("status, completed_at, started_at, step_results");
      if (workflow_id) query = query.eq("workflow_id", workflow_id);

      const { data: allExecs } = await query.limit(500);
      const execs = allExecs || [];

      const stats = {
        total: execs.length,
        completed: execs.filter(e => e.status === "completed").length,
        failed: execs.filter(e => e.status === "failed").length,
        running: execs.filter(e => e.status === "running" || e.status === "pending").length,
        paused: execs.filter(e => e.status === "paused").length,
        cancelled: execs.filter(e => e.status === "cancelled").length,
        avg_duration_seconds: 0,
        total_emails_sent: 0,
        total_whatsapp_sent: 0,
        total_coupons_created: 0,
        success_rate: 0,
      };

      // Calculate averages
      const completedExecs = execs.filter(e => e.status === "completed" && e.completed_at && e.started_at);
      if (completedExecs.length > 0) {
        const totalDuration = completedExecs.reduce((sum, e) => {
          return sum + (new Date(e.completed_at!).getTime() - new Date(e.started_at).getTime()) / 1000;
        }, 0);
        stats.avg_duration_seconds = Math.round(totalDuration / completedExecs.length);
      }

      // Count channel sends
      for (const e of execs) {
        const results = (e.step_results || []) as any[];
        stats.total_emails_sent += results.filter(r => r.channel === "email" && r.status === "sent").length;
        stats.total_whatsapp_sent += results.filter(r => r.channel === "whatsapp" && r.status === "sent").length;
        stats.total_coupons_created += results.filter(r => r.type === "create_coupon" && r.status === "success").length;
      }

      stats.success_rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

      return jsonResp({ success: true, stats });
    }

    // ── IMPROVEMENT #16: bulk operations ──
    if (action === "bulk") {
      const { operation, workflow_ids } = body;
      if (!operation || !workflow_ids || !Array.isArray(workflow_ids)) throw new Error("Missing operation or workflow_ids");

      if (operation === "activate") {
        await supabase.from("automation_workflows").update({ is_active: true }).in("id", workflow_ids);
        return jsonResp({ success: true, message: `${workflow_ids.length} workflows activated` });
      }
      if (operation === "deactivate") {
        await supabase.from("automation_workflows").update({ is_active: false }).in("id", workflow_ids);
        return jsonResp({ success: true, message: `${workflow_ids.length} workflows deactivated` });
      }
      if (operation === "delete") {
        // Cancel all pending executions first
        await supabase.from("workflow_executions")
          .update({ status: "cancelled", completed_at: new Date().toISOString() })
          .in("workflow_id", workflow_ids)
          .in("status", ["pending", "running"]);
        await supabase.from("automation_workflows").delete().in("id", workflow_ids);
        return jsonResp({ success: true, message: `${workflow_ids.length} workflows deleted` });
      }

      throw new Error(`Unknown bulk operation: ${operation}`);
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

async function failExec(supabase: any, id: string, errorMessage: string) {
  await supabase.from("workflow_executions").update({
    status: "failed",
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  }).eq("id", id);
}

/**
 * Advance to next step with smart delay/schedule lookahead
 */
async function advanceToNext(
  supabase: any, exec: any, currentIdx: number,
  steps: WorkflowStep[], stepResults: any[], stepResult: Record<string, any>
) {
  const nextIdx = currentIdx + 1;
  let nextRunAt = new Date().toISOString();

  if (nextIdx < steps.length) {
    const nextStep = steps[nextIdx];
    if (nextStep.type === "delay") {
      const delayMs = (nextStep.delay_minutes || 0) * 60 * 1000;
      nextRunAt = new Date(Date.now() + delayMs).toISOString();
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
}

/**
 * Notify admin via webhook_logs + email when workflow step fails
 */
async function notifyAdminError(
  supabase: any, supabaseUrl: string, serviceKey: string,
  exec: any, errorDetail: string
) {
  try {
    const workflowName = exec.automation_workflows?.name || "Desconhecido";
    const triggerData = exec.trigger_data || {};
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
  } catch (e) {
    console.error("[WorkflowEngine] Failed to notify admin:", e);
  }
}

async function logFailure(supabase: any, exec: any, step: WorkflowStep, result: Record<string, any>) {
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
      error_message: result.error || result.reason || "Max retries exhausted",
    });
  } catch (e) {
    console.error("[WorkflowEngine] Log failure error:", e);
  }
}

/**
 * IMPROVEMENT #17: Quiet hours check (22h-7h BRT)
 */
function isQuietHours(): boolean {
  const now = new Date();
  const brtHour = (now.getUTCHours() - 3 + 24) % 24;
  return brtHour >= 22 || brtHour < 7;
}

function calcScheduleDelay(hour: number, minute: number): number {
  const now = new Date();
  const brtOffset = -3 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const brtMinutes = utcMinutes + brtOffset;
  const targetMinutes = hour * 60 + minute;

  let diffMinutes = targetMinutes - (brtMinutes >= 0 ? brtMinutes : brtMinutes + 1440);
  if (diffMinutes <= 0) diffMinutes += 1440;

  return diffMinutes * 60 * 1000;
}

async function evaluateCondition(supabase: any, checkType: string, triggerData: Record<string, any>): Promise<boolean> {
  const orderId = triggerData.order_id || triggerData.id;

  switch (checkType) {
    case "payment_confirmed":
    case "Pagamento confirmado?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("payment_status").eq("id", orderId).maybeSingle();
      return order?.payment_status === "paid" || order?.payment_status === "approved";
    }
    case "boleto_expired":
    case "Boleto vencido?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("created_at, payment_method").eq("id", orderId).maybeSingle();
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
    // ── IMPROVEMENT #18: New condition types ──
    case "order_value_above_100":
    case "Valor acima de R$100?": {
      const amount = parseFloat(triggerData.amount?.replace(/[^\d.,]/g, "").replace(",", ".") || "0");
      return amount > 100;
    }
    case "order_value_above_500":
    case "Valor acima de R$500?": {
      const amount = parseFloat(triggerData.amount?.replace(/[^\d.,]/g, "").replace(",", ".") || "0");
      return amount > 500;
    }
    case "is_repeat_customer":
    case "Cliente recorrente?": {
      const email = triggerData.customer_email;
      if (!email) return false;
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_email", email);
      return (count || 0) > 1;
    }
    case "has_phone":
    case "Tem telefone?": {
      return !!triggerData.customer_phone;
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
    return { status: result?.success ? "sent" : "failed", channel: "email", response: result, error: result?.error };
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
    return { status: result?.success ? "sent" : "failed", channel: "whatsapp", response: result, error: result?.error };
  } catch (e) {
    return { status: "error", channel: "whatsapp", error: e instanceof Error ? e.message : "Unknown" };
  }
}

function replaceVars(template: string, vars: Record<string, any>): string {
  const aliases: Record<string, string> = {
    nome: vars.customer_name || "",
    valor: vars.amount || vars.total || "",
    prazo: vars.expiration_date || "",
    pedido: vars.order_number || "",
    telefone: vars.customer_phone || "",
    email: vars.customer_email || "",
    endereco: vars.shipping_address || "",
    cidade: vars.shipping_city || "",
    estado: vars.shipping_state || "",
    cep: vars.shipping_cep || "",
    cupom: vars.coupon_code || "",
    desconto: vars.coupon_value || "",
  };
  const merged = { ...aliases, ...vars };

  let result = template;
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === "string" || typeof value === "number") {
      result = result.replaceAll(`{{${key}}}`, String(value));
      result = result.replaceAll(`{${key}}`, String(value));
    }
  }
  return result;
}
