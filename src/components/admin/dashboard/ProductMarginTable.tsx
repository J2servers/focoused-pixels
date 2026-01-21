import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductsWithMargins } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function ProductMarginTable() {
  const { data: products, isLoading } = useProductsWithMargins();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Margem de Lucro por Produto
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

  // Ordena por margem percentual
  const sortedProducts = [...(products || [])].sort((a, b) => b.marginPercent - a.marginPercent);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          Margem de Lucro por Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="px-6">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 py-2 text-xs font-medium text-muted-foreground border-b sticky top-0 bg-card">
              <div className="col-span-5">Produto</div>
              <div className="col-span-2 text-right">Venda</div>
              <div className="col-span-2 text-right">Custo</div>
              <div className="col-span-3 text-right">Margem</div>
            </div>

            {/* Products */}
            <div className="divide-y">
              {sortedProducts.map(product => (
                <div 
                  key={product.id}
                  className="grid grid-cols-12 gap-2 py-3 text-sm items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-5 truncate font-medium">
                    {product.name}
                  </div>
                  <div className="col-span-2 text-right text-muted-foreground">
                    R$ {product.sellPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right text-muted-foreground">
                    R$ {product.totalCost.toFixed(2)}
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {product.marginPercent >= 30 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      ) : product.marginPercent >= 15 ? (
                        <TrendingUp className="h-3 w-3 text-amber-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-mono",
                          product.marginPercent >= 30 && "border-emerald-500 text-emerald-700",
                          product.marginPercent >= 15 && product.marginPercent < 30 && "border-amber-500 text-amber-700",
                          product.marginPercent < 15 && "border-red-500 text-red-700"
                        )}
                      >
                        {product.marginPercent.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {sortedProducts.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum produto com custos cadastrados.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
