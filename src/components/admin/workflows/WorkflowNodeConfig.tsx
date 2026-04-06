import { memo, forwardRef } from 'react';
import { type Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Trash2, Eye, AlertTriangle, ShoppingCart, CreditCard, Zap,
  Package, Star, Truck, Mail, MessageSquare, Clock, GitBranch,
  SearchCheck, CalendarClock, Repeat, Settings2, Gift, Globe, UserPlus, Timer,
} from 'lucide-react';
import { TRIGGER_EVENTS, type TemplateLite, type WorkflowMeta } from '@/hooks/useWorkflows';

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  abandoned_cart: ShoppingCart, order_created: Package, payment_confirmed: CreditCard,
  boleto_generated: CreditCard, pix_generated: Zap, post_delivery: Star, shipping_sent: Truck,
};

const NODE_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  trigger: { label: 'Gatilho', icon: Zap, color: 'text-violet-400' },
  send_email: { label: 'E-mail', icon: Mail, color: 'text-blue-400' },
  send_whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-green-400' },
  delay: { label: 'Aguardar', icon: Clock, color: 'text-orange-400' },
  condition: { label: 'Condição', icon: GitBranch, color: 'text-violet-400' },
  check_status: { label: 'Verificar', icon: SearchCheck, color: 'text-emerald-400' },
  schedule: { label: 'Agendar', icon: CalendarClock, color: 'text-cyan-400' },
  loop: { label: 'Loop', icon: Repeat, color: 'text-amber-400' },
  update_order_status: { label: 'Atualizar Pedido', icon: Settings2, color: 'text-indigo-400' },
  create_coupon: { label: 'Criar Cupom', icon: Gift, color: 'text-amber-400' },
  http_webhook: { label: 'Webhook', icon: Globe, color: 'text-rose-400' },
  add_tag: { label: 'Tag Lead', icon: UserPlus, color: 'text-teal-400' },
  wait_for_event: { label: 'Aguardar Evento', icon: Timer, color: 'text-sky-400' },
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
  const meta = NODE_TYPE_META[type || ''] || NODE_TYPE_META.trigger;
  const Icon = meta.icon;

  return (
    <div className="w-[340px] shrink-0 border-l border-white/[0.06] flex flex-col bg-gradient-to-b from-[rgb(255 255 255 / 0.03)] to-[rgb(255 255 255 / 0.95)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{meta.label}</h4>
          <p className="text-[10px] text-white/30 font-mono">{selectedNode.id.slice(0, 16)}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-white/30 hover:text-white shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">

          {/* ─── Trigger ─── */}
          {type === 'trigger' && (
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
          )}

          {/* ─── Delay ─── */}
          {type === 'delay' && (
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
            <Section label="Condição" hint="Saída SIM (verde) e NÃO (vermelho) permitem ramificações condicionais.">
              <Input className="h-10" value={(data.condition_label as string) || ''} onChange={e => onUpdate({ condition_label: e.target.value })} placeholder="Ex: Pagamento confirmado?" />
            </Section>
          )}

          {/* ─── Check Status ─── */}
          {type === 'check_status' && (
            <Section label="Verificação automática" hint="Verifica status real no banco de dados antes de prosseguir.">
              <Select value={(data.check_type as string) || 'payment_confirmed'} onValueChange={v => onUpdate({ check_type: v, condition_label: { payment_confirmed: 'Pagamento confirmado?', boleto_expired: 'Boleto vencido?', order_shipped: 'Pedido enviado?', cart_recovered: 'Carrinho recuperado?' }[v] || v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_confirmed">Pagamento confirmado?</SelectItem>
                  <SelectItem value="boleto_expired">Boleto vencido?</SelectItem>
                  <SelectItem value="order_shipped">Pedido enviado?</SelectItem>
                  <SelectItem value="cart_recovered">Carrinho recuperado?</SelectItem>
                </SelectContent>
              </Select>
            </Section>
          )}

          {/* ─── Schedule ─── */}
          {type === 'schedule' && (
            <Section label="Horário (BRT)" hint="Pausa e continua no próximo dia no horário definido.">
              <div className="flex gap-2 items-center">
                <Input type="number" min={0} max={23} className="w-20 h-10 text-center font-mono text-lg" value={(data.schedule_hour as number) ?? 8}
                  onChange={e => onUpdate({ schedule_hour: parseInt(e.target.value) || 0 })} />
                <span className="text-xl font-bold text-white/20">:</span>
                <Input type="number" min={0} max={59} className="w-20 h-10 text-center font-mono text-lg" value={(data.schedule_minute as number) ?? 0}
                  onChange={e => onUpdate({ schedule_minute: parseInt(e.target.value) || 0 })} />
              </div>
            </Section>
          )}

          {/* ─── Loop ─── */}
          {type === 'loop' && (
            <Section label="Configuração do loop" hint="Repete os passos seguintes o número definido de vezes.">
              <FieldLabel>Máx. repetições</FieldLabel>
              <Input type="number" min={1} max={30} className="h-10" value={(data.max_loops as number) || 5}
                onChange={e => onUpdate({ max_loops: parseInt(e.target.value) || 1, loop_label: `Repetir até ${e.target.value}x` })} />
              <FieldLabel>Descrição</FieldLabel>
              <Input className="h-10" value={(data.loop_label as string) || ''} onChange={e => onUpdate({ loop_label: e.target.value })} placeholder="Ex: Repetir cobrança 5x" />
            </Section>
          )}

          {/* ─── Update Order Status ─── */}
          {type === 'update_order_status' && (
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
          )}

          {/* ─── Create Coupon ─── */}
          {type === 'create_coupon' && (
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
          )}

          {/* ─── HTTP Webhook ─── */}
          {type === 'http_webhook' && (
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
          )}

          {/* ─── Add Tag ─── */}
          {type === 'add_tag' && (
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
          )}

          {/* ─── Wait For Event ─── */}
          {type === 'wait_for_event' && (
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
          )}

          {/* Delete */}
          {type !== 'trigger' && (
            <div className="pt-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
              <Button className="admin-btn admin-btn-delete w-full !min-h-0 h-9 gap-2 text-xs" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />Deletar
              </Button>
              <p className="text-[10px] text-white/25 mt-2 text-center">Nós adjacentes serão reconectados automaticamente.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ─── Sub-components ─── */
function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-white">{label}</label>
        {hint && <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-medium text-white/40 block mt-2 mb-1">{children}</label>;
}

function TemplateConfig({ type, data, templates, onUpdate }: { type: string; data: any; templates: TemplateLite[]; onUpdate: (p: any) => void }) {
  const tpl = templates.find(t => t.id === (data.template_id as string));
  const content = type === 'send_email'
    ? (tpl?.body || '').replace(/<[^>]*>/g, '').slice(0, 500)
    : (tpl?.message_text || '').slice(0, 500);
  const vars = (content.match(/\{\{[^}]+\}\}/g) || []).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  return (
    <Section label="Template" hint={type === 'send_email' ? 'Selecione o template de e-mail a ser enviado.' : 'Selecione o template de WhatsApp a ser enviado.'}>
      <Select value={(data.template_id as string) || ''} onValueChange={v => {
        const t = templates.find(t => t.id === v);
        onUpdate({ template_id: v, template_name: t?.name || '' });
      }}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Selecione um template" /></SelectTrigger>
        <SelectContent>
          {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {templates.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <p className="text-[10px] text-yellow-400">Nenhum template encontrado. Crie na aba Templates.</p>
        </div>
      )}

      {data.template_id && !tpl && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <p className="text-[10px] text-red-400">Template não encontrado ou desativado</p>
        </div>
      )}

      {tpl && (
        <div className="space-y-3 mt-2">
          {type === 'send_email' && tpl.subject && (
            <div>
              <FieldLabel>Assunto</FieldLabel>
              <p className="text-xs text-white/80 font-medium">{tpl.subject}</p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Preview</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 max-h-40 overflow-y-auto">
              <p className="text-[11px] whitespace-pre-wrap leading-relaxed text-white/40">{content}</p>
            </div>
          </div>
          {vars.length > 0 && (
            <div>
              <FieldLabel>Variáveis detectadas</FieldLabel>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {vars.map((v: string) => <Badge key={v} variant="secondary" className="text-[9px] font-mono bg-violet-500/10 text-violet-300 border-violet-500/20">{v}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export default memo(WorkflowNodeConfig);
