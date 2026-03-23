import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  // Only service role can call this
  const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  if (token !== serviceKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  
  // Store service role key in vault using raw SQL via postgrest
  // We need to use the pg function vault.create_secret
  const results: string[] = [];

  // Check if SUPABASE_SERVICE_ROLE_KEY already exists
  const { data: existingKey } = await supabase
    .schema('vault')
    .from('decrypted_secrets')
    .select('name')
    .eq('name', 'SUPABASE_SERVICE_ROLE_KEY')
    .maybeSingle();

  if (!existingKey) {
    // We can't call vault.create_secret directly via supabase-js, 
    // so let's use a workaround: create a temporary function
    results.push("SUPABASE_SERVICE_ROLE_KEY needs manual vault insert");
  } else {
    results.push("SUPABASE_SERVICE_ROLE_KEY already in vault");
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
});
