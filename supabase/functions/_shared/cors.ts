// Shared CORS helper with origin allowlist for Wave 2 hardening.
// Falls back to '*' only for unknown/empty origins on read-only/public endpoints.
// For sensitive endpoints, pass `strict: true` to return 403 on disallowed origins.

const DEFAULT_ALLOWED = [
  "https://focoused-pixels.lovable.app",
  "https://id-preview--56f7641d-9f03-4582-9895-63f996c0d8f6.lovable.app",
  "https://lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-api-key, x-signature, x-signature-id, x-request-id, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

function envAllowed(): string[] {
  const extra = Deno.env.get("ALLOWED_ORIGINS");
  if (!extra) return DEFAULT_ALLOWED;
  return [...DEFAULT_ALLOWED, ...extra.split(",").map((s) => s.trim()).filter(Boolean)];
}

function isAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const list = envAllowed();
  // Allow exact match or any *.lovable.app / *.lovableproject.com sub-host
  if (list.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname.endsWith(".lovable.app")) return true;
    if (u.hostname.endsWith(".lovableproject.com")) return true;
  } catch {
    return false;
  }
  return false;
}

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowOrigin = isAllowed(origin) ? origin! : "null";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

/** Returns a preflight Response if it's an OPTIONS request, else null. */
export function handlePreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response("ok", { headers: buildCorsHeaders(req) });
}

/** For strict endpoints: returns 403 if origin is not allowed (and not server-to-server). */
export function enforceOrigin(req: Request): Response | null {
  const origin = req.headers.get("origin");
  // Server-to-server (no Origin header) is allowed; browser requests must be in allowlist.
  if (!origin) return null;
  if (isAllowed(origin)) return null;
  return new Response(JSON.stringify({ error: "Origin not allowed" }), {
    status: 403,
    headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
  });
}

/** Basic XSS-safe text sanitizer for free-form strings stored/echoed back to UI. */
export function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "") // control chars
    .replace(/<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*\/?\s*(iframe|object|embed|link|meta|style)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, maxLen);
}
