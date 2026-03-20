/**
 * UrgencyBadge - Shows "X pessoas compraram hoje" or "Poucas unidades"
 */
import { useMemo } from 'react';
import { Flame, Eye } from 'lucide-react';

interface UrgencyBadgeProps {
  productId: string;
  stock?: number;
  className?: string;
}

export function UrgencyBadge({ productId, stock, className = '' }: UrgencyBadgeProps) {
  // Generate a consistent "purchased today" number based on product ID
  const purchasedToday = useMemo(() => {
    let hash = 0;
    const day = new Date().getDate();
    const str = productId + day;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 12) + 3; // 3-14 purchases
  }, [productId]);

  if (stock !== undefined && stock <= 5 && stock > 0) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium text-destructive ${className}`}>
        <Flame className="h-3.5 w-3.5 animate-pulse" />
        <span>Apenas {stock} em estoque!</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Eye className="h-3.5 w-3.5" />
      <span>{purchasedToday} pessoas compraram hoje</span>
    </div>
  );
}
