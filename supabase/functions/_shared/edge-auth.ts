// Shared authorization helper for edge functions that must be reachable by:
//  - other edge functions (using the service-role key)
//  - authenticated admin/editor users (UI calls via supabase.functions.invoke)
//
// Anonymous users and the public anon key are explicitly rejected.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthContext {
  ok: boolean;
  isServiceRole: boolean;
  isAdminUser: boolean;
  userId?: string;
  reason?: string;
}

export async function authorizeAdminOrService(req: Request): Promise<AuthContext> {
  const auth = req.headers.get("Authorization") ?? "";
  const bearer = auth.replace("Bearer ", "").trim();

  if (!bearer) return { ok: false, isServiceRole: false, isAdminUser: false, reason: "missing token" };

  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (serviceRole && bearer === serviceRole) {
    return { ok: true, isServiceRole: true, isAdminUser: false };
  }

  // Reject anon key explicitly
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (anon && bearer === anon) {
    return { ok: false, isServiceRole: false, isAdminUser: false, reason: "anon key not accepted" };
  }

  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRole,
      { auth: { persistSession: false } },
    );
    const { data, error } = await sb.auth.getUser(bearer);
    if (error || !data?.user) {
      return { ok: false, isServiceRole: false, isAdminUser: false, reason: "invalid jwt" };
    }
    const { data: isAdmin } = await sb.rpc("has_admin_access", { _user_id: data.user.id });
    if (isAdmin === true) {
      return { ok: true, isServiceRole: false, isAdminUser: true, userId: data.user.id };
    }
    return { ok: false, isServiceRole: false, isAdminUser: false, userId: data.user.id, reason: "not admin" };
  } catch (e) {
    return { ok: false, isServiceRole: false, isAdminUser: false, reason: (e as Error).message };
  }
}
