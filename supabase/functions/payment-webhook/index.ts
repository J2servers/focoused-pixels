import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WebhookPayload {
  type?: string;
  action?: string;
  data?: {
    id?: string;
  };
  // Mercado Pago specific
  topic?: string;
  resource?: string;
  // Stripe specific
  object?: string;
  // EFI specific
  pix?: Array<{
    txid?: string;
    valor?: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "mercadopago";
    
    const payload = await req.json() as WebhookPayload;
    console.log(`[Webhook] Provider: ${provider}, Payload:`, JSON.stringify(payload));

    // Mercado Pago webhook
    if (provider === "mercadopago" || payload.topic === "payment") {
      const paymentId = payload.data?.id || url.searchParams.get("id");
      
      if (paymentId) {
        // Get payment config
        const { data: config } = await supabase
          .from("payment_credentials")
          .select("mercadopago_access_token")
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (config?.mercadopago_access_token) {
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${config.mercadopago_access_token}`,
            },
          });

          const paymentData = await response.json();
          console.log(`[Webhook MP] Payment ${paymentId} status: ${paymentData.status}`);

          // Update order status based on payment
          if (paymentData.external_reference) {
            const newStatus = paymentData.status === "approved" ? "paid" 
              : paymentData.status === "rejected" ? "rejected"
              : paymentData.status === "pending" ? "pending"
              : "unknown";

            // Try matching by id first, then by order_number
            const extRef = paymentData.external_reference;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            const updateData: Record<string, unknown> = { 
              payment_status: newStatus,
              updated_at: new Date().toISOString(),
            };
            if (newStatus === "paid") {
              updateData.order_status = "confirmed";
            }

            let result;
            if (uuidRegex.test(extRef)) {
              result = await supabase
                .from("orders")
                .update(updateData)
                .eq("id", extRef)
                .select("customer_name, customer_email, customer_phone")
                .single();
            } else {
              result = await supabase
                .from("orders")
                .update(updateData)
                .eq("order_number", extRef)
                .select("customer_name, customer_email, customer_phone")
                .single();
            }

            if (result.error) {
              console.error(`[Webhook MP] Error updating order:`, result.error);
            } else {
              console.log(`[Webhook MP] Order ${extRef} updated to ${newStatus}`);
              
              // Save customer as lead when payment is confirmed
              if (newStatus === "paid" && result.data) {
                const customer = result.data;
                await supabase.from("leads").upsert({
                  name: customer.customer_name,
                  email: customer.customer_email,
                  phone: customer.customer_phone || null,
                  source: "pagamento",
                  tags: ["cliente", "pagamento-confirmado"],
                  is_subscribed: true,
                  subscribed_at: new Date().toISOString(),
                }, { onConflict: "email" });
                console.log(`[Webhook MP] Lead saved: ${customer.customer_email}`);
              }
            }
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // EFI (Gerencianet) webhook
    if (provider === "efi" || payload.pix) {
      const pixPayments = payload.pix || [];
      
      for (const pix of pixPayments) {
        if (pix.txid) {
          console.log(`[Webhook EFI] PIX received: ${pix.txid}, value: ${pix.valor}`);
          
          // Update order if txid matches
          await supabase
            .from("orders")
            .update({ 
              payment_status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("order_number", pix.txid);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stripe webhook
    if (provider === "stripe" || payload.object === "event") {
      const eventType = payload.type;
      
      if (eventType === "checkout.session.completed" || eventType === "payment_intent.succeeded") {
        console.log(`[Webhook Stripe] Event: ${eventType}`);
        
        // Update order status
        const orderId = (payload.data as { object?: { metadata?: { order_id?: string } } })?.object?.metadata?.order_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ 
              payment_status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
            
          console.log(`[Webhook Stripe] Order ${orderId} marked as paid`);
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[Webhook] Unknown provider or payload format");
    return new Response(JSON.stringify({ received: true, message: "Unknown provider" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    // Always return 200 for webhooks to prevent retries
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
