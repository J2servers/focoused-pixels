import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  avatarUrl?: string;
  name: string;
}

export function LunaAvatar({ size = 'md', avatarUrl, name }: Props) {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  return (
    <div className={cn(
      sizes[size],
      'rounded-full bg-gradient-to-br from-primary via-purple-500 to-cyan-400 p-[2px] flex-shrink-0 shadow-[0_0_15px_hsl(var(--primary)/0.5)]'
    )}>
      <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <Bot className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', 'text-primary')} />
        )}
      </div>
    </div>
  );
}
