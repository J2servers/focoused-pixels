export const ABANDONED_CART_TOKEN_KEY = 'pdl_abandoned_cart_token';
export const ABANDONED_CART_CONTACT_KEY = 'pdl_abandoned_cart_contact';
export const ABANDONED_CONTACT_UPDATED_EVENT = 'pdl-abandoned-contact-updated';

export interface AbandonedCartContact {
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

function hasWindow() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function safeTrim(value: unknown, maxLength = 255): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(value: unknown): string | undefined {
  const email = safeTrim(value, 320)?.toLowerCase();
  if (!email || !email.includes('@')) return undefined;
  return email;
}

function normalizePhone(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return undefined;
  return digits;
}

export function getOrCreateAbandonedCartToken(): string {
  if (!hasWindow()) return '';

  const existing = localStorage.getItem(ABANDONED_CART_TOKEN_KEY);
  if (existing && existing.length >= 8) return existing;

  const generated = (crypto?.randomUUID?.() || `${Date.now()}${Math.random()}`)
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 64);

  localStorage.setItem(ABANDONED_CART_TOKEN_KEY, generated);
  return generated;
}

export function getAbandonedCartContact(): AbandonedCartContact | null {
  if (!hasWindow()) return null;

  const raw = localStorage.getItem(ABANDONED_CART_CONTACT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AbandonedCartContact;
    return {
      name: safeTrim(parsed.name, 140),
      email: normalizeEmail(parsed.email),
      phone: normalizePhone(parsed.phone),
      userId: safeTrim(parsed.userId, 50),
    };
  } catch {
    return null;
  }
}

export function saveAbandonedCartContact(contact: AbandonedCartContact): void {
  if (!hasWindow()) return;

  const previous = getAbandonedCartContact() || {};

  const next: AbandonedCartContact = {
    name: safeTrim(contact.name ?? previous.name, 140),
    email: normalizeEmail(contact.email ?? previous.email),
    phone: normalizePhone(contact.phone ?? previous.phone),
    userId: safeTrim(contact.userId ?? previous.userId, 50),
  };

  if (!next.name && !next.email && !next.phone && !next.userId) {
    localStorage.removeItem(ABANDONED_CART_CONTACT_KEY);
  } else {
    localStorage.setItem(ABANDONED_CART_CONTACT_KEY, JSON.stringify(next));
  }

  window.dispatchEvent(new CustomEvent(ABANDONED_CONTACT_UPDATED_EVENT, { detail: next }));
}

export function clearAbandonedCartContact(): void {
  if (!hasWindow()) return;
  localStorage.removeItem(ABANDONED_CART_CONTACT_KEY);
  window.dispatchEvent(new CustomEvent(ABANDONED_CONTACT_UPDATED_EVENT, { detail: null }));
}
