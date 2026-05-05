// Shared helper to validate cron requests + audit runs.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Accepts only:
 *  - service-role key bearer token
 *  - x-cron-secret header matching the CRON_SECRET env var
 *  - bearer token of an authenticated user with admin/editor role
 * Anon key and any hardcoded literals are rejected.
 */
export async function isCronAuthorized(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.replace("Bearer ", "").trim();
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (bearer && serviceRole && bearer === serviceRole) return true;

  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const incoming = req.headers.get("x-cron-secret") ?? "";
  if (cronSecret && incoming && incoming === cronSecret) return true;

  // Accept admin user JWT
  if (bearer) {
    try {
      const sb = getServiceClient();
      const { data, error } = await sb.auth.getUser(bearer);
      if (!error && data?.user) {
        const { data: isAdmin } = await sb.rpc("has_admin_access", { _user_id: data.user.id });
        if (isAdmin === true) return true;
      }
    } catch { /* ignore */ }
  }

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
