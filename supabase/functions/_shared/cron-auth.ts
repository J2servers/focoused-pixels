// Shared helper to validate cron requests + audit runs.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Accepts service-role bearer or x-cron-secret header. Returns true if authorized. */
export function isCronAuthorized(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.replace("Bearer ", "").trim();
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (bearer && serviceRole && bearer === serviceRole) return true;
  // Allow Lovable Cloud cron internal call header (matches existing pattern in repo)
  const internal = req.headers.get("x-cron-secret");
  if (internal === "internal_cron_call") return true;
  // Also accept anon key calls scheduled via pg_cron for backward compat
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (bearer && anon && bearer === anon) return true;
  return false;
}

export async function auditRun<T extends Record<string, unknown>>(
  jobName: string,
  worker: (sb: SupabaseClient) => Promise<T>,
): Promise<{ ok: boolean; metrics?: T; error?: string }> {
  const sb = getServiceClient();
  const { data: runRow } = await sb
    .from("system_cron_runs")
    .insert({ job_name: jobName, status: "running" })
    .select("id")
    .maybeSingle();
  const runId = runRow?.id as string | undefined;
  try {
    const metrics = await worker(sb);
    if (runId) {
      await sb.from("system_cron_runs").update({
        status: "success",
        finished_at: new Date().toISOString(),
        metrics: metrics as unknown as Record<string, unknown>,
      }).eq("id", runId);
    }
    return { ok: true, metrics };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    if (runId) {
      await sb.from("system_cron_runs").update({
        status: "failed",
        finished_at: new Date().toISOString(),
        error,
      }).eq("id", runId);
    }
    return { ok: false, error };
  }
}

export async function recordFailure(
  sb: SupabaseClient,
  channel: string,
  event: string,
  recipient: string | null,
  payload: Record<string, unknown>,
  error: string,
) {
  await sb.from("notification_failures").insert({
    channel, event_name: event, recipient,
    payload, last_error: error, attempts: 1,
    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}
