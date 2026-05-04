import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isValidCep,
  parseViaCep,
  fetchViaCep,
  cheapestQuote,
  fastestQuote,
  findQuoteById,
  applyFreeShippingThreshold,
  clearFreightCache,
  type FreightQuote,
} from '@/lib/freight';

const quotes: FreightQuote[] = [
  { id: 'pac', name: 'PAC', price: 30, days: 8 },
  { id: 'sedex', name: 'SEDEX', price: 50, days: 3 },
  { id: 'jadlog', name: 'Jadlog', price: 40, days: 5 },
];

describe('freight', () => {
  beforeEach(() => clearFreightCache());

  it('isValidCep validates 8-digit cep', () => {
    expect(isValidCep('01310100')).toBe(true);
    expect(isValidCep('01310-100')).toBe(true);
    expect(isValidCep('123')).toBe(false);
    expect(isValidCep('')).toBe(false);
  });

  it('parseViaCep returns null on error or missing fields', () => {
    expect(parseViaCep({ erro: true })).toBeNull();
    expect(parseViaCep({ cep: '01310100' })).toBeNull();
    expect(parseViaCep(null)).toBeNull();
  });

  it('parseViaCep maps fields correctly', () => {
    const r = parseViaCep({
      cep: '01310-100', logradouro: 'Av. Paulista', bairro: 'Bela Vista',
      localidade: 'São Paulo', uf: 'sp',
    });
    expect(r).toEqual({
      cep: '01310100', street: 'Av. Paulista', neighborhood: 'Bela Vista',
      city: 'São Paulo', state: 'SP',
    });
  });

  it('fetchViaCep returns null for invalid cep', async () => {
    const r = await fetchViaCep('123');
    expect(r).toBeNull();
  });

  it('fetchViaCep caches successful responses', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cep: '01310-100', localidade: 'SP', uf: 'SP' }),
    });
    await fetchViaCep('01310100', { fetcher: fetcher as unknown as typeof fetch });
    await fetchViaCep('01310100', { fetcher: fetcher as unknown as typeof fetch });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('cheapestQuote / fastestQuote work', () => {
    expect(cheapestQuote(quotes)?.id).toBe('pac');
    expect(fastestQuote(quotes)?.id).toBe('sedex');
    expect(cheapestQuote([])).toBeNull();
  });

  it('findQuoteById returns the right quote', () => {
    expect(findQuoteById(quotes, 'jadlog')?.price).toBe(40);
    expect(findQuoteById(quotes, null)).toBeNull();
    expect(findQuoteById(quotes, 'xx')).toBeNull();
  });

  it('applyFreeShippingThreshold zeroes quote when subtotal >= min', () => {
    const r = applyFreeShippingThreshold(250, quotes[0], 200);
    expect(r.applied).toBe(true);
    expect(r.quote?.price).toBe(0);
  });

  it('applyFreeShippingThreshold keeps price when below min', () => {
    const r = applyFreeShippingThreshold(150, quotes[0], 200);
    expect(r.applied).toBe(false);
    expect(r.quote?.price).toBe(30);
  });
});
