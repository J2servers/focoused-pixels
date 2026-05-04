// Diário 08:00 BRT: relatório executivo (vendas, pedidos, leads).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized } from "../_shared/cron-auth.ts";

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401, headers: cors });

  const result = await auditRun("cron-daily-report", async (sb) => {
    const { data: company } = await sb.from("company_info")
      .select("notification_email, company_name").order("updated_at", { ascending: false }).limit(1).maybeSingle();
    const email = company?.notification_email;
    if (!email) return { skipped: true };

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [orders, leads, abandoned] = await Promise.all([
      sb.from("orders").select("id, total, payment_status, created_at").gte("created_at", since),
      sb.from("leads").select("id, created_at").gte("created_at", since),
      sb.from("abandoned_cart_sessions").select("id, cart_total").gte("created_at", since).eq("recovered", false),
    ]);

    const total24 = (orders.data ?? []).filter(o => o.payment_status === "approved").reduce((s, o) => s + Number(o.total ?? 0), 0);
    const html = `<div style="font-family:Arial"><h2>📊 Relatório Diário - ${company?.company_name}</h2>
      <p><strong>Vendas confirmadas (24h):</strong> R$ ${total24.toFixed(2)}</p>
      <p><strong>Pedidos novos:</strong> ${orders.data?.length ?? 0}</p>
      <p><strong>Leads captados:</strong> ${leads.data?.length ?? 0}</p>
      <p><strong>Carrinhos abandonados:</strong> ${abandoned.data?.length ?? 0} (R$ ${(abandoned.data ?? []).reduce((s, c) => s + Number(c.cart_total ?? 0), 0).toFixed(2)})</p></div>`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: email, subject: `📊 Relatório diário - ${new Date().toLocaleDateString("pt-BR")}`, html }),
    });
    return { sent: true, total24, orders: orders.data?.length ?? 0 };
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500, headers: { ...cors, "Content-Type": "application/json" } });
});
