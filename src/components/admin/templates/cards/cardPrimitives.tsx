import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap } from 'lucide-react';
import { SYSTEM_EVENTS } from './TemplateConstants';

export const nodeBase = "group relative rounded-2xl border-2 transition-all duration-200 overflow-hidden";
export const actionBtn = "h-8 w-8 rounded-lg bg-transparent text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-white/10 transition-colors";
export const actionBtnDanger = "h-8 w-8 rounded-lg bg-transparent text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors";
export const varBadge = "bg-white/5 text-[hsl(var(--admin-text-muted))] border border-white/10 text-[10px] font-mono";
export const statBadge = "border-0 text-[10px] font-medium";

export function EventLabel({ name }: { name: string }) {
  const ev = SYSTEM_EVENTS.find(e => e.value === name);
  if (!ev) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--admin-accent-purple)/0.12)] text-[hsl(var(--admin-accent-purple))] text-[10px] font-semibold">
      <Zap className="h-2.5 w-2.5" />{ev.label}
    </span>
  );
}

export interface CardAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function ActionBar({ actions }: { actions: CardAction[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0.5">
        {actions.map((a, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className={a.danger ? actionBtnDanger : actionBtn} onClick={a.onClick}>
                <a.icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{a.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
