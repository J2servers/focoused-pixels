/**
 * Centralized formatting utilities (DRY).
 * Use these everywhere — never inline `Intl.NumberFormat` or `toLocaleString` in components.
 */

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PERCENT = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 });
const DATE = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DATETIME = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

export const formatCurrency = (value: number | null | undefined): string =>
  BRL.format(Number(value) || 0);

export const formatPercent = (ratio: number | null | undefined): string =>
  PERCENT.format(Number(ratio) || 0);

export const formatDate = (input: string | Date | null | undefined): string => {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? '' : DATE.format(date);
};

export const formatDateTime = (input: string | Date | null | undefined): string => {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? '' : DATETIME.format(date);
};

export const formatPhone = (raw: string | null | undefined): string => {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return raw || '';
};

export const formatCEP = (raw: string | null | undefined): string => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length === 8 ? digits.replace(/^(\d{5})(\d{3})$/, '$1-$2') : raw || '';
};

export const formatCNPJ = (raw: string | null | undefined): string => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length === 14
    ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : raw || '';
};

export const formatCPF = (raw: string | null | undefined): string => {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length === 11
    ? digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
    : raw || '';
};
