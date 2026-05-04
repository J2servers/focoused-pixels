import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Radio, Upload } from 'lucide-react';

const btnOutline = 'border-white/10 bg-transparent text-white hover:bg-white/[0.06] transition-colors';
const mutedText = 'text-white/50';

interface Props {
  onExport: () => void;
  onImport: () => void;
}

export function TemplatesHeader({ onExport, onImport }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Radio className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Comunicação & Automação</h1>
          <p className={`text-sm ${mutedText}`}>Central de templates, notificações e workflows</p>
        </div>
      </div>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className={btnOutline} onClick={onExport}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar templates</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className={btnOutline} onClick={onImport}>
                <Upload className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Importar templates</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
