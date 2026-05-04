// Mercado Pago config loader.
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface MercadoPagoConfig {
  accessToken: string;
  sandbox: boolean;
  publicKey: string | null;
  pixDiscountPercent: number;
  maxInstallments: number;
  minInstallmentValue: number;
  boletoExtraDays: number;
}

export async function getMercadoPagoConfig(supabase: SupabaseClient): Promise<MercadoPagoConfig> {
  const { data, error } = await supabase
    .from("payment_credentials")
    .select(`
      mercadopago_enabled,
      mercadopago_public_key,
      mercadopago_access_token,
      mercadopago_sandbox,
      pix_discount_percent,
      max_installments,
      min_installment_value,
      boleto_extra_days
    `)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error("Failed to get payment config: " + error.message);

  const config = data as {
    mercadopago_enabled: boolean | null;
    mercadopago_public_key: string | null;
    mercadopago_access_token: string | null;
    mercadopago_sandbox: boolean | null;
    pix_discount_percent: number | null;
    max_installments: number | null;
    min_installment_value: number | null;
    boleto_extra_days: number | null;
  } | null;

  if (!config?.mercadopago_enabled) throw new Error("Mercado Pago is not enabled");
  if (!config?.mercadopago_access_token) throw new Error("Mercado Pago access token not configured");

  return {
    accessToken: config.mercadopago_access_token,
    sandbox: config.mercadopago_sandbox ?? true,
    publicKey: config.mercadopago_public_key,
    pixDiscountPercent: config.pix_discount_percent ?? 5,
    maxInstallments: config.max_installments ?? 12,
    minInstallmentValue: config.min_installment_value ?? 50,
    boletoExtraDays: config.boleto_extra_days ?? 3,
  };
}
