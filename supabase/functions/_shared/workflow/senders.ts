import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { WorkflowStep, TriggerData } from "./types.ts";
import { replaceVars } from "./templates.ts";

export async function sendEmail(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceKey: string,
  step: WorkflowStep,
  triggerData: TriggerData,
): Promise<Record<string, unknown>> {
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

    const email = (triggerData.customer_email || (triggerData as Record<string, unknown>).email) as string | undefined;
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

export async function sendWhatsApp(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceKey: string,
  step: WorkflowStep,
  triggerData: TriggerData,
): Promise<Record<string, unknown>> {
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

    const phone = (triggerData.customer_phone || (triggerData as Record<string, unknown>).phone) as string | undefined;
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
