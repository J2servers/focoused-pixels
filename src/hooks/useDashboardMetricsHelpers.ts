// Helper functions extracted from useDashboardMetrics to reduce file size

export function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
export function startOfWeek(d: Date) { const day = d.getDay(); return startOfDay(new Date(d.getTime() - day * 86400000)); }
export function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
export function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1); }
export function daysAgo(n: number) { return new Date(Date.now() - n * 86400000); }

export const sum = (arr: { total: number }[]) => arr.reduce((s, o) => s + (o.total || 0), 0);

interface DateFilterable { created_at: string }
interface TransactionDateFilterable { transaction_date: string; amount: number }

export function filterByDate<T extends DateFilterable>(arr: T[], start: Date): T[] {
  return arr.filter(o => new Date(o.created_at) >= start);
}

export function filterByDateRange<T extends DateFilterable>(arr: T[], start: Date, end: Date): T[] {
  return arr.filter(o => { const d = new Date(o.created_at); return d >= start && d <= end; });
}

export function buildDailyTimeSeries<T extends DateFilterable>(
  arr: T[],
  days: number,
  extractor: (items: T[], day: Date, nextDay: Date) => Record<string, number>
) {
  const result: (Record<string, number> & { date: string })[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(daysAgo(i));
    const nextDay = new Date(day.getTime() + 86400000);
    const items = arr.filter(o => { const d = new Date(o.created_at); return d >= day && d < nextDay; });
    result.push({
      date: day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      ...extractor(items, day, nextDay),
    });
  }
  return result;
}

export function buildMonthlyTimeSeries<T extends DateFilterable>(
  arr: T[],
  months: number,
  extractor: (items: T[], mStart: Date, mEnd: Date) => Record<string, number>
) {
  const now = new Date();
  const result: (Record<string, number> & { mes: string })[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const items = arr.filter(o => { const d = new Date(o.created_at); return d >= mStart && d <= mEnd; });
    result.push({
      mes: mStart.toLocaleDateString('pt-BR', { month: 'short' }),
      ...extractor(items, mStart, mEnd),
    });
  }
  return result;
}

export function countByField<T>(arr: T[], field: keyof T, value: unknown): number {
  return arr.filter(o => o[field] === value).length;
}

export function buildDistribution(items: { name: string; value: number; fill: string }[]) {
  return items.filter(s => s.value > 0);
}

export function buildCashDailyTimeSeries(
  entradas: TransactionDateFilterable[],
  saidas: TransactionDateFilterable[],
  days: number
) {
  const result: { date: string; entradas: number; saidas: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(daysAgo(i));
    const nextDay = new Date(day.getTime() + 86400000);
    const dayStr = day.toLocaleDateString('pt-BR', { weekday: 'short' });
    const ent = entradas.filter(t => { const d = new Date(t.transaction_date); return d >= day && d < nextDay; }).reduce((s, t) => s + (t.amount || 0), 0);
    const sai = saidas.filter(t => { const d = new Date(t.transaction_date); return d >= day && d < nextDay; }).reduce((s, t) => s + (t.amount || 0), 0);
    result.push({ date: dayStr, entradas: ent, saidas: sai });
  }
  return result;
}
