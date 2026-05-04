import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, LayoutGrid, List, Plus, ChevronRight } from 'lucide-react';
import { DRAGGABLE_NODES, TRIGGER_EVENTS } from '@/hooks/useWorkflows';
import { NODE_ICONS, NODE_COLORS, TRIGGER_ICONS } from './constants';

interface Props {
  onAddNode: (type: string) => void;
  onNewWorkflow: (triggerEvent: string) => void;
}

export function NodesTab({ onAddNode, onNewWorkflow }: Props) {
  const [nodeView, setNodeView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Adicionar ao fluxo</h4>
          <div className="flex gap-0.5 bg-white/[0.04] rounded-lg p-0.5">
            <button onClick={() => setNodeView('grid')} className={`p-1 rounded-md transition-all ${nodeView === 'grid' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
              <LayoutGrid className="h-3 w-3" />
            </button>
            <button onClick={() => setNodeView('list')} className={`p-1 rounded-md transition-all ${nodeView === 'list' ? 'bg-white/10 text-white' : 'text-white/30'}`}>
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>

        {nodeView === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {DRAGGABLE_NODES.map(dn => {
              const Icon = NODE_ICONS[dn.type] || Zap;
              const colors = NODE_COLORS[dn.colorKey] || NODE_COLORS.blue;
              return (
                <Tooltip key={dn.type}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onAddNode(dn.type)}
                      className={`group flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-[1.04] active:scale-95 cursor-pointer hover:shadow-lg ${colors.bg} ${colors.glow}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      <span className="text-[9px] font-semibold text-white/70 group-hover:text-white transition-colors">{dn.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs max-w-[200px]">{dn.description}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {DRAGGABLE_NODES.map(dn => {
              const Icon = NODE_ICONS[dn.type] || Zap;
              const colors = NODE_COLORS[dn.colorKey] || NODE_COLORS.blue;
              return (
                <button
                  key={dn.type}
                  onClick={() => onAddNode(dn.type)}
                  className="w-full flex items-center gap-3 rounded-lg border border-transparent hover:border-white/[0.06] px-3 py-2 transition-all hover:bg-white/[0.03] group"
                >
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${colors.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${colors.text}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-medium text-white/80 group-hover:text-white truncate">{dn.label}</p>
                    <p className="text-[10px] text-white/30 truncate">{dn.description}</p>
                  </div>
                  <Plus className="h-3 w-3 text-white/20 group-hover:text-white/50 ml-auto shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-1">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Criar por gatilho</h4>
        <div className="space-y-0.5">
          {TRIGGER_EVENTS.map(te => {
            const Icon = TRIGGER_ICONS[te.value] || Zap;
            return (
              <button
                key={te.value}
                onClick={() => onNewWorkflow(te.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-white/[0.04] transition-all text-white/50 hover:text-white group"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{te.label}</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
