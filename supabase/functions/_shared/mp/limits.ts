// Shared rate limiter and idempotency cache for payment edge functions.
export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();
  constructor(private opts: Required<RateLimitOptions>) {}
  check(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);
    if (!entry || now > entry.resetAt) {
      this.store.set(identifier, { count: 1, resetAt: now + this.opts.windowMs });
      return true;
    }
    if (entry.count >= this.opts.max) return false;
    entry.count++;
    return true;
  }
}

export function createRateLimiter(opts: RateLimitOptions = {}): RateLimiter {
  return new RateLimiter({ windowMs: opts.windowMs ?? 60_000, max: opts.max ?? 10 });
}

export class IdempotencyCache {
  private store = new Map<string, { response: string; timestamp: number }>();
  constructor(private ttlMs = 5 * 60 * 1000) {}
  get(key: string): string | null {
    const e = this.store.get(key);
    if (!e) return null;
    if (Date.now() - e.timestamp > this.ttlMs) {
      this.store.delete(key);
      return null;
    }
    return e.response;
  }
  set(key: string, response: string) {
    this.store.set(key, { response, timestamp: Date.now() });
  }
}
