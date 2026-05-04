import { describe, it, expect } from 'vitest';
import { parseDayRange, estimateDeliveryWindow } from '@/lib/delivery';
import { addBusinessDays } from 'date-fns';

describe('parseDayRange', () => {
  it('handles "X a Y dias úteis"', () => {
    expect(parseDayRange('4 a 10 dias úteis')).toEqual({ min: 4, max: 10 });
  });
  it('handles single number', () => {
    expect(parseDayRange('5 dias úteis')).toEqual({ min: 5, max: 5 });
  });
  it('handles dash format', () => {
    expect(parseDayRange('3-7')).toEqual({ min: 3, max: 7 });
  });
  it('handles null/empty', () => {
    expect(parseDayRange(null)).toEqual({ min: 0, max: 0 });
    expect(parseDayRange('')).toEqual({ min: 0, max: 0 });
    expect(parseDayRange('sem prazo')).toEqual({ min: 0, max: 0 });
  });
});

describe('estimateDeliveryWindow', () => {
  it('sums production + transit days', () => {
    const from = new Date('2026-05-04T12:00:00Z'); // Monday
    const w = estimateDeliveryWindow('4 a 10 dias úteis', '3 a 5 dias úteis', from);
    expect(w.minDays).toBe(7);
    expect(w.maxDays).toBe(15);
    expect(w.minDate.getTime()).toBe(addBusinessDays(from, 7).getTime());
    expect(w.maxDate.getTime()).toBe(addBusinessDays(from, 15).getTime());
  });
  it('handles missing inputs gracefully', () => {
    const w = estimateDeliveryWindow(undefined, undefined);
    expect(w.minDays).toBe(0);
    expect(w.maxDays).toBe(0);
  });
  it('keeps min <= max', () => {
    const w = estimateDeliveryWindow('10 a 4 dias', '5 a 3 dias');
    expect(w.minDays).toBeLessThanOrEqual(w.maxDays);
  });
});
