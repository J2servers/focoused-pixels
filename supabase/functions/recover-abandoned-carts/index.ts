import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AbandonedSession {
  id: string;
  session_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  cart_total: number | null;
  cart_items: unknown;
  reminder_sent: boolean;
  coupon_code: string | null;
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getCartPreview(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return "Seu carrinho ainda está salvo para você.";
  return (items as Array<Record<string, unknown>>)
    .slice(0, 3)
    .map((item) => {
      const name = typeof item.name === "string" ? item.name : "Produto";
      const qty = Math.max(1, Number(item.quantity ?? 1));
      return `- ${name} x${qty}`;
    })
    .join("\n");
}

function buildCouponCode(): string {
  return `VOLTA${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

async function safeJson(response: Response): Promise<unknown> {
  try { return await response.json(); } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth: accept service role key via Authorization header OR legacy x-cron-secret
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.replace("Bearer ", "").trim();
    const cronSecret = Deno.env.get("ABANDONED_CART_CRON_SECRET");
    const incomingCronSecret = req.headers.get("x-cron-secret");

    const isServiceRole = bearerToken === serviceRoleKey;
    const isCronAuth = cronSecret && incomingCronSecret === cronSecret;

    if (!isServiceRole && !isCronAuth) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const storefrontUrl = (Deno.env.get("STORE_URL") || "https://pinceldeluz.com.br").replace(/\/$/, "");

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { data: companyInfo } = await supabase
      .from("company_info")
      .select("company_name, abandoned_cart_reminder_hours")
      .limit(1)
      .maybeSingle();

    const reminderHours = Math.max(1, Number(companyInfo?.abandoned_cart_reminder_hours ?? 2));
    const companyName = companyInfo?.company_name || "Pincel de Luz";
    const cutoffIso = new Date(Date.now() - reminderHours * 60 * 60 * 1000).toISOString();

    const { data: sessions, error: sessionsError } = await supabase
      .from("abandoned_cart_sessions")
      .select("id, session_id, user_name, user_email, user_phone, cart_total, cart_items, reminder_sent, coupon_code")
      .eq("recovered", false)
      .eq("reminder_sent", false)
      .gt("cart_total", 0)
      .lte("last_activity_at", cutoffIso)
      .or("user_email.not.is.null,user_phone.not.is.null")
      .order("last_activity_at", { ascending: true })
      .limit(100);

    if (sessionsError) throw sessionsError;

    const targets = (sessions ?? []) as AbandonedSession[];

    const summary = {
      scanned: targets.length,
      processed: 0,
      remindersSent: 0,
      emailSent: 0,
      whatsappSent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const session of targets) {
      try {
        let couponCode = session.coupon_code;
        const discountValue = 10;
        if (!couponCode) {
          couponCode = buildCouponCode();
          const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from("coupons").insert({
            code: couponCode,
            description: `Recuperação de carrinho ${session.id}`,
            type: "percentage",
            value: discountValue,
            usage_limit: 1,
            usage_count: 0,
            is_active: true,
            start_date: new Date().toISOString(),
            end_date: expiresAt,
          });
        }

        const firstName = session.user_name?.split(" ")[0] || "Oi";
        const total = Number(session.cart_total ?? 0);
        const recoveryLink = `${storefrontUrl}/carrinho?cupom=${encodeURIComponent(couponCode)}`;

        const whatsappText =
          `${firstName}, seus produtos ainda estão no carrinho.\n\n` +
          `Cupom exclusivo: *${couponCode}* (${discountValue}% OFF)\n` +
          `Valor atual: ${formatCurrency(total)}\n` +
          `Finalize agora: ${recoveryLink}`;

        const emailHtml = `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:24px;">
            <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
              <h2 style="margin:0 0 12px;color:#111827;">Seu carrinho ainda está reservado</h2>
              <p>${firstName}, separamos um incentivo para você concluir sua compra.</p>
              <p><strong>Cupom:</strong> ${couponCode} (${discountValue}% OFF)</p>
              <p><strong>Total atual:</strong> ${formatCurrency(total)}</p>
              <pre style="background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap;">${getCartPreview(session.cart_items)}</pre>
              <a href="${recoveryLink}" style="display:inline-block;margin-top:16px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Retomar compra</a>
              <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">Equipe ${companyName}.</p>
            </div>
          </div>`;

        let sentAny = false;

        if (session.user_email) {
          try {
            const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
              body: JSON.stringify({
                to: session.user_email,
                subject: `${firstName}, seu carrinho te espera com ${discountValue}% OFF`,
                html: emailHtml,
                from_name: companyName,
              }),
            });
            const result = await safeJson(resp);
            if (resp.ok && (result as { success?: boolean })?.success) {
              summary.emailSent += 1;
              sentAny = true;
            }
          } catch (e) { console.error("[recover] email error:", e); }
        }

        const phone = normalizePhone(session.user_phone);
        if (phone) {
          try {
            const resp = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceRoleKey}` },
              body: JSON.stringify({
                action: "sendText",
                number: phone,
                text: whatsappText,
                recipientName: session.user_name,
              }),
            });
            const result = await safeJson(resp);
            if (resp.ok && (result as { success?: boolean })?.success) {
              summary.whatsappSent += 1;
              sentAny = true;
            }
          } catch (e) { console.error("[recover] whatsapp error:", e); }
        }

        await supabase.from("abandoned_cart_reminders").insert({
          session_id: session.id,
          channel: phone ? "whatsapp" : "email",
          message_text: phone ? whatsappText : `Email sent to ${session.user_email}`,
          coupon_code: couponCode,
          coupon_discount: discountValue,
          status: sentAny ? "sent" : "failed",
          sent_at: sentAny ? new Date().toISOString() : null,
        });

        await supabase.from("abandoned_cart_sessions").update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString(),
          coupon_code: couponCode,
        }).eq("id", session.id);

        summary.processed += 1;
        if (sentAny) summary.remindersSent += 1;
        else summary.failed += 1;
      } catch (error) {
        console.error("[recover] failed session", session.id, error);
        summary.failed += 1;
      }
    }

    return new Response(
      JSON.stringify({ success: true, reminderHours, cutoffIso, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[recover-abandoned-carts] error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
