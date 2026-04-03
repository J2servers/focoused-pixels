import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import {
  glassCard,
  inputClass,
  textareaClass,
  selectClass,
  labelClass,
  StatPill,
  ToggleBlock,
  InfoBanner,
} from './SettingsShared';

interface Props {
  settings: Partial<CompanyInfo>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
}

export const SettingsGeneralSection = ({ settings, u }: Props) => (
  <div className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-2">
      <div className={cn(glassCard, 'p-6 space-y-5')}>
        <div>
          <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Workspace da operação</h3>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Disponibilidade da loja e modo manutenção.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClass}>Status da loja</Label>
            <Select value={settings.store_status || 'open'} onValueChange={v => u('store_status', v)}>
              <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text))]">
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="closed">Fechada</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="coming_soon">Em breve</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>Mensagem de status</Label>
            <Input className={inputClass} value={settings.store_closed_message || ''} onChange={e => u('store_closed_message', e.target.value)} placeholder="Voltamos em breve" />
          </div>
        </div>
        <ToggleBlock title="Modo manutenção" description="Bloqueia acesso à loja temporariamente." checked={settings.maintenance_mode ?? false} onChange={v => u('maintenance_mode', v)} />
        {settings.maintenance_mode && (
          <div className="space-y-2">
            <Label className={labelClass}>Mensagem de manutenção</Label>
            <Textarea className={textareaClass} value={settings.maintenance_message || ''} onChange={e => u('maintenance_message', e.target.value)} />
          </div>
        )}
      </div>

      <div className={cn(glassCard, 'p-6 space-y-5')}>
        <div>
          <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Jornada do cliente</h3>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Resumo vivo do checkout.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <StatPill label="Checkout" value={settings.enable_guest_checkout ? 'Convidado' : 'Login exigido'} accentVar="--admin-accent-blue" />
          <StatPill label="Pedido mínimo" value={`R$ ${Number(settings.min_order_value || 0).toFixed(2)}`} accentVar="--admin-accent-green" />
        </div>
        <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4">
          <p className="text-sm font-medium text-[hsl(var(--admin-text))]">Mensagem de sucesso</p>
          <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))] leading-6">{settings.checkout_success_message || 'Não configurada.'}</p>
        </div>
        <InfoBanner>Receita e gráficos só consideram pedidos com pagamento confirmado.</InfoBanner>
      </div>
    </div>

    <div className={cn(glassCard, 'p-6 space-y-5')}>
      <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Checkout e conversão</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2"><Label className={labelClass}>Pedido mínimo (R$)</Label><Input className={inputClass} type="number" value={settings.min_order_value || 0} onChange={e => u('min_order_value', Number(e.target.value))} /></div>
        <div className="space-y-2"><Label className={labelClass}>Recuperação carrinho (h)</Label><Input className={inputClass} type="number" value={settings.abandoned_cart_reminder_hours || 24} onChange={e => u('abandoned_cart_reminder_hours', Number(e.target.value))} /></div>
        <div className="space-y-2 xl:col-span-2"><Label className={labelClass}>Mensagem de sucesso</Label><Input className={inputClass} value={settings.checkout_success_message || ''} onChange={e => u('checkout_success_message', e.target.value)} /></div>
      </div>
      <div className="space-y-2">
        <Label className={labelClass}>Template WhatsApp</Label>
        <Textarea className={textareaClass} rows={3} value={settings.whatsapp_message_template || ''} onChange={e => u('whatsapp_message_template', e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ToggleBlock title="Checkout convidado" description="Compra sem criar conta." checked={settings.enable_guest_checkout ?? true} onChange={v => u('enable_guest_checkout', v)} />
        <ToggleBlock title="Telefone obrigatório" description="Mantém WhatsApp pronto no pós-venda." checked={settings.require_phone_on_checkout ?? true} onChange={v => u('require_phone_on_checkout', v)} />
      </div>
    </div>
  </div>
);
