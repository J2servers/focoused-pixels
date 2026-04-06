import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "").trim();
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: isAdmin, error: adminError } = await adminClient.rpc("has_admin_access", {
      _user_id: userId,
    });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await adminClient
      .from("abandoned_cart_sessions")
      .select("id, cart_total, cart_items, recovered, reminder_sent")
      .order("last_activity_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const sessions = Array.isArray(data) ? data : [];

    // "abandoned" = not recovered sessions with items
    const abandonedSessions = sessions.filter((s) => !s.recovered);
    const recoveredSessions = sessions.filter((s) => s.recovered);
    const withReminder = sessions.filter((s) => s.reminder_sent);
    const recoveredAfterReminder = recoveredSessions.filter((s) => s.reminder_sent);

    // Top products analysis
    interface ProductInsight {
      key: string;
      name: string;
      quantity: number;
      value: number;
      sessions: number;
    }

    const productMap = new Map<string, ProductInsight>();
    for (const session of abandonedSessions) {
      const items = Array.isArray(session.cart_items)
        ? session.cart_items as Array<Record<string, unknown>>
        : [];
      for (const item of items) {
        const id = typeof item.id === "string" ? item.id : "unknown";
        const name = typeof item.name === "string" ? item.name : "Produto";
        const quantity = Math.max(1, Number(item.quantity || 1));
        const price = Math.max(0, Number(item.price || 0));
        const existing = productMap.get(id);
        if (existing) {
          existing.quantity += quantity;
          existing.value += quantity * price;
          existing.sessions += 1;
        } else {
          productMap.set(id, { key: id, name, quantity, value: quantity * price, sessions: 1 });
        }
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalAbandonedValue = abandonedSessions.reduce((sum, s) => {
      const v = Number(s.cart_total || 0);
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);

    const insights = {
      sessionsAbandoned: abandonedSessions.length,
      sessionsRecovered: recoveredSessions.length,
      remindersSent: withReminder.length,
      recoveryRate: withReminder.length > 0 ? (recoveredAfterReminder.length / withReminder.length) * 100 : 0,
      totalAbandonedValue: Number(totalAbandonedValue.toFixed(2)),
      topProductName: topProducts[0]?.name || "N/A",
      topProducts,
    };

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[abandoned-cart-insights] error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
