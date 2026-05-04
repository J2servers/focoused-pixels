import { describe, it, expect } from 'vitest';

// Mirrors `_shared/webhook/crm.ts::generateOrderNumber`
function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `PL${y}${m}${d}-${rand}`;
}

describe('crm helpers', () => {
  it('generateOrderNumber matches PLYYMMDD-NNNN', () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^PL\d{6}-\d{4}$/);
  });
  it('generateOrderNumber yields distinct values across many calls', () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) set.add(generateOrderNumber());
    // Allowing collisions but expecting > 50 distinct values
    expect(set.size).toBeGreaterThan(50);
  });
});
