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
    bg: 'bg-gradient-to-br from-[hsl(280,80%,50%)] to-[hsl(300,70%,40%)]',
    trendColor: 'text-violet-200',
  },
  green: {
    bg: 'bg-gradient-to-br from-[hsl(160,100%,38%)] to-[hsl(145,80%,30%)]',
    trendColor: 'text-emerald-200',
  },
  blue: {
    bg: 'bg-gradient-to-br from-[hsl(210,100%,55%)] to-[hsl(220,90%,42%)]',
    trendColor: 'text-blue-200',
  },
  orange: {
    bg: 'bg-gradient-to-br from-[hsl(30,100%,50%)] to-[hsl(20,90%,42%)]',
    trendColor: 'text-orange-200',
  },
  pink: {
    bg: 'bg-gradient-to-br from-[hsl(340,100%,58%)] to-[hsl(330,80%,45%)]',
    trendColor: 'text-pink-200',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-[hsl(185,100%,45%)] to-[hsl(195,90%,35%)]',
    trendColor: 'text-cyan-200',
  },
};

export const AdminSummaryCard = ({ title, value, icon: Icon, variant = 'purple', subtitle, trend }: AdminSummaryCardProps) => {
  const v = variantMap[variant];
  return (
    <Card className={cn(
      'border-0 shadow-lg motion-fade-up group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
      v.bg
    )}>
      <CardContent className="flex items-center gap-4 p-6 relative">
        <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/75 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            {trend && (
              <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-white/90' : 'text-red-200')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/60 truncate">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
