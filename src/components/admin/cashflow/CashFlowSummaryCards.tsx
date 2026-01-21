import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCashSummary } from '@/hooks/useCashFlow';

interface CashFlowSummaryCardsProps {
  startDate?: string;
  endDate?: string;
}

export function CashFlowSummaryCards({ startDate, endDate }: CashFlowSummaryCardsProps) {
  const { totalEntries, totalExits, balance, transactionCount } = useCashSummary(startDate, endDate);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const cards = [
    {
      title: 'Total de Entradas',
      value: formatCurrency(totalEntries),
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      badge: <ArrowUpRight className="h-3 w-3" />,
      badgeBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Total de Saídas',
      value: formatCurrency(totalExits),
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      badge: <ArrowDownRight className="h-3 w-3" />,
      badgeBg: 'bg-red-100 text-red-700',
    },
    {
      title: 'Saldo do Período',
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-amber-500 to-amber-600',
      iconBg: balance >= 0 ? 'bg-blue-500/10' : 'bg-amber-500/10',
      iconColor: balance >= 0 ? 'text-blue-500' : 'text-amber-500',
      badge: balance >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />,
      badgeBg: balance >= 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700',
      subtitle: `${transactionCount} transações`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", card.color)}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", card.badgeBg)}>
                {card.badge}
              </div>
            </div>
            <div className="mt-4">
              <p className={cn(
                "text-2xl font-bold",
                card.title === 'Saldo do Período' && balance < 0 ? 'text-red-600' : 'text-foreground'
              )}>
                {card.value}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.title}</p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
