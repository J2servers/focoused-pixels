/**
 * Client-side rate limiting and throttling utilities.
 * Reduces unnecessary API calls and prevents flood.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

/**
 * Simple sliding-window rate limiter.
 * Returns true if the request is allowed, false if rate-limited.
 */
export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= maxRequests) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Creates a throttled version of an async function.
 * Only the first call within the interval executes; subsequent calls are ignored.
 */
export function throttleAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  intervalMs: number
): T {
  let lastCall = 0;
  let pending: Promise<unknown> | null = null;

  return ((...args: unknown[]) => {
    const now = Date.now();
    if (now - lastCall < intervalMs && pending) {
      return pending;
    }
    lastCall = now;
    pending = fn(...args).finally(() => {
      pending = null;
    });
    return pending;
  }) as T;
}

/**
 * Circuit breaker pattern for API calls.
 * After `threshold` failures within `windowMs`, opens the circuit for `cooldownMs`.
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private isOpen = false;
  private openedAt = 0;

  constructor(
    private readonly threshold: number = 5,
    private readonly windowMs: number = 60_000,
    private readonly cooldownMs: number = 30_000
  ) {}

  canExecute(): boolean {
    if (!this.isOpen) return true;

    // Check if cooldown has passed
    if (Date.now() - this.openedAt > this.cooldownMs) {
      this.isOpen = false;
      this.failures = 0;
      return true;
    }

    return false;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.isOpen = false;
  }

  recordFailure(): void {
    const now = Date.now();

    // Reset window if expired
    if (now - this.lastFailureTime > this.windowMs) {
      this.failures = 0;
    }

    this.failures++;
    this.lastFailureTime = now;

    if (this.failures >= this.threshold) {
      this.isOpen = true;
      this.openedAt = now;
    }
  }

  get state(): 'closed' | 'open' | 'half-open' {
    if (!this.isOpen) return 'closed';
    if (Date.now() - this.openedAt > this.cooldownMs) return 'half-open';
    return 'open';
  }
}

// Singleton circuit breakers for critical paths
export const paymentCircuitBreaker = new CircuitBreaker(3, 60_000, 30_000);
export const apiCircuitBreaker = new CircuitBreaker(10, 60_000, 15_000);
