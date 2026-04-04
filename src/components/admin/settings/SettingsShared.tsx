import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { EmailCredentials } from '@/hooks/useEmailCredentials';
import { type LucideIcon } from 'lucide-react';

/* ─── Design Tokens ─── */
export const card = 'rounded-2xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))]';
export const cardInner = 'p-5 md:p-6';
export const sectionGap = 'space-y-6';
export const gridGap = 'gap-5';

export const inputClass = cn(
  'h-10 rounded-lg border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))]',
  'text-sm text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted)/0.5)]',
  'focus-visible:ring-1 focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)] focus-visible:border-[hsl(var(--admin-accent-purple)/0.5)]',
  'transition-colors'
);

export const textareaClass = cn(
  'min-h-[100px] rounded-lg border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))]',
  'text-sm text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted)/0.5)]',
  'focus-visible:ring-1 focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)]',
  'transition-colors'
);

export const selectClass = cn(
  'h-10 rounded-lg border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))]',
  'text-sm text-[hsl(var(--admin-text))]'
);

export const labelClass = 'text-xs font-semibold uppercase tracking-wide text-[hsl(var(--admin-text-muted))]';

/* ─── Section Header ─── */
export const SectionHeader = ({ title, description, icon: Icon, accentVar = '--admin-accent-purple' }: {
  title: string; description: string; icon?: LucideIcon; accentVar?: string;
}) => (
  <div className="flex items-start gap-3 pb-1">
    {Icon && (
      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', `bg-[hsl(var(${accentVar})/0.12)]`)}>
        <Icon className={`h-4.5 w-4.5 text-[hsl(var(${accentVar}))]`} />
      </div>
    )}
    <div>
      <h3 className="text-base font-bold text-[hsl(var(--admin-text))]">{title}</h3>
      <p className="mt-0.5 text-sm leading-relaxed text-[hsl(var(--admin-text-muted))]">{description}</p>
    </div>
  </div>
);

/* ─── Stat Metric ─── */
export const MetricCard = ({ label, value, accentVar = '--admin-accent-purple' }: {
  label: string; value: string | number; accentVar?: string;
}) => (
  <div className={cn(
    'rounded-xl border px-4 py-3 transition-colors',
    `border-[hsl(var(${accentVar})/0.15)] bg-[hsl(var(${accentVar})/0.06)]`,
    `hover:bg-[hsl(var(${accentVar})/0.1)]`
  )}>
    <p className={cn('text-[11px] font-semibold uppercase tracking-widest', `text-[hsl(var(${accentVar}))]`)}>{label}</p>
    <p className="mt-1 text-lg font-bold text-[hsl(var(--admin-text))]">{value}</p>
  </div>
);

// Legacy alias
export const StatPill = MetricCard;
export const glassCard = card;

/* ─── Toggle Row ─── */
export const ToggleBlock = ({ title, description, checked, onChange, icon: Icon }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void; icon?: LucideIcon;
}) => (
  <label className={cn(
    'flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors',
    'border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.4)]',
    'hover:bg-[hsl(var(--admin-bg)/0.7)]',
    checked && 'border-[hsl(var(--admin-accent-purple)/0.25)] bg-[hsl(var(--admin-accent-purple)/0.04)]'
  )}>
    <div className="flex items-center gap-3 min-w-0">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-[hsl(var(--admin-text-muted))]" />}
      <div className="min-w-0">
        <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{title}</p>
        <p className="text-xs text-[hsl(var(--admin-text-muted))] leading-relaxed">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} className="shrink-0" />
  </label>
);

/* ─── Field Group (label + input standardized) ─── */
export const FieldGroup = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => (
  <div className={cn('space-y-1.5', className)}>
    <Label className={labelClass}>{label}</Label>
    {children}
  </div>
);

/* ─── Info Banner ─── */
export const InfoBanner = ({ children, accentVar = '--admin-accent-orange', icon: Icon }: {
  children: ReactNode; accentVar?: string; icon?: LucideIcon;
}) => (
  <div className={cn(
    'flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed',
    `border-[hsl(var(${accentVar})/0.2)] bg-[hsl(var(${accentVar})/0.05)] text-[hsl(var(${accentVar})/0.85)]`
  )}>
    {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
    <div>{children}</div>
  </div>
);

/* ─── Helper types ─── */
export type SettingsTab = 'geral' | 'pagamentos' | 'email' | 'seguranca' | 'operacoes' | 'ia';

export interface SettingsContext {
  settings: Partial<CompanyInfo>;
  payment: Partial<PaymentCredentials>;
  emailSettings: Partial<EmailCredentials>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
  up: <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => void;
  ue: <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => void;
  canMutate: boolean;
}
