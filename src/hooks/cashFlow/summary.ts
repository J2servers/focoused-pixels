import { useCashTransactions } from './queries';
import type { CashTransaction, CashTransactionType } from './types';

const sumByType = (txs: CashTransaction[] | undefined, type: CashTransactionType) =>
  txs?.filter(t => t.type === type).reduce((s, t) => s + Number(t.amount), 0) ?? 0;

const groupByCategory = (txs: CashTransaction[] | undefined, type: CashTransactionType) =>
  txs?.filter(t => t.type === type).reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {}) ?? {};

export function useCashSummary(startDate?: string, endDate?: string) {
  const { data: transactions } = useCashTransactions(startDate, endDate);

  const totalEntries = sumByType(transactions, 'entry');
  const totalExits = sumByType(transactions, 'exit');

  return {
    totalEntries,
    totalExits,
    balance: totalEntries - totalExits,
    entriesByCategory: groupByCategory(transactions, 'entry'),
    exitsByCategory: groupByCategory(transactions, 'exit'),
    transactionCount: transactions?.length || 0,
  };
}
