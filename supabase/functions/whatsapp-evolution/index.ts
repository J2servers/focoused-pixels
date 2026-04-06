import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  return clean;
}

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
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
    const supabase = getSupabase();

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, instanceName, number, text, recipientName, orderNumber } = body as {
      action: string;
      instanceName?: string;
      number?: string;
      text?: string;
      recipientName?: string;
      orderNumber?: string;
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
        const name = instanceName || "pinceldeluz1";
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

        // Update instance status in DB
        await supabase.from("whatsapp_instances")
          .update({ status: "connecting", updated_at: new Date().toISOString() })
          .eq("instance_name", name);

        console.log(`[Evolution] Create result:`, JSON.stringify(result).slice(0, 300));
        break;
      }

      // ===== CONNECT (GET QR CODE) =====
      case "connect": {
        const name = instanceName || "pinceldeluz1";
        console.log(`[Evolution] Connecting instance: ${name}`);

        const resp = await fetch(`${baseUrl}/instance/connect/${name}`, {
          method: "GET",
          headers,
        });
        result = await resp.json();

        await supabase.from("whatsapp_instances")
          .update({ status: "connecting", updated_at: new Date().toISOString() })
          .eq("instance_name", name);

        console.log(`[Evolution] Connect result status:`, resp.status);
        break;
      }

      // ===== CHECK STATUS =====
      case "status": {
        const name = instanceName || "pinceldeluz1";
        console.log(`[Evolution] Checking status: ${name}`);

        const resp = await fetch(`${baseUrl}/instance/connectionState/${name}`, {
          method: "GET",
          headers,
        });
        result = await resp.json();

        // Sync status to DB
        const state = result?.instance?.state || result?.state;
        let dbStatus = "disconnected";
        if (state === "open" || state === "connected") dbStatus = "connected";
        else if (state === "connecting") dbStatus = "connecting";

        const updateData: Record<string, unknown> = {
          status: dbStatus,
          updated_at: new Date().toISOString(),
        };
        if (dbStatus === "connected") {
          updateData.last_connected_at = new Date().toISOString();
        }
        await supabase.from("whatsapp_instances")
          .update(updateData)
          .eq("instance_name", name);

        console.log(`[Evolution] Status: ${dbStatus}`);
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

      // ===== SEND TEXT WITH FAILOVER =====
      case "sendText": {
        if (!number || !text) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing 'number' or 'text'" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const cleanNumber = sanitizePhone(number);
        if (cleanNumber.length < 12) {
          return new Response(
            JSON.stringify({ success: false, error: `Invalid phone number: ${cleanNumber}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // If a specific instance is given, use it directly (for test messages)
        if (instanceName) {
          const sendResult = await attemptSend(baseUrl, headers, instanceName, cleanNumber, text);
          
          // Log message
          await supabase.from("whatsapp_messages").insert({
            instance_name: instanceName,
            recipient_phone: cleanNumber,
            recipient_name: recipientName || null,
            message_text: text.slice(0, 5000),
            status: sendResult.success ? "sent" : "failed",
            error_message: sendResult.error || null,
            order_number: orderNumber || null,
            sent_at: sendResult.success ? new Date().toISOString() : null,
          });

          if (!sendResult.success) {
            return new Response(
              JSON.stringify({ success: false, error: sendResult.error, instance: instanceName }),
              { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          result = { messageId: sendResult.data, sentVia: instanceName };
          break;
        }

        // === FAILOVER LOGIC: try instances by priority ===
        const { data: instances } = await supabase
          .from("whatsapp_instances")
          .select("instance_name, display_name, priority")
          .eq("is_active", true)
          .order("priority", { ascending: true });

        if (!instances || instances.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "No active WhatsApp instances configured" }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let sentVia: string | null = null;
        let lastError = "";

        for (const inst of instances) {
          console.log(`[Evolution] Trying instance: ${inst.instance_name} (priority ${inst.priority})`);
          
          const sendResult = await attemptSend(baseUrl, headers, inst.instance_name, cleanNumber, text);

          // Log attempt
          await supabase.from("whatsapp_messages").insert({
            instance_name: inst.instance_name,
            recipient_phone: cleanNumber,
            recipient_name: recipientName || null,
            message_text: text.slice(0, 5000),
            status: sendResult.success ? "sent" : "failed",
            error_message: sendResult.error || null,
            order_number: orderNumber || null,
            sent_at: sendResult.success ? new Date().toISOString() : null,
          });

          if (sendResult.success) {
            sentVia = inst.instance_name;
            result = { messageId: sendResult.data, sentVia: inst.instance_name, displayName: inst.display_name };
            break;
          } else {
            lastError = sendResult.error || "Unknown error";
            console.log(`[Evolution] Instance ${inst.instance_name} failed: ${lastError}, trying next...`);
          }
        }

        if (!sentVia) {
          return new Response(
            JSON.stringify({ success: false, error: `All instances failed. Last error: ${lastError}` }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        break;
      }

      // ===== LOGOUT / DISCONNECT =====
      case "logout": {
        const name = instanceName || "pinceldeluz1";
        console.log(`[Evolution] Logging out: ${name}`);

        const resp = await fetch(`${baseUrl}/instance/logout/${name}`, {
          method: "DELETE",
          headers,
        });
        result = await resp.json();

        await supabase.from("whatsapp_instances")
          .update({ status: "disconnected", updated_at: new Date().toISOString() })
          .eq("instance_name", name);
        break;
      }

      // ===== DELETE INSTANCE =====
      case "delete": {
        const name = instanceName || "pinceldeluz1";
        console.log(`[Evolution] Deleting instance: ${name}`);

        const resp = await fetch(`${baseUrl}/instance/delete/${name}`, {
          method: "DELETE",
          headers,
        });
        result = await resp.json();

        await supabase.from("whatsapp_instances")
          .update({ status: "disconnected", phone_number: null, updated_at: new Date().toISOString() })
          .eq("instance_name", name);
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
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Attempt to send a message via a specific instance. Returns success/error. */
async function attemptSend(
  baseUrl: string,
  headers: Record<string, string>,
  instanceName: string,
  number: string,
  text: string,
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    // Check connection first
    const statusResp = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      method: "GET",
      headers,
    });
    
    if (!statusResp.ok) {
      return { success: false, error: `Status check failed (${statusResp.status})` };
    }

    const statusData = await statusResp.json();
    const state = statusData?.instance?.state;

    if (state !== "open") {
      return { success: false, error: `Instance not connected (state: ${state || "unknown"})` };
    }

    // Send message
    const resp = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ number, text }),
    });
    const data = await resp.json();

    if (!resp.ok) {
      return { success: false, error: `Send failed (${resp.status}): ${JSON.stringify(data).slice(0, 200)}` };
    }

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message || "Network error" };
  }
}
