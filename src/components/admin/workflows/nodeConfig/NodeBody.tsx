import { Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRIGGER_EVENTS, type TemplateLite, type WorkflowMeta } from '@/hooks/useWorkflows';
import { Section, FieldLabel, TRIGGER_ICONS } from './primitives';
import { TemplateConfig } from './TemplateConfig';

type NodeData = Record<string, unknown>;

interface Props {
  type: string;
  data: NodeData;
  emailTemplates: TemplateLite[];
  whatsTemplates: TemplateLite[];
  onUpdate: (p: NodeData) => void;
  onUpdateWorkflow: (p: Partial<WorkflowMeta>) => void;
}

export function NodeBody({ type, data, emailTemplates, whatsTemplates, onUpdate, onUpdateWorkflow }: Props) {
  if (type === 'trigger') {
    return (
      <Section label="Evento gatilho" hint="Selecione o evento que inicia este workflow.">
        <Select
          value={(data.trigger_event as string) || 'abandoned_cart'}
          onValueChange={v => { onUpdate({ trigger_event: v }); onUpdateWorkflow({ trigger_event: v }); }}
        >
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TRIGGER_EVENTS.map(t => {
              const TIcon = TRIGGER_ICONS[t.value] || Zap;
              return (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2"><TIcon className="h-3.5 w-3.5" />{t.label}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </Section>
    );
  }

  if (type === 'delay') {
    return (
      <Section label="Tempo de espera" hint="O workflow pausará por este período antes de continuar para o próximo passo.">
        <div className="flex gap-2">
          <Input type="number" min={1} className="w-24 h-10" value={(data.delay_value as number) || 30}
            onChange={e => onUpdate({ delay_value: parseInt(e.target.value) || 1 })} />
          <Select value={(data.delay_unit as string) || 'minutes'} onValueChange={v => onUpdate({ delay_unit: v })}>
            <SelectTrigger className="flex-1 h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutos</SelectItem>
              <SelectItem value="hours">Horas</SelectItem>
              <SelectItem value="days">Dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>
    );
  }

  if (type === 'send_email' || type === 'send_whatsapp') {
    return (
      <TemplateConfig
        type={type}
        data={data}
        templates={type === 'send_email' ? emailTemplates : whatsTemplates}
        onUpdate={onUpdate}
      />
    );
  }

  if (type === 'condition') {
    return (
      <Section label="Condição" hint="Saída SIM (verde) e NÃO (vermelho) permitem ramificações condicionais.">
        <Input className="h-10" value={(data.condition_label as string) || ''} onChange={e => onUpdate({ condition_label: e.target.value })} placeholder="Ex: Pagamento confirmado?" />
      </Section>
    );
  }

  if (type === 'check_status') {
    const labelMap: Record<string, string> = { payment_confirmed: 'Pagamento confirmado?', boleto_expired: 'Boleto vencido?', order_shipped: 'Pedido enviado?', cart_recovered: 'Carrinho recuperado?' };
    return (
      <Section label="Verificação automática" hint="Verifica status real no banco de dados antes de prosseguir.">
        <Select value={(data.check_type as string) || 'payment_confirmed'} onValueChange={v => onUpdate({ check_type: v, condition_label: labelMap[v] || v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_confirmed">Pagamento confirmado?</SelectItem>
            <SelectItem value="boleto_expired">Boleto vencido?</SelectItem>
            <SelectItem value="order_shipped">Pedido enviado?</SelectItem>
            <SelectItem value="cart_recovered">Carrinho recuperado?</SelectItem>
          </SelectContent>
        </Select>
      </Section>
    );
  }

  if (type === 'schedule') {
    return (
      <Section label="Horário (BRT)" hint="Pausa e continua no próximo dia no horário definido.">
        <div className="flex gap-2 items-center">
          <Input type="number" min={0} max={23} className="w-20 h-10 text-center font-mono text-lg" value={(data.schedule_hour as number) ?? 8}
            onChange={e => onUpdate({ schedule_hour: parseInt(e.target.value) || 0 })} />
          <span className="text-xl font-bold text-white/20">:</span>
          <Input type="number" min={0} max={59} className="w-20 h-10 text-center font-mono text-lg" value={(data.schedule_minute as number) ?? 0}
            onChange={e => onUpdate({ schedule_minute: parseInt(e.target.value) || 0 })} />
        </div>
      </Section>
    );
  }

  if (type === 'loop') {
    return (
      <Section label="Configuração do loop" hint="Repete os passos seguintes o número definido de vezes.">
        <FieldLabel>Máx. repetições</FieldLabel>
        <Input type="number" min={1} max={30} className="h-10" value={(data.max_loops as number) || 5}
          onChange={e => onUpdate({ max_loops: parseInt(e.target.value) || 1, loop_label: `Repetir até ${e.target.value}x` })} />
        <FieldLabel>Descrição</FieldLabel>
        <Input className="h-10" value={(data.loop_label as string) || ''} onChange={e => onUpdate({ loop_label: e.target.value })} placeholder="Ex: Repetir cobrança 5x" />
      </Section>
    );
  }

  if (type === 'update_order_status') {
    return (
      <Section label="Alterar status" hint="Atualiza o status do pedido ou pagamento automaticamente.">
        <FieldLabel>Status do pedido</FieldLabel>
        <Select value={(data.new_order_status as string) || 'processing'} onValueChange={v => onUpdate({ new_order_status: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="processing">Em produção</SelectItem>
            <SelectItem value="shipped">Enviado</SelectItem>
            <SelectItem value="delivered">Entregue</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <FieldLabel>Status de pagamento</FieldLabel>
        <Select value={(data.new_payment_status as string) || ''} onValueChange={v => onUpdate({ new_payment_status: v })}>
          <SelectTrigger className="h-10"><SelectValue placeholder="Não alterar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="refunded">Reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </Section>
    );
  }

  if (type === 'create_coupon') {
    return (
      <Section label="Cupom automático" hint="O cupom gerado será injetado como {{coupon_code}} nos passos seguintes.">
        <FieldLabel>Tipo</FieldLabel>
        <Select value={(data.coupon_type as string) || 'percentage'} onValueChange={v => onUpdate({ coupon_type: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentual (%)</SelectItem>
            <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Valor</FieldLabel>
            <Input type="number" min={1} className="h-10" value={(data.coupon_value as number) || 10} onChange={e => onUpdate({ coupon_value: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <FieldLabel>Validade (dias)</FieldLabel>
            <Input type="number" min={1} className="h-10" value={(data.coupon_duration_days as number) || 7} onChange={e => onUpdate({ coupon_duration_days: parseInt(e.target.value) || 1 })} />
          </div>
        </div>
        <FieldLabel>Prefixo</FieldLabel>
        <Input className="h-10 font-mono uppercase" value={(data.coupon_prefix as string) || 'AUTO'} onChange={e => onUpdate({ coupon_prefix: e.target.value.toUpperCase() })} />
      </Section>
    );
  }

  if (type === 'http_webhook') {
    return (
      <Section label="Webhook HTTP" hint="Os dados do trigger serão enviados como JSON no body da requisição.">
        <FieldLabel>URL</FieldLabel>
        <Input className="h-10 font-mono text-xs" value={(data.webhook_url as string) || ''} onChange={e => onUpdate({ webhook_url: e.target.value })} placeholder="https://api.exemplo.com/hook" />
        <FieldLabel>Método</FieldLabel>
        <Select value={(data.webhook_method as string) || 'POST'} onValueChange={v => onUpdate({ webhook_method: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
      </Section>
    );
  }

  if (type === 'add_tag') {
    return (
      <Section label="Tag do lead" hint="Adiciona ou remove uma tag para segmentação do lead.">
        <FieldLabel>Nome da tag</FieldLabel>
        <Input className="h-10" value={(data.tag_name as string) || ''} onChange={e => onUpdate({ tag_name: e.target.value })} placeholder="vip, comprador, inativo..." />
        <FieldLabel>Ação</FieldLabel>
        <Select value={(data.tag_action as string) || 'add'} onValueChange={v => onUpdate({ tag_action: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Adicionar</SelectItem>
            <SelectItem value="remove">Remover</SelectItem>
          </SelectContent>
        </Select>
      </Section>
    );
  }

  if (type === 'wait_for_event') {
    return (
      <Section label="Aguardar evento" hint="Verifica a cada 5min se o evento ocorreu. Após timeout, avança automaticamente.">
        <Select value={(data.wait_event as string) || 'payment_confirmed'} onValueChange={v => onUpdate({ wait_event: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="payment_confirmed">Pagamento confirmado</SelectItem>
            <SelectItem value="order_shipped">Pedido enviado</SelectItem>
            <SelectItem value="cart_recovered">Carrinho recuperado</SelectItem>
            <SelectItem value="boleto_expired">Boleto vencido</SelectItem>
          </SelectContent>
        </Select>
        <FieldLabel>Timeout (minutos)</FieldLabel>
        <Input type="number" min={5} className="h-10" value={(data.wait_timeout_minutes as number) || 1440} onChange={e => onUpdate({ wait_timeout_minutes: parseInt(e.target.value) || 60 })} />
      </Section>
    );
  }

  return null;
}
