import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { Loader2, CheckCircle2, XCircle, CreditCard, Wallet, Settings, Info } from 'lucide-react';
import {
  card, cardInner, sectionGap, gridGap, inputClass, selectClass,
  SectionHeader, MetricCard, ToggleBlock, FieldGroup, InfoBanner,
} from './SettingsShared';

interface Props {
  payment: Partial<PaymentCredentials>;
  up: <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => void;
  canMutate: boolean;
  testMP: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  testEFI: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  testStripe: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  runTest: (name: string, fn: () => Promise<any>) => void;
}

const METHOD_LABELS: Record<string, string> = { pix: 'PIX', credit_card: 'Cartão de Crédito', boleto: 'Boleto Bancário' };

interface GatewayConfig {
  id: string;
  label: string;
  description: string;
  enabledKey: keyof PaymentCredentials;
  sandboxKey?: keyof PaymentCredentials;
  fields: { key: keyof PaymentCredentials; label: string; type?: string; placeholder?: string; span2?: boolean }[];
  accentVar: string;
}

const GATEWAYS: GatewayConfig[] = [
  { id: 'mercadopago', label: 'Mercado Pago', description: 'PIX, boleto e cartão de crédito', enabledKey: 'mercadopago_enabled', sandboxKey: 'mercadopago_sandbox', accentVar: '--admin-accent-blue',
    fields: [{ key: 'mercadopago_public_key', label: 'Public Key', placeholder: 'APP_USR-...' }, { key: 'mercadopago_access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }] },
  { id: 'efi', label: 'EFI Bank', description: 'PIX direto via EFI/Gerencianet', enabledKey: 'efi_enabled', sandboxKey: 'efi_sandbox', accentVar: '--admin-accent-green',
    fields: [{ key: 'efi_client_id', label: 'Client ID' }, { key: 'efi_client_secret', label: 'Client Secret', type: 'password' }, { key: 'efi_pix_key', label: 'Chave PIX', placeholder: 'email, telefone ou chave aleatória', span2: true }] },
  { id: 'stripe', label: 'Stripe', description: 'Cartão de crédito internacional', enabledKey: 'stripe_enabled', sandboxKey: 'stripe_sandbox', accentVar: '--admin-accent-purple',
    fields: [{ key: 'stripe_public_key', label: 'Publishable Key' }, { key: 'stripe_secret_key', label: 'Secret Key', type: 'password' }] },
  { id: 'pagseguro', label: 'PagSeguro', description: 'Gateway reserva PagSeguro', enabledKey: 'pagseguro_enabled', sandboxKey: 'pagseguro_sandbox', accentVar: '--admin-accent-orange',
    fields: [{ key: 'pagseguro_email', label: 'Email', type: 'email' }, { key: 'pagseguro_token', label: 'Token', type: 'password' }] },
  { id: 'asaas', label: 'Asaas', description: 'Cobranças e recorrência', enabledKey: 'asaas_enabled', sandboxKey: 'asaas_sandbox', accentVar: '--admin-accent-pink',
    fields: [{ key: 'asaas_api_key', label: 'API Key', type: 'password' }] },
];

export const SettingsPaymentsSection = ({ payment, up, canMutate, testMP, testEFI, testStripe, runTest }: Props) => {
  const methods = payment.payment_methods_enabled || [];

  const toggleMethod = (m: string) => {
    const current = payment.payment_methods_enabled || ['pix', 'credit_card', 'boleto'];
    up('payment_methods_enabled', current.includes(m) ? current.filter(i => i !== m) : [...current, m]);
  };

  const testMap: Record<string, typeof testMP> = { mercadopago: testMP, efi: testEFI, stripe: testStripe };

  return (
    <div className={sectionGap}>
      {/* ── Config Global ── */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={Wallet} title="Configuração global" description="Gateway primário, métodos aceitos e regras de parcelamento." accentVar="--admin-accent-green" />

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          <FieldGroup label="Gateway principal">
            <Select value={payment.payment_gateway_primary || 'mercadopago'} onValueChange={v => up('payment_gateway_primary', v)}>
              <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white/[0.04] border-white/[0.08] text-white">
                {GATEWAYS.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldGroup>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Métodos aceitos</p>
            <div className="flex gap-2">
              {['pix', 'credit_card', 'boleto'].map(m => (
                <label key={m} className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                  methods.includes(m)
                    ? 'border-purple-500/[0.3] bg-purple-500/[0.08] text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/50'
                )}>
                  <Checkbox checked={methods.includes(m)} onCheckedChange={() => toggleMethod(m)} />
                  <span className="font-medium">{METHOD_LABELS[m]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FieldGroup label="Desconto PIX (%)">
            <Input className={inputClass} type="number" value={payment.pix_discount_percent ?? 5} onChange={e => up('pix_discount_percent', Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup label="Dias boleto">
            <Input className={inputClass} type="number" value={payment.boleto_extra_days ?? 3} onChange={e => up('boleto_extra_days', Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup label="Parcelas máx.">
            <Input className={inputClass} type="number" value={payment.max_installments ?? 12} onChange={e => up('max_installments', Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup label="Parcela mín. (R$)">
            <Input className={inputClass} type="number" value={payment.min_installment_value ?? 50} onChange={e => up('min_installment_value', Number(e.target.value))} />
          </FieldGroup>
        </div>

        <InfoBanner accentVar="--admin-accent-orange" icon={Info}>
          Boleto só libera o pedido após compensação bancária confirmada.
        </InfoBanner>
      </div>

      {/* ── Status dos Gateways ── */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={CreditCard} title="Status dos gateways" description="Teste a conexão com cada provedor de pagamento." accentVar="--admin-accent-blue" />

        <div className="grid md:grid-cols-3 gap-3">
          {[
            { id: 'mercadopago', label: 'Mercado Pago', test: testMP },
            { id: 'efi', label: 'EFI Bank', test: testEFI },
            { id: 'stripe', label: 'Stripe', test: testStripe },
          ].map(gw => (
            <div key={gw.id} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                {gw.test.isSuccess
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  : <XCircle className="h-5 w-5 text-white/30" />}
                <div>
                  <p className="text-sm font-semibold text-white">{gw.label}</p>
                  <p className="text-xs text-white/50">{gw.test.isSuccess ? 'Conectado' : 'Não testado'}</p>
                </div>
              </div>
              <Button className="admin-btn admin-btn-edit !min-h-0 !py-1.5 !px-3 h-8 text-xs" onClick={() => runTest(gw.label, gw.test.mutateAsync)} disabled={!canMutate || gw.test.isPending}>
                {gw.test.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Testar'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gateway Cards ── */}
      <div className="grid xl:grid-cols-2 gap-5">
        {GATEWAYS.map(gw => {
          const test = testMap[gw.id];
          const enabled = Boolean(payment[gw.enabledKey]);
          const sandbox = gw.sandboxKey ? Boolean(payment[gw.sandboxKey]) : false;
          return (
            <div key={gw.id} className={cn(card, cardInner, 'space-y-5')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn('inline-flex h-8 items-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider', `bg-[hsl(var(${gw.accentVar})/0.12)] text-[hsl(var(${gw.accentVar}))]`)}>{gw.label}</span>
                  {test && (
                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium',
                      test.isSuccess ? 'bg-emerald-500/[0.1] text-emerald-400' : 'bg-[rgb(255 255 255 / 0.2)] text-white/30'
                    )}>
                      {test.isSuccess ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {test.isSuccess ? 'OK' : 'pendente'}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-white/50">{gw.description}</p>

              <ToggleBlock title={`Ativar ${gw.label}`} description="Disponibiliza no checkout." checked={enabled} onChange={v => up(gw.enabledKey, v as any)} />

              <div className={cn('grid md:grid-cols-2', gridGap)}>
                {gw.fields.map(f => (
                  <FieldGroup key={String(f.key)} label={f.label} className={f.span2 ? 'md:col-span-2' : ''}>
                    <Input className={inputClass} type={f.type || 'text'} value={String(payment[f.key] || '')} onChange={e => up(f.key, e.target.value as any)} placeholder={f.placeholder} />
                  </FieldGroup>
                ))}
              </div>

              {gw.sandboxKey && (
                <ToggleBlock title="Modo sandbox" description="Ambiente de homologação e testes." checked={sandbox} onChange={v => up(gw.sandboxKey!, v as any)} />
              )}

              {test && (
                <Button className="admin-btn admin-btn-edit !min-h-0 !py-1.5 !px-3 h-9" onClick={() => runTest(gw.label, test.mutateAsync)} disabled={!canMutate || test.isPending}>
                  {test.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Testar conexão
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
