/**
 * Simples Nacional tax calculations (LC 123/2006).
 * Pure functions — no side effects, fully testable.
 */
import type { SimplesAnexo, SimplesTaxResult } from './types';

interface TaxBracket {
  faixa: number;
  receitaBruta: number;
  aliquota: number;
  deducao: number;
}

const ANEXO_III: TaxBracket[] = [
  { faixa: 1, receitaBruta: 180_000, aliquota: 6.0, deducao: 0 },
  { faixa: 2, receitaBruta: 360_000, aliquota: 11.2, deducao: 9_360 },
  { faixa: 3, receitaBruta: 720_000, aliquota: 13.5, deducao: 17_640 },
  { faixa: 4, receitaBruta: 1_800_000, aliquota: 16.0, deducao: 35_640 },
  { faixa: 5, receitaBruta: 3_600_000, aliquota: 21.0, deducao: 125_640 },
  { faixa: 6, receitaBruta: 4_800_000, aliquota: 33.0, deducao: 648_000 },
];

const ANEXO_II: TaxBracket[] = [
  { faixa: 1, receitaBruta: 180_000, aliquota: 4.5, deducao: 0 },
  { faixa: 2, receitaBruta: 360_000, aliquota: 7.8, deducao: 5_940 },
  { faixa: 3, receitaBruta: 720_000, aliquota: 10.0, deducao: 13_860 },
  { faixa: 4, receitaBruta: 1_800_000, aliquota: 11.2, deducao: 22_500 },
  { faixa: 5, receitaBruta: 3_600_000, aliquota: 14.7, deducao: 85_500 },
  { faixa: 6, receitaBruta: 4_800_000, aliquota: 30.0, deducao: 720_000 },
];

const findBracket = (table: TaxBracket[], revenue: number): TaxBracket =>
  table.find((b) => revenue <= b.receitaBruta) ?? table[table.length - 1];

export function calculateSimplesTax(
  receitaBruta12Meses: number,
  anexo: SimplesAnexo = 'III',
): SimplesTaxResult {
  const table = anexo === 'II' ? ANEXO_II : ANEXO_III;
  const bracket = findBracket(table, receitaBruta12Meses);

  const effectiveRate = receitaBruta12Meses > 0
    ? (((receitaBruta12Meses * (bracket.aliquota / 100)) - bracket.deducao) / receitaBruta12Meses) * 100
    : bracket.aliquota;

  const safeRate = Math.max(effectiveRate, 0);
  return {
    aliquotaEfetiva: safeRate,
    valorImposto: (receitaBruta12Meses * safeRate) / 100,
    faixa: bracket.faixa,
  };
}
