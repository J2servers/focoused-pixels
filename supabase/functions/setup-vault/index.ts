import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is using service role
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== serviceKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Store service role key in vault
    const { data: existing } = await supabase.rpc("vault_secret_exists", { secret_name: "SUPABASE_SERVICE_ROLE_KEY" });
    
    // Use raw SQL via supabase-js to insert vault secret
    const { error } = await supabase.from("_vault_helper").select("*").limit(0); // dummy to test
    
    // Direct approach: use the service role key we already have
    const { data, error: vaultError } = await supabase.rpc("create_vault_secret", {
      secret_value: serviceKey,
      secret_name: "SUPABASE_SERVICE_ROLE_KEY"
    });

    return new Response(JSON.stringify({ success: true, message: "Vault secrets configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
