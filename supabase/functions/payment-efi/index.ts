import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  action: "create_pix" | "check_status" | "test_connection" | "create_boleto";
  orderId?: string;
  amount?: number;
  description?: string;
  payerName?: string;
  payerCpf?: string;
  payerEmail?: string;
  txid?: string;
  expireSeconds?: number;
}

interface EfiConfig {
  clientId: string;
  clientSecret: string;
  sandbox: boolean;
  pixKey: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPaymentConfig(supabaseClient: any): Promise<EfiConfig> {
  const { data, error } = await supabaseClient
    .from("company_info")
    .select("efi_enabled, efi_client_id, efi_client_secret, efi_sandbox, efi_pix_key")
    .maybeSingle();

  if (error) throw new Error("Failed to get payment config: " + error.message);
  
  const config = data as {
    efi_enabled: boolean | null;
    efi_client_id: string | null;
    efi_client_secret: string | null;
    efi_sandbox: boolean | null;
    efi_pix_key: string | null;
  } | null;

  if (!config?.efi_enabled) throw new Error("EFI Bank is not enabled");
  if (!config?.efi_client_id || !config?.efi_client_secret) {
    throw new Error("EFI Bank credentials not configured");
  }

  return {
    clientId: config.efi_client_id,
    clientSecret: config.efi_client_secret,
    sandbox: config.efi_sandbox ?? true,
    pixKey: config.efi_pix_key || "",
  };
}

async function getAccessToken(config: EfiConfig): Promise<string> {
  const baseUrl = config.sandbox 
    ? "https://pix-h.api.efipay.com.br" 
    : "https://pix.api.efipay.com.br";

  const credentials = base64Encode(`${config.clientId}:${config.clientSecret}`);

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[EFI] Auth error:", error);
    throw new Error("Failed to authenticate with EFI Bank");
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, orderId, amount, description, payerName, payerCpf, payerEmail, txid, expireSeconds } = 
      await req.json() as PaymentRequest;

    console.log(`[EFI] Action: ${action}, OrderId: ${orderId}`);

    const config = await getPaymentConfig(supabase);
    const baseUrl = config.sandbox 
      ? "https://pix-h.api.efipay.com.br" 
      : "https://pix.api.efipay.com.br";

    // Test connection
    if (action === "test_connection") {
      try {
        const token = await getAccessToken(config);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Conexão estabelecida com sucesso",
            sandbox: config.sandbox,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[EFI] Test failed:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : "Falha na conexão" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const accessToken = await getAccessToken(config);

    // Create PIX immediate charge (cob)
    if (action === "create_pix") {
      if (!amount) throw new Error("Amount is required for PIX");
      if (!config.pixKey) throw new Error("PIX key not configured");

      // Generate unique txid if not provided
      const generatedTxid = txid || `pix${Date.now()}${Math.random().toString(36).substring(7)}`;
      
      const pixData = {
        calendario: {
          expiracao: expireSeconds || 3600, // 1 hour default
        },
        devedor: payerCpf ? {
          cpf: payerCpf.replace(/\D/g, ""),
          nome: payerName || "Cliente",
        } : undefined,
        valor: {
          original: amount.toFixed(2),
        },
        chave: config.pixKey,
        solicitacaoPagador: description || "Pagamento via PIX",
        infoAdicionais: orderId ? [
          { nome: "Pedido", valor: orderId }
        ] : undefined,
      };

      const response = await fetch(`${baseUrl}/v2/cob/${generatedTxid}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pixData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[EFI] Create PIX error:", data);
        throw new Error(data.mensagem || data.message || "Failed to create PIX");
      }

      // Get QR Code
      const qrResponse = await fetch(`${baseUrl}/v2/loc/${data.loc.id}/qrcode`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const qrData = await qrResponse.json();

      console.log("[EFI] PIX created:", data.txid);

      return new Response(
        JSON.stringify({
          success: true,
          txid: data.txid,
          status: data.status,
          pixCopiaECola: data.pixCopiaECola,
          qrCode: qrData.qrcode,
          qrCodeImage: qrData.imagemQrcode,
          expirationDate: data.calendario?.criacao,
          amount: data.valor?.original,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check PIX status
    if (action === "check_status") {
      if (!txid) throw new Error("TXID is required");

      const response = await fetch(`${baseUrl}/v2/cob/${txid}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[EFI] Check status error:", data);
        throw new Error(data.mensagem || "Failed to check status");
      }

      return new Response(
        JSON.stringify({
          success: true,
          txid: data.txid,
          status: data.status,
          amount: data.valor?.original,
          payer: data.pagador,
          paidAt: data.pix?.[0]?.horario,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Boleto
    if (action === "create_boleto") {
      if (!amount || !payerName || !payerCpf) {
        throw new Error("Amount, payer name and CPF are required for boleto");
      }

      const boletoBaseUrl = config.sandbox
        ? "https://cobrancas-h.api.efipay.com.br"
        : "https://cobrancas.api.efipay.com.br";

      // First, get boleto token
      const credentials = base64Encode(`${config.clientId}:${config.clientSecret}`);
      const tokenResponse = await fetch(`${boletoBaseUrl}/v1/authorize`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grant_type: "client_credentials" }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get boleto authorization");
      }

      const tokenData = await tokenResponse.json();

      const boletoData = {
        items: [{
          name: description || "Produto/Serviço",
          value: Math.round(amount * 100), // Value in cents
          amount: 1,
        }],
        payment: {
          banking_billet: {
            expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days
            customer: {
              name: payerName,
              cpf: payerCpf.replace(/\D/g, ""),
              email: payerEmail,
            },
          },
        },
      };

      const response = await fetch(`${boletoBaseUrl}/v1/charge/one-step`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boletoData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[EFI] Create boleto error:", data);
        throw new Error(data.message || "Failed to create boleto");
      }

      return new Response(
        JSON.stringify({
          success: true,
          chargeId: data.data.charge_id,
          status: data.data.status,
          barcodeNumber: data.data.barcode,
          link: data.data.link,
          pdf: data.data.pdf?.charge,
          expireAt: data.data.expire_at,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("[EFI] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
