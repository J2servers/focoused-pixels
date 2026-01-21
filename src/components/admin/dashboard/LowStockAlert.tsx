import { AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLowStockProducts } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export function LowStockAlert() {
  const { data: products, isLoading } = useLowStockProducts(10);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-emerald-500" />
            Estoque OK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Todos os produtos estão com estoque adequado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Estoque Baixo
          <Badge variant="destructive" className="ml-auto text-xs">
            {products.length} produtos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px] px-6">
          <div className="space-y-3 pb-4">
            {products.map(product => (
              <Link 
                key={product.id}
                to="/admin/produtos"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {product.cover_image ? (
                    <img 
                      src={product.cover_image} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Mínimo: {product.min_stock || 5} unidades
                  </p>
                </div>
                <Badge 
                  variant={product.stock === 0 ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {product.stock} un
                </Badge>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
