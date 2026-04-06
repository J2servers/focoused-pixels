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

const variantStyles = {
  purple: { gradient: 'linear-gradient(135deg, hsl(280 80% 50% / 0.25), hsl(300 70% 40% / 0.15))', border: 'hsl(280 90% 60% / 0.25)', iconBg: 'hsl(280 80% 55% / 0.2)', trendUp: 'text-violet-300' },
  green:  { gradient: 'linear-gradient(135deg, hsl(160 100% 38% / 0.25), hsl(145 80% 30% / 0.15))', border: 'hsl(160 100% 45% / 0.25)', iconBg: 'hsl(160 100% 40% / 0.2)', trendUp: 'text-emerald-300' },
  blue:   { gradient: 'linear-gradient(135deg, hsl(210 100% 55% / 0.25), hsl(220 90% 42% / 0.15))', border: 'hsl(210 100% 60% / 0.25)', iconBg: 'hsl(210 100% 55% / 0.2)', trendUp: 'text-blue-300' },
  orange: { gradient: 'linear-gradient(135deg, hsl(30 100% 50% / 0.25), hsl(20 90% 42% / 0.15))', border: 'hsl(30 100% 55% / 0.25)', iconBg: 'hsl(30 100% 50% / 0.2)', trendUp: 'text-orange-300' },
  pink:   { gradient: 'linear-gradient(135deg, hsl(340 100% 58% / 0.25), hsl(330 80% 45% / 0.15))', border: 'hsl(340 100% 65% / 0.25)', iconBg: 'hsl(340 100% 58% / 0.2)', trendUp: 'text-pink-300' },
  cyan:   { gradient: 'linear-gradient(135deg, hsl(185 100% 45% / 0.25), hsl(195 90% 35% / 0.15))', border: 'hsl(185 100% 50% / 0.25)', iconBg: 'hsl(185 100% 45% / 0.2)', trendUp: 'text-cyan-300' },
};

export const AdminSummaryCard = ({ title, value, icon: Icon, variant = 'purple', subtitle, trend }: AdminSummaryCardProps) => {
  const v = variantStyles[variant];
  return (
    <div className="rounded-xl p-5 motion-fade-up group overflow-hidden transition-all duration-300 hover:-translate-y-1 backdrop-blur-lg"
      style={{ background: v.gradient, border: `1px solid ${v.border}`, boxShadow: `0 8px 32px hsl(0 0% 0% / 0.2)` }}>
      <div className="flex items-center gap-4 relative">
        <div className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: v.iconBg, backdropFilter: 'blur(8px)' }}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/60 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            {trend && (
              <span className={cn('text-xs font-medium', trend.value >= 0 ? v.trendUp : 'text-red-300')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/40 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
