/**
 * StockIndicator - Real stock level display
 * Improvements: #10 Stock badge, #11 Low stock urgency, #12 Stock progress bar
 */
import { Package, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StockIndicatorProps {
  stock: number | null | undefined;
  showWhenAbove?: number;
  lowThreshold?: number;
}

export function StockIndicator({ stock, showWhenAbove = 0, lowThreshold = 10 }: StockIndicatorProps) {
  if (stock === null || stock === undefined) return null;
  if (stock > showWhenAbove && stock > lowThreshold) return null;

  if (stock <= 0) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm font-medium">
        <Package className="h-4 w-4" />
        <span>Produto esgotado</span>
      </div>
    );
  }

  const isLow = stock <= lowThreshold;
  const percentage = Math.min(100, (stock / 50) * 100);

  if (!isLow) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-medium text-amber-600 dark:text-amber-400">
          {stock <= 3
            ? `Últimas ${stock} unidade${stock > 1 ? 's' : ''}!`
            : `Apenas ${stock} em estoque`}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}
