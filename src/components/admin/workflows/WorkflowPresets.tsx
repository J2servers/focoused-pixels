import { 
  ShoppingCart, CreditCard, Package, Star, Zap, Mail, MessageSquare, 
  Clock, UserPlus, Gift, RefreshCw, Truck, AlertTriangle, Heart,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { WorkflowStep } from './WorkflowBuilder';

const uid = () => crypto.randomUUID().slice(0, 8);

export interface WorkflowPreset {
  name: string;
  description: string;
  trigger_event: string;
  icon: React.ElementType;
  color: string;
  category: string;
  steps: Omit<WorkflowStep, 'id'>[];
}

const PRESET_CATEGORIES = [
  { key: 'vendas', label: 'Vendas', icon: CreditCard },
  { key: 'recuperacao', label: 'Recuperação', icon: RefreshCw },
  { key: 'pos_venda', label: 'Pós-venda', icon: Heart },
  { key: 'leads', label: 'Leads', icon: UserPlus },
  { key: 'logistica', label: 'Logística', icon: Truck },
];

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  // VENDAS
  {
    name: 'Confirmação de pagamento PIX',
    description: 'Envia confirmação por WhatsApp e e-mail após pagamento PIX aprovado',
    trigger_event: 'pix_generated',
    icon: Zap,
    color: 'text-purple-500',
    category: 'vendas',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'PIX confirmado' },
      { type: 'delay', delay_value: 5, delay_unit: 'minutes', delay_minutes: 5 },
      { type: 'send_email', channel: 'email', template_name: 'PIX confirmado' },
    ],
  },
  {
    name: 'Cobrança de boleto completa',
    description: 'WhatsApp imediato + lembrete antes do vencimento + e-mail de confirmação',
    trigger_event: 'boleto_generated',
    icon: CreditCard,
    color: 'text-yellow-500',
    category: 'vendas',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Boleto gerado' },
      { type: 'send_email', channel: 'email', template_name: 'Boleto gerado' },
      { type: 'delay', delay_value: 2, delay_unit: 'days', delay_minutes: 2880 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Lembrete de boleto' },
    ],
  },
  {
    name: 'Pedido confirmado multicanal',
    description: 'Notifica cliente por WhatsApp e e-mail quando pedido é criado',
    trigger_event: 'order_created',
    icon: Package,
    color: 'text-blue-500',
    category: 'vendas',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Pedido criado' },
      { type: 'delay', delay_value: 2, delay_unit: 'minutes', delay_minutes: 2 },
      { type: 'send_email', channel: 'email', template_name: 'Pedido criado' },
    ],
  },
  {
    name: 'Pagamento aprovado + produção',
    description: 'Confirmação de pagamento e aviso de início de produção',
    trigger_event: 'payment_confirmed',
    icon: CreditCard,
    color: 'text-green-500',
    category: 'vendas',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Pagamento confirmado' },
      { type: 'send_email', channel: 'email', template_name: 'Pagamento confirmado' },
      { type: 'delay', delay_value: 1, delay_unit: 'hours', delay_minutes: 60 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Produção iniciada' },
    ],
  },
  // RECUPERAÇÃO
  {
    name: 'Recuperação de carrinho agressiva',
    description: '3 tentativas: WhatsApp imediato, e-mail em 2h, WhatsApp com cupom em 24h',
    trigger_event: 'abandoned_cart',
    icon: ShoppingCart,
    color: 'text-orange-500',
    category: 'recuperacao',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Carrinho abandonado' },
      { type: 'delay', delay_value: 2, delay_unit: 'hours', delay_minutes: 120 },
      { type: 'send_email', channel: 'email', template_name: 'Carrinho abandonado' },
      { type: 'delay', delay_value: 22, delay_unit: 'hours', delay_minutes: 1320 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Lembrete de carrinho com urgência' },
    ],
  },
  {
    name: 'Recuperação suave (só e-mail)',
    description: 'E-mail gentil em 1h + segundo em 24h',
    trigger_event: 'abandoned_cart',
    icon: ShoppingCart,
    color: 'text-orange-400',
    category: 'recuperacao',
    steps: [
      { type: 'delay', delay_value: 1, delay_unit: 'hours', delay_minutes: 60 },
      { type: 'send_email', channel: 'email', template_name: 'Carrinho abandonado' },
      { type: 'delay', delay_value: 23, delay_unit: 'hours', delay_minutes: 1380 },
      { type: 'send_email', channel: 'email', template_name: 'Lembrete de carrinho com urgência' },
    ],
  },
  // PÓS-VENDA
  {
    name: 'Pós-entrega com avaliação',
    description: 'Agradecimento + pedido de avaliação após entrega',
    trigger_event: 'post_delivery',
    icon: Star,
    color: 'text-pink-500',
    category: 'pos_venda',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Pós-venda com avaliação' },
      { type: 'delay', delay_value: 3, delay_unit: 'days', delay_minutes: 4320 },
      { type: 'send_email', channel: 'email', template_name: 'Solicitar avaliação' },
      { type: 'delay', delay_value: 7, delay_unit: 'days', delay_minutes: 10080 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Recompra VIP' },
    ],
  },
  {
    name: 'Recompra VIP 30 dias',
    description: 'Cupom exclusivo para recompra após 30 dias da entrega',
    trigger_event: 'post_delivery',
    icon: Gift,
    color: 'text-amber-500',
    category: 'pos_venda',
    steps: [
      { type: 'delay', delay_value: 30, delay_unit: 'days', delay_minutes: 43200 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Recompra VIP' },
      { type: 'delay', delay_value: 3, delay_unit: 'days', delay_minutes: 4320 },
      { type: 'send_email', channel: 'email', template_name: 'Recompra VIP' },
    ],
  },
  // LEADS
  {
    name: 'Boas-vindas para novo lead',
    description: 'Sequência de boas-vindas com cupom de primeira compra',
    trigger_event: 'order_created',
    icon: UserPlus,
    color: 'text-indigo-500',
    category: 'leads',
    steps: [
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Boas-vindas com cupom' },
      { type: 'delay', delay_value: 1, delay_unit: 'days', delay_minutes: 1440 },
      { type: 'send_email', channel: 'email', template_name: 'Boas-vindas' },
      { type: 'delay', delay_value: 3, delay_unit: 'days', delay_minutes: 4320 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Lembrete de cupom' },
    ],
  },
  // LOGÍSTICA
  {
    name: 'Atualização de envio',
    description: 'Notifica sobre envio do pedido com código de rastreio',
    trigger_event: 'payment_confirmed',
    icon: Truck,
    color: 'text-cyan-500',
    category: 'logistica',
    steps: [
      { type: 'delay', delay_value: 3, delay_unit: 'days', delay_minutes: 4320 },
      { type: 'send_whatsapp', channel: 'whatsapp', template_name: 'Pedido enviado com rastreio' },
      { type: 'send_email', channel: 'email', template_name: 'Pedido enviado' },
    ],
  },
];

interface WorkflowPresetsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onUsePreset: (preset: WorkflowPreset) => void;
}

export default function WorkflowPresets({ selectedCategory, onSelectCategory, onUsePreset }: WorkflowPresetsProps) {
  const filtered = selectedCategory === 'all'
    ? WORKFLOW_PRESETS
    : WORKFLOW_PRESETS.filter(p => p.category === selectedCategory);

  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <div className="w-48 shrink-0 border-r border-[hsl(var(--admin-card-border)/0.5)] bg-[hsl(var(--admin-bg)/0.5)]">
        <div className="p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--admin-text-muted))] mb-3">Categorias</p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white'
                  : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Todos</span>
              <Badge variant="secondary" className="ml-auto text-[10px] h-5">{WORKFLOW_PRESETS.length}</Badge>
            </button>
            {PRESET_CATEGORIES.map(cat => {
              const count = WORKFLOW_PRESETS.filter(p => p.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => onSelectCategory(cat.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.key
                      ? 'bg-[hsl(var(--admin-accent-purple)/0.2)] text-white'
                      : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5">{count}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Presets grid */}
      <ScrollArea className="flex-1">
        <div className="p-4 grid gap-3 md:grid-cols-2">
          {filtered.map((preset, i) => {
            const Icon = preset.icon;
            const emailCount = preset.steps.filter(s => s.type === 'send_email').length;
            const whatsCount = preset.steps.filter(s => s.type === 'send_whatsapp').length;
            const delayCount = preset.steps.filter(s => s.type === 'delay').length;

            return (
              <div
                key={i}
                className="group rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] p-4 hover:border-[hsl(var(--admin-accent-purple)/0.5)] transition-all cursor-pointer"
                onClick={() => onUsePreset(preset)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-[hsl(var(--admin-card-border)/0.3)]`}>
                      <Icon className={`h-4 w-4 ${preset.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{preset.name}</p>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{preset.category}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[hsl(var(--admin-text-muted))] group-hover:text-[hsl(var(--admin-accent-purple))] transition-colors" />
                </div>

                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-3">{preset.description}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  {whatsCount > 0 && (
                    <Badge className="text-[10px] gap-1 bg-green-500/10 text-green-400 border-green-700">
                      <MessageSquare className="h-2.5 w-2.5" />{whatsCount}x WhatsApp
                    </Badge>
                  )}
                  {emailCount > 0 && (
                    <Badge className="text-[10px] gap-1 bg-blue-500/10 text-blue-400 border-blue-700">
                      <Mail className="h-2.5 w-2.5" />{emailCount}x Email
                    </Badge>
                  )}
                  {delayCount > 0 && (
                    <Badge className="text-[10px] gap-1 bg-orange-500/10 text-orange-400 border-orange-700">
                      <Clock className="h-2.5 w-2.5" />{delayCount}x Delay
                    </Badge>
                  )}
                  <span className="text-[10px] text-[hsl(var(--admin-text-muted))] ml-auto">{preset.steps.length} passos</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
