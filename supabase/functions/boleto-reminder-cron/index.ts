import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * BOLETO REMINDER CRON
 * 
 * Runs daily (ideally at 8:00 AM BRT via pg_cron).
 * 
 * Logic:
 * 1. Find orders where payment_method = 'boleto' AND payment_status = 'pending'
 * 2. Skip orders where boleto has expired (created_at + boleto_extra_days)
 * 3. Skip orders already notified today
 * 4. Send WhatsApp + Email reminder
 * 5. If boleto expired, send "boleto vencido" notification instead
 * 6. Log all actions
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth check: only service role or admin
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== serviceKey) {
      // Check if it's an admin user
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    console.log("[BoletoReminder] Starting daily boleto reminder check...");

    // Get boleto config
    const { data: payConfig } = await supabase
      .from("payment_credentials")
      .select("boleto_extra_days")
      .limit(1)
      .maybeSingle();
    
    const boletoExtraDays = payConfig?.boleto_extra_days || 3;

    // Find unpaid boleto orders
    const { data: pendingOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, customer_phone, total, created_at, payment_status, payment_method, notes")
      .eq("payment_method", "boleto")
      .eq("payment_status", "pending")
      .not("order_status", "eq", "cancelled");

    if (ordersError) throw ordersError;

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log("[BoletoReminder] No pending boleto orders found");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending boletos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[BoletoReminder] Found ${pendingOrders.length} pending boleto orders`);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    let reminders_sent = 0;
    let expired_notified = 0;
    let skipped = 0;

    // Load templates
    const { data: whatsTemplates } = await supabase
      .from("whatsapp_templates")
      .select("name, message_text")
      .eq("is_active", true);

    const { data: emailTemplates } = await supabase
      .from("email_templates")
      .select("name, subject, body")
      .eq("is_active", true);

    const findWhatsTemplate = (name: string) => whatsTemplates?.find(t => t.name === name);
    const findEmailTemplate = (name: string) => emailTemplates?.find(t => t.name === name);

    for (const order of pendingOrders) {
      try {
        const createdAt = new Date(order.created_at);
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(expiryDate.getDate() + boletoExtraDays);

        const isExpired = now > expiryDate;

        // Check if we already sent a reminder today (via notes field or webhook_logs)
        const { data: todayLogs } = await supabase
          .from("webhook_logs")
          .select("id")
          .eq("source", "boleto-reminder")
          .eq("event_type", order.id)
          .gte("created_at", `${todayStr}T00:00:00Z`)
          .limit(1);

        if (todayLogs && todayLogs.length > 0) {
          console.log(`[BoletoReminder] Already sent reminder for ${order.order_number} today, skipping`);
          skipped++;
          continue;
        }

        const vars: Record<string, string> = {
          customer_name: order.customer_name,
          order_number: order.order_number,
          total: `R$ ${Number(order.total).toFixed(2).replace('.', ',')}`,
          expiration_date: expiryDate.toLocaleDateString('pt-BR'),
          company_name: 'Pincel de Luz',
        };

        if (isExpired) {
          // Send "boleto expired" notification
          console.log(`[BoletoReminder] Boleto expired for ${order.order_number}`);

          const whatsMsg = findWhatsTemplate("Boleto vencido");
          const emailMsg = findEmailTemplate("Boleto vencido");

          if (whatsMsg && order.customer_phone) {
            await sendWhatsApp(supabaseUrl, serviceKey, order.customer_phone, replaceVars(whatsMsg.message_text, vars), order);
          }
          if (emailMsg && order.customer_email) {
            await sendEmail(supabaseUrl, serviceKey, order.customer_email, replaceVars(emailMsg.subject, vars), replaceVars(emailMsg.body, vars));
          }

          // Cancel order after expiry notification
          await supabase.from("orders").update({
            order_status: "cancelled",
            payment_status: "expired",
            notes: `${order.notes || ''}\n[${todayStr}] Boleto vencido - pedido cancelado automaticamente`.trim()
          }).eq("id", order.id);

          expired_notified++;
        } else {
          // Send reminder
          console.log(`[BoletoReminder] Sending reminder for ${order.order_number}`);

          const whatsMsg = findWhatsTemplate("Lembrete de boleto");
          const emailMsg = findEmailTemplate("Lembrete de boleto");

          if (whatsMsg && order.customer_phone) {
            await sendWhatsApp(supabaseUrl, serviceKey, order.customer_phone, replaceVars(whatsMsg.message_text, vars), order);
          }
          if (emailMsg && order.customer_email) {
            await sendEmail(supabaseUrl, serviceKey, order.customer_email, replaceVars(emailMsg.subject, vars), replaceVars(emailMsg.body, vars));
          }

          reminders_sent++;
        }

        // Log the action to prevent duplicates
        await supabase.from("webhook_logs").insert({
          direction: "outbound",
          endpoint: "boleto-reminder-cron",
          source: "boleto-reminder",
          event_type: order.id,
          method: "POST",
          request_body: { order_number: order.order_number, action: isExpired ? "expired" : "reminder" },
          status_code: 200,
          processed: true,
        });

      } catch (e) {
        console.error(`[BoletoReminder] Error processing ${order.order_number}:`, e);
      }
    }

    const summary = { success: true, processed: pendingOrders.length, reminders_sent, expired_notified, skipped };
    console.log("[BoletoReminder] Done:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[BoletoReminder] Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── Helpers ───

function replaceVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

async function sendWhatsApp(supabaseUrl: string, serviceKey: string, phone: string, text: string, order: any) {
  const digits = phone.replace(/\D/g, "");
  const cleanPhone = digits.startsWith("55") ? digits : `55${digits}`;
  try {
    await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        action: "sendText",
        number: cleanPhone,
        text,
        recipientName: order.customer_name || "Cliente",
        orderNumber: order.order_number || "",
      }),
    });
  } catch (e) {
    console.error("[BoletoReminder] WhatsApp send error:", e);
  }
}

async function sendEmail(supabaseUrl: string, serviceKey: string, to: string, subject: string, html: string) {
  try {
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to, subject, html, from_name: "Pincel de Luz" }),
    });
  } catch (e) {
    console.error("[BoletoReminder] Email send error:", e);
  }
}
