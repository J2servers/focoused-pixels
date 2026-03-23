import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CalendarClock } from 'lucide-react';

function ScheduleNode({ data, selected }: NodeProps) {
  const hour = (data.schedule_hour as number) ?? 8;
  const minute = (data.schedule_minute as number) ?? 0;
  const label = `Próximo dia às ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <div className={`relative rounded-2xl border-2 border-cyan-500/30 bg-cyan-500/10 px-5 py-4 min-w-[210px] shadow-lg transition-all ${selected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-background' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background" />
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5 bg-cyan-500/20 shadow-sm">
          <CalendarClock className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Agendar</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-background" />
    </div>
  );
}

export default memo(ScheduleNode);
