export function normalizeWhatsAppNumber(value?: string | null) {
  const digits = (value ?? '').replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('55')) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;

  return digits;
}

export function buildWhatsAppUrl(number?: string | null, message?: string) {
  const normalized = normalizeWhatsAppNumber(number);

  if (!normalized) return '';

  const encodedMessage = message?.trim() ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalized}${encodedMessage}`;
}