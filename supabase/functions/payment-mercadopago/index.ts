import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  action: "create_preference" | "create_pix" | "check_status" | "test_connection";
  orderId?: string;
  amount?: number;
  description?: string;
  payerEmail?: string;
  payerName?: string;
  paymentId?: string;
  items?: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface MercadoPagoConfig {
  accessToken: string;
  sandbox: boolean;
  publicKey: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPaymentConfig(supabaseClient: any): Promise<MercadoPagoConfig> {
  const { data, error } = await supabaseClient
    .from("company_info")
    .select("mercadopago_enabled, mercadopago_public_key, mercadopago_access_token, mercadopago_sandbox")
    .maybeSingle();

  if (error) throw new Error("Failed to get payment config: " + error.message);
  
  const config = data as {
    mercadopago_enabled: boolean | null;
    mercadopago_public_key: string | null;
    mercadopago_access_token: string | null;
    mercadopago_sandbox: boolean | null;
  } | null;

  if (!config?.mercadopago_enabled) throw new Error("Mercado Pago is not enabled");
  if (!config?.mercadopago_access_token) throw new Error("Mercado Pago access token not configured");

  return {
    accessToken: config.mercadopago_access_token,
    sandbox: config.mercadopago_sandbox ?? true,
    publicKey: config.mercadopago_public_key,
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

    const { action, orderId, amount, description, payerEmail, payerName, paymentId, items } = 
      await req.json() as PaymentRequest;

    console.log(`[MercadoPago] Action: ${action}, OrderId: ${orderId}`);

    const config = await getPaymentConfig(supabase);
    const baseUrl = config.sandbox 
      ? "https://api.mercadopago.com" 
      : "https://api.mercadopago.com";

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
            }
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
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook`,
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

      const pixData = {
        transaction_amount: amount,
        description: description || "Pagamento via PIX",
        payment_method_id: "pix",
        payer: {
          email: payerEmail,
          first_name: payerName?.split(" ")[0] || "Cliente",
          last_name: payerName?.split(" ").slice(1).join(" ") || "",
        },
        external_reference: orderId,
        notification_url: `${supabaseUrl}/functions/v1/payment-webhook`,
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
        throw new Error(data.message || "Failed to create PIX payment");
      }

      console.log("[MercadoPago] PIX created:", data.id);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: data.id,
          status: data.status,
          qrCode: data.point_of_interaction?.transaction_data?.qr_code,
          qrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
          expirationDate: data.date_of_expiration,
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
