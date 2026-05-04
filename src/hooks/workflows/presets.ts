import type { PresetDef, WorkflowStep } from './types';

export const TRIGGER_EVENTS = [
  { value: 'abandoned_cart', label: 'Carrinho abandonado', description: 'Quando um carrinho é abandonado' },
  { value: 'order_created', label: 'Pedido criado', description: 'Quando um novo pedido é criado' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Quando pagamento é confirmado' },
  { value: 'boleto_generated', label: 'Boleto gerado', description: 'Quando um boleto é gerado' },
  { value: 'pix_generated', label: 'PIX gerado', description: 'Quando um PIX é gerado' },
  { value: 'post_delivery', label: 'Pós-entrega', description: 'Após confirmação de entrega' },
  { value: 'shipping_sent', label: 'Envio despachado', description: 'Quando o pedido é enviado' },
] as const;

export const DRAGGABLE_NODES = [
  { type: 'send_email', label: 'E-mail', colorKey: 'blue', description: 'Enviar e-mail ao cliente' },
  { type: 'send_whatsapp', label: 'WhatsApp', colorKey: 'green', description: 'Enviar WhatsApp' },
  { type: 'delay', label: 'Aguardar', colorKey: 'orange', description: 'Esperar um tempo' },
  { type: 'condition', label: 'Condição', colorKey: 'violet', description: 'Ramificação condicional' },
  { type: 'check_status', label: 'Verificar', colorKey: 'emerald', description: 'Verificar status real no banco' },
  { type: 'schedule', label: 'Agendar', colorKey: 'cyan', description: 'Agendar para horário específico' },
  { type: 'loop', label: 'Loop', colorKey: 'amber', description: 'Repetir bloco N vezes' },
  { type: 'update_order_status', label: 'Atualizar Pedido', colorKey: 'indigo', description: 'Alterar status do pedido' },
  { type: 'create_coupon', label: 'Criar Cupom', colorKey: 'amber', description: 'Gerar cupom automático' },
  { type: 'http_webhook', label: 'Webhook', colorKey: 'rose', description: 'Chamar API externa via HTTP' },
  { type: 'add_tag', label: 'Tag Lead', colorKey: 'teal', description: 'Adicionar/remover tag do lead' },
  { type: 'wait_for_event', label: 'Aguardar Evento', colorKey: 'sky', description: 'Esperar evento acontecer' },
] as const;

export const PRESET_CATEGORIES = [
  { key: 'vendas', label: 'Vendas' },
  { key: 'recuperacao', label: 'Recuperação' },
  { key: 'pos_venda', label: 'Pós-venda' },
  { key: 'leads', label: 'Leads' },
  { key: 'logistica', label: 'Logística' },
] as const;

const s = (steps: WorkflowStep[]) => steps;

export const PRESETS: PresetDef[] = [
  { name: 'Cobrança boleto diária', description: 'Cobra 8h AM, verifica pagamento, repete até vencer', trigger_event: 'boleto_generated', category: 'vendas', difficulty: 'advanced', steps: s([
    { type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' },
    { type: 'schedule', schedule_hour: 8, schedule_minute: 0 }, { type: 'check_status', check_type: 'payment_confirmed', condition_label: 'Pagamento confirmado?' },
    { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }, { type: 'send_email', template_name: 'Lembrete de boleto' },
    { type: 'loop', max_loops: 5, loop_label: 'Repetir cobrança 5x' },
  ]) },
  { name: 'Boleto completo', description: 'WhatsApp + e-mail + lembrete', trigger_event: 'boleto_generated', category: 'vendas', difficulty: 'easy', steps: s([{ type: 'send_whatsapp', template_name: 'Boleto gerado' }, { type: 'send_email', template_name: 'Boleto gerado' }, { type: 'delay', delay_value: 2, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Lembrete de boleto' }]) },
  { name: 'Confirmação PIX', description: 'WhatsApp + e-mail após PIX', trigger_event: 'pix_generated', category: 'vendas', difficulty: 'easy', steps: s([{ type: 'send_whatsapp', template_name: 'PIX confirmado' }, { type: 'delay', delay_value: 5, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'PIX confirmado' }]) },
  { name: 'Pedido confirmado', description: 'Multicanal ao criar pedido', trigger_event: 'order_created', category: 'vendas', difficulty: 'easy', steps: s([{ type: 'send_whatsapp', template_name: 'Pedido criado' }, { type: 'delay', delay_value: 2, delay_unit: 'minutes' }, { type: 'send_email', template_name: 'Pedido criado' }]) },
  { name: 'Pagamento + produção', description: 'Confirmação e produção', trigger_event: 'payment_confirmed', category: 'vendas', difficulty: 'medium', steps: s([{ type: 'send_whatsapp', template_name: 'Pagamento confirmado' }, { type: 'send_email', template_name: 'Pagamento confirmado' }, { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Produção iniciada' }]) },
  { name: 'Recuperação agressiva', description: '3 tentativas em 24h', trigger_event: 'abandoned_cart', category: 'recuperacao', difficulty: 'medium', steps: s([{ type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 2, delay_unit: 'hours' }, { type: 'send_email', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 22, delay_unit: 'hours' }, { type: 'send_whatsapp', template_name: 'Lembrete de carrinho com urgência' }]) },
  { name: 'Recuperação com verificação', description: 'Verifica carrinho antes de cobrar', trigger_event: 'abandoned_cart', category: 'recuperacao', difficulty: 'advanced', steps: s([
    { type: 'delay', delay_value: 1, delay_unit: 'hours' }, { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' },
    { type: 'send_whatsapp', template_name: 'Carrinho abandonado' }, { type: 'delay', delay_value: 23, delay_unit: 'hours' },
    { type: 'check_status', check_type: 'cart_recovered', condition_label: 'Carrinho recuperado?' }, { type: 'send_email', template_name: 'Lembrete de carrinho com urgência' },
  ]) },
  { name: 'Pós-entrega + avaliação', description: 'Avaliação e cupom recompra', trigger_event: 'post_delivery', category: 'pos_venda', difficulty: 'medium', steps: s([{ type: 'send_whatsapp', template_name: 'Pós-venda com avaliação' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Solicitar avaliação' }, { type: 'delay', delay_value: 7, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }]) },
  { name: 'Recompra VIP 30d', description: 'Cupom 30 dias após entrega', trigger_event: 'post_delivery', category: 'pos_venda', difficulty: 'easy', steps: s([{ type: 'delay', delay_value: 30, delay_unit: 'days' }, { type: 'send_whatsapp', template_name: 'Recompra VIP' }, { type: 'delay', delay_value: 3, delay_unit: 'days' }, { type: 'send_email', template_name: 'Recompra VIP' }]) },
  { name: 'Boas-vindas lead', description: 'Cupom primeira compra', trigger_event: 'order_created', category: 'leads', difficulty: 'easy', steps: s([{ type: 'send_whatsapp', template_name: 'Boas-vindas com cupom' }, { type: 'delay', delay_value: 1, delay_unit: 'days' }, { type: 'send_email', template_name: 'Boas-vindas' }]) },
  { name: 'Notificação de envio', description: 'Aviso com rastreio', trigger_event: 'shipping_sent', category: 'logistica', difficulty: 'easy', steps: s([{ type: 'send_whatsapp', template_name: 'Pedido enviado com rastreio' }, { type: 'send_email', template_name: 'Pedido enviado' }]) },
];
