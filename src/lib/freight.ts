/**
 * freight.ts — pure helpers for freight workflow.
 *
 * - In-memory TTL cache to avoid duplicate ViaCEP calls within a session.
 * - Type-safe ViaCEP response parsing.
 * - Selection helpers (cheapest, fastest, by id).
 *
 * Designed to be consumed by useFreightCalculator.
 */

export interface ViaCepAddress {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface FreightQuote {
  id: string;
  name: string;
  price: number;
  days: number;
  carrier?: string;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5min
const viaCepCache = new Map<string, CacheEntry<ViaCepAddress | null>>();

function now(): number {
  return Date.now();
}

export function clearFreightCache(): void {
  viaCepCache.clear();
}

export function isValidCep(raw: string | null | undefined): boolean {
  return /^\d{8}$/.test((raw ?? '').replace(/\D/g, ''));
}

interface RawViaCep {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export function parseViaCep(payload: unknown): ViaCepAddress | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as RawViaCep;
  if (p.erro) return null;
  if (!p.cep || !p.localidade || !p.uf) return null;
  return {
    cep: p.cep.replace(/\D/g, ''),
    street: p.logradouro ?? '',
    neighborhood: p.bairro ?? '',
    city: p.localidade,
    state: p.uf.toUpperCase(),
  };
}

export interface FetchViaCepDeps {
  fetcher?: typeof fetch;
  ttlMs?: number;
}

export async function fetchViaCep(
  rawCep: string,
  deps: FetchViaCepDeps = {},
): Promise<ViaCepAddress | null> {
  const cep = (rawCep ?? '').replace(/\D/g, '');
  if (!isValidCep(cep)) return null;

  const cached = viaCepCache.get(cep);
  if (cached && cached.expiresAt > now()) return cached.value;

  const f = deps.fetcher ?? fetch;
  try {
    const res = await f(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    const parsed = parseViaCep(json);
    viaCepCache.set(cep, {
      value: parsed,
      expiresAt: now() + (deps.ttlMs ?? DEFAULT_TTL_MS),
    });
    return parsed;
  } catch {
    return null;
  }
}

export function cheapestQuote(quotes: FreightQuote[]): FreightQuote | null {
  if (!quotes.length) return null;
  return [...quotes].sort((a, b) => a.price - b.price)[0];
}

export function fastestQuote(quotes: FreightQuote[]): FreightQuote | null {
  if (!quotes.length) return null;
  return [...quotes].sort((a, b) => a.days - b.days)[0];
}

export function findQuoteById(
  quotes: FreightQuote[],
  id: string | null | undefined,
): FreightQuote | null {
  if (!id) return null;
  return quotes.find((q) => q.id === id) ?? null;
}

export function applyFreeShippingThreshold(
  cartSubtotal: number,
  quote: FreightQuote | null,
  freeShippingMinimum: number,
): { quote: FreightQuote | null; applied: boolean } {
  if (!quote) return { quote: null, applied: false };
  if (freeShippingMinimum > 0 && cartSubtotal >= freeShippingMinimum) {
    return { quote: { ...quote, price: 0 }, applied: true };
  }
  return { quote, applied: false };
}
