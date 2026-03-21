import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  event:
    | "pix_generated"
    | "boleto_generated"
    | "card_approved"
    | "card_pending"
    | "payment_confirmed";
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  order: {
    orderId: string;
    orderNumber?: string;
    amount: number;
    description?: string;
    paymentMethod?: string;
    items?: Array<{ name?: string; quantity?: number; price?: number }>;
  };
  // PIX-specific
  pix?: {
    qrCode?: string;
    ticketUrl?: string;
    expirationDate?: string;
    finalAmount?: number;
    discountPercent?: number;
  };
  // Boleto-specific
  boleto?: {
    barcode?: string;
    boletoUrl?: string;
    expirationDate?: string;
  };
  // Card-specific
  card?: {
    lastFourDigits?: string;
    brand?: string;
    installments?: number;
    installmentAmount?: number;
  };
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
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

// ===== WhatsApp Message Builders =====

function buildPixWhatsApp(data: NotifyRequest): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";
  const finalAmount = data.pix?.finalAmount ?? data.order.amount;
  const discount = data.pix?.discountPercent ?? 0;

  return [
    `💳 *PIX Gerado - Pincel de Luz*`,
    ``,
    `Olá, ${firstName}! Seu pagamento via PIX foi gerado.`,
    ``,
    `💰 *Valor:* ${formatCurrency(finalAmount)}`,
    discount > 0 ? `🏷️ *Desconto PIX:* ${discount}%` : null,
    `⏰ *Expira em:* ${formatDate(data.pix?.expirationDate)}`,
    ``,
    data.pix?.ticketUrl ? `🔗 *Link para pagamento:*\n${data.pix.ticketUrl}` : null,
    ``,
    `Após o pagamento, você receberá a confirmação automaticamente. ✨`,
  ].filter(Boolean).join("\n");
}

function buildBoletoWhatsApp(data: NotifyRequest): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";

  return [
    `🧾 *Boleto Gerado - Pincel de Luz*`,
    ``,
    `Olá, ${firstName}! Seu boleto foi gerado com sucesso.`,
    ``,
    `💰 *Valor:* ${formatCurrency(data.order.amount)}`,
    `📅 *Vencimento:* ${formatDate(data.boleto?.expirationDate)}`,
    ``,
    data.boleto?.barcode ? `📋 *Código de barras:*\n${data.boleto.barcode}` : null,
    ``,
    data.boleto?.boletoUrl ? `🔗 *Link do boleto:*\n${data.boleto.boletoUrl}` : null,
    ``,
    `Após a compensação, você receberá a confirmação automaticamente. ✨`,
  ].filter(Boolean).join("\n");
}

function buildCardWhatsApp(data: NotifyRequest): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";
  const installments = data.card?.installments || 1;
  const installmentText = installments > 1
    ? `${installments}x de ${formatCurrency(data.card?.installmentAmount || data.order.amount / installments)}`
    : `à vista`;

  return [
    `✅ *Pagamento Aprovado - Pincel de Luz*`,
    ``,
    `Olá, ${firstName}! Seu pagamento com cartão foi aprovado.`,
    ``,
    `💰 *Valor:* ${formatCurrency(data.order.amount)} (${installmentText})`,
    data.card?.brand ? `💳 *Cartão:* ${data.card.brand} final ${data.card.lastFourDigits || "****"}` : null,
    ``,
    `Seu pedido já está em processamento! ✨`,
  ].filter(Boolean).join("\n");
}

// ===== Email Builders =====

function buildPixEmail(data: NotifyRequest, companyName: string, companyWhatsapp: string): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";
  const finalAmount = data.pix?.finalAmount ?? data.order.amount;
  const discount = data.pix?.discountPercent ?? 0;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
<div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<h1 style="color:#7c3aed;margin:0 0 16px;">💳 PIX Gerado</h1>
<p>Olá <strong>${firstName}</strong>, seu pagamento via PIX foi gerado com sucesso.</p>
<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0;">
<p style="margin:4px 0;"><strong>Valor:</strong> ${formatCurrency(finalAmount)}</p>
${discount > 0 ? `<p style="margin:4px 0;"><strong>Desconto PIX:</strong> ${discount}%</p>` : ""}
<p style="margin:4px 0;"><strong>Expira em:</strong> ${formatDate(data.pix?.expirationDate)}</p>
</div>
${data.pix?.ticketUrl ? `<p style="margin:16px 0;"><a href="${data.pix.ticketUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Pagar com PIX</a></p>` : ""}
<p style="font-size:14px;color:#64748b;">Após o pagamento, você receberá a confirmação automaticamente.</p>
${companyWhatsapp ? `<p style="font-size:14px;color:#374151;"><strong>WhatsApp:</strong> ${companyWhatsapp}</p>` : ""}
<p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">${companyName}</p>
</div></body></html>`;
}

function buildBoletoEmail(data: NotifyRequest, companyName: string, companyWhatsapp: string): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
<div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<h1 style="color:#7c3aed;margin:0 0 16px;">🧾 Boleto Gerado</h1>
<p>Olá <strong>${firstName}</strong>, seu boleto foi gerado com sucesso.</p>
<div style="background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:16px;margin:16px 0;">
<p style="margin:4px 0;"><strong>Valor:</strong> ${formatCurrency(data.order.amount)}</p>
<p style="margin:4px 0;"><strong>Vencimento:</strong> ${formatDate(data.boleto?.expirationDate)}</p>
</div>
${data.boleto?.barcode ? `<div style="background:#f3f4f6;border-radius:8px;padding:12px;margin:16px 0;word-break:break-all;font-family:monospace;font-size:13px;">${data.boleto.barcode}</div>` : ""}
${data.boleto?.boletoUrl ? `<p style="margin:16px 0;"><a href="${data.boleto.boletoUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir Boleto</a></p>` : ""}
<p style="font-size:14px;color:#64748b;">Após a compensação bancária, você receberá a confirmação automaticamente.</p>
${companyWhatsapp ? `<p style="font-size:14px;color:#374151;"><strong>WhatsApp:</strong> ${companyWhatsapp}</p>` : ""}
<p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">${companyName}</p>
</div></body></html>`;
}

function buildCardEmail(data: NotifyRequest, companyName: string, companyWhatsapp: string): string {
  const firstName = data.customer.name.split(" ")[0] || "Cliente";
  const installments = data.card?.installments || 1;
  const installmentText = installments > 1
    ? `${installments}x de ${formatCurrency(data.card?.installmentAmount || data.order.amount / installments)}`
    : `à vista`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
<div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<h1 style="color:#7c3aed;margin:0 0 16px;">✅ Pagamento Aprovado</h1>
<p>Olá <strong>${firstName}</strong>, seu pagamento com cartão foi aprovado!</p>
<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0;">
<p style="margin:4px 0;"><strong>Valor:</strong> ${formatCurrency(data.order.amount)} (${installmentText})</p>
${data.card?.brand ? `<p style="margin:4px 0;"><strong>Cartão:</strong> ${data.card.brand} final ${data.card.lastFourDigits || "****"}</p>` : ""}
</div>
<div style="background:#ede9fe;border-radius:8px;padding:16px;margin:16px 0;">
<p style="margin:0;font-size:14px;">Seu pedido já está em processamento e seguirá para produção e envio.</p>
</div>
${companyWhatsapp ? `<p style="font-size:14px;color:#374151;"><strong>WhatsApp:</strong> ${companyWhatsapp}</p>` : ""}
<p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">${companyName}</p>
</div></body></html>`;
}

// ===== Subject builders =====

function getEmailSubject(event: string, companyName: string): string {
  switch (event) {
    case "pix_generated": return `PIX gerado - ${companyName}`;
    case "boleto_generated": return `Boleto gerado - ${companyName}`;
    case "card_approved": return `Pagamento aprovado - ${companyName}`;
    case "card_pending": return `Pagamento em análise - ${companyName}`;
    default: return `Notificação - ${companyName}`;
  }
}

// ===== MAIN =====

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
    const companyWhatsapp = company?.whatsapp || "";

    // Build messages based on event
    let whatsappMessage = "";
    let emailHtml = "";
    let emailSubject = getEmailSubject(event, companyName);

    switch (event) {
      case "pix_generated":
        whatsappMessage = buildPixWhatsApp(data);
        emailHtml = buildPixEmail(data, companyName, companyWhatsapp);
        break;
      case "boleto_generated":
        whatsappMessage = buildBoletoWhatsApp(data);
        emailHtml = buildBoletoEmail(data, companyName, companyWhatsapp);
        break;
      case "card_approved":
        whatsappMessage = buildCardWhatsApp(data);
        emailHtml = buildCardEmail(data, companyName, companyWhatsapp);
        break;
      case "card_pending":
        whatsappMessage = `⏳ *Pagamento em Análise*\n\nOlá, ${customer.name.split(" ")[0]}! Seu pagamento está sendo analisado. Você receberá uma confirmação em breve.`;
        emailHtml = `<p>Pagamento em análise para o pedido.</p>`;
        emailSubject = `Pagamento em análise - ${companyName}`;
        break;
      default:
        throw new Error(`Unknown event: ${event}`);
    }

    // Send WhatsApp (fire-and-forget)
    const cleanPhone = sanitizePhone(customer.phone);
    let whatsappSent = false;
    if (cleanPhone && whatsappMessage) {
      try {
        const whatsappResponse = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            action: "sendText",
            number: cleanPhone,
            text: whatsappMessage,
            recipientName: customer.name,
            orderNumber: order.orderNumber || order.orderId,
          }),
        });
        const whatsappResult = await whatsappResponse.json();
        whatsappSent = whatsappResult?.success === true;
        console.log(`[Notify] WhatsApp: ${whatsappSent ? "sent" : "failed"}`);
      } catch (e) {
        console.error("[Notify] WhatsApp error (non-blocking):", e);
      }
    }

    // Send Email (fire-and-forget)
    let emailSent = false;
    if (customer.email && customer.email.includes("@") && emailHtml) {
      try {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: customer.email,
            subject: emailSubject,
            html: emailHtml,
            from_name: companyName,
          }),
        });
        const emailResult = await emailResponse.json();
        emailSent = emailResult?.success === true;
        console.log(`[Notify] Email: ${emailSent ? "sent" : "failed"}`);
      } catch (e) {
        console.error("[Notify] Email error (non-blocking):", e);
      }
    }

    // Log notification
    await supabase.from("webhook_logs").insert({
      direction: "outbound",
      endpoint: "notify-customer",
      event_type: event,
      request_body: {
        customer_name: customer.name,
        customer_email: customer.email,
        order_id: order.orderId,
        amount: order.amount,
      } as Record<string, unknown>,
      response_body: { whatsapp_sent: whatsappSent, email_sent: emailSent } as Record<string, unknown>,
      status_code: 200,
      source: "system",
      processed: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        whatsappSent,
        emailSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Notify] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
