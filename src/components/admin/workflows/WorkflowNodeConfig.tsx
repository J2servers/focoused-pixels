import { memo } from 'react';
import { type Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Trash2, Eye, AlertTriangle, ShoppingCart, CreditCard, Zap, Package, Star, Truck } from 'lucide-react';
import { TRIGGER_EVENTS, type TemplateLite, type WorkflowMeta } from '@/hooks/useWorkflows';

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

interface Props {
  selectedNode: Node;
  currentWorkflow: WorkflowMeta;
  emailTemplates: TemplateLite[];
  whatsTemplates: TemplateLite[];
  onUpdate: (patch: Record<string, any>) => void;
  onUpdateWorkflow: (patch: Partial<WorkflowMeta>) => void;
  onDelete: () => void;
  onClose: () => void;
}

function WorkflowNodeConfig({ selectedNode, currentWorkflow, emailTemplates, whatsTemplates, onUpdate, onUpdateWorkflow, onDelete, onClose }: Props) {
  const { type, data } = selectedNode;

  return (
    <div className="w-80 shrink-0 border-l border-[hsl(var(--admin-card-border)/0.5)] flex flex-col bg-[hsl(var(--admin-bg)/0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--admin-card-border)/0.5)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--admin-accent-purple))]" />
          <h4 className="text-sm font-semibold text-white">Configurar Nó</h4>
        </div>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] capitalize">{type?.replace('send_', '').replace('_', ' ')}</Badge>
            <span className="text-[10px] text-[hsl(var(--admin-text-muted))] font-mono">{selectedNode.id.slice(0, 12)}</span>
          </div>

          {/* ─── Trigger ─── */}
          {type === 'trigger' && (
            <Section label="Evento gatilho">
              <Select
                value={(data.trigger_event as string) || 'abandoned_cart'}
                onValueChange={v => { onUpdate({ trigger_event: v }); onUpdateWorkflow({ trigger_event: v }); }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map(t => {
                    const Icon = TRIGGER_ICONS[t.value] || Zap;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{t.label}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Hint>{TRIGGER_EVENTS.find(t => t.value === (data.trigger_event as string))?.description}</Hint>
            </Section>
          )}

          {/* ─── Delay ─── */}
          {type === 'delay' && (
            <Section label="Tempo de espera">
              <div className="flex gap-2">
                <Input type="number" min={1} className="w-20" value={(data.delay_value as number) || 30}
                  onChange={e => onUpdate({ delay_value: parseInt(e.target.value) || 1 })} />
                <Select value={(data.delay_unit as string) || 'minutes'} onValueChange={v => onUpdate({ delay_unit: v })}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Hint>O workflow pausará por este período antes de continuar.</Hint>
            </Section>
          )}

          {/* ─── Email / WhatsApp ─── */}
          {(type === 'send_email' || type === 'send_whatsapp') && (
            <TemplateConfig
              type={type}
              data={data}
              templates={type === 'send_email' ? emailTemplates : whatsTemplates}
              onUpdate={onUpdate}
            />
          )}

          {/* ─── Condition ─── */}
          {type === 'condition' && (
            <Section label="Condição">
              <Input value={(data.condition_label as string) || ''} onChange={e => onUpdate({ condition_label: e.target.value })} placeholder="Ex: Pagamento confirmado?" />
              <Hint>Saída SIM (verde) e NÃO (vermelho) permitem ramificações condicionais.</Hint>
            </Section>
          )}

          {/* ─── Check Status ─── */}
          {type === 'check_status' && (
            <Section label="Verificação automática">
              <Select value={(data.check_type as string) || 'payment_confirmed'} onValueChange={v => onUpdate({ check_type: v, condition_label: { payment_confirmed: 'Pagamento confirmado?', boleto_expired: 'Boleto vencido?', order_shipped: 'Pedido enviado?', cart_recovered: 'Carrinho recuperado?' }[v] || v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_confirmed">Pagamento confirmado?</SelectItem>
                  <SelectItem value="boleto_expired">Boleto vencido?</SelectItem>
                  <SelectItem value="order_shipped">Pedido enviado?</SelectItem>
                  <SelectItem value="cart_recovered">Carrinho recuperado?</SelectItem>
                </SelectContent>
              </Select>
              <Hint>Verifica status real no banco de dados.</Hint>
            </Section>
          )}

          {/* ─── Schedule ─── */}
          {type === 'schedule' && (
            <Section label="Horário (BRT)">
              <div className="flex gap-2 items-center">
                <Input type="number" min={0} max={23} className="w-20" value={(data.schedule_hour as number) ?? 8}
                  onChange={e => onUpdate({ schedule_hour: parseInt(e.target.value) || 0 })} />
                <span className="text-lg text-[hsl(var(--admin-text-muted))]">:</span>
                <Input type="number" min={0} max={59} className="w-20" value={(data.schedule_minute as number) ?? 0}
                  onChange={e => onUpdate({ schedule_minute: parseInt(e.target.value) || 0 })} />
              </div>
              <Hint>Pausa e continua no próximo dia no horário definido.</Hint>
            </Section>
          )}

          {/* ─── Loop ─── */}
          {type === 'loop' && (
            <Section label="Configuração do loop">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Máx. repetições</label>
              <Input type="number" min={1} max={30} value={(data.max_loops as number) || 5}
                onChange={e => onUpdate({ max_loops: parseInt(e.target.value) || 1, loop_label: `Repetir até ${e.target.value}x` })} />
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Descrição</label>
              <Input value={(data.loop_label as string) || ''} onChange={e => onUpdate({ loop_label: e.target.value })} placeholder="Ex: Repetir cobrança 5x" />
            </Section>
          )}

          {/* ─── Update Order Status ─── */}
          {type === 'update_order_status' && (
            <Section label="Alterar status">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Status do pedido</label>
              <Select value={(data.new_order_status as string) || 'processing'} onValueChange={v => onUpdate({ new_order_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Em produção</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Status de pagamento</label>
              <Select value={(data.new_payment_status as string) || ''} onValueChange={v => onUpdate({ new_payment_status: v })}>
                <SelectTrigger><SelectValue placeholder="Não alterar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </Section>
          )}

          {/* ─── Create Coupon ─── */}
          {type === 'create_coupon' && (
            <Section label="Cupom automático">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Tipo</label>
              <Select value={(data.coupon_type as string) || 'percentage'} onValueChange={v => onUpdate({ coupon_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Valor</label>
              <Input type="number" min={1} value={(data.coupon_value as number) || 10} onChange={e => onUpdate({ coupon_value: parseInt(e.target.value) || 1 })} />
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Validade (dias)</label>
              <Input type="number" min={1} value={(data.coupon_duration_days as number) || 7} onChange={e => onUpdate({ coupon_duration_days: parseInt(e.target.value) || 1 })} />
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Prefixo</label>
              <Input value={(data.coupon_prefix as string) || 'AUTO'} onChange={e => onUpdate({ coupon_prefix: e.target.value.toUpperCase() })} />
              <Hint>O cupom gerado será injetado como {'{{coupon_code}}'} nos passos seguintes.</Hint>
            </Section>
          )}

          {/* ─── HTTP Webhook ─── */}
          {type === 'http_webhook' && (
            <Section label="Webhook HTTP">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">URL</label>
              <Input value={(data.webhook_url as string) || ''} onChange={e => onUpdate({ webhook_url: e.target.value })} placeholder="https://api.exemplo.com/hook" />
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Método</label>
              <Select value={(data.webhook_method as string) || 'POST'} onValueChange={v => onUpdate({ webhook_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
              <Hint>Os dados do trigger serão enviados como JSON.</Hint>
            </Section>
          )}

          {/* ─── Add Tag ─── */}
          {type === 'add_tag' && (
            <Section label="Tag do lead">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Nome da tag</label>
              <Input value={(data.tag_name as string) || ''} onChange={e => onUpdate({ tag_name: e.target.value })} placeholder="vip, comprador, inativo..." />
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Ação</label>
              <Select value={(data.tag_action as string) || 'add'} onValueChange={v => onUpdate({ tag_action: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Adicionar</SelectItem>
                  <SelectItem value="remove">Remover</SelectItem>
                </SelectContent>
              </Select>
            </Section>
          )}

          {/* ─── Wait For Event ─── */}
          {type === 'wait_for_event' && (
            <Section label="Aguardar evento">
              <Select value={(data.wait_event as string) || 'payment_confirmed'} onValueChange={v => onUpdate({ wait_event: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_confirmed">Pagamento confirmado</SelectItem>
                  <SelectItem value="order_shipped">Pedido enviado</SelectItem>
                  <SelectItem value="cart_recovered">Carrinho recuperado</SelectItem>
                  <SelectItem value="boleto_expired">Boleto vencido</SelectItem>
                </SelectContent>
              </Select>
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Timeout (minutos)</label>
              <Input type="number" min={5} value={(data.wait_timeout_minutes as number) || 1440} onChange={e => onUpdate({ wait_timeout_minutes: parseInt(e.target.value) || 60 })} />
              <Hint>Verifica a cada 5min se o evento ocorreu. Após timeout, avança.</Hint>
            </Section>
          )}

          {/* Delete */}
          {type !== 'trigger' && (
            <div className="pt-4 border-t border-[hsl(var(--admin-card-border)/0.3)]">
              <Button variant="destructive" size="sm" className="w-full gap-2" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />Remover nó
              </Button>
              <p className="text-[9px] text-[hsl(var(--admin-text-muted))] mt-1.5 text-center">Nós adjacentes serão reconectados automaticamente.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ─── Sub-components ─── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-semibold text-white">{label}</label>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-[hsl(var(--admin-text-muted))] leading-relaxed">{children}</p>;
}

function TemplateConfig({ type, data, templates, onUpdate }: { type: string; data: any; templates: TemplateLite[]; onUpdate: (p: any) => void }) {
  const tpl = templates.find(t => t.id === (data.template_id as string));
  const content = type === 'send_email'
    ? (tpl?.body || '').replace(/<[^>]*>/g, '').slice(0, 500)
    : (tpl?.message_text || '').slice(0, 500);
  const vars = (content.match(/\{\{[^}]+\}\}/g) || []).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  return (
    <div className="space-y-3">
      <Section label="Template">
        <Select value={(data.template_id as string) || ''} onValueChange={v => {
          const t = templates.find(t => t.id === v);
          onUpdate({ template_id: v, template_name: t?.name || '' });
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
          <SelectContent>
            {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {templates.length === 0 && (
          <p className="text-[10px] text-yellow-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Nenhum template encontrado. Crie na aba Templates.</p>
        )}

        {data.template_id && !tpl && (
          <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Template não encontrado ou desativado</p>
        )}

        {tpl && (
          <>
            {type === 'send_email' && tpl.subject && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Assunto</label>
                <p className="text-xs mt-0.5 text-white">{tpl.subject}</p>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] flex items-center gap-1"><Eye className="h-3 w-3" />Preview</label>
              <div className="mt-1 rounded-lg border border-dashed border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] p-3 max-h-36 overflow-y-auto">
                <p className="text-[11px] whitespace-pre-wrap leading-relaxed text-[hsl(var(--admin-text-muted))]">{content}</p>
              </div>
            </div>
            {vars.length > 0 && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Variáveis</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vars.map((v: string) => <Badge key={v} variant="secondary" className="text-[9px] font-mono">{v}</Badge>)}
                </div>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}

export default memo(WorkflowNodeConfig);
