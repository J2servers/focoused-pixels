import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateIdempotencyKey,
  getIdempotencyEntry,
  setIdempotencyEntry,
  cleanupIdempotencyEntries,
} from '@/lib/idempotency';

describe('idempotency', () => {
  beforeEach(() => sessionStorage.clear());

  it('generateIdempotencyKey is deterministic regardless of order', () => {
    const items1 = [{ id: 'a', quantity: 1 }, { id: 'b', quantity: 2 }];
    const items2 = [{ id: 'b', quantity: 2 }, { id: 'a', quantity: 1 }];
    expect(generateIdempotencyKey('e@x.com', items1, 100))
      .toBe(generateIdempotencyKey('e@x.com', items2, 100));
  });

  it('different cart -> different key', () => {
    const k1 = generateIdempotencyKey('e@x.com', [{ id: 'a', quantity: 1 }], 100);
    const k2 = generateIdempotencyKey('e@x.com', [{ id: 'a', quantity: 2 }], 100);
    expect(k1).not.toBe(k2);
  });

  it('set/get round trip', () => {
    setIdempotencyEntry('idem_test', 'processing', null);
    const e = getIdempotencyEntry('idem_test');
    expect(e?.status).toBe('processing');
    expect(e?.orderId).toBeNull();
  });

  it('returns null when not set', () => {
    expect(getIdempotencyEntry('idem_missing')).toBeNull();
  });

  it('cleanup removes only idem_ keys', () => {
    sessionStorage.setItem('other_key', 'x');
    setIdempotencyEntry('idem_a', 'completed', 'order-1');
    cleanupIdempotencyEntries();
    expect(sessionStorage.getItem('other_key')).toBe('x');
  });
});
