import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

const EmailSchema = z.object({
  email: z.string().email().max(255),
})

// Military-grade constants
const MAX_ATTEMPTS_PER_IP = 5;       // per 15 min window
const MAX_ATTEMPTS_PER_EMAIL = 3;    // per 15 min window
const WINDOW_MINUTES = 15;
const PERMANENT_BAN_THRESHOLD = 20;  // total fails = permanent IP ban

function hashValue(val: string): string {
  // Simple consistent hash for privacy (not crypto-grade, just for grouping)
  let hash = 0;
  for (let i = 0; i < val.length; i++) {
    const char = val.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  const __pre = handlePreflight(req);
  if (__pre) return __pre;

  const DENY = (reason?: string) => new Response(
    JSON.stringify({ allowed: false, reason: reason || undefined }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );

  try {
    const body = await req.json()
    const parsed = EmailSchema.safeParse(body)
    if (!parsed.success) return DENY();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Extract IP from headers
    const ip = req.headers.get('x-real-ip') || 
               req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               'unknown';
    const ipHash = hashValue(ip);
    const emailHash = hashValue(parsed.data.email.toLowerCase());
    const userAgentHash = hashValue(req.headers.get('user-agent') || 'unknown');

    // 1. CHECK IP BLOCKLIST
    const { data: blocked } = await supabase
      .from('ip_blocklist')
      .select('id, permanent, blocked_until')
      .eq('ip_hash', ipHash)
      .single();

    if (blocked) {
      if (blocked.permanent) {
        console.log(`[SECURITY] Permanently blocked IP attempted access: ${ipHash}`);
        return DENY('blocked');
      }
      if (blocked.blocked_until && new Date(blocked.blocked_until) > new Date()) {
        return DENY('blocked');
      }
    }

    // 2. CHECK RATE LIMITS (server-side)
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    const [{ count: ipAttempts }, { count: emailAttempts }] = await Promise.all([
      supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .eq('success', false)
        .gte('created_at', windowStart),
      supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('email_hash', emailHash)
        .eq('success', false)
        .gte('created_at', windowStart),
    ]);

    // Check if IP should be permanently banned
    const { count: totalIpFails } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('success', false);

    if ((totalIpFails || 0) >= PERMANENT_BAN_THRESHOLD) {
      // Permanent ban
      await supabase.from('ip_blocklist').upsert({
        ip_hash: ipHash,
        reason: 'brute_force_permanent',
        permanent: true,
      }, { onConflict: 'ip_hash' });
      console.log(`[SECURITY] IP permanently banned: ${ipHash}`);
      return DENY('blocked');
    }

    if ((ipAttempts || 0) >= MAX_ATTEMPTS_PER_IP) {
      // Temporary block
      const blockedUntil = new Date(Date.now() + WINDOW_MINUTES * 60 * 1000).toISOString();
      await supabase.from('ip_blocklist').upsert({
        ip_hash: ipHash,
        reason: 'rate_limit',
        blocked_until: blockedUntil,
        permanent: false,
      }, { onConflict: 'ip_hash' });
      return DENY('rate_limited');
    }

    if ((emailAttempts || 0) >= MAX_ATTEMPTS_PER_EMAIL) {
      // Log attempt but don't reveal email-specific blocking
      await supabase.from('login_attempts').insert({
        ip_hash: ipHash,
        email_hash: emailHash,
        success: false,
        user_agent_hash: userAgentHash,
      });
      return DENY();
    }

    // 3. CHECK USER EXISTS + HAS ADMIN ROLE
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error('Auth lookup error:', userError);
      return DENY();
    }

    const user = users.users.find(u => u.email === parsed.data.email);
    if (!user) {
      // Log failed attempt - user doesn't exist
      await supabase.from('login_attempts').insert({
        ip_hash: ipHash,
        email_hash: emailHash,
        success: false,
        user_agent_hash: userAgentHash,
      });
      // Constant-time delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      return DENY();
    }

    // 4. CHECK ROLE
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData) {
      await supabase.from('login_attempts').insert({
        ip_hash: ipHash,
        email_hash: emailHash,
        success: false,
        user_agent_hash: userAgentHash,
      });
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
      return DENY();
    }

    const allowedRoles = ['admin', 'editor', 'support'];
    const isAllowed = allowedRoles.includes(roleData.role);

    // Log attempt
    await supabase.from('login_attempts').insert({
      ip_hash: ipHash,
      email_hash: emailHash,
      success: isAllowed,
      user_agent_hash: userAgentHash,
    });

    if (!isAllowed) {
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    }

    return new Response(
      JSON.stringify({ allowed: isAllowed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Gate check error:', error);
    return DENY();
  }
})
