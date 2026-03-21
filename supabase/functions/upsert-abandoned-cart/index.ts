import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeText(value: unknown, maxLength = 255): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().slice(0, maxLength);
  return normalized.length > 0 ? normalized : null;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 320) return null;
  return email;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function sanitizeCartToken(value: unknown): string {
  if (typeof value === "string") {
    const token = value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 72);
    if (token.length >= 8) return token;
  }
  return crypto.randomUUID().replace(/-/g, "");
}

function sanitizeItems(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 100)
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Record<string, unknown>;

      const id = sanitizeText(item.id, 80);
      const name = sanitizeText(item.name, 160) || "Produto";
      const quantityRaw = Number(item.quantity ?? 1);
      const priceRaw = Number(item.price ?? 0);

      if (!id || !Number.isFinite(quantityRaw) || quantityRaw <= 0) return null;

      const quantity = Math.max(1, Math.min(999, Math.round(quantityRaw)));
      const price = Number.isFinite(priceRaw) ? Math.max(0, Number(priceRaw.toFixed(2))) : 0;

      return {
        id,
        name,
        price,
        quantity,
        size: sanitizeText(item.size, 40),
        image: sanitizeText(item.image, 500),
      };
    })
    .filter((item): item is Record<string, unknown> => item !== null);
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cartToken = sanitizeCartToken(body.cartToken);
    const items = sanitizeItems(body.items);

    const computedItemCount = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
    const requestedItemCount = Number(body.itemCount);
    const itemCount = Number.isFinite(requestedItemCount)
      ? Math.max(0, Math.min(9999, Math.round(requestedItemCount)))
      : computedItemCount;

    const requestedTotal = Number(body.total);
    const computedTotal = Number(
      items
        .reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0)
        .toFixed(2),
    );

    const total = Number.isFinite(requestedTotal)
      ? Math.max(0, Number(requestedTotal.toFixed(2)))
      : computedTotal;

    const sourcePath = sanitizeText(body.sourcePath, 255);

    const customer = body.customer && typeof body.customer === "object"
      ? body.customer as Record<string, unknown>
      : {};

    const leadEmail = normalizeEmail(customer.email);
    const leadPhone = normalizePhone(customer.phone);
    const leadName = sanitizeText(customer.name, 140);
    const userIdCandidate = sanitizeText(customer.userId, 40);
    const userId = userIdCandidate && UUID_REGEX.test(userIdCandidate) ? userIdCandidate : null;

    const now = new Date().toISOString();
    const hasCart = itemCount > 0 && items.length > 0;

    const payload: Record<string, unknown> = {
      cart_token: cartToken,
      user_id: userId,
      lead_name: leadName,
      lead_email: leadEmail,
      lead_phone: leadPhone,
      cart_items: items,
      cart_total: total,
      item_count: hasCart ? itemCount : 0,
      source_path: sourcePath,
      status: hasCart ? "active" : "ignored",
      last_activity_at: now,
      updated_at: now,
      metadata: {
        last_user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      },
    };

    if (hasCart) {
      payload.reminder_count = 0;
      payload.first_reminder_at = null;
      payload.last_reminder_at = null;
      payload.coupon_id = null;
      payload.coupon_code = null;
      payload.recovered_at = null;
      payload.converted_order_id = null;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase
      .from("abandoned_cart_sessions")
      .upsert(payload, { onConflict: "cart_token" });

    if (error) {
      console.error("[upsert-abandoned-cart] upsert error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        cartToken,
        status: hasCart ? "active" : "ignored",
        itemCount: hasCart ? itemCount : 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[upsert-abandoned-cart] error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
