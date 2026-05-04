// Limpeza diária: login_attempts antigos, page_views > 90 dias, cron_runs > 30 dias,
// failures resolvidas > 30 dias, sessões abandonadas recovered > 60 dias.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized } from "../_shared/cron-auth.ts";

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401, headers: cors });

  const result = await auditRun("cron-cleanup", async (sb) => {
    const summary: Record<string, number> = {};
    const ninetyDays = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDays = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    await sb.rpc("cleanup_old_login_attempts").then(() => { summary.login_attempts = 1; }).catch(() => {});

    const r1 = await sb.from("page_views").delete().lt("created_at", ninetyDays).select("id");
    summary.page_views = r1.data?.length ?? 0;

    const r2 = await sb.from("system_cron_runs").delete().lt("started_at", thirtyDays).select("id");
    summary.cron_runs = r2.data?.length ?? 0;

    const r3 = await sb.from("notification_failures").delete().eq("resolved", true).lt("updated_at", thirtyDays).select("id");
    summary.failures = r3.data?.length ?? 0;

    const r4 = await sb.from("abandoned_cart_sessions").delete().eq("recovered", true).lt("recovered_at", sixtyDays).select("id");
    summary.abandoned_carts = r4.data?.length ?? 0;

    return summary;
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500, headers: { ...cors, "Content-Type": "application/json" } });
});
