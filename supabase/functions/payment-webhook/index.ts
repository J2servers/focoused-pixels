import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WebhookPayload {
  type?: string;
  action?: string;
  data?: {
    id?: string;
  };
  topic?: string;
  resource?: string;
  object?: string;
  pix?: Array<{
    txid?: string;
    valor?: string;
  }>;
}

// ===== HELPERS =====

/** Sanitize phone number to E.164-like format (55XXXXXXXXXXX) */
function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.startsWith("0")) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

// ===== NOTIFICATION HELPERS =====

async function sendWhatsAppNotification(
  supabase: ReturnType<typeof createClient>,
  order: {
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    items: unknown;
    payment_method?: string | null;
  }
): Promise<{ sent: boolean }> {
  try {
    const { data: company } = await supabase
      .from("company_info")
      .select("company_name")
      .limit(1)
      .single();

    const cleanPhone = sanitizePhone(order.customer_phone);
    if (!cleanPhone) {
      console.log("[Notification] Invalid customer phone, skipping WhatsApp");
      return { sent: false };
    }

    const companyName = company?.company_name || "Pincel de Luz";
    const formattedTotal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total);
    const firstName = order.customer_name.split(" ")[0] || order.customer_name;
    const paymentLabel = order.payment_method === "credit_card" ? "Cartao" : order.payment_method === "boleto" ? "Boleto" : "PIX";
    const itemsDescription = Array.isArray(order.items)
      ? (order.items as Array<{ name?: string; description?: string; quantity?: number }>)
          .map((item) => `- ${item.name || item.description || "Produto"} x${item.quantity || 1}`)
          .join("\n")
      : "";

    const message = order.payment_method === "boleto"
      ? `Pagamento do boleto confirmado!\n\nOla ${firstName}, o sistema reconheceu a compensacao do boleto do pedido #${order.order_number}.\n\nTotal: ${formattedTotal}\nMetodo: ${paymentLabel}\n${itemsDescription ? `Itens:\n${itemsDescription}\n\n` : ""}Seu comprovante foi reconhecido e agora o pedido segue para producao e envio.`
      : `Compra confirmada!\n\nOla ${firstName}, seu pagamento do pedido #${order.order_number} foi confirmado com sucesso.\n\nTotal: ${formattedTotal}\nMetodo: ${paymentLabel}\n${itemsDescription ? `Itens:\n${itemsDescription}\n\n` : ""}Seu pedido segue para as proximas etapas de producao e envio.\n\nObrigado por comprar na ${companyName}.`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const whatsappResponse = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        action: "sendText",
        number: cleanPhone,
        text: message,
        recipientName: order.customer_name,
        orderNumber: order.order_number,
      }),
    });

    const whatsappResult = await whatsappResponse.json();
    console.log("[Notification] WhatsApp result:", JSON.stringify(whatsappResult));

    const sent = whatsappResult?.success === true;
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("notes")
      .eq("order_number", order.order_number)
      .single();

    const existingNotes = existingOrder?.notes || "";
    const separator = existingNotes ? "\n---\n" : "";
    const newNote = sent
      ? `WhatsApp enviado para ${cleanPhone} em ${new Date().toLocaleString("pt-BR")}`
      : `WhatsApp falhou para ${cleanPhone} - Link manual: https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message).slice(0, 500)}`;

    await supabase
      .from("orders")
      .update({ notes: existingNotes + separator + newNote })
      .eq("order_number", order.order_number);

    return { sent };
  } catch (e) {
    console.error("[Notification] WhatsApp error:", e);
    return { sent: false };
  }
}

async function sendEmailNotification(
  supabase: ReturnType<typeof createClient>,
  order: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total: number;
    items: unknown;
    payment_method?: string | null;
  }
): Promise<{ sent: boolean }> {
  try {
    if (!order.customer_email || !order.customer_email.includes("@")) {
      console.log("[Notification] Invalid email, skipping");
      return { sent: false };
    }

    const { data: company } = await supabase
      .from("company_info")
      .select("company_name, email, whatsapp")
      .limit(1)
      .single();

    const companyName = company?.company_name || "Pincel de Luz";
    const companyEmail = company?.email || "";
    const companyWhatsapp = company?.whatsapp || "";
    const whatsappClean = companyWhatsapp.replace(/\D/g, "");
    const formattedTotal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total);
    const firstName = order.customer_name.split(" ")[0] || order.customer_name;
    const paymentLabel = order.payment_method === "credit_card" ? "Cartao de Credito" : order.payment_method === "boleto" ? "Boleto Bancario" : "PIX";
    const itemsHtml = Array.isArray(order.items)
      ? (order.items as Array<{ name?: string; description?: string; quantity?: number; price?: number }>)
          .map((item) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.name || item.description || "Produto"}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 1}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.price ? `R$ ${Number(item.price).toFixed(2)}` : ""}</td></tr>`)
          .join("")
      : "";

    const boletoBlock = order.payment_method === "boleto"
      ? `<div style="margin-top:20px;padding:16px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;"><p style="margin:0;font-size:14px;color:#9a3412;"><strong>Boleto reconhecido:</strong> o sistema confirmou a compensacao e seu pedido agora segue para producao e envio.</p></div>`
      : "";

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;"><div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);"><h1 style="color:#7c3aed;margin:0 0 16px;">Pagamento confirmado</h1><p>Ola <strong>${firstName}</strong>, seu pagamento do pedido <strong>#${order.order_number}</strong> foi confirmado.</p><div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;"><p style="margin:4px 0;"><strong>Total:</strong> ${formattedTotal}</p><p style="margin:4px 0;"><strong>Metodo:</strong> ${paymentLabel}</p></div>${itemsHtml ? `<table style="width:100%;border-collapse:collapse;margin-top:16px;"><thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;">Produto</th><th style="padding:8px;text-align:center;">Qtd</th><th style="padding:8px;text-align:right;">Preco</th></tr></thead><tbody>${itemsHtml}</tbody></table>` : ""}${boletoBlock}<div style="margin-top:20px;padding:16px;background:#ede9fe;border-radius:8px;"><p style="margin:0;font-size:14px;">Seu pedido segue para as proximas etapas de producao e envio.</p></div>${whatsappClean || companyEmail ? `<div style="margin-top:20px;font-size:14px;color:#374151;">${whatsappClean ? `<p style="margin:4px 0;"><strong>WhatsApp:</strong> ${companyWhatsapp}</p>` : ""}${companyEmail ? `<p style="margin:4px 0;"><strong>Email:</strong> ${companyEmail}</p>` : ""}</div>` : ""}<p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">${companyName} - Obrigado por sua compra.</p></div></body></html>`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const customerSubject = order.payment_method === "boleto"
      ? `Pagamento do boleto confirmado - Pedido #${order.order_number}`
      : `Pedido #${order.order_number} confirmado - ${companyName}`;

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        to: order.customer_email,
        subject: customerSubject,
        html: emailHtml,
        from_name: companyName,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("[Notification] Customer email result:", emailResult);

    await supabase.from("webhook_logs").insert({
      direction: "outbound",
      endpoint: "email-notification",
      event_type: order.payment_method === "boleto" ? "boleto_confirmed" : "order_confirmed",
      request_body: { to: order.customer_email, subject: customerSubject } as Record<string, unknown>,
      response_body: emailResult as Record<string, unknown>,
      status_code: emailResponse.status,
      source: "system",
      processed: emailResult.success || false,
    });

    if (companyEmail) {
      const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#7c3aed;">Novo pagamento confirmado</h2><p><strong>Pedido:</strong> #${order.order_number}</p><p><strong>Cliente:</strong> ${order.customer_name}</p><p><strong>Email:</strong> ${order.customer_email}</p><p><strong>Telefone:</strong> ${order.customer_phone || "N/A"}</p><p><strong>Total:</strong> ${formattedTotal}</p><p><strong>Metodo:</strong> ${paymentLabel}</p></div>`;

      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: companyEmail,
          subject: `Pagamento confirmado - Pedido #${order.order_number}`,
          html: adminHtml,
          from_name: companyName,
        }),
      });
    }

    return { sent: true };
  } catch (e) {
    console.error("[Notification] Email error:", e);
    return { sent: false };
  }
}
/** Process paid order: update lead, send notifications, trigger workflows */
async function processConfirmedOrder(
  supabase: ReturnType<typeof createClient>,
  order: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total: number;
    items: unknown;
    payment_method?: string | null;
  }
) {
  // Save/update lead with payment tags
  try {
    if (order.customer_email && order.customer_email.includes("@")) {
      await supabase.from("leads").upsert({
        name: order.customer_name,
        email: order.customer_email.trim().toLowerCase(),
        phone: sanitizePhone(order.customer_phone),
        source: "pagamento",
        tags: ["cliente", "pagamento-confirmado"],
        is_subscribed: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: "email" });
      console.log(`[Webhook] Lead saved: ${order.customer_email}`);
    }
  } catch (e) {
    console.error("[Webhook] Lead save error (non-critical):", e);
  }

  // Send notifications in parallel
  const [whatsResult, emailResult] = await Promise.allSettled([
    sendWhatsAppNotification(supabase, order),
    sendEmailNotification(supabase, order),
  ]);

  console.log(`[Webhook] Notifications for ${order.order_number}: WhatsApp=${
    whatsResult.status === "fulfilled" ? whatsResult.value.sent : "error"
  }, Email=${
    emailResult.status === "fulfilled" ? emailResult.value.sent : "error"
  }`);

  // Trigger automation workflows for payment_confirmed event
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const formattedTotal = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total);

    await fetch(`${supabaseUrl}/functions/v1/execute-workflow`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
      body: JSON.stringify({
        action: "trigger",
        trigger_event: "payment_confirmed",
        trigger_data: {
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          order_number: order.order_number,
          amount: formattedTotal,
          payment_method: order.payment_method || "unknown",
        },
      }),
    });
    console.log(`[Webhook] Workflow trigger sent for payment_confirmed: ${order.order_number}`);
  } catch (e) {
    console.error("[Webhook] Workflow trigger error (non-blocking):", e);
  }
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "mercadopago";
    
    let payload: WebhookPayload;
    try {
      payload = await req.json() as WebhookPayload;
    } catch {
      console.error("[Webhook] Invalid JSON body");
      return new Response(JSON.stringify({ received: true, error: "Invalid JSON" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`[Webhook] Provider: ${provider}, Payload:`, JSON.stringify(payload).slice(0, 500));

    // Log incoming webhook
    await supabase.from("webhook_logs").insert({
      direction: "inbound",
      endpoint: `payment-webhook?provider=${provider}`,
      event_type: payload.type || payload.topic || "unknown",
      request_body: payload as Record<string, unknown>,
      source: provider,
      processed: false,
    });

    // ===== MERCADO PAGO =====
    if (provider === "mercadopago" || payload.topic === "payment") {
      const paymentId = payload.data?.id || url.searchParams.get("id");
      
      if (!paymentId) {
        console.log("[Webhook MP] No payment ID found");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: config } = await supabase
        .from("payment_credentials")
        .select("mercadopago_access_token")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!config?.mercadopago_access_token) {
        console.error("[Webhook MP] No access token configured");
        return new Response(JSON.stringify({ received: true, error: "No token" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${config.mercadopago_access_token}` },
      });

      if (!response.ok) {
        console.error(`[Webhook MP] Failed to fetch payment: ${response.status}`);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentData = await response.json();
      console.log(`[Webhook MP] Payment ${paymentId} status: ${paymentData.status}`);

      if (!paymentData.external_reference) {
        console.log("[Webhook MP] No external_reference");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const newStatus = paymentData.status === "approved" ? "paid" 
        : paymentData.status === "rejected" ? "rejected"
        : paymentData.status === "pending" ? "pending"
        : "unknown";

      const extRef = paymentData.external_reference;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      const updateData: Record<string, unknown> = { 
        payment_status: newStatus,
        payment_method: paymentData.payment_method_id || "pix",
        updated_at: new Date().toISOString(),
      };
      if (newStatus === "paid") {
        updateData.order_status = "confirmed";
      }

      const matchColumn = uuidRegex.test(extRef) ? "id" : "order_number";
      const result = await supabase
        .from("orders")
        .update(updateData)
        .eq(matchColumn, extRef)
        .select("order_number, customer_name, customer_email, customer_phone, total, items, payment_method")
        .single();

      if (result.error) {
        console.error(`[Webhook MP] Error updating order:`, result.error);
      } else {
        console.log(`[Webhook MP] Order ${extRef} updated to ${newStatus}`);
        
        if (newStatus === "paid" && result.data) {
          await processConfirmedOrder(supabase, result.data);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== EFI (GERENCIANET) =====
    if (provider === "efi" || payload.pix) {
      const pixPayments = payload.pix || [];
      
      for (const pix of pixPayments) {
        if (!pix.txid) continue;
        
        console.log(`[Webhook EFI] PIX received: ${pix.txid}, value: ${pix.valor}`);
        
        const result = await supabase
          .from("orders")
          .update({ 
            payment_status: "paid",
            order_status: "confirmed",
            payment_method: "pix",
            updated_at: new Date().toISOString(),
          })
          .eq("order_number", pix.txid)
          .select("order_number, customer_name, customer_email, customer_phone, total, items, payment_method")
          .single();

        if (result.data) {
          await processConfirmedOrder(supabase, result.data);
        } else {
          console.error(`[Webhook EFI] Order not found for txid: ${pix.txid}`);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== STRIPE =====
    if (provider === "stripe" || payload.object === "event") {
      const eventType = payload.type;
      
      if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
        console.log(`[Webhook Stripe] Event: ${eventType}`);
        
        const orderId = (payload.data as { object?: { metadata?: { order_id?: string } } })?.object?.metadata?.order_id;
        if (orderId) {
          const result = await supabase
            .from("orders")
            .update({ 
              payment_status: "paid",
              order_status: "confirmed",
              payment_method: "credit_card",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId)
            .select("order_number, customer_name, customer_email, customer_phone, total, items, payment_method")
            .single();
            
          console.log(`[Webhook Stripe] Order ${orderId} marked as paid`);
          
          if (result.data) {
            await processConfirmedOrder(supabase, result.data);
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Webhook] Unknown provider or payload format");
    return new Response(JSON.stringify({ received: true, message: "Unknown provider" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
