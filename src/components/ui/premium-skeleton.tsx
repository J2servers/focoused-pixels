import { cn } from '@/lib/utils';

interface PremiumSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function PremiumSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: PremiumSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-muted via-muted/60 to-muted bg-[length:200%_100%]';

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 rounded-md', i === lines - 1 && 'w-3/4')}
            style={{ width: i === lines - 1 ? '75%' : width }}
          />
        ))}
      </div>
    );
  }

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-lg',
    card: 'rounded-xl min-h-[120px]',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 p-0">
      <PremiumSkeleton variant="rectangular" className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <PremiumSkeleton variant="text" className="w-2/3 h-3" />
        <PremiumSkeleton variant="text" className="w-full h-4" />
        <div className="flex justify-between items-center pt-2">
          <PremiumSkeleton variant="text" className="w-1/3 h-5" />
          <PremiumSkeleton variant="circular" className="w-9 h-9" />
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-4 p-3 border-b border-border/30">
        {[1, 2, 3, 4].map(i => (
          <PremiumSkeleton key={i} variant="text" className="flex-1 h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          {[1, 2, 3, 4].map(j => (
            <PremiumSkeleton key={j} variant="text" className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 p-6 space-y-3">
      <div className="flex items-center gap-4">
        <PremiumSkeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <PremiumSkeleton variant="text" className="w-1/2 h-3" />
          <PremiumSkeleton variant="text" className="w-1/3 h-6" />
        </div>
      </div>
    </div>
  );
}
