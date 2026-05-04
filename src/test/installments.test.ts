import { describe, it, expect } from 'vitest';
import {
  buildInstallments,
  maxValidInstallments,
  maxInstallmentPreview,
  MIN_INSTALLMENT,
} from '@/lib/installments';

describe('installments', () => {
  it('caps to 1× when total is below minimum', () => {
    expect(maxValidInstallments(40)).toBe(1);
    const list = buildInstallments(40);
    expect(list).toHaveLength(1);
    expect(list[0].number).toBe(1);
    expect(list[0].value).toBe(40);
  });

  it('returns zero installment safely for invalid total', () => {
    expect(buildInstallments(NaN)).toEqual([
      { number: 1, value: 0, total: 0, hasInterest: false, label: '1× de R$ 0,00 sem juros' },
    ]);
    expect(maxValidInstallments(-10)).toBe(1);
  });

  it('respects min per installment of R$ 50', () => {
    // R$ 240 / R$ 50 = 4.8 → max 4 parcelas
    expect(maxValidInstallments(240)).toBe(4);
    const list = buildInstallments(240);
    expect(list).toHaveLength(4);
    expect(list[3].value).toBe(60);
  });

  it('caps at maxInstallments=12 by default', () => {
    expect(maxValidInstallments(10000)).toBe(12);
    expect(buildInstallments(1200).length).toBe(12);
  });

  it('marks "sem juros" up to maxNoInterest', () => {
    const list = buildInstallments(600, { maxInstallments: 12, maxNoInterest: 6 });
    expect(list[5].hasInterest).toBe(false); // 6×
    expect(list[6].hasInterest).toBe(true);  // 7×
    expect(list[6].label).toContain('com juros');
  });

  it('maxInstallmentPreview returns highest valid', () => {
    const top = maxInstallmentPreview(600);
    expect(top.number).toBe(12);
    expect(top.value).toBe(50);
  });

  it('honors custom minPerInstallment', () => {
    expect(maxValidInstallments(300, { minPerInstallment: 100 })).toBe(3);
  });

  it('exports MIN_INSTALLMENT = 50', () => {
    expect(MIN_INSTALLMENT).toBe(50);
  });

  it('rounds parcel value to 2 decimals', () => {
    const list = buildInstallments(100);
    const three = list.find(i => i.number === 2)!;
    expect(three.value).toBe(50);
  });

  it('label uses BRL with comma decimal', () => {
    const list = buildInstallments(150);
    expect(list[0].label).toBe('1× de R$ 150,00 sem juros');
  });
});
