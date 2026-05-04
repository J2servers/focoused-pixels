/** CEP utilities — formatting (`99999-999`) and digit-only normalization. */
export const cepDigits = (raw: string | null | undefined): string =>
  (raw ?? '').replace(/\D/g, '').slice(0, 8);

export const formatCep = (raw: string | null | undefined): string => {
  const d = cepDigits(raw);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

export const isValidCep = (raw: string | null | undefined): boolean =>
  cepDigits(raw).length === 8;
