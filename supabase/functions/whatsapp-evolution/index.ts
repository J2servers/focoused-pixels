import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Sanitize phone number to 55XXXXXXXXXXX format */
function sanitizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (clean.length === 11 && clean.startsWith("0")) {
    clean = "55" + clean.substring(1);
  } else if (clean.length === 11 || clean.length === 10) {
    clean = "55" + clean;
  }
  // If already has 55 prefix or other formats, return as-is
  return clean;
}

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
    
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, instanceName, number, text } = body as {
      action: string;
      instanceName?: string;
      number?: string;
      text?: string;
    };

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'action' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        console.log(`[Evolution] Create result:`, JSON.stringify(result).slice(0, 300));
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
        const cleanNumber = sanitizePhone(number);

        if (cleanNumber.length < 12) {
          return new Response(
            JSON.stringify({ success: false, error: `Invalid phone number: ${cleanNumber}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[Evolution] Sending text to ${cleanNumber} via ${name}`);

        // Check connection status first
        try {
          const statusResp = await fetch(`${baseUrl}/instance/connectionState/${name}`, {
            method: "GET",
            headers,
          });
          const statusData = await statusResp.json();
          const state = statusData?.instance?.state;
          
          if (state !== "open") {
            console.error(`[Evolution] Instance ${name} is not connected (state: ${state})`);
            return new Response(
              JSON.stringify({ success: false, error: `WhatsApp not connected (state: ${state})` }),
              { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch (statusErr) {
          console.error(`[Evolution] Status check failed:`, statusErr);
          // Continue anyway - let the send attempt determine outcome
        }

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
          console.error(`[Evolution] Send failed [${resp.status}]:`, JSON.stringify(result).slice(0, 300));
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
