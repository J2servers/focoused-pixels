import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import {
  glassCard,
  inputClass,
  selectClass,
  labelClass,
  StatPill,
  ToggleBlock,
  InfoBanner,
} from './SettingsShared';

interface GatewayField {
  key: keyof PaymentCredentials;
  label: string;
  type?: string;
  placeholder?: string;
}

interface GatewayCardConfig {
  id: string;
  label: string;
  description: string;
  enabledKey: keyof PaymentCredentials;
  sandboxKey?: keyof PaymentCredentials;
  fields: GatewayField[];
  accentVar: string;
}

interface Props {
  payment: Partial<PaymentCredentials>;
  up: <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => void;
  canMutate: boolean;
  testMP: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  testEFI: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  testStripe: { isPending: boolean; isSuccess: boolean; mutateAsync: () => Promise<any> };
  runTest: (name: string, fn: () => Promise<any>) => void;
}

const paymentMethodLabel = (m: string) => {
  switch (m) { case 'pix': return 'PIX'; case 'credit_card': return 'Cartão'; case 'boleto': return 'Boleto'; default: return m; }
};

export const SettingsPaymentsSection = ({ payment, up, canMutate, testMP, testEFI, testStripe, runTest }: Props) => {
  const methodsEnabled = payment.payment_methods_enabled || [];
  
  const toggleMethod = (method: string) => {
    const current = payment.payment_methods_enabled || ['pix', 'credit_card', 'boleto'];
    up('payment_methods_enabled', current.includes(method) ? current.filter(i => i !== method) : [...current, method]);
  };

  const gatewayCards: GatewayCardConfig[] = [
    { id: 'mercadopago', label: 'Mercado Pago', description: 'PIX, boleto e cartão.', enabledKey: 'mercadopago_enabled', sandboxKey: 'mercadopago_sandbox', accentVar: '--admin-accent-blue',
      fields: [{ key: 'mercadopago_public_key', label: 'Public Key', placeholder: 'APP_USR-...' }, { key: 'mercadopago_access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }] },
    { id: 'efi', label: 'EFI Bank', description: 'PIX direto via EFI.', enabledKey: 'efi_enabled', sandboxKey: 'efi_sandbox', accentVar: '--admin-accent-green',
      fields: [{ key: 'efi_client_id', label: 'Client ID' }, { key: 'efi_client_secret', label: 'Client Secret', type: 'password' }, { key: 'efi_pix_key', label: 'Chave PIX', placeholder: 'email, telefone ou chave' }] },
    { id: 'pagseguro', label: 'PagSeguro', description: 'Conta e token de reserva.', enabledKey: 'pagseguro_enabled', sandboxKey: 'pagseguro_sandbox', accentVar: '--admin-accent-orange',
      fields: [{ key: 'pagseguro_email', label: 'Email', type: 'email' }, { key: 'pagseguro_token', label: 'Token', type: 'password' }] },
    { id: 'stripe', label: 'Stripe', description: 'Cartão internacional.', enabledKey: 'stripe_enabled', sandboxKey: 'stripe_sandbox', accentVar: '--admin-accent-purple',
      fields: [{ key: 'stripe_public_key', label: 'Public Key' }, { key: 'stripe_secret_key', label: 'Secret Key', type: 'password' }] },
    { id: 'asaas', label: 'Asaas', description: 'Cobranças recorrentes.', enabledKey: 'asaas_enabled', sandboxKey: 'asaas_sandbox', accentVar: '--admin-accent-pink',
      fields: [{ key: 'asaas_api_key', label: 'API Key', type: 'password' }] },
  ];

  const paymentTestMap: Record<string, { pending: boolean; success: boolean; action: () => void }> = {
    mercadopago: { pending: testMP.isPending, success: testMP.isSuccess, action: () => runTest('Mercado Pago', testMP.mutateAsync) },
    efi: { pending: testEFI.isPending, success: testEFI.isSuccess, action: () => runTest('EFI', testEFI.mutateAsync) },
    stripe: { pending: testStripe.isPending, success: testStripe.isSuccess, action: () => runTest('Stripe', testStripe.mutateAsync) },
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Matriz de pagamentos</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Gateway principal e meios habilitados.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelClass}>Gateway principal</Label>
              <Select value={payment.payment_gateway_primary || 'mercadopago'} onValueChange={v => up('payment_gateway_primary', v)}>
                <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text))]">
                  {['mercadopago', 'efi', 'stripe', 'pagseguro', 'asaas'].map(g => <SelectItem key={g} value={g}>{g === 'mercadopago' ? 'Mercado Pago' : g === 'efi' ? 'EFI' : g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <StatPill label="Credenciais" value={`${[payment.mercadopago_public_key, payment.mercadopago_access_token, payment.efi_client_id, payment.efi_client_secret, payment.efi_pix_key, payment.pagseguro_email, payment.pagseguro_token, payment.stripe_public_key, payment.stripe_secret_key, payment.asaas_api_key].filter(Boolean).length} preenchidas`} accentVar="--admin-accent-green" />
          </div>

          <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[hsl(var(--admin-text))]">Formas de pagamento</p>
              <span className="rounded-full bg-[hsl(var(--admin-accent-blue)/0.15)] px-3 py-1 text-xs font-bold text-[hsl(var(--admin-accent-blue))]">{methodsEnabled.length} ativas</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['pix', 'credit_card', 'boleto'].map(m => (
                <label key={m} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.4)] px-4 py-3 text-sm font-medium text-[hsl(var(--admin-text-muted))] transition hover:border-[hsl(var(--admin-accent-purple)/0.4)]">
                  <Checkbox checked={methodsEnabled.includes(m)} onCheckedChange={() => toggleMethod(m)} />
                  <span>{paymentMethodLabel(m)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2"><Label className={labelClass}>Desconto PIX (%)</Label><Input className={inputClass} type="number" value={payment.pix_discount_percent ?? 5} onChange={e => up('pix_discount_percent', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Dias boleto</Label><Input className={inputClass} type="number" value={payment.boleto_extra_days ?? 3} onChange={e => up('boleto_extra_days', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Parcelas máx</Label><Input className={inputClass} type="number" value={payment.max_installments ?? 12} onChange={e => up('max_installments', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Parcela mín (R$)</Label><Input className={inputClass} type="number" value={payment.min_installment_value ?? 50} onChange={e => up('min_installment_value', Number(e.target.value))} /></div>
          </div>
        </div>

        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Status dos gateways</h3>
          <div className="grid gap-3">
            {[
              { label: 'Mercado Pago', success: testMP.isSuccess, pending: testMP.isPending, action: () => runTest('Mercado Pago', testMP.mutateAsync) },
              { label: 'EFI Bank', success: testEFI.isSuccess, pending: testEFI.isPending, action: () => runTest('EFI', testEFI.mutateAsync) },
              { label: 'Stripe', success: testStripe.isSuccess, pending: testStripe.isPending, action: () => runTest('Stripe', testStripe.mutateAsync) },
            ].map(gw => (
              <div key={gw.label} className="flex items-center justify-between rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4">
                <div className="flex items-center gap-3">
                  {gw.success ? <CheckCircle2 className="h-5 w-5 text-[hsl(var(--admin-accent-green))]" /> : <XCircle className="h-5 w-5 text-[hsl(var(--admin-text-muted))]" />}
                  <div>
                    <p className="font-medium text-[hsl(var(--admin-text))]">{gw.label}</p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{gw.success ? 'Conectado' : 'Pendente'}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={gw.action} disabled={!canMutate || gw.pending}>
                  {gw.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
              </div>
            ))}
          </div>
          <InfoBanner>Boleto só libera pedido após compensação confirmada.</InfoBanner>
        </div>
      </div>

      {/* Gateway credential cards */}
      <div className="grid gap-5 xl:grid-cols-2">
        {gatewayCards.map(gw => {
          const testStatus = paymentTestMap[gw.id];
          const enabled = Boolean(payment[gw.enabledKey]);
          const sandbox = gw.sandboxKey ? Boolean(payment[gw.sandboxKey]) : false;
          return (
            <div key={gw.id} className={cn(glassCard, 'p-6 space-y-4')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={cn('inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider', `bg-[hsl(var(${gw.accentVar})/0.12)] text-[hsl(var(${gw.accentVar}))]`)}>{gw.label}</span>
                  <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">{gw.description}</p>
                </div>
                {testStatus && (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium', testStatus.success ? 'bg-[hsl(var(--admin-accent-green)/0.12)] text-[hsl(var(--admin-accent-green))]' : 'bg-[hsl(var(--admin-card-border)/0.3)] text-[hsl(var(--admin-text-muted))]')}>
                    {testStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {testStatus.success ? 'OK' : 'pendente'}
                  </span>
                )}
              </div>
              <ToggleBlock title={`Ativar ${gw.label}`} description="Libera gateway no checkout." checked={enabled} onChange={v => up(gw.enabledKey, v as any)} />
              <div className="grid gap-4 md:grid-cols-2">
                {gw.fields.map(f => (
                  <div key={String(f.key)} className={f.key === 'efi_pix_key' ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                    <Label className={labelClass}>{f.label}</Label>
                    <Input className={inputClass} type={f.type || 'text'} value={String(payment[f.key] || '')} onChange={e => up(f.key, e.target.value as any)} placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
              {gw.sandboxKey && <ToggleBlock title="Modo sandbox" description="Homologação e testes." checked={sandbox} onChange={v => up(gw.sandboxKey!, v as any)} />}
              {testStatus && (
                <Button size="sm" variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={testStatus.action} disabled={!canMutate || testStatus.pending}>
                  {testStatus.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Testar agora
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
