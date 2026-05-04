import { Input } from '@/components/ui/input';

export type Accent = 'cyan' | 'purple' | 'pink' | 'green' | 'amber';

const SECTION_STYLES: Record<Accent, { bg: string; border: string; text: string }> = {
  cyan:   { bg: 'hsl(185 100% 50% / 0.06)', border: 'hsl(185 100% 50% / 0.15)', text: 'text-cyan-400' },
  purple: { bg: 'hsl(280 90% 60% / 0.06)',  border: 'hsl(280 90% 60% / 0.15)',  text: 'text-violet-400' },
  pink:   { bg: 'hsl(340 100% 65% / 0.06)', border: 'hsl(340 100% 65% / 0.15)', text: 'text-pink-400' },
  green:  { bg: 'hsl(160 100% 45% / 0.06)', border: 'hsl(160 100% 45% / 0.15)', text: 'text-emerald-400' },
  amber:  { bg: 'hsl(45 100% 50% / 0.06)',  border: 'hsl(45 100% 50% / 0.15)',  text: 'text-amber-400' },
};

export function LiquidSection({ icon: Icon, title, children, color = 'cyan' }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  color?: Accent;
}) {
  const s = SECTION_STYLES[color];
  return (
    <div className="rounded-xl overflow-hidden backdrop-blur-sm" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${s.border}` }}>
        <Icon className={`h-3.5 w-3.5 ${s.text}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${s.text}`}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

export function Field({ label, value, onChange, type = 'text', prefix, suffix, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/30">{prefix}</span>}
        <Input
          type={type} step={type === 'number' ? '0.01' : undefined}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`h-8 text-xs liquid-input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30">{suffix}</span>}
      </div>
    </div>
  );
}

export function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] text-white/35">{label}</span>
      <span className="text-xs text-white/85 font-medium text-right tabular-nums">{value}</span>
    </div>
  );
}

export type KpiAccent = 'green' | 'amber' | 'red' | 'cyan';

const KPI_STYLES: Record<KpiAccent, { bg: string; border: string; text: string }> = {
  green: { bg: 'hsl(160 100% 45% / 0.08)', border: 'hsl(160 100% 45% / 0.2)', text: 'text-emerald-400' },
  amber: { bg: 'hsl(45 100% 50% / 0.08)',  border: 'hsl(45 100% 50% / 0.2)',  text: 'text-amber-400' },
  red:   { bg: 'hsl(0 80% 50% / 0.08)',    border: 'hsl(0 80% 50% / 0.2)',    text: 'text-red-400' },
  cyan:  { bg: 'hsl(185 100% 50% / 0.08)', border: 'hsl(185 100% 50% / 0.2)', text: 'text-cyan-400' },
};

export function KPI({ label, value, sub, accent = 'cyan' }: {
  label: string; value: string; sub?: string; accent?: KpiAccent;
}) {
  const c = KPI_STYLES[accent];
  return (
    <div className="rounded-xl p-2.5 flex flex-col items-center text-center min-h-[56px] backdrop-blur-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span className={`text-base font-bold ${c.text} leading-none`}>{value}</span>
      {sub && <span className="text-[9px] text-white/25 mt-0.5">{sub}</span>}
      <span className="text-[9px] text-white/40 mt-1 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

export const fmtBRL = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
export const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
