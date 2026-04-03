import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'purple' | 'green' | 'blue' | 'orange' | 'pink' | 'cyan';
  subtitle?: string;
}

const variantMap = {
  purple: {
    gradient: 'from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]',
    stat: 'admin-stat-purple',
  },
  green: {
    gradient: 'from-[hsl(var(--admin-accent-green))] to-emerald-600',
    stat: 'admin-stat-green',
  },
  blue: {
    gradient: 'from-[hsl(var(--admin-accent-blue))] to-[hsl(var(--admin-accent-cyan))]',
    stat: 'admin-stat-blue',
  },
  orange: {
    gradient: 'from-[hsl(var(--admin-accent-orange))] to-red-500',
    stat: 'admin-stat-orange',
  },
  pink: {
    gradient: 'from-[hsl(var(--admin-accent-pink))] to-rose-600',
    stat: 'admin-stat-pink',
  },
  cyan: {
    gradient: 'from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-blue))]',
    stat: 'admin-stat-blue',
  },
};

export const AdminSummaryCard = ({ title, value, icon: Icon, variant = 'purple', subtitle }: AdminSummaryCardProps) => {
  const v = variantMap[variant];
  return (
    <Card className={cn('border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg admin-stat-card', v.stat)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn('p-3 rounded-xl bg-gradient-to-br shadow-lg', v.gradient)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-[hsl(var(--admin-text-muted))]">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
