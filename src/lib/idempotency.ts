/**
 * Idempotency utilities for checkout flow.
 * Prevents duplicate orders and payment requests.
 */

const IDEMPOTENCY_PREFIX = 'idem_';
const IDEMPOTENCY_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface IdempotencyEntry {
  key: string;
  orderId: string | null;
  createdAt: number;
  status: 'received' | 'processing' | 'completed' | 'failed';
}

/** Generate a deterministic idempotency key from cart contents + user */
export function generateIdempotencyKey(
  userEmail: string,
  cartItems: Array<{ id: string; quantity: number }>,
  amount: number
): string {
  const itemsHash = cartItems
    .map(i => `${i.id}:${i.quantity}`)
    .sort()
    .join('|');
  const raw = `${userEmail}|${itemsHash}|${amount.toFixed(2)}`;
  // Simple hash (not crypto, just dedup)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `${IDEMPOTENCY_PREFIX}${Math.abs(hash).toString(36)}`;
}

/** Check if a request with this key is already in flight or completed */
export function getIdempotencyEntry(key: string): IdempotencyEntry | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: IdempotencyEntry = JSON.parse(raw);
    // Expired?
    if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/** Mark a request as in-flight */
export function setIdempotencyEntry(
  key: string,
  status: IdempotencyEntry['status'],
  orderId: string | null = null
): void {
  const entry: IdempotencyEntry = {
    key,
    orderId,
    createdAt: Date.now(),
    status,
  };
  sessionStorage.setItem(key, JSON.stringify(entry));
}

/** Clear expired entries */
export function cleanupIdempotencyEntries(): void {
  const now = Date.now();
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const k = sessionStorage.key(i);
    if (k?.startsWith(IDEMPOTENCY_PREFIX)) {
      try {
        const entry: IdempotencyEntry = JSON.parse(sessionStorage.getItem(k)!);
        if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
          sessionStorage.removeItem(k);
        }
      } catch {
        sessionStorage.removeItem(k!);
      }
    }
  }
}

/**
 * Debounce guard for payment buttons.
 * Returns true if the action should proceed, false if it's a duplicate click.
 */
const actionTimestamps = new Map<string, number>();
const MIN_ACTION_INTERVAL_MS = 3000; // 3 seconds between same actions

export function shouldAllowAction(actionId: string): boolean {
  const now = Date.now();
  const lastTime = actionTimestamps.get(actionId);
  if (lastTime && now - lastTime < MIN_ACTION_INTERVAL_MS) {
    return false;
  }
  actionTimestamps.set(actionId, now);
  return true;
}
