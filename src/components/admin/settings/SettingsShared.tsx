import { ReactNode, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { EmailCredentials } from '@/hooks/useEmailCredentials';

/* ─── Shared Styles ─── */
export const glassCard = 'rounded-2xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] backdrop-blur-xl';
export const inputClass = 'h-11 rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)] focus-visible:border-[hsl(var(--admin-accent-purple)/0.5)]';
export const textareaClass = 'min-h-[112px] rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)]';
export const selectClass = 'h-11 rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]';
export const labelClass = 'text-sm font-medium text-[hsl(var(--admin-text-muted))]';

/* ─── Reusable Blocks ─── */
export const StatPill = ({ label, value, accentVar }: { label: string; value: string | number; accentVar: string }) => (
  <div className={cn('rounded-xl px-4 py-3 border', `border-[hsl(var(${accentVar})/0.2)] bg-[hsl(var(${accentVar})/0.08)]`)}>
    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(${accentVar}))]`}>{label}</p>
    <p className="mt-1 text-lg font-bold text-[hsl(var(--admin-text))]">{value}</p>
  </div>
);

export const ToggleBlock = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.6)] p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-[hsl(var(--admin-text))]">{title}</p>
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  </div>
);

export const InfoBanner = ({ children, accentVar = '--admin-accent-orange' }: { children: ReactNode; accentVar?: string }) => (
  <div className={cn('rounded-xl border p-4 text-sm', `border-[hsl(var(${accentVar})/0.25)] bg-[hsl(var(${accentVar})/0.06)] text-[hsl(var(${accentVar}))]`)}>
    {children}
  </div>
);

/* ─── Helper types ─── */
export type SettingsTab = 'geral' | 'pagamentos' | 'email' | 'seguranca' | 'operacoes';

export interface SettingsContext {
  settings: Partial<CompanyInfo>;
  payment: Partial<PaymentCredentials>;
  emailSettings: Partial<EmailCredentials>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
  up: <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => void;
  ue: <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => void;
  canMutate: boolean;
}
