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
      .select("whatsapp, company_name")
      .limit(1)
      .single();

    const cleanPhone = sanitizePhone(order.customer_phone);
    if (!cleanPhone) {
      console.log("[Notification] Invalid customer phone, skipping WhatsApp");
      return { sent: false };
    }

    const companyName = company?.company_name || "Pincel de Luz";
    const formattedTotal = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(order.total);

    // Build items description
    let itemsDescription = "";
    if (Array.isArray(order.items)) {
      itemsDescription = (order.items as Array<{ name?: string; description?: string; quantity?: number }>)
        .map((item) => {
          const name = item.name || item.description || "Produto";
          const qty = item.quantity || 1;
          return `  • ${name} x${qty}`;
        })
        .join("\n");
    }

    const paymentLabel = order.payment_method === "credit_card" ? "Cartão" 
      : order.payment_method === "boleto" ? "Boleto"
      : "PIX";

    const message = `✅ *Compra Confirmada!*\n\n` +
      `Olá ${order.customer_name.split(" ")[0]}! 🎉\n\n` +
      `Seu pagamento foi *confirmado* com sucesso!\n\n` +
      `📋 *Pedido:* #${order.order_number}\n` +
      `💰 *Total:* ${formattedTotal}\n` +
      `💳 *Método:* ${paymentLabel}\n` +
      (itemsDescription ? `\n📦 *Itens:*\n${itemsDescription}\n` : "") +
      `\nSeu pedido será processado e você receberá atualizações sobre a produção e envio.\n\n` +
      `Obrigado por comprar na *${companyName}*! 💜`;

    // Send via Evolution API
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
        instanceName: "pinceldeluz",
        number: cleanPhone,
        text: message,
      }),
    });

    const whatsappResult = await whatsappResponse.json();
    console.log(`[Notification] WhatsApp result:`, JSON.stringify(whatsappResult));

    const sent = whatsappResult?.success === true;

    // Append to existing notes (don't overwrite)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("notes")
      .eq("order_number", order.order_number)
      .single();

    const existingNotes = existingOrder?.notes || "";
    const separator = existingNotes ? "\n---\n" : "";
    const newNote = sent 
      ? `✅ WhatsApp enviado para ${cleanPhone} em ${new Date().toLocaleString("pt-BR")}`
      : `⚠️ WhatsApp falhou para ${cleanPhone} - Link manual: https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message).slice(0, 500)}`;

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
    
    const formattedTotal = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(order.total);

    const paymentLabel = order.payment_method === "credit_card" ? "Cartão de Crédito" 
      : order.payment_method === "boleto" ? "Boleto Bancário"
      : "PIX";

    // Build items HTML
    let itemsHtml = "";
    if (Array.isArray(order.items)) {
      itemsHtml = (order.items as Array<{ name?: string; description?: string; quantity?: number; price?: number }>)
        .map((item) => {
          const name = item.name || item.description || "Produto";
          const qty = item.quantity || 1;
          const price = item.price ? `R$ ${Number(item.price).toFixed(2)}` : "";
          return `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${price}</td></tr>`;
        })
        .join("");
    }

    const whatsappClean = companyWhatsapp.replace(/\D/g, "");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
        <div style="background:white;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#7c3aed;margin:0;">✅ Pagamento Confirmado!</h1>
          </div>
          
          <p style="font-size:16px;">Olá <strong>${order.customer_name.split(" ")[0]}</strong>,</p>
          <p>Seu pagamento foi confirmado com sucesso! Aqui estão os detalhes do seu pedido:</p>
          
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>📋 Pedido:</strong> #${order.order_number}</p>
            <p style="margin:4px 0;"><strong>💰 Total:</strong> ${formattedTotal}</p>
            <p style="margin:4px 0;"><strong>💳 Pagamento:</strong> ${paymentLabel}</p>
          </div>

          ${itemsHtml ? `
          <h3 style="color:#374151;">📦 Itens do Pedido</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:8px;text-align:left;">Produto</th>
                <th style="padding:8px;text-align:center;">Qtd</th>
                <th style="padding:8px;text-align:right;">Preço</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>` : ""}

          <div style="margin-top:24px;padding:16px;background:#ede9fe;border-radius:8px;">
            <p style="margin:0;font-size:14px;">🏭 <strong>Próximos passos:</strong> Seu pedido será processado e você receberá atualizações sobre a produção e envio.</p>
            <p style="margin:8px 0 0;font-size:14px;">📦 Prazo de produção: 4 a 10 dias úteis após confirmação.</p>
          </div>

          <div style="margin-top:24px;padding:20px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
            <h3 style="color:#166534;margin:0 0 12px 0;font-size:16px;">📞 Precisa de ajuda? Fale conosco!</h3>
            <p style="margin:4px 0;font-size:14px;color:#374151;">
              Tem dúvidas sobre seu pedido? Quer enviar sua <strong>logo, QR Code</strong> ou informações adicionais?
            </p>
            ${whatsappClean ? `<p style="margin:8px 0 4px;font-size:14px;color:#374151;">📱 <strong>WhatsApp:</strong> <a href="https://wa.me/${whatsappClean}" style="color:#25D366;text-decoration:none;font-weight:bold;">${companyWhatsapp}</a></p>` : ""}
            ${companyEmail ? `<p style="margin:4px 0;font-size:14px;color:#374151;">📧 <strong>E-mail:</strong> <a href="mailto:${companyEmail}" style="color:#7c3aed;text-decoration:none;">${companyEmail}</a></p>` : ""}
          </div>

          ${whatsappClean ? `
          <div style="text-align:center;margin-top:24px;">
            <a href="https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Olá! Acabei de fazer o pedido #${order.order_number} e gostaria de tirar uma dúvida.`)}" style="display:inline-block;background:#25D366;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              💬 Falar no WhatsApp
            </a>
          </div>` : ""}

          <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;color:#9ca3af;text-align:center;">
            ${companyName} — Obrigado por sua compra! 💜
          </p>
        </div>
      </body>
      </html>
    `;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const customerSubject = `✅ Pedido #${order.order_number} Confirmado - ${companyName}`;

    // Send customer email
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
    console.log(`[Notification] Customer email result:`, emailResult);

    // Log to webhook_logs
    await supabase.from("webhook_logs").insert({
      direction: "outbound",
      endpoint: "email-notification",
      event_type: "order_confirmed",
      request_body: { to: order.customer_email, subject: customerSubject } as Record<string, unknown>,
      response_body: emailResult as Record<string, unknown>,
      status_code: emailResponse.status,
      source: "system",
      processed: emailResult.success || false,
    });

    // Send admin notification email
    if (companyEmail) {
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#7c3aed;">🎉 Nova Venda Realizada!</h2>
          <p><strong>Pedido:</strong> #${order.order_number}</p>
          <p><strong>Cliente:</strong> ${order.customer_name}</p>
          <p><strong>Email:</strong> ${order.customer_email}</p>
          <p><strong>Telefone:</strong> ${order.customer_phone || "N/A"}</p>
          <p><strong>Total:</strong> ${formattedTotal}</p>
          <p><strong>Método:</strong> ${paymentLabel}</p>
          ${itemsHtml ? `<h3>Itens:</h3><table style="width:100%;border-collapse:collapse;"><tbody>${itemsHtml}</tbody></table>` : ""}
        </div>
      `;

      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: companyEmail,
          subject: `🎉 Nova Venda! Pedido #${order.order_number} - ${formattedTotal}`,
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

/** Process paid order: update lead, send notifications */
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
