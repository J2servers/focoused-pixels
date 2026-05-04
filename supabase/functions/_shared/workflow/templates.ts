import type { TriggerData } from "./types.ts";

export function replaceVars(template: string, vars: TriggerData): string {
  const v = vars as Record<string, unknown>;
  const aliases: Record<string, string> = {
    nome: String(v.customer_name ?? ""),
    valor: String(v.amount ?? v.total ?? ""),
    prazo: String(v.expiration_date ?? ""),
    pedido: String(v.order_number ?? ""),
    telefone: String(v.customer_phone ?? ""),
    email: String(v.customer_email ?? ""),
    endereco: String(v.shipping_address ?? ""),
    cidade: String(v.shipping_city ?? ""),
    estado: String(v.shipping_state ?? ""),
    cep: String(v.shipping_cep ?? ""),
    cupom: String(v.coupon_code ?? ""),
    desconto: String(v.coupon_value ?? ""),
  };
  const merged = { ...aliases, ...v };

  let result = template;
  for (const [key, value] of Object.entries(merged)) {
    if (typeof value === "string" || typeof value === "number") {
      result = result.replaceAll(`{{${key}}}`, String(value));
      result = result.replaceAll(`{${key}}`, String(value));
    }
  }
  return result;
}
