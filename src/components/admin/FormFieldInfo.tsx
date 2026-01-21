import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FormFieldInfoProps {
  label: string;
  description: string;
  showsIn?: string;
  required?: boolean;
  className?: string;
}

/**
 * Component that displays a label with an info tooltip explaining
 * where the field appears for customers.
 */
export const FormFieldInfo = ({ 
  label, 
  description, 
  showsIn, 
  required,
  className 
}: FormFieldInfoProps) => {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Info className="h-3.5 w-3.5" />
              <span className="sr-only">Informação do campo</span>
            </button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="max-w-xs text-xs bg-popover border shadow-lg"
          >
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">{description}</p>
              {showsIn && (
                <p className="text-muted-foreground">
                  <span className="font-medium">Aparece:</span> {showsIn}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FormFieldInfo;
