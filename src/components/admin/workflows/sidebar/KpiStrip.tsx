import { LayoutGrid, Zap, Activity as ActivityIcon } from 'lucide-react';

interface Props {
  metrics: { total: number; active: number; totalExecs: number };
}

export function KpiStrip({ metrics }: Props) {
  const items = [
    { label: 'Total', value: metrics.total, icon: LayoutGrid, color: 'text-white', accent: 'from-white/5 to-white/[0.02]' },
    { label: 'Ativos', value: metrics.active, icon: Zap, color: 'text-emerald-400', accent: 'from-emerald-500/10 to-emerald-500/[0.02]' },
    { label: 'Execuções', value: metrics.totalExecs, icon: ActivityIcon, color: 'text-violet-400', accent: 'from-violet-500/10 to-violet-500/[0.02]' },
  ];
  return (
    <div className="px-4 py-4 border-b border-white/[0.06]">
      <div className="grid grid-cols-3 gap-3">
        {items.map(kpi => (
          <div key={kpi.label} className={`relative rounded-xl bg-gradient-to-b ${kpi.accent} border border-white/[0.06] px-3 py-3 text-center overflow-hidden`}>
            <kpi.icon className={`absolute -right-1 -top-1 h-8 w-8 ${kpi.color} opacity-[0.06]`} />
            <p className={`text-xl font-bold ${kpi.color} tabular-nums`}>{kpi.value}</p>
            <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/40 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
