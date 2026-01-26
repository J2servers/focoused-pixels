import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  action: 
    | "create_preference" 
    | "create_pix" 
    | "create_boleto"
    | "create_card_payment"
    | "check_status" 
    | "test_connection"
    | "get_installments"
    | "get_payment_methods";
  orderId?: string;
  amount?: number;
  description?: string;
  payerEmail?: string;
  payerName?: string;
  payerCpf?: string;
  payerPhone?: string;
  paymentId?: string;
  items?: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  // Card payment specific
  token?: string;
  installments?: number;
  issuerId?: string;
  paymentMethodId?: string;
  // Boleto specific
  expirationDays?: number;
  // For installments calculation
  bin?: string;
}

interface MercadoPagoConfig {
  accessToken: string;
  sandbox: boolean;
  publicKey: string | null;
  pixDiscountPercent: number;
  maxInstallments: number;
  minInstallmentValue: number;
  boletoExtraDays: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPaymentConfig(supabaseClient: any): Promise<MercadoPagoConfig> {
  const { data, error } = await supabaseClient
    .from("company_info")
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
    .maybeSingle();

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json() as PaymentRequest;
    const { 
      action, orderId, amount, description, payerEmail, payerName, payerCpf, payerPhone,
      paymentId, items, token, installments, issuerId, paymentMethodId, expirationDays, bin
    } = requestData;

    console.log(`[MercadoPago] Action: ${action}, OrderId: ${orderId}`);

    const config = await getPaymentConfig(supabase);
    const baseUrl = "https://api.mercadopago.com";

    // Test connection
    if (action === "test_connection") {
      const testResponse = await fetch(`${baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });
      
      if (testResponse.ok) {
        const userData = await testResponse.json();
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Conexão estabelecida com sucesso",
            account: {
              id: userData.id,
              email: userData.email,
              site_id: userData.site_id,
            },
            sandbox: config.sandbox,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const errorData = await testResponse.text();
        console.error("[MercadoPago] Test failed:", errorData);
        return new Response(
          JSON.stringify({ success: false, message: "Falha na conexão: credenciais inválidas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get payment methods
    if (action === "get_payment_methods") {
      const response = await fetch(`${baseUrl}/v1/payment_methods`, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });
      
      const methods = await response.json();
      return new Response(
        JSON.stringify({ 
          success: true, 
          paymentMethods: methods,
          config: {
            pixDiscountPercent: config.pixDiscountPercent,
            maxInstallments: config.maxInstallments,
            minInstallmentValue: config.minInstallmentValue,
            publicKey: config.publicKey,
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get installments for a given amount and card bin
    if (action === "get_installments") {
      if (!amount || !bin) {
        throw new Error("Amount and card bin are required");
      }

      const response = await fetch(
        `${baseUrl}/v1/payment_methods/installments?amount=${amount}&bin=${bin}`,
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        }
      );
      
      const installmentsData = await response.json();
      
      // Filter installments based on config
      if (installmentsData && installmentsData[0]) {
        const filtered = installmentsData[0].payer_costs.filter(
          (inst: { installments: number; installment_amount: number }) => 
            inst.installments <= config.maxInstallments && 
            inst.installment_amount >= config.minInstallmentValue
        );
        installmentsData[0].payer_costs = filtered;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          installments: installmentsData,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payment preference (for checkout redirect)
    if (action === "create_preference") {
      if (!items || items.length === 0) {
        throw new Error("Items are required for preference creation");
      }

      const preferenceData = {
        items: items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: "BRL",
        })),
        payer: {
          email: payerEmail,
          name: payerName,
        },
        external_reference: orderId,
        back_urls: {
          success: `${req.headers.get("origin")}/pagamento/sucesso`,
          failure: `${req.headers.get("origin")}/pagamento/erro`,
          pending: `${req.headers.get("origin")}/pagamento/pendente`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook?provider=mercadopago`,
        payment_methods: {
          installments: config.maxInstallments,
          default_installments: 1,
        },
      };

      const response = await fetch(`${baseUrl}/checkout/preferences`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferenceData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[MercadoPago] Create preference error:", data);
        throw new Error(data.message || "Failed to create preference");
      }

      console.log("[MercadoPago] Preference created:", data.id);

      return new Response(
        JSON.stringify({
          success: true,
          preferenceId: data.id,
          initPoint: config.sandbox ? data.sandbox_init_point : data.init_point,
          publicKey: config.publicKey,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create PIX payment
    if (action === "create_pix") {
      if (!amount || !payerEmail) {
        throw new Error("Amount and payer email are required for PIX");
      }

      // Apply PIX discount
      const discountedAmount = amount * (1 - config.pixDiscountPercent / 100);

      const pixData = {
        transaction_amount: Number(discountedAmount.toFixed(2)),
        description: description || "Pagamento via PIX - Pincel de Luz",
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName?.split(" ")[0] || "Cliente",
          last_name: payerName?.split(" ").slice(1).join(" ") || "",
          identification: payerCpf ? {
            type: "CPF",
            number: payerCpf.replace(/\D/g, ""),
          } : undefined,
        },
        external_reference: orderId,
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook?provider=mercadopago`,
      };

      const response = await fetch(`${baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `pix-${orderId}-${Date.now()}`,
        },
        body: JSON.stringify(pixData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[MercadoPago] Create PIX error:", data);
        throw new Error(data.message || data.cause?.[0]?.description || "Failed to create PIX payment");
      }

      console.log("[MercadoPago] PIX created:", data.id);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: data.id,
          status: data.status,
          originalAmount: amount,
          discountPercent: config.pixDiscountPercent,
          finalAmount: discountedAmount,
          qrCode: data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
          expirationDate: data.date_of_expiration,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Boleto payment
    if (action === "create_boleto") {
      if (!amount || !payerEmail || !payerName || !payerCpf) {
        throw new Error("Amount, payer email, name and CPF are required for Boleto");
      }

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (expirationDays || config.boletoExtraDays + 3));

      const boletoData = {
        transaction_amount: amount,
        description: description || "Pagamento via Boleto - Pincel de Luz",
        payment_method_id: "bolbradesco", // Bradesco boleto
        payer: {
          email: payerEmail,
          first_name: payerName.split(" ")[0],
          last_name: payerName.split(" ").slice(1).join(" ") || payerName.split(" ")[0],
          identification: {
            type: "CPF",
            number: payerCpf.replace(/\D/g, ""),
          },
        },
        external_reference: orderId,
        date_of_expiration: expirationDate.toISOString(),
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook?provider=mercadopago`,
      };

      const response = await fetch(`${baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `boleto-${orderId}-${Date.now()}`,
        },
        body: JSON.stringify(boletoData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[MercadoPago] Create Boleto error:", data);
        throw new Error(data.message || data.cause?.[0]?.description || "Failed to create Boleto");
      }

      console.log("[MercadoPago] Boleto created:", data.id);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: data.id,
          status: data.status,
          amount: amount,
          barcode: data.barcode?.content,
          boletoUrl: data.transaction_details?.external_resource_url,
          expirationDate: data.date_of_expiration,
          extraDays: config.boletoExtraDays,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Card payment (checkout transparente)
    if (action === "create_card_payment") {
      if (!amount || !payerEmail || !token) {
        throw new Error("Amount, payer email and card token are required");
      }

      const cardData = {
        transaction_amount: amount,
        token: token,
        description: description || "Pagamento com Cartão - Pincel de Luz",
        installments: installments || 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: payerEmail,
          first_name: payerName?.split(" ")[0] || "Cliente",
          last_name: payerName?.split(" ").slice(1).join(" ") || "",
          identification: payerCpf ? {
            type: "CPF",
            number: payerCpf.replace(/\D/g, ""),
          } : undefined,
        },
        external_reference: orderId,
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook?provider=mercadopago`,
      };

      const response = await fetch(`${baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `card-${orderId}-${Date.now()}`,
        },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[MercadoPago] Create Card payment error:", data);
        throw new Error(data.message || data.cause?.[0]?.description || "Failed to process card payment");
      }

      console.log("[MercadoPago] Card payment created:", data.id, "Status:", data.status);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: data.id,
          status: data.status,
          statusDetail: data.status_detail,
          amount: amount,
          installments: installments,
          installmentAmount: data.transaction_details?.installment_amount,
          dateApproved: data.date_approved,
          lastFourDigits: data.card?.last_four_digits,
          cardBrand: data.payment_method_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check payment status
    if (action === "check_status") {
      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      const response = await fetch(`${baseUrl}/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[MercadoPago] Check status error:", data);
        throw new Error(data.message || "Failed to check payment status");
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: data.id,
          status: data.status,
          statusDetail: data.status_detail,
          amount: data.transaction_amount,
          dateApproved: data.date_approved,
          paymentMethod: data.payment_method_id,
          externalReference: data.external_reference,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("[MercadoPago] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
