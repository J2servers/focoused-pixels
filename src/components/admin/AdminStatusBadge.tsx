import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface AdminStatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25',
  warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25',
  danger: 'bg-red-500/20 text-red-300 border border-red-500/25 hover:bg-red-500/25',
  info: 'bg-blue-500/20 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25',
  neutral: 'bg-white/10 text-white/50 border border-white/10 hover:bg-white/15',
  purple: 'bg-violet-500/20 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25',
};

export const AdminStatusBadge = ({ label, variant = 'neutral', className }: AdminStatusBadgeProps) => (
  <Badge className={cn('backdrop-blur-sm', variantStyles[variant], className)}>{label}</Badge>
);
