// Edge function: report-error
// Recebe erros do frontend (anônimo permitido) e persiste em system_errors com deduplicação por fingerprint.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { createLogger } from "../_shared/logger.ts";

const log = createLogger("report-error");

interface ErrorPayload {
  level?: "fatal" | "error" | "warning" | "info";
  source?: "frontend" | "edge_function" | "database" | "cron" | "webhook" | "payment";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  url?: string;
  user_agent?: string;
  user_id?: string | null;
}

async function fingerprintOf(message: string, stack?: string): Promise<string> {
  const top = (stack ?? "").split("\n").slice(0, 3).join("|");
  const data = new TextEncoder().encode(`${message}::${top}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const body = await req.json() as ErrorPayload;
    if (!body?.message || typeof body.message !== "string") {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const message = body.message.slice(0, 2000);
    const stack = body.stack?.slice(0, 8000);
    const fp = await fingerprintOf(message, stack);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Dedup: se já existe um não-resolvido com mesmo fingerprint nas últimas 24h, incrementa
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("system_errors")
      .select("id, occurrences")
      .eq("fingerprint", fp)
      .eq("resolved", false)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      await supabase.from("system_errors")
        .update({ occurrences: (existing.occurrences ?? 1) + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return new Response(JSON.stringify({ ok: true, deduped: true, id: existing.id }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data, error } = await supabase.from("system_errors").insert({
      level: body.level ?? "error",
      source: body.source ?? "frontend",
      message,
      stack,
      context: body.context ?? {},
      url: body.url?.slice(0, 1000),
      user_agent: body.user_agent?.slice(0, 500),
      user_id: body.user_id ?? null,
      fingerprint: fp,
    }).select("id").single();

    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: data.id }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    log.error("report-error failed", e);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
