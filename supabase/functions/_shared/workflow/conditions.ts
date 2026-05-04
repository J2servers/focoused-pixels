import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { TriggerData } from "./types.ts";

export async function evaluateCondition(
  supabase: SupabaseClient,
  checkType: string,
  triggerData: TriggerData,
): Promise<boolean> {
  const orderId = (triggerData.order_id || (triggerData as Record<string, unknown>).id) as string | undefined;

  switch (checkType) {
    case "payment_confirmed":
    case "Pagamento confirmado?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("payment_status").eq("id", orderId).maybeSingle();
      return order?.payment_status === "paid" || order?.payment_status === "approved";
    }
    case "boleto_expired":
    case "Boleto vencido?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("created_at, payment_method").eq("id", orderId).maybeSingle();
      if (!order || order.payment_method !== "boleto") return false;
      const { data: payConfig } = await supabase.from("payment_credentials").select("boleto_extra_days").limit(1).maybeSingle();
      const extraDays = payConfig?.boleto_extra_days || 3;
      const created = new Date(order.created_at);
      created.setDate(created.getDate() + extraDays);
      return new Date() > created;
    }
    case "order_shipped":
    case "Pedido enviado?": {
      if (!orderId) return false;
      const { data: order } = await supabase.from("orders").select("order_status").eq("id", orderId).maybeSingle();
      return order?.order_status === "shipped" || order?.order_status === "delivered";
    }
    case "cart_recovered":
    case "Carrinho recuperado?": {
      const sessionId = triggerData.session_id;
      if (!sessionId) return false;
      const { data: session } = await supabase.from("abandoned_cart_sessions").select("recovered").eq("session_id", sessionId).maybeSingle();
      return session?.recovered === true;
    }
    case "order_value_above_100":
    case "Valor acima de R$100?": {
      const raw = String(triggerData.amount ?? "0").replace(/[^\d.,]/g, "").replace(",", ".");
      return parseFloat(raw) > 100;
    }
    case "order_value_above_500":
    case "Valor acima de R$500?": {
      const raw = String(triggerData.amount ?? "0").replace(/[^\d.,]/g, "").replace(",", ".");
      return parseFloat(raw) > 500;
    }
    case "is_repeat_customer":
    case "Cliente recorrente?": {
      const email = triggerData.customer_email;
      if (!email) return false;
      const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_email", email);
      return (count || 0) > 1;
    }
    case "has_phone":
    case "Tem telefone?":
      return !!triggerData.customer_phone;
    default:
      return false;
  }
}
