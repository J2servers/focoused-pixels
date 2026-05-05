// Notifica clientes com pedidos PIX/Boleto aguardando pagamento.
// Cadência: lembrete 1 após 2h, lembrete 2 após 12h. Máximo 2 lembretes.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { auditRun, isCronAuthorized, recordFailure } from "../_shared/cron-auth.ts";

interface PendingOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  payment_method: string | null;
  created_at: string;
  payment_reminder_count: number;
  last_payment_reminder_at: string | null;
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const pre = handlePreflight(req); if (pre) return pre;
  if (!(await isCronAuthorized(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = await auditRun("notify-pending-payments", async (sb) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const now = Date.now();

    // Buscar pedidos pendentes que precisam de lembrete (última atividade > 2h e count < 2)
    const cutoff = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const { data, error } = await sb
      .from("orders")
      .select("id, order_number, customer_name, customer_email, customer_phone, total, payment_method, created_at, payment_reminder_count, last_payment_reminder_at")
      .eq("payment_status", "pending")
      .in("payment_method", ["pix", "boleto"])
      .lt("payment_reminder_count", 2)
      .lte("created_at", cutoff)
      .order("created_at", { ascending: true })
      .limit(80);
    if (error) throw error;

    const orders = (data ?? []) as PendingOrder[];
    const summary = { scanned: orders.length, sent: 0, skipped: 0, failed: 0 };

    for (const o of orders) {
      // Cadência: 1º lembrete 2h após criação, 2º lembrete 10h após o primeiro
      const ageMs = now - new Date(o.created_at).getTime();
      const sinceLast = o.last_payment_reminder_at ? now - new Date(o.last_payment_reminder_at).getTime() : Infinity;
      const due =
        (o.payment_reminder_count === 0 && ageMs >= 2 * 60 * 60 * 1000) ||
        (o.payment_reminder_count === 1 && sinceLast >= 10 * 60 * 60 * 1000);
      if (!due) { summary.skipped++; continue; }

      const event = o.payment_method === "boleto" ? "boleto_reminder" : "pix_generated";
      const payload = {
        event,
        customer: { name: o.customer_name, email: o.customer_email, phone: o.customer_phone },
        order: {
          orderId: o.id,
          orderNumber: o.order_number,
          amount: Number(o.total ?? 0),
          description: `Pedido ${o.order_number} aguardando pagamento (${formatBRL(Number(o.total ?? 0))})`,
          paymentMethod: o.payment_method ?? undefined,
        },
      };

      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/notify-customer`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error(`notify-customer ${resp.status}`);
        await sb.from("orders").update({
          payment_reminder_count: o.payment_reminder_count + 1,
          last_payment_reminder_at: new Date().toISOString(),
        }).eq("id", o.id);
        summary.sent++;
      } catch (e) {
        summary.failed++;
        await recordFailure(sb, "notify-customer", event, o.customer_email, payload, e instanceof Error ? e.message : String(e));
      }
    }
    return summary;
  });

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
