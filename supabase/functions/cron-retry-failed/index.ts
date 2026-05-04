// A cada 15min: retry de notificações falhadas (max 5 tentativas, backoff exponencial).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized } from "../_shared/cron-auth.ts";

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401, headers: cors });

  const result = await auditRun("cron-retry-failed", async (sb) => {
    const { data: failures } = await sb.from("notification_failures")
      .select("*").eq("resolved", false).lt("attempts", 5).lte("next_retry_at", new Date().toISOString())
      .order("next_retry_at", { ascending: true }).limit(50);

    if (!failures?.length) return { retries: 0 };
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    let success = 0, retried = 0;

    for (const f of failures) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/${f.channel}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify(f.payload),
        });
        if (resp.ok) {
          await sb.from("notification_failures").update({ resolved: true, updated_at: new Date().toISOString() }).eq("id", f.id);
          success++;
        } else {
          throw new Error(`HTTP ${resp.status}`);
        }
      } catch (e) {
        const attempts = (f.attempts ?? 0) + 1;
        const backoffMs = Math.min(60, Math.pow(2, attempts)) * 60 * 1000;
        await sb.from("notification_failures").update({
          attempts,
          last_error: e instanceof Error ? e.message : String(e),
          next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", f.id);
        retried++;
      }
    }
    return { processed: failures.length, success, retried };
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500, headers: { ...cors, "Content-Type": "application/json" } });
});
