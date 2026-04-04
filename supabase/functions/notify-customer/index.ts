import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  event: "pix_generated" | "boleto_generated" | "card_approved" | "card_pending" | "payment_confirmed" | "order_shipped" | "abandoned_cart" | "new_lead" | "review_received" | "boleto_reminder";
  customer: { name: string; email: string; phone: string };
  order: {
    orderId: string;
    orderNumber?: string;
    amount: number;
    description?: string;
    paymentMethod?: string;
    items?: Array<{ name?: string; quantity?: number; price?: number }>;
  };
  pix?: { qrCode?: string; ticketUrl?: string; expirationDate?: string; finalAmount?: number; discountPercent?: number };
  boleto?: { barcode?: string; boletoUrl?: string; expirationDate?: string };
  card?: { lastFourDigits?: string; brand?: string; installments?: number; installmentAmount?: number };
}

function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.startsWith("0")) return `55${digits.substring(1)}`;
  return `55${digits}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("pt-BR"); } catch { return "—"; }
}

function replaceVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || "");
    result = result.replaceAll(`{${key}}`, value || "");
  }
  return result;
}

// Event name → WhatsApp template name mapping
const EVENT_TO_WA_TEMPLATE: Record<string, string[]> = {
  pix_generated: ["pix_generated", "PIX Gerado"],
  boleto_generated: ["boleto_generated", "Boleto Emitido", "Boleto gerado"],
  card_approved: ["card_approved", "Pagamento Confirmado"],
  card_pending: ["card_pending"],
  payment_confirmed: ["payment_confirmed", "Pagamento Confirmado"],
};

// Fallback WhatsApp messages (only used if no DB template found)
function buildFallbackWhatsApp(data: NotifyRequest): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";
  const finalAmount = data.pix?.finalAmount ?? data.order.amount;
  const discount = data.pix?.discountPercent ?? 0;

  switch (data.event) {
    case "pix_generated":
      return [
        `💳 *PIX Gerado - Pincel de Luz*`, ``,
        `Olá, ${firstName}! Seu pagamento via PIX foi gerado.`, ``,
        `💰 *Valor:* ${formatCurrency(finalAmount)}`,
        discount > 0 ? `🏷️ *Desconto PIX:* ${discount}%` : null,
        `⏰ *Expira em:* ${formatDate(data.pix?.expirationDate)}`, ``,
        data.pix?.ticketUrl ? `🔗 *Link para pagamento:*\n${data.pix.ticketUrl}` : null, ``,
        `Após o pagamento, você receberá a confirmação automaticamente. ✨`,
      ].filter(Boolean).join("\n");

    case "boleto_generated":
      return [
        `🧾 *Boleto Gerado - Pincel de Luz*`, ``,
        `Olá, ${firstName}! Seu boleto foi gerado com sucesso.`, ``,
        `💰 *Valor:* ${formatCurrency(data.order.amount)}`,
        `📅 *Vencimento:* ${formatDate(data.boleto?.expirationDate)}`, ``,
        data.boleto?.barcode ? `📋 *Código de barras:*\n${data.boleto.barcode}` : null, ``,
        data.boleto?.boletoUrl ? `🔗 *Link do boleto:*\n${data.boleto.boletoUrl}` : null, ``,
        `Após a compensação, você receberá a confirmação. ✨`,
      ].filter(Boolean).join("\n");

    case "card_approved":
      const inst = data.card?.installments || 1;
      const instText = inst > 1 ? `${inst}x de ${formatCurrency(data.card?.installmentAmount || data.order.amount / inst)}` : `à vista`;
      return [
        `✅ *Pagamento Aprovado - Pincel de Luz*`, ``,
        `Olá, ${firstName}! Seu pagamento foi aprovado.`, ``,
        `💰 *Valor:* ${formatCurrency(data.order.amount)} (${instText})`,
        data.card?.brand ? `💳 *Cartão:* ${data.card.brand} final ${data.card.lastFourDigits || "****"}` : null, ``,
        `Seu pedido já está em processamento! ✨`,
      ].filter(Boolean).join("\n");

    case "card_pending":
      return `⏳ *Pagamento em Análise*\n\nOlá, ${firstName}! Seu pagamento está sendo analisado. Você receberá uma confirmação em breve.`;

    default:
      return `Olá ${firstName}, recebemos seu pagamento. Obrigado!`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data = await req.json() as NotifyRequest;
    const { event, customer, order } = data;

    console.log(`[Notify] Event: ${event}, Customer: ${customer.name}, Order: ${order.orderId}`);

    if (!event || !customer || !order) {
      throw new Error("Missing required fields: event, customer, order");
    }

    // Get company info
    const { data: company } = await supabase
      .from("company_info")
      .select("company_name, email, whatsapp")
      .limit(1)
      .single();

    const companyName = company?.company_name || "Pincel de Luz";

    // Build template variables
    const firstName = customer.name.split(" ")[0] || "Cliente";
    const inst = data.card?.installments || 1;
    const instText = inst > 1 ? `${inst}x de ${formatCurrency(data.card?.installmentAmount || order.amount / inst)}` : `à vista`;

    const formattedAmount = formatCurrency(data.pix?.finalAmount ?? order.amount);
    const expirationDateStr = formatDate(data.pix?.expirationDate || data.boleto?.expirationDate);

    const templateVars: Record<string, string> = {
      customer_name: firstName,
      customer_email: customer.email || "",
      customer_phone: customer.phone || "",
      amount: formattedAmount,
      total: formattedAmount, // alias for templates using {{total}}
      company_name: companyName,
      order_id: order.orderId || "",
      order_number: order.orderNumber || order.orderId || "",
      discount_percent: String(data.pix?.discountPercent ?? 0),
      expiration_date: expirationDateStr,
      payment_link: data.pix?.ticketUrl || "",
      barcode: data.boleto?.barcode || "",
      boleto_url: data.boleto?.boletoUrl || "",
      installment_text: instText,
      card_brand: data.card?.brand || "",
      card_last_four: data.card?.lastFourDigits || "****",
      shipping_address: "",
      shipping_city: "",
      shipping_state: "",
      shipping_cep: "",
      delivery_estimate: "",
    };

    // Try to enrich with order shipping data from DB
    if (order.orderId) {
      try {
        const { data: orderData } = await supabase
          .from("orders")
          .select("shipping_address, shipping_city, shipping_state, shipping_cep, shipping_method")
          .eq("id", order.orderId)
          .maybeSingle();
        if (orderData) {
          templateVars.shipping_address = orderData.shipping_address || "";
          templateVars.shipping_city = orderData.shipping_city || "";
          templateVars.shipping_state = orderData.shipping_state || "";
          templateVars.shipping_cep = orderData.shipping_cep || "";
          templateVars.delivery_estimate = orderData.shipping_method === "express" ? "3-5 dias úteis" : "7-12 dias úteis";
        }
      } catch (e) {
        console.warn("[Notify] Could not fetch order shipping data:", e);
      }
    }

    // ─── Load email template from DB ───
    const { data: emailTemplate } = await supabase
      .from("email_templates")
      .select("subject, body")
      .eq("name", event)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    let emailSubject = "";
    let emailHtml = "";

    if (emailTemplate) {
      emailSubject = replaceVars(emailTemplate.subject, templateVars);
      emailHtml = replaceVars(emailTemplate.body, templateVars);
    } else {
      emailSubject = `${event.replace(/_/g, " ")} - ${companyName}`;
      emailHtml = `<p>Olá ${firstName}, seu evento "${event}" foi processado. Valor: ${formatCurrency(order.amount)}</p>`;
    }

    // ─── Load WhatsApp template from DB ───
    let whatsappMessage = "";
    const candidateNames = EVENT_TO_WA_TEMPLATE[event] || [event];

    for (const tplName of candidateNames) {
      const { data: waTpl } = await supabase
        .from("whatsapp_templates")
        .select("message_text")
        .eq("name", tplName)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (waTpl?.message_text) {
        whatsappMessage = replaceVars(waTpl.message_text, templateVars);
        console.log(`[Notify] WhatsApp template loaded: ${tplName}`);
        break;
      }
    }

    // Fallback to hardcoded if no DB template
    if (!whatsappMessage) {
      whatsappMessage = buildFallbackWhatsApp(data);
      console.log(`[Notify] Using fallback WhatsApp message for ${event}`);
    }

    // ─── Send WhatsApp ───
    const cleanPhone = sanitizePhone(customer.phone);
    let whatsappSent = false;
    if (cleanPhone && whatsappMessage) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            action: "sendText",
            number: cleanPhone,
            text: whatsappMessage,
            recipientName: customer.name,
            orderNumber: order.orderNumber || order.orderId,
          }),
        });
        const result = await resp.json();
        whatsappSent = result?.success === true;
        console.log(`[Notify] WhatsApp: ${whatsappSent ? "sent" : "failed"}`);
      } catch (e) {
        console.error("[Notify] WhatsApp error:", e);
      }
    }

    // ─── Send Email ───
    let emailSent = false;
    if (customer.email && customer.email.includes("@") && emailHtml) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            to: customer.email,
            subject: emailSubject,
            html: emailHtml,
            from_name: companyName,
          }),
        });
        const result = await resp.json();
        emailSent = result?.success === true;
        console.log(`[Notify] Email: ${emailSent ? "sent" : "failed"}`);
      } catch (e) {
        console.error("[Notify] Email error:", e);
      }
    }

    // ─── Log ───
    await supabase.from("webhook_logs").insert({
      direction: "outbound",
      endpoint: "notify-customer",
      event_type: event,
      request_body: { customer_name: customer.name, customer_email: customer.email, order_id: order.orderId, amount: order.amount } as Record<string, unknown>,
      response_body: { whatsapp_sent: whatsappSent, email_sent: emailSent } as Record<string, unknown>,
      status_code: 200,
      source: "system",
      processed: true,
    });

    // ─── Trigger automation workflows (fire-and-forget) ───
    try {
      await fetch(`${supabaseUrl}/functions/v1/execute-workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseServiceKey}` },
        body: JSON.stringify({
          action: "trigger",
          trigger_event: event,
          trigger_data: {
            ...templateVars,
            customer_name: customer.name,
            customer_email: customer.email,
            customer_phone: customer.phone,
          },
        }),
      });
      console.log(`[Notify] Workflow trigger sent for event: ${event}`);
    } catch (e) {
      console.error("[Notify] Workflow trigger error (non-blocking):", e);
    }

    return new Response(
      JSON.stringify({ success: true, whatsappSent, emailSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Notify] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
