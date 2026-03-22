import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorkflowStep {
  id: string;
  type: "send_email" | "send_whatsapp" | "delay";
  template_id?: string;
  template_name?: string;
  channel?: "email" | "whatsapp";
  delay_minutes?: number;
  delay_value?: number;
  delay_unit?: string;
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

    // ─── ACTION: trigger — starts a workflow execution ───
    if (action === "trigger") {
      const { trigger_event, trigger_data } = body;
      if (!trigger_event) throw new Error("Missing trigger_event");

      console.log(`[WorkflowEngine] Trigger: ${trigger_event}`);

      // Find active workflows for this event
      const { data: workflows, error: wfError } = await supabase
        .from("automation_workflows")
        .select("*")
        .eq("trigger_event", trigger_event)
        .eq("is_active", true);

      if (wfError) throw wfError;
      if (!workflows || workflows.length === 0) {
        console.log(`[WorkflowEngine] No active workflows for ${trigger_event}`);
        return new Response(
          JSON.stringify({ success: true, message: "No workflows to trigger", count: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const executions = [];
      for (const wf of workflows) {
        const steps = (wf.steps || []) as WorkflowStep[];
        if (steps.length === 0) continue;

        // Calculate initial delay
        const firstStep = steps[0];
        const initialDelayMs = firstStep.type === "delay"
          ? (firstStep.delay_minutes || 0) * 60 * 1000
          : (wf.trigger_delay_minutes || 0) * 60 * 1000;

        const nextRunAt = new Date(Date.now() + initialDelayMs).toISOString();

        const { data: exec, error: execError } = await supabase
          .from("workflow_executions")
          .insert({
            workflow_id: wf.id,
            trigger_data: trigger_data || {},
            current_step_index: firstStep.type === "delay" ? 1 : 0, // skip delay step, just schedule
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

        // Update run count
        await supabase
          .from("automation_workflows")
          .update({ run_count: (wf.run_count || 0) + 1, last_run_at: new Date().toISOString() })
          .eq("id", wf.id);

        executions.push(exec);
        console.log(`[WorkflowEngine] Created execution ${exec.id} for workflow ${wf.name}`);
      }

      return new Response(
        JSON.stringify({ success: true, count: executions.length, executions: executions.map(e => e.id) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── ACTION: process — processes pending executions (called by cron) ───
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
        return new Response(
          JSON.stringify({ success: true, processed: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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

          if (currentIdx >= steps.length) {
            // All steps completed
            await supabase.from("workflow_executions").update({
              status: "completed",
              completed_at: new Date().toISOString(),
            }).eq("id", exec.id);
            processed++;
            continue;
          }

          const step = steps[currentIdx];
          const triggerData = exec.trigger_data as Record<string, any>;
          const stepResults = (exec.step_results || []) as any[];
          let stepResult: Record<string, any> = { step_index: currentIdx, type: step.type, timestamp: new Date().toISOString() };

          // Execute step
          if (step.type === "delay") {
            // Calculate delay and schedule next run
            const delayMs = (step.delay_minutes || 0) * 60 * 1000;
            const nextRun = new Date(Date.now() + delayMs).toISOString();

            stepResult.status = "completed";
            stepResult.delay_minutes = step.delay_minutes;

            await supabase.from("workflow_executions").update({
              status: "running",
              current_step_index: currentIdx + 1,
              next_run_at: nextRun,
              step_results: [...stepResults, stepResult],
            }).eq("id", exec.id);

            console.log(`[WorkflowEngine] Exec ${exec.id}: Delay ${step.delay_minutes}min, next run: ${nextRun}`);
            processed++;
            continue;
          }

          if (step.type === "send_email") {
            const result = await sendEmail(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };
          } else if (step.type === "send_whatsapp") {
            const result = await sendWhatsApp(supabase, supabaseUrl, serviceKey, step, triggerData);
            stepResult = { ...stepResult, ...result };
          }

          // Move to next step
          const nextIdx = currentIdx + 1;
          let nextRunAt = new Date().toISOString(); // immediate

          // Check if next step is a delay
          if (nextIdx < steps.length && steps[nextIdx].type === "delay") {
            const delayMs = (steps[nextIdx].delay_minutes || 0) * 60 * 1000;
            nextRunAt = new Date(Date.now() + delayMs).toISOString();
            // Skip the delay step
            await supabase.from("workflow_executions").update({
              status: nextIdx + 1 >= steps.length ? "completed" : "running",
              current_step_index: nextIdx + 1,
              next_run_at: nextRunAt,
              step_results: [...stepResults, stepResult, { step_index: nextIdx, type: "delay", status: "completed", delay_minutes: steps[nextIdx].delay_minutes, timestamp: new Date().toISOString() }],
              completed_at: nextIdx + 1 >= steps.length ? new Date().toISOString() : null,
            }).eq("id", exec.id);
          } else {
            await supabase.from("workflow_executions").update({
              status: nextIdx >= steps.length ? "completed" : "running",
              current_step_index: nextIdx,
              next_run_at: nextRunAt,
              step_results: [...stepResults, stepResult],
              completed_at: nextIdx >= steps.length ? new Date().toISOString() : null,
            }).eq("id", exec.id);
          }

          processed++;
          console.log(`[WorkflowEngine] Exec ${exec.id}: Step ${currentIdx} (${step.type}) done`);
        } catch (e) {
          console.error(`[WorkflowEngine] Error processing exec ${exec.id}:`, e);
          const msg = e instanceof Error ? e.message : "Unknown error";
          await supabase.from("workflow_executions").update({
            status: "failed",
            error_message: msg,
          }).eq("id", exec.id);
          errors++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed, errors, total: pendingExecs.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── ACTION: status — get execution status ───
    if (action === "status") {
      const { execution_id } = body;
      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*, automation_workflows(name, trigger_event)")
        .eq("id", execution_id)
        .single();
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, execution: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

// ─── Send Email Helper ───
async function sendEmail(
  supabase: any,
  supabaseUrl: string,
  serviceKey: string,
  step: WorkflowStep,
  triggerData: Record<string, any>
): Promise<Record<string, any>> {
  try {
    let subject = "";
    let htmlBody = "";

    // Load template if available
    if (step.template_id) {
      const { data: tpl } = await supabase
        .from("email_templates")
        .select("subject, body, variables")
        .eq("id", step.template_id)
        .maybeSingle();

      if (tpl) {
        subject = replaceVars(tpl.subject, triggerData);
        htmlBody = replaceVars(tpl.body, triggerData);
      }
    }

    // Fallback: search by template name
    if (!htmlBody && step.template_name) {
      const { data: tpl } = await supabase
        .from("email_templates")
        .select("subject, body")
        .eq("name", step.template_name)
        .eq("is_active", true)
        .maybeSingle();

      if (tpl) {
        subject = replaceVars(tpl.subject, triggerData);
        htmlBody = replaceVars(tpl.body, triggerData);
      }
    }

    if (!htmlBody) {
      return { status: "skipped", reason: "No email template found" };
    }

    const email = triggerData.customer_email || triggerData.email;
    if (!email) {
      return { status: "skipped", reason: "No customer email" };
    }

    const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        to: email,
        subject: subject || `Notificação - Pincel de Luz`,
        html: htmlBody,
        from_name: triggerData.company_name || "Pincel de Luz",
      }),
    });

    const result = await resp.json();
    return { status: result?.success ? "sent" : "failed", channel: "email", response: result };
  } catch (e) {
    return { status: "error", channel: "email", error: e instanceof Error ? e.message : "Unknown" };
  }
}

// ─── Send WhatsApp Helper ───
async function sendWhatsApp(
  supabase: any,
  supabaseUrl: string,
  serviceKey: string,
  step: WorkflowStep,
  triggerData: Record<string, any>
): Promise<Record<string, any>> {
  try {
    let messageText = "";

    // Load template if available
    if (step.template_id) {
      const { data: tpl } = await supabase
        .from("whatsapp_templates")
        .select("message_text")
        .eq("id", step.template_id)
        .maybeSingle();

      if (tpl) {
        messageText = replaceVars(tpl.message_text, triggerData);
      }
    }

    // Fallback: search by template name
    if (!messageText && step.template_name) {
      const { data: tpl } = await supabase
        .from("whatsapp_templates")
        .select("message_text")
        .eq("name", step.template_name)
        .eq("is_active", true)
        .maybeSingle();

      if (tpl) {
        messageText = replaceVars(tpl.message_text, triggerData);
      }
    }

    if (!messageText) {
      return { status: "skipped", reason: "No whatsapp template found" };
    }

    const phone = triggerData.customer_phone || triggerData.phone;
    if (!phone) {
      return { status: "skipped", reason: "No customer phone" };
    }

    // Sanitize phone
    const digits = phone.replace(/\D/g, "");
    const cleanPhone = digits.startsWith("55") ? digits : `55${digits}`;

    const resp = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        action: "sendText",
        number: cleanPhone,
        text: messageText,
        recipientName: triggerData.customer_name || "Cliente",
        orderNumber: triggerData.order_number || triggerData.order_id || "",
      }),
    });

    const result = await resp.json();
    return { status: result?.success ? "sent" : "failed", channel: "whatsapp", response: result };
  } catch (e) {
    return { status: "error", channel: "whatsapp", error: e instanceof Error ? e.message : "Unknown" };
  }
}

// ─── Variable replacement ───
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
