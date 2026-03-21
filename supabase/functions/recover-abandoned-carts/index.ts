import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AbandonedSession {
  id: string;
  cart_token: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  cart_total: number | null;
  item_count: number;
  cart_items: unknown;
  reminder_count: number;
  coupon_id: string | null;
  coupon_code: string | null;
}

interface ReminderAttempt {
  channel: "email" | "whatsapp";
  status: "sent" | "failed" | "skipped";
  recipient: string | null;
  errorMessage?: string;
  payload?: unknown;
  sentAt?: string;
}

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getCartPreview(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return "Seu carrinho ainda esta salvo para voce.";

  const preview = (items as Array<Record<string, unknown>>)
    .slice(0, 3)
    .map((item) => {
      const name = typeof item.name === "string" ? item.name : "Produto";
      const quantity = Number(item.quantity ?? 1);
      return `- ${name} x${Number.isFinite(quantity) ? quantity : 1}`;
    })
    .join("\n");

  return preview;
}

function buildCouponCode(cartToken: string, attempt: number): string {
  const suffix = cartToken.slice(-4).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 3).toUpperCase();
  return `VOLTA${suffix}${attempt}${random}`;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function ensureCoupon(
  supabase: ReturnType<typeof createClient>,
  session: AbandonedSession,
  attempt: number,
): Promise<{ couponId: string | null; couponCode: string; discountValue: number }> {
  if (session.coupon_id && session.coupon_code) {
    return { couponId: session.coupon_id, couponCode: session.coupon_code, discountValue: attempt === 1 ? 10 : 12 };
  }

  const discountValue = attempt === 1 ? 10 : 12;
  const nowIso = new Date().toISOString();
  const expiresAtIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const minOrder = Math.max(0, Number((session.cart_total ?? 0) * 0.4));

  for (let i = 0; i < 3; i += 1) {
    const code = buildCouponCode(session.cart_token, attempt);
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code,
        description: `Recuperacao de carrinho ${session.id}`,
        type: "percentage",
        value: discountValue,
        min_order_value: Number(minOrder.toFixed(2)),
        usage_limit: 1,
        usage_count: 0,
        is_active: true,
        start_date: nowIso,
        end_date: expiresAtIso,
      })
      .select("id, code")
      .single();

    if (!error && data) {
      return { couponId: data.id as string, couponCode: data.code as string, discountValue };
    }

    const details = String(error?.message ?? "").toLowerCase();
    if (!details.includes("duplicate") && !details.includes("unique")) {
      throw error;
    }
  }

  throw new Error("Could not create a unique coupon for abandoned cart recovery");
}

async function logReminderAttempt(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  attemptNumber: number,
  couponCode: string,
  attempt: ReminderAttempt,
): Promise<void> {
  await supabase.from("abandoned_cart_reminders").insert({
    session_id: sessionId,
    attempt_number: attemptNumber,
    channel: attempt.channel,
    recipient: attempt.recipient,
    status: attempt.status,
    coupon_code: couponCode,
    response_payload: (attempt.payload ?? null) as Record<string, unknown> | null,
    error_message: attempt.errorMessage ?? null,
    sent_at: attempt.sentAt ?? null,
  });
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
    const cronSecret = Deno.env.get("ABANDONED_CART_CRON_SECRET");
    const incomingSecret = req.headers.get("x-cron-secret");

    if (!cronSecret || incomingSecret !== cronSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const storefrontUrl = (Deno.env.get("STORE_URL") || "https://pinceldeluz.com.br").replace(/\/$/, "");

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: companyInfo } = await supabase
      .from("company_info")
      .select("company_name, abandoned_cart_reminder_hours")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const reminderHours = Math.max(1, Number(companyInfo?.abandoned_cart_reminder_hours ?? 2));
    const companyName = companyInfo?.company_name || "Pincel de Luz";
    const cutoffIso = new Date(Date.now() - reminderHours * 60 * 60 * 1000).toISOString();

    const { data: sessions, error: sessionsError } = await supabase
      .from("abandoned_cart_sessions")
      .select("id, cart_token, lead_name, lead_email, lead_phone, cart_total, item_count, cart_items, reminder_count, coupon_id, coupon_code")
      .in("status", ["active", "abandoned"])
      .lt("reminder_count", 2)
      .gt("item_count", 0)
      .lte("last_activity_at", cutoffIso)
      .or("lead_email.not.is.null,lead_phone.not.is.null")
      .order("last_activity_at", { ascending: true })
      .limit(100);

    if (sessionsError) {
      throw sessionsError;
    }

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
      const attemptNumber = session.reminder_count + 1;

      try {
        const coupon = await ensureCoupon(supabase, session, attemptNumber);
        const firstName = session.lead_name?.split(" ")[0] || "Oi";
        const total = Number(session.cart_total ?? 0);
        const recoveryLink = `${storefrontUrl}/carrinho?cupom=${encodeURIComponent(coupon.couponCode)}`;

        const whatsappText =
          `${firstName}, seus produtos ainda estao no carrinho.\n\n` +
          `Cupom exclusivo: *${coupon.couponCode}* (${coupon.discountValue}% OFF)\n` +
          `Valor atual: ${formatCurrency(total)}\n` +
          `Finalize agora: ${recoveryLink}`;

        const emailHtml = `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:24px;">
            <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e5e7eb;">
              <h2 style="margin:0 0 12px;color:#111827;">Seu carrinho ainda esta reservado</h2>
              <p style="margin:0 0 8px;color:#374151;">${firstName}, separamos um incentivo para voce concluir sua compra.</p>
              <p style="margin:0 0 16px;color:#374151;"><strong>Cupom:</strong> ${coupon.couponCode} (${coupon.discountValue}% OFF)</p>
              <p style="margin:0 0 16px;color:#374151;"><strong>Total atual:</strong> ${formatCurrency(total)}</p>
              <pre style="background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap;color:#111827;">${getCartPreview(session.cart_items)}</pre>
              <a href="${recoveryLink}" style="display:inline-block;margin-top:16px;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Retomar compra</a>
              <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">Oferta valida por tempo limitado. Equipe ${companyName}.</p>
            </div>
          </div>
        `;

        const attempts: ReminderAttempt[] = [];

        if (session.lead_email) {
          const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              to: session.lead_email,
              subject: `${firstName}, seu carrinho te espera com ${coupon.discountValue}% OFF`,
              html: emailHtml,
              from_name: companyName,
            }),
          });

          const payload = await safeJson(response);
          const sent = response.ok && !!(payload as { success?: boolean } | null)?.success;
          attempts.push({
            channel: "email",
            status: sent ? "sent" : "failed",
            recipient: session.lead_email,
            payload,
            sentAt: sent ? new Date().toISOString() : undefined,
            errorMessage: sent ? undefined : `Email send failed (${response.status})`,
          });
        } else {
          attempts.push({ channel: "email", status: "skipped", recipient: null, errorMessage: "Missing email" });
        }

        const normalizedPhone = normalizePhone(session.lead_phone);
        if (normalizedPhone) {
          const response = await fetch(`${supabaseUrl}/functions/v1/whatsapp-evolution`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              action: "sendText",
              number: normalizedPhone,
              text: whatsappText,
              recipientName: session.lead_name,
            }),
          });

          const payload = await safeJson(response);
          const sent = response.ok && !!(payload as { success?: boolean } | null)?.success;
          attempts.push({
            channel: "whatsapp",
            status: sent ? "sent" : "failed",
            recipient: normalizedPhone,
            payload,
            sentAt: sent ? new Date().toISOString() : undefined,
            errorMessage: sent ? undefined : `WhatsApp send failed (${response.status})`,
          });
        } else {
          attempts.push({ channel: "whatsapp", status: "skipped", recipient: null, errorMessage: "Missing valid phone" });
        }

        let sentAtLeastOne = false;
        let failedCount = 0;
        let skippedCount = 0;
        for (const attempt of attempts) {
          await logReminderAttempt(supabase, session.id, attemptNumber, coupon.couponCode, attempt);
          if (attempt.status === "sent") {
            sentAtLeastOne = true;
            if (attempt.channel === "email") summary.emailSent += 1;
            if (attempt.channel === "whatsapp") summary.whatsappSent += 1;
          }
          if (attempt.status === "failed") failedCount += 1;
          if (attempt.status === "skipped") skippedCount += 1;
        }

        let nextStatus: "active" | "abandoned" | "ignored" = "abandoned";
        if (!sentAtLeastOne && failedCount > 0) {
          nextStatus = "active";
        } else if (!sentAtLeastOne && skippedCount === attempts.length) {
          nextStatus = "ignored";
        }

        if (!sentAtLeastOne && failedCount > 0) {
          summary.failed += 1;
        }
        if (!sentAtLeastOne && skippedCount === attempts.length) {
          summary.skipped += 1;
        }

        await supabase
          .from("abandoned_cart_sessions")
          .update({
            status: nextStatus,
            reminder_count: attemptNumber,
            first_reminder_at: session.reminder_count === 0 ? new Date().toISOString() : undefined,
            last_reminder_at: new Date().toISOString(),
            coupon_id: coupon.couponId,
            coupon_code: coupon.couponCode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.id);

        summary.processed += 1;
        if (sentAtLeastOne) summary.remindersSent += 1;
      } catch (error) {
        console.error("[recover-abandoned-carts] failed processing session", session.id, error);
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
