import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

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
  return value.slice(0, 100).map((raw) => {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const id = sanitizeText(item.id, 80);
    const name = sanitizeText(item.name, 160) || "Produto";
    const quantityRaw = Number(item.quantity ?? 1);
    const priceRaw = Number(item.price ?? 0);
    if (!id || !Number.isFinite(quantityRaw) || quantityRaw <= 0) return null;
    return {
      id, name,
      price: Number.isFinite(priceRaw) ? Math.max(0, Number(priceRaw.toFixed(2))) : 0,
      quantity: Math.max(1, Math.min(999, Math.round(quantityRaw))),
      size: sanitizeText(item.size, 40),
      image: sanitizeText(item.image, 500),
    };
  }).filter(Boolean);
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const __pre = handlePreflight(req);
  if (__pre) return __pre;
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing config" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sessionId = sanitizeCartToken(body.cartToken);
    const items = sanitizeItems(body.items);
    const total = Number(body.total);
    const cartTotal = Number.isFinite(total) ? Math.max(0, Number(total.toFixed(2))) : 0;

    const customer = body.customer && typeof body.customer === "object"
      ? body.customer as Record<string, unknown> : {};

    const hasCart = items.length > 0 && cartTotal > 0;

    // Browser metadata enrichment (LGPD-safe + advanced)
    const browserRaw = (body.browser && typeof body.browser === "object") ? body.browser as Record<string, unknown> : {};
    const browserMeta = {
      userAgent: sanitizeText(browserRaw.userAgent, 500),
      language: sanitizeText(browserRaw.language, 20),
      languages: Array.isArray(browserRaw.languages) ? browserRaw.languages.slice(0, 8).map(l => sanitizeText(l, 20)).filter(Boolean) : [],
      timezone: sanitizeText(browserRaw.timezone, 60),
      timezoneOffset: typeof browserRaw.timezoneOffset === "number" ? browserRaw.timezoneOffset : null,
      screen: browserRaw.screen ?? null,
      viewport: browserRaw.viewport ?? null,
      platform: sanitizeText(browserRaw.platform, 60),
      vendor: sanitizeText(browserRaw.vendor, 60),
      hardwareConcurrency: typeof browserRaw.hardwareConcurrency === "number" ? browserRaw.hardwareConcurrency : null,
      deviceMemory: typeof browserRaw.deviceMemory === "number" ? browserRaw.deviceMemory : null,
      connection: browserRaw.connection ?? null,
      referrer: sanitizeText(browserRaw.referrer, 500),
      utm: browserRaw.utm ?? null,
      sourcePath: sanitizeText(body.sourcePath, 500),
      capturedAt: new Date().toISOString(),
    };

    const payload: Record<string, unknown> = {
      session_id: sessionId,
      user_name: sanitizeText(customer.name, 140),
      user_email: normalizeEmail(customer.email),
      user_phone: normalizePhone(customer.phone),
      cart_items: items,
      cart_total: cartTotal,
      last_activity_at: new Date().toISOString(),
      browser_metadata: browserMeta,
    };

    if (!hasCart) {
      payload.cart_total = 0;
      payload.cart_items = [];
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { error } = await supabase
      .from("abandoned_cart_sessions")
      .upsert(payload, { onConflict: "session_id" });

    if (error) {
      console.error("[upsert-abandoned-cart] error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, sessionId, status: hasCart ? "active" : "ignored" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[upsert-abandoned-cart] error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
