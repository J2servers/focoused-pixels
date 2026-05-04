/** CPF utilities — format `999.999.999-99` and full module-11 validation. */
export const cpfDigits = (raw: string | null | undefined): string =>
  (raw ?? '').replace(/\D/g, '').slice(0, 11);

export const formatCpf = (raw: string | null | undefined): string => {
  const d = cpfDigits(raw);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const calcDigit = (digits: string, factor: number): number => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * (factor - i);
  const mod = (sum * 10) % 11;
  return mod === 10 ? 0 : mod;
};

export const isValidCpf = (raw: string | null | undefined): boolean => {
  const d = cpfDigits(raw);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const d1 = calcDigit(d.slice(0, 9), 10);
  const d2 = calcDigit(d.slice(0, 10), 11);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
};
