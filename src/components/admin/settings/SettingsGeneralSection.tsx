import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { Store, ShoppingCart, Clock, Users, Phone, MessageSquare, Info } from 'lucide-react';
import {
  card, cardInner, sectionGap, gridGap, inputClass, textareaClass, selectClass,
  SectionHeader, MetricCard, ToggleBlock, FieldGroup, InfoBanner,
} from './SettingsShared';

interface Props {
  settings: Partial<CompanyInfo>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
}

export const SettingsGeneralSection = ({ settings, u }: Props) => (
  <div className={sectionGap}>
    {/* ── Status da Loja ── */}
    <div className={cn(card, cardInner, sectionGap)}>
      <SectionHeader icon={Store} title="Status da loja" description="Controle a disponibilidade e modo de manutenção." accentVar="--admin-accent-blue" />

      <div className={cn('grid md:grid-cols-2', gridGap)}>
        <FieldGroup label="Status atual">
          <Select value={settings.store_status || 'open'} onValueChange={v => u('store_status', v)}>
            <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text))]">
              <SelectItem value="open">🟢 Aberta</SelectItem>
              <SelectItem value="closed">🔴 Fechada</SelectItem>
              <SelectItem value="vacation">🏖️ Férias</SelectItem>
              <SelectItem value="coming_soon">🔜 Em breve</SelectItem>
            </SelectContent>
          </Select>
        </FieldGroup>
        <FieldGroup label="Mensagem de status">
          <Input className={inputClass} value={settings.store_closed_message || ''} onChange={e => u('store_closed_message', e.target.value)} placeholder="Voltamos em breve..." />
        </FieldGroup>
      </div>

      <ToggleBlock icon={Clock} title="Modo manutenção" description="Bloqueia todo acesso à loja temporariamente." checked={settings.maintenance_mode ?? false} onChange={v => u('maintenance_mode', v)} />

      {settings.maintenance_mode && (
        <FieldGroup label="Mensagem de manutenção">
          <Textarea className={textareaClass} value={settings.maintenance_message || ''} onChange={e => u('maintenance_message', e.target.value)} placeholder="Estamos em manutenção. Voltaremos em breve!" />
        </FieldGroup>
      )}
    </div>

    {/* ── Checkout ── */}
    <div className={cn(card, cardInner, sectionGap)}>
      <SectionHeader icon={ShoppingCart} title="Checkout e conversão" description="Regras de pedido, carrinho abandonado e mensagens pós-venda." accentVar="--admin-accent-green" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Checkout" value={settings.enable_guest_checkout ? 'Convidado' : 'Login'} accentVar="--admin-accent-blue" />
        <MetricCard label="Pedido mín." value={`R$ ${Number(settings.min_order_value || 0).toFixed(0)}`} accentVar="--admin-accent-green" />
        <MetricCard label="Carrinho" value={`${settings.abandoned_cart_reminder_hours || 24}h`} accentVar="--admin-accent-orange" />
        <MetricCard label="Parcelas" value={`${settings.installments || 12}x`} accentVar="--admin-accent-purple" />
      </div>

      <div className={cn('grid md:grid-cols-2 xl:grid-cols-4', gridGap)}>
        <FieldGroup label="Pedido mínimo (R$)">
          <Input className={inputClass} type="number" value={settings.min_order_value || 0} onChange={e => u('min_order_value', Number(e.target.value))} />
        </FieldGroup>
        <FieldGroup label="Recuperação carrinho (h)">
          <Input className={inputClass} type="number" value={settings.abandoned_cart_reminder_hours || 24} onChange={e => u('abandoned_cart_reminder_hours', Number(e.target.value))} />
        </FieldGroup>
        <FieldGroup label="Mensagem de sucesso" className="xl:col-span-2">
          <Input className={inputClass} value={settings.checkout_success_message || ''} onChange={e => u('checkout_success_message', e.target.value)} placeholder="Obrigado por sua compra!" />
        </FieldGroup>
      </div>

      <div className={cn('grid md:grid-cols-2', gridGap)}>
        <ToggleBlock icon={Users} title="Checkout convidado" description="Permite comprar sem criar conta." checked={settings.enable_guest_checkout ?? true} onChange={v => u('enable_guest_checkout', v)} />
        <ToggleBlock icon={Phone} title="Telefone obrigatório" description="Garante WhatsApp no pós-venda." checked={settings.require_phone_on_checkout ?? true} onChange={v => u('require_phone_on_checkout', v)} />
      </div>
    </div>

    {/* ── WhatsApp Template ── */}
    <div className={cn(card, cardInner, sectionGap)}>
      <SectionHeader icon={MessageSquare} title="Template WhatsApp" description="Mensagem padrão usada nas automações de pós-venda." accentVar="--admin-accent-green" />

      <FieldGroup label="Mensagem template">
        <Textarea className={textareaClass} rows={3} value={settings.whatsapp_message_template || ''} onChange={e => u('whatsapp_message_template', e.target.value)} placeholder="Olá! Gostaria de saber mais sobre os produtos..." />
      </FieldGroup>

      <InfoBanner accentVar="--admin-accent-blue" icon={Info}>
        Receita e gráficos do dashboard só consideram pedidos com pagamento confirmado.
      </InfoBanner>
    </div>
  </div>
);
