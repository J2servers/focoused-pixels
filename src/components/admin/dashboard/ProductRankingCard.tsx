import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductRanking } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ProductRankingCard() {
  const { data: ranking, isLoading } = useProductRanking(10);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {index + 1}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Ranking de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ranking || ranking.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Ranking de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma venda registrada ainda. O ranking será exibido após os primeiros pedidos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Ranking de Produtos Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="px-6 pb-4 space-y-1">
            {ranking.map((product, index) => (
              <div 
                key={product.product_id || product.product_name}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  index === 0 && "bg-yellow-50 border border-yellow-200",
                  index === 1 && "bg-gray-50 border border-gray-200",
                  index === 2 && "bg-amber-50 border border-amber-200",
                  index > 2 && "hover:bg-muted/50"
                )}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {product.product_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      Receita: R$ {product.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-emerald-600">
                      Lucro: R$ {product.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {product.totalQuantity} un
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
