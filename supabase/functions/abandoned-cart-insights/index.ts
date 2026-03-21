import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface ProductInsight {
  key: string;
  name: string;
  quantity: number;
  value: number;
  sessions: number;
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

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("has_admin_access", {
      _user_id: userData.user.id,
    });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await supabase
      .from("abandoned_cart_sessions")
      .select("id, status, cart_total, item_count, cart_items, reminder_count")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    const sessions = Array.isArray(data) ? data : [];

    const abandonedSessions = sessions.filter((s) => {
      const status = String(s.status || "");
      return status === "active" || status === "abandoned";
    });

    const recoveredSessions = sessions.filter((s) => String(s.status || "") === "recovered");
    const remindersSent = sessions.filter((s) => Number(s.reminder_count || 0) > 0);
    const recoveredAfterReminder = recoveredSessions.filter((s) => Number(s.reminder_count || 0) > 0);

    const productMap = new Map<string, ProductInsight>();

    for (const session of abandonedSessions) {
      const sessionItems = Array.isArray(session.cart_items)
        ? session.cart_items as Array<Record<string, unknown>>
        : [];

      for (const item of sessionItems) {
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
          productMap.set(id, {
            key: id,
            name,
            quantity,
            value: quantity * price,
            sessions: 1,
          });
        }
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const totalAbandonedValue = abandonedSessions.reduce((sum, session) => {
      const value = Number(session.cart_total || 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    const insights = {
      sessionsAbandoned: abandonedSessions.length,
      sessionsRecovered: recoveredSessions.length,
      remindersSent: remindersSent.length,
      recoveryRate: remindersSent.length > 0 ? (recoveredAfterReminder.length / remindersSent.length) * 100 : 0,
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
