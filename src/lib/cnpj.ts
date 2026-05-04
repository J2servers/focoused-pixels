/** CNPJ utilities — format `99.999.999/9999-99` and full module-11 validation. */
export const cnpjDigits = (raw: string | null | undefined): string =>
  (raw ?? '').replace(/\D/g, '').slice(0, 14);

export const formatCnpj = (raw: string | null | undefined): string => {
  const d = cnpjDigits(raw);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

const W1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const W2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const calcDigit = (digits: string, weights: number[]): number => {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += Number(digits[i]) * weights[i];
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};

export const isValidCnpj = (raw: string | null | undefined): boolean => {
  const d = cnpjDigits(raw);
  if (d.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(d)) return false;
  const d1 = calcDigit(d.slice(0, 12), W1);
  const d2 = calcDigit(d.slice(0, 13), W2);
  return d1 === Number(d[12]) && d2 === Number(d[13]);
};
