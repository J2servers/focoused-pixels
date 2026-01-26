import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  action: "create_checkout" | "create_payment_intent" | "check_status" | "test_connection";
  orderId?: string;
  amount?: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
  customerName?: string;
  paymentIntentId?: string;
  successUrl?: string;
  cancelUrl?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface StripeConfig {
  secretKey: string;
  publicKey: string;
  sandbox: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPaymentConfig(supabaseClient: any): Promise<StripeConfig> {
  const { data, error } = await supabaseClient
    .from("company_info")
    .select("stripe_enabled, stripe_public_key, stripe_secret_key, stripe_sandbox")
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error("Failed to get payment config: " + error.message);
  
  const config = data as {
    stripe_enabled: boolean | null;
    stripe_public_key: string | null;
    stripe_secret_key: string | null;
    stripe_sandbox: boolean | null;
  } | null;

  if (!config?.stripe_enabled) throw new Error("Stripe is not enabled");
  if (!config?.stripe_secret_key) throw new Error("Stripe secret key not configured");

  return {
    secretKey: config.stripe_secret_key,
    publicKey: config.stripe_public_key || "",
    sandbox: config.stripe_sandbox ?? true,
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

    const { 
      action, 
      orderId, 
      amount, 
      currency, 
      description, 
      customerEmail, 
      customerName, 
      paymentIntentId,
      successUrl,
      cancelUrl,
      items 
    } = await req.json() as PaymentRequest;

    console.log(`[Stripe] Action: ${action}, OrderId: ${orderId}`);

    const config = await getPaymentConfig(supabase);
    const stripe = new Stripe(config.secretKey, {
      apiVersion: "2023-10-16",
    });

    // Test connection
    if (action === "test_connection") {
      try {
        const account = await stripe.accounts.retrieve();
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Conexão estabelecida com sucesso",
            account: {
              id: account.id,
              email: account.email,
              country: account.country,
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[Stripe] Test failed:", error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : "Falha na conexão" 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create Checkout Session
    if (action === "create_checkout") {
      if (!items || items.length === 0) {
        throw new Error("Items are required for checkout");
      }

      const origin = req.headers.get("origin") || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map(item => ({
          price_data: {
            currency: currency || "brl",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: successUrl || `${origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/pagamento/erro`,
        customer_email: customerEmail,
        metadata: {
          order_id: orderId || "",
        },
      });

      console.log("[Stripe] Checkout session created:", session.id);

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: session.id,
          url: session.url,
          publicKey: config.publicKey,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Payment Intent (for custom payment forms)
    if (action === "create_payment_intent") {
      if (!amount) throw new Error("Amount is required");

      // Find or create customer
      let customerId: string | undefined;
      if (customerEmail) {
        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: customerEmail,
            name: customerName,
          });
          customerId = customer.id;
        }
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || "brl",
        description: description || "Pagamento",
        customer: customerId,
        metadata: {
          order_id: orderId || "",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log("[Stripe] Payment intent created:", paymentIntent.id);

      return new Response(
        JSON.stringify({
          success: true,
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          publicKey: config.publicKey,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check payment status
    if (action === "check_status") {
      if (!paymentIntentId) throw new Error("Payment Intent ID is required");

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return new Response(
        JSON.stringify({
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("[Stripe] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
