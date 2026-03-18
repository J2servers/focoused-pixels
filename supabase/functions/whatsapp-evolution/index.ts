import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");

    if (!evolutionUrl || !evolutionKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Evolution API credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = evolutionUrl.replace(/\/$/, "");
    const { action, instanceName, number, text } = await req.json();

    const headers = {
      "Content-Type": "application/json",
      "apikey": evolutionKey,
    };

    let result;

    switch (action) {
      // ===== CREATE INSTANCE =====
      case "create": {
        const name = instanceName || "pinceldeluz";
        console.log(`[Evolution] Creating instance: ${name}`);
        
        const resp = await fetch(`${baseUrl}/instance/create`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            instanceName: name,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
            rejectCall: false,
          }),
        });
        result = await resp.json();
        console.log(`[Evolution] Create result:`, JSON.stringify(result));
        break;
      }

      // ===== CONNECT (GET QR CODE) =====
      case "connect": {
        const name = instanceName || "pinceldeluz";
        console.log(`[Evolution] Connecting instance: ${name}`);
        
        const resp = await fetch(`${baseUrl}/instance/connect/${name}`, {
          method: "GET",
          headers,
        });
        result = await resp.json();
        console.log(`[Evolution] Connect result status:`, resp.status);
        break;
      }

      // ===== CHECK STATUS =====
      case "status": {
        const name = instanceName || "pinceldeluz";
        console.log(`[Evolution] Checking status: ${name}`);
        
        const resp = await fetch(`${baseUrl}/instance/connectionState/${name}`, {
          method: "GET",
          headers,
        });
        result = await resp.json();
        console.log(`[Evolution] Status:`, JSON.stringify(result));
        break;
      }

      // ===== FETCH INSTANCES =====
      case "fetch": {
        console.log(`[Evolution] Fetching all instances`);
        
        const resp = await fetch(`${baseUrl}/instance/fetchInstances`, {
          method: "GET",
          headers,
        });
        result = await resp.json();
        break;
      }

      // ===== SEND TEXT MESSAGE =====
      case "sendText": {
        if (!number || !text) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing 'number' or 'text'" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const name = instanceName || "pinceldeluz";
        // Clean phone number
        let cleanNumber = number.replace(/\D/g, "");
        if (cleanNumber.length === 11 && cleanNumber.startsWith("0")) {
          cleanNumber = "55" + cleanNumber.substring(1);
        } else if (cleanNumber.length === 11 || cleanNumber.length === 10) {
          cleanNumber = "55" + cleanNumber;
        }

        console.log(`[Evolution] Sending text to ${cleanNumber} via ${name}`);

        const resp = await fetch(`${baseUrl}/message/sendText/${name}`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            number: cleanNumber,
            text: text,
          }),
        });
        result = await resp.json();
        
        if (!resp.ok) {
          console.error(`[Evolution] Send failed [${resp.status}]:`, JSON.stringify(result));
          return new Response(
            JSON.stringify({ success: false, error: `Send failed: ${resp.status}`, details: result }),
            { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        console.log(`[Evolution] Message sent to ${cleanNumber}`);
        break;
      }

      // ===== LOGOUT / DISCONNECT =====
      case "logout": {
        const name = instanceName || "pinceldeluz";
        console.log(`[Evolution] Logging out: ${name}`);
        
        const resp = await fetch(`${baseUrl}/instance/logout/${name}`, {
          method: "DELETE",
          headers,
        });
        result = await resp.json();
        break;
      }

      // ===== DELETE INSTANCE =====
      case "delete": {
        const name = instanceName || "pinceldeluz";
        console.log(`[Evolution] Deleting instance: ${name}`);
        
        const resp = await fetch(`${baseUrl}/instance/delete/${name}`, {
          method: "DELETE",
          headers,
        });
        result = await resp.json();
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Evolution] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
