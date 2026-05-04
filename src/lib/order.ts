/**
 * order.ts — pure builders for order rows / production notes.
 * No side effects, no Supabase, no toast.
 */
import { sanitizeEmail, sanitizePhone } from '@/lib/sanitize';

export interface CustomerAddressInput {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export function buildFullAddress(c: CustomerAddressInput): string {
  return [c.street, c.number, c.complement, c.neighborhood, c.city, c.state]
    .map((v) => (v ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

export function buildShippingAddressLine(c: CustomerAddressInput): string | null {
  const parts = [c.street, c.number, c.complement, c.neighborhood]
    .map((v) => (v ?? '').trim())
    .filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export interface UploadedFileLite { name: string; url: string }

export function buildProductionNotes(
  customText: string,
  files: UploadedFileLite[],
): string | null {
  const out: string[] = [];
  const text = customText.trim();
  if (text) out.push(`📝 Texto: ${text}`);
  if (files.length > 0) out.push(`📎 Arquivos: ${files.map((f) => f.name).join(', ')}`);
  return out.length ? out.join('\n') : null;
}

/**
 * order_number with format PDL-YYYYMMDD-RAND4.
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PDL-${y}${m}${d}-${rand}`;
}

export interface CustomerSnapshot {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function sanitizeCustomerSnapshot(c: CustomerSnapshot): CustomerSnapshot {
  return {
    customerName: c.customerName.trim(),
    customerEmail: sanitizeEmail(c.customerEmail),
    customerPhone: sanitizePhone(c.customerPhone) || c.customerPhone || '',
  };
}
