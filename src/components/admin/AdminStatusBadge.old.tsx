import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface AdminStatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[hsl(var(--admin-accent-green))] text-white hover:bg-[hsl(var(--admin-accent-green))]',
  warning: 'bg-amber-500 text-white hover:bg-amber-500',
  danger: 'bg-red-500 text-white hover:bg-red-500',
  info: 'bg-[hsl(var(--admin-accent-blue))] text-white hover:bg-[hsl(var(--admin-accent-blue))]',
  neutral: 'bg-gray-500 text-white hover:bg-gray-500',
  purple: 'bg-[hsl(var(--admin-accent-purple))] text-white hover:bg-[hsl(var(--admin-accent-purple))]',
};

export const AdminStatusBadge = ({ label, variant = 'neutral', className }: AdminStatusBadgeProps) => (
  <Badge className={cn(variantStyles[variant], className)}>{label}</Badge>
);
