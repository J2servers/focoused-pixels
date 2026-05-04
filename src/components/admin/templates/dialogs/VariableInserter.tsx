import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TEMPLATE_VARIABLES } from '../TemplateConstants';
import { labelCls, varBtn } from './styles';

export function VariableInserter({ onInsert }: { onInsert: (key: string) => void }) {
  return (
    <div>
      <span className={labelCls}>Variáveis disponíveis</span>
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-wrap gap-1">
          {TEMPLATE_VARIABLES.map(v => (
            <Tooltip key={v.key}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className={varBtn} onClick={() => onInsert(v.key)}>
                  {v.key}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{v.desc}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
