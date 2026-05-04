import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ToolbarBtn({ icon: Icon, tooltip, onClick, disabled, active, spin }: {
  icon: React.ElementType; tooltip: string; onClick: () => void; disabled?: boolean; active?: boolean; spin?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon" variant="ghost"
          className={`h-8 w-8 rounded-lg ${active ? 'bg-violet-500/15 text-violet-400' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'} disabled:opacity-20`}
          onClick={onClick} disabled={disabled}
        >
          <Icon className={`h-3.5 w-3.5 ${spin ? 'animate-spin' : ''}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarDivider() {
  return <div className="w-px h-5 bg-white/[0.06] mx-0.5" />;
}
