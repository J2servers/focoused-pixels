// Semanal: reativa clientes sem compras há 60-180 dias com cupom de boas-vindas.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized } from "../_shared/cron-auth.ts";

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!isCronAuthorized(req)) return new Response("Unauthorized", { status: 401, headers: cors });

  const result = await auditRun("cron-reactivate-inactive", async (sb) => {
    const sixtyDays = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const oneEighty = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const { data: orders } = await sb.from("orders")
      .select("customer_email, customer_name, customer_phone, created_at")
      .eq("payment_status", "approved")
      .lte("created_at", sixtyDays).gte("created_at", oneEighty)
      .order("created_at", { ascending: false }).limit(500);

    if (!orders?.length) return { customers: 0, sent: 0 };

    // Dedup por email
    const seen = new Set<string>();
    const unique = orders.filter(o => {
      const k = (o.customer_email ?? "").toLowerCase();
      if (!k || seen.has(k)) return false; seen.add(k); return true;
    });

    let sent = 0, failed = 0;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cupom único 10% off válido 14 dias
    const couponCode = `VOLTE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await sb.from("coupons").insert({
      code: couponCode, description: "Reativação clientes inativos",
      type: "percentage", value: 10, usage_limit: unique.length, usage_count: 0,
      is_active: true, start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    for (const o of unique.slice(0, 50)) {
      const html = `<div style="font-family:Arial"><h2>Sentimos sua falta, ${(o.customer_name ?? "").split(" ")[0]}!</h2><p>Use o cupom <strong>${couponCode}</strong> e ganhe <strong>10% OFF</strong> na sua próxima compra.</p><p>Válido por 14 dias.</p></div>`;
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({ to: o.customer_email, subject: "Voltamos com 10% OFF para você 🎁", html }),
        });
        if (resp.ok) sent++; else failed++;
      } catch { failed++; }
    }
    return { customers: unique.length, sent, failed, coupon: couponCode };
  });

  return new Response(JSON.stringify(result), { status: result.ok ? 200 : 500, headers: { ...cors, "Content-Type": "application/json" } });
});
