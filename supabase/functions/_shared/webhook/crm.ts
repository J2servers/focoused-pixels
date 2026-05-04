// Shared CRM webhook helpers (logger + API key validation + order number gen).
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `PL${y}${m}${d}-${rand}`;
}

export async function logWebhook(
  supabase: SupabaseClient,
  direction: string,
  endpoint: string,
  eventType: string,
  requestBody: unknown,
  responseBody: unknown,
  statusCode: number,
  source: string,
  processed: boolean,
  errorMessage?: string,
): Promise<void> {
  try {
    await supabase.from("webhook_logs").insert({
      direction,
      endpoint,
      event_type: eventType,
      request_body: requestBody as Record<string, unknown>,
      response_body: responseBody as Record<string, unknown>,
      status_code: statusCode,
      source,
      processed,
      error_message: errorMessage || null,
    });
  } catch {
    // swallow logging errors
  }
}

export async function validateApiKey(supabase: SupabaseClient, apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.length < 8) return false;
  const prefix = apiKey.substring(0, 8);

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key_hash, is_active, expires_at, permissions")
    .eq("key_prefix", prefix)
    .eq("is_active", true)
    .limit(1);

  if (error || !data || data.length === 0) return false;
  const keyRecord = data[0];

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(apiKey));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  if (computedHash !== keyRecord.key_hash) return false;
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) return false;

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id);

  return true;
}
