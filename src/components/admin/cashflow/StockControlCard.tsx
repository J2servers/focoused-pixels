import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLowStockProducts, useProductsWithMargins } from '@/hooks/useFinancialData';
import { cn } from '@/lib/utils';

export function StockControlCard() {
  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useLowStockProducts(5);
  const { data: allProducts } = useProductsWithMargins();

  // Calcular estatísticas de estoque
  const totalProducts = allProducts?.length || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  const outOfStockCount = allProducts?.filter(p => (p.stock || 0) === 0).length || 0;
  const totalStockValue = allProducts?.reduce((sum, p) => {
    const price = p.promotional_price || p.price;
    return sum + (price * (p.stock || 0));
  }, 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-primary" />
          Controle de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo de Estoque */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            <p className="text-xs text-muted-foreground">Total de Produtos</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalStockValue)}</p>
            <p className="text-xs text-muted-foreground">Valor em Estoque</p>
          </div>
        </div>

        {/* Alertas */}
        <div className="space-y-2">
          {outOfStockCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Sem estoque</span>
              </div>
              <Badge variant="destructive">{outOfStockCount}</Badge>
            </div>
          )}
          
          {lowStockCount > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Estoque baixo</span>
              </div>
              <Badge className="bg-amber-500">{lowStockCount}</Badge>
            </div>
          )}
        </div>

        {/* Lista de Produtos com Estoque Baixo */}
        {isLoadingLowStock ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : lowStockProducts && lowStockProducts.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Produtos para repor:</p>
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {product.cover_image ? (
                    <img
                      src={product.cover_image}
                      alt={product.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm truncate">{product.name}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-2 shrink-0",
                    (product.stock || 0) === 0
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  )}
                >
                  {product.stock || 0} un
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Estoque em dia! 🎉</p>
          </div>
        )}

        <Button asChild variant="outline" className="w-full gap-2">
          <Link to="/admin/produtos">
            Ver Todos os Produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
