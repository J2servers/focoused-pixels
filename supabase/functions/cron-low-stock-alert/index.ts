// Diário: alerta admin sobre produtos com estoque <= low_stock_threshold.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized } from "../_shared/cron-auth.ts";

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401, headers: cors });

  const result = await auditRun("cron-low-stock-alert", async (sb) => {
    const { data: company } = await sb.from("company_info")
      .select("notification_email, low_stock_threshold, enable_stock_alerts, company_name")
      .order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (!company?.enable_stock_alerts) return { skipped: true };
    const threshold = Number(company?.low_stock_threshold ?? 5);
    const email = company?.notification_email;
    if (!email) return { skipped: true, reason: "no_notification_email" };

    const { data: products } = await sb.from("products")
      .select("name, sku, stock")
      .eq("status", "active").is("deleted_at", null)
      .lte("stock", threshold).order("stock", { ascending: true }).limit(100);

    if (!products?.length) return { products: 0, sent: false };

    const rows = products.map(p => `<tr><td>${p.name}</td><td>${p.sku ?? "-"}</td><td style="text-align:center;color:${(p.stock ?? 0) === 0 ? "#dc2626" : "#d97706"};font-weight:bold">${p.stock ?? 0}</td></tr>`).join("");
    const html = `<div style="font-family:Arial,sans-serif"><h2>⚠️ Alerta de Estoque Baixo - ${company.company_name}</h2><p>${products.length} produto(s) com estoque ≤ ${threshold}:</p><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Produto</th><th>SKU</th><th>Estoque</th></tr>${rows}</table></div>`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: email, subject: `⚠️ ${products.length} produtos com estoque baixo`, html, from_name: company.company_name }),
    });
    return { products: products.length, sent: true };
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500, headers: { ...cors, "Content-Type": "application/json" } });
});
