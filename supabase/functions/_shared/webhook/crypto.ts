// Shared cryptographic helpers for payment webhooks.

/** Constant-time string comparison to prevent timing attacks. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Compute HMAC-SHA256 hex digest. */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Validate Mercado Pago x-signature header (HMAC-SHA256 over manifest). */
export async function validateMercadoPagoSignature(
  req: Request,
  paymentId: string | null,
  secret: string | null,
): Promise<boolean> {
  if (!secret) return true;
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !paymentId) return false;
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("=")).filter((kv) => kv.length === 2),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const manifest = `id:${paymentId};request-id:${xRequestId || ""};ts:${ts};`;
  const expected = await hmacSha256Hex(secret, manifest);
  return timingSafeEqual(expected, v1);
}

/** Validate Stripe-Signature header (t=...,v1=...). */
export async function validateStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string | null,
): Promise<boolean> {
  if (!secret) return true;
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => p.trim().split("=")).filter((kv) => kv.length === 2),
  );
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const tsNum = parseInt(ts, 10);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) return false;
  const expected = await hmacSha256Hex(secret, `${ts}.${rawBody}`);
  return timingSafeEqual(expected, v1);
}

/** Sanitize phone number to E.164-like format (55XXXXXXXXXXX). */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.startsWith("0")) return `55${digits.substring(1)}`;
  return `55${digits}`;
}
