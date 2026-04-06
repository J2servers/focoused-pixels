import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PIE_COLORS = [
  'hsl(170,70%,45%)', 'hsl(210,80%,55%)', 'hsl(220,15%,50%)',
  'hsl(45,93%,47%)', 'hsl(270,70%,55%)', 'hsl(145,63%,42%)', 'hsl(0,72%,51%)',
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

export function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-xs text-white/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : p.value}
        </p>
      ))}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  href?: string;
  format?: 'number' | 'currency' | 'percent' | 'text' | 'days';
  trend?: number | null;
}

export function MetricCard({ label, value, icon: Icon, color, href, format = 'number', trend }: MetricCardProps) {
  const fmt = typeof value === 'string' ? value :
    format === 'currency' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
    format === 'percent' ? `${value.toFixed(1)}%` :
    format === 'days' ? `${value.toFixed(1)}d` :
    value.toLocaleString('pt-BR');

  const inner = (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2.5 rounded-xl liquid-glass transition-all h-full",
      href && "hover:bg-white/[0.08] cursor-pointer"
    )}>
      <div className={cn("p-1.5 rounded-lg shrink-0", color)}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate leading-tight">{fmt}</p>
        <p className="text-[10px] text-white/50 truncate leading-tight">{label}</p>
      </div>
      {trend !== undefined && trend !== null && (
        <span className={cn("text-[10px] font-bold shrink-0", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(0)}%
        </span>
      )}
    </div>
  );
  if (href) return <Link to={href} className="h-full">{inner}</Link>;
  return inner;
}

interface HeroKPIProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  format?: 'currency' | 'number';
  subtitle?: string;
  trend?: number;
}

export function HeroKPI({ label, value, icon: Icon, color, format = 'currency', subtitle, trend }: HeroKPIProps) {
  const fmt = format === 'currency'
    ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : value.toLocaleString('pt-BR');
  return (
    <div className="liquid-glass rounded-2xl shadow-xl overflow-hidden h-full p-4">
      <div className="flex items-start justify-between mb-1">
        <div className={cn("p-2.5 rounded-xl shadow-lg", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
            trend >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          )}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white leading-tight mt-2">{fmt}</p>
      <p className="text-xs text-white/60">{label}</p>
      {subtitle && <p className="text-[10px] text-white/40">{subtitle}</p>}
    </div>
  );
}

export function SectionLabel({ children, icon: Icon, color }: { children: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-2 col-span-full py-1">
      <div className={cn("p-1.5 rounded-lg", color)}><Icon className="h-3.5 w-3.5 text-white" /></div>
      <h2 className="text-xs font-bold text-white tracking-wide">{children}</h2>
    </div>
  );
}

export function ChartCard({ title, children, className, height = 'h-40' }: {
  title: string;
  children: ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn("liquid-glass rounded-2xl shadow-lg", className)}>
      <div className="pb-0 pt-3 px-4">
        <p className="text-xs text-white/50 font-medium">{title}</p>
      </div>
      <div className={cn("p-2", height)}>
        {children}
      </div>
    </div>
  );
}

interface PieDataItem {
  name: string;
  value: number;
  fill?: string;
}

export function PieCard({ title, data }: { title: string; data: PieDataItem[] }) {
  return (
    <div className="liquid-glass rounded-2xl shadow-lg">
      <div className="p-3 flex items-center h-full min-h-[100px]">
        <div className="w-16 h-16 shrink-0">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%" paddingAngle={3} dataKey="value">
                  {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i] || data[i]?.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : null}
        </div>
        <div className="flex-1 min-w-0 pl-2">
          <p className="text-[10px] font-bold text-white/50 mb-1">{title}</p>
          {data.map((p, i) => (
            <div key={p.name} className="flex items-center gap-1 mb-0.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] || p.fill }} />
              <span className="text-[10px] text-white truncate">{p.name}: {p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
