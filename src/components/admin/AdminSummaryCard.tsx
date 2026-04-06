import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'purple' | 'green' | 'blue' | 'orange' | 'pink' | 'cyan';
  subtitle?: string;
  trend?: { value: number; label?: string };
}

const variantMap = {
  purple: {
    gradient: 'from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]',
    stat: 'admin-stat-purple',
    trendColor: 'text-violet-400',
  },
  green: {
    gradient: 'from-[hsl(var(--admin-accent-green))] to-emerald-600',
    stat: 'admin-stat-green',
    trendColor: 'text-emerald-400',
  },
  blue: {
    gradient: 'from-[hsl(var(--admin-accent-blue))] to-[hsl(var(--admin-accent-cyan))]',
    stat: 'admin-stat-blue',
    trendColor: 'text-blue-400',
  },
  orange: {
    gradient: 'from-[hsl(var(--admin-accent-orange))] to-red-500',
    stat: 'admin-stat-orange',
    trendColor: 'text-orange-400',
  },
  pink: {
    gradient: 'from-[hsl(var(--admin-accent-pink))] to-rose-600',
    stat: 'admin-stat-pink',
    trendColor: 'text-pink-400',
  },
  cyan: {
    gradient: 'from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-blue))]',
    stat: 'admin-stat-blue',
    trendColor: 'text-cyan-400',
  },
};

export const AdminSummaryCard = ({ title, value, icon: Icon, variant = 'purple', subtitle, trend }: AdminSummaryCardProps) => {
  const v = variantMap[variant];
  return (
    <Card className={cn(
      'border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg admin-stat-card admin-card-hover motion-fade-up group',
      v.stat
    )}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110',
          v.gradient
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[hsl(var(--admin-text-muted))] truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            {trend && (
              <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
