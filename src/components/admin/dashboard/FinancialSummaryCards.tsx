import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Calculator,
  Percent,
  FileCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinancialSummary } from '@/hooks/useFinancialData';
import { cn } from '@/lib/utils';

export function FinancialSummaryCards() {
  const summary = useFinancialSummary();

  const cards = [
    {
      title: 'Receita Bruta',
      value: summary.receitaBruta,
      format: 'currency',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Total de vendas (12 meses)',
    },
    {
      title: 'Custos Totais',
      value: summary.custoTotal,
      format: 'currency',
      icon: Receipt,
      color: 'from-red-500 to-red-600',
      description: 'Material + Mão de obra + Frete',
    },
    {
      title: 'Impostos (Simples)',
      value: summary.impostos,
      format: 'currency',
      icon: Calculator,
      color: 'from-amber-500 to-amber-600',
      description: `Faixa ${summary.faixaSimples} - ${summary.aliquotaEfetiva.toFixed(2)}%`,
    },
    {
      title: 'Receita Líquida',
      value: summary.receitaLiquida,
      format: 'currency',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      description: 'Lucro após custos e impostos',
    },
    {
      title: 'Margem Líquida',
      value: summary.margemLiquida,
      format: 'percent',
      icon: Percent,
      color: 'from-purple-500 to-purple-600',
      description: '% de lucro sobre receita',
    },
    {
      title: 'Orçamentos Aprovados',
      value: summary.totalOrcamentosAprovados,
      format: 'number',
      icon: FileCheck,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Convertidos em vendas',
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br",
                card.color
              )}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {summary.taxSettings === undefined ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  formatValue(card.value, card.format)
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {card.title}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
