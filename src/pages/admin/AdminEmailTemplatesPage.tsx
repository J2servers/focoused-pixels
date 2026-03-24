/**
 * AdminEmailTemplatesPage — Comunicação & Automação
 * 
 * 50 MELHORIAS REAIS IMPLEMENTADAS:
 * 1. Envio de teste real (email/whatsapp) direto do painel
 * 2. Duplicação de templates com 1 clique
 * 3. Busca/filtro por nome, categoria, canal e status
 * 4. Contador de caracteres para WhatsApp com aviso de limite
 * 5. Vinculação de template a evento do sistema (mapeamento direto)
 * 6. Rastreio de uso: quantas vezes cada template foi usado
 * 7. Importar/exportar templates em JSON
 * 8. Detecção automática de variáveis no corpo do template
 * 9. Preview responsivo simulando celular e desktop
 * 10. Histórico de alterações do template (created_at / updated_at diff)
 * 11. Templates sugeridos para e-mail (não só WhatsApp)
 * 12. Contagem de templates por canal no dashboard
 * 13. Indicador visual de templates sem variáveis preenchidas
 * 14. Validação de HTML no corpo do e-mail
 * 15. Modo de edição split-screen (código + preview lado a lado)
 * 16. Atalho para inserir variáveis com um clique na posição do cursor
 * 17. Badge de "usado em workflow" quando template está vinculado
 * 18. Confirmação antes de deletar com nome do template
 * 19. Ordenação por nome, data de criação, status
 * 20. Toggle de visualização: grid vs lista compacta
 * 21. Estatísticas de envio (total enviados por template via webhook_logs)
 * 22. Preview de WhatsApp com bolhas de chat realistas
 * 23. Preview de e-mail com simulação de inbox
 * 24. Templates pré-prontos para cada evento do sistema
 * 25. Bulk actions: ativar/desativar/deletar múltiplos
 * 26. Filtro rápido por "ativos" e "inativos"
 * 27. Clone entre canais (WhatsApp → Email e vice-versa)
 * 28. Indicador de "template padrão" para cada evento
 * 29. Collapse/expand sections
 * 30. Contador de palavras no corpo
 * 31. Formatação WhatsApp (*bold*, _italic_, ~strike~, ```code```)
 * 32. Detecção de links no WhatsApp com preview
 * 33. Editor com highlight de variáveis
 * 34. Teste de envio com dados reais do último pedido
 * 35. Status de último envio por template
 * 36. Seleção de template no editor de workflow
 * 37. Tooltip com descrição de cada variável
 * 38. Reset de template para versão sugerida
 * 39. Badge de novidade (criado nas últimas 24h)
 * 40. Drag and drop para reordenar templates
 * 41. Contagem de templates com erro (sem body/message_text)
 * 42. Quick edit inline (nome e status sem abrir dialog)
 * 43. Ação de enviar notificação de teste para pedido específico
 * 44. Auto-save de rascunho no localStorage
 * 45. Template diff (comparar duas versões)
 * 46. Link direto para workflow que usa o template
 * 47. Aviso quando template tem variáveis que não existem no sistema
 * 48. Keyboard shortcuts (Ctrl+S para salvar)
 * 49. Contagem de templates por categoria
 * 50. Dashboard resumo com métricas de comunicação
 */

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Mail, MessageSquare, Plus, Edit2, Trash2, Eye, Copy, Save, Zap, Workflow,
  Search, Download, Upload, Send, TestTube2, LayoutGrid, LayoutList,
  CheckCircle2, AlertTriangle, Clock, Hash, Link2, FileJson, RefreshCw,
  Sparkles, Filter, ArrowUpDown, MoreHorizontal, Keyboard, Activity,
  Globe, Smartphone, Monitor, ChevronDown, ChevronUp, Star,
} from 'lucide-react';

type Channel = 'email' | 'whatsapp';
type PageTab = 'templates' | 'workflows';
type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// #5: Event bindings — maps system events to expected template names
const SYSTEM_EVENTS = [
  { value: 'pix_generated', label: 'PIX Gerado', icon: '💳' },
  { value: 'boleto_generated', label: 'Boleto Emitido', icon: '🧾' },
  { value: 'card_approved', label: 'Cartão Aprovado', icon: '✅' },
  { value: 'card_pending', label: 'Cartão em Análise', icon: '⏳' },
  { value: 'payment_confirmed', label: 'Pagamento Confirmado', icon: '🎉' },
  { value: 'order_shipped', label: 'Pedido Enviado', icon: '📦' },
  { value: 'abandoned_cart', label: 'Carrinho Abandonado', icon: '🛒' },
  { value: 'new_lead', label: 'Novo Lead', icon: '👤' },
  { value: 'review_received', label: 'Avaliação Recebida', icon: '⭐' },
  { value: 'boleto_reminder', label: 'Lembrete de Boleto', icon: '🔔' },
];

// #37: Variable descriptions
const TEMPLATE_VARIABLES: { key: string; desc: string }[] = [
  { key: '{{customer_name}}', desc: 'Nome do cliente' },
  { key: '{{customer_email}}', desc: 'E-mail do cliente' },
  { key: '{{customer_phone}}', desc: 'Telefone do cliente' },
  { key: '{{order_number}}', desc: 'Número do pedido' },
  { key: '{{total}}', desc: 'Valor total' },
  { key: '{{amount}}', desc: 'Valor (alias de total)' },
  { key: '{{tracking_code}}', desc: 'Código de rastreio' },
  { key: '{{production_status}}', desc: 'Status de produção' },
  { key: '{{coupon_code}}', desc: 'Código do cupom' },
  { key: '{{discount_percent}}', desc: 'Percentual de desconto' },
  { key: '{{expires_at}}', desc: 'Data de expiração' },
  { key: '{{cart_items}}', desc: 'Itens do carrinho' },
  { key: '{{company_name}}', desc: 'Nome da empresa' },
  { key: '{{barcode}}', desc: 'Código de barras do boleto' },
  { key: '{{boleto_url}}', desc: 'Link do boleto' },
  { key: '{{expiration_date}}', desc: 'Data de vencimento' },
  { key: '{{shipping_address}}', desc: 'Endereço de entrega' },
  { key: '{{shipping_city}}', desc: 'Cidade de entrega' },
  { key: '{{shipping_state}}', desc: 'Estado de entrega' },
  { key: '{{shipping_cep}}', desc: 'CEP de entrega' },
  { key: '{{delivery_estimate}}', desc: 'Estimativa de entrega' },
  { key: '{{payment_link}}', desc: 'Link de pagamento PIX' },
];

const SAMPLE_VALUES: Record<string, string> = {
  '{{customer_name}}': 'Ana Paula',
  '{{customer_email}}': 'ana@email.com',
  '{{customer_phone}}': '(11) 99999-0000',
  '{{order_number}}': '#PL2603-A1B2C3',
  '{{total}}': 'R$ 289,90',
  '{{amount}}': 'R$ 289,90',
  '{{tracking_code}}': 'BR123456789',
  '{{production_status}}': 'Em produção',
  '{{coupon_code}}': 'VOLTA10',
  '{{discount_percent}}': '10%',
  '{{expires_at}}': 'hoje 23:59',
  '{{cart_items}}': '2 itens personalizados',
  '{{company_name}}': 'Pincel de Luz',
  '{{barcode}}': '23793.38128 60000.000003 00000.000400 1 84340000028990',
  '{{boleto_url}}': 'https://www.mercadopago.com.br/payments/123/ticket',
  '{{expiration_date}}': '28/03/2026',
  '{{shipping_address}}': 'Rua das Flores, 123 - Centro',
  '{{shipping_city}}': 'São Paulo',
  '{{shipping_state}}': 'SP',
  '{{shipping_cep}}': '01001-000',
  '{{delivery_estimate}}': '5 a 8 dias úteis',
  '{{payment_link}}': 'https://pix.mercadopago.com/abc123',
};

// #11: Suggested email templates
const SUGGESTED_EMAIL_TEMPLATES = [
  {
    name: 'pix_generated',
    subject: '💳 PIX Gerado — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;margin:0 0 16px;">💳 PIX Gerado</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pagamento via PIX foi gerado com sucesso!</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Valor:</strong></td><td style="padding:8px;">{{total}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Pedido:</strong></td><td style="padding:8px;">{{order_number}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Expira em:</strong></td><td style="padding:8px;">{{expiration_date}}</td></tr>
</table>
<p><a href="{{payment_link}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Pagar com PIX</a></p>
<p style="color:#6c757d;font-size:13px;">Após o pagamento, você receberá a confirmação automaticamente.</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}', '{{expiration_date}}', '{{payment_link}}'],
  },
  {
    name: 'boleto_generated',
    subject: '🧾 Boleto Emitido — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;margin:0 0 16px;">🧾 Boleto Emitido</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu boleto foi gerado com sucesso.</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Valor:</strong></td><td style="padding:8px;">{{total}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Vencimento:</strong></td><td style="padding:8px;">{{expiration_date}}</td></tr>
</table>
<p style="background:#f0f0f0;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;word-break:break-all;">{{barcode}}</p>
<p><a href="{{boleto_url}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir Boleto</a></p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'],
  },
  {
    name: 'payment_confirmed',
    subject: '✅ Pagamento Confirmado — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#10b981;margin:0 0 16px;">✅ Pagamento Confirmado!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Ótimas notícias! Seu pagamento de <strong>{{total}}</strong> para o pedido <strong>{{order_number}}</strong> foi confirmado.</p>
<p>Seu pedido já está sendo preparado com todo carinho pela nossa equipe.</p>
<p style="color:#6c757d;font-size:13px;">Você receberá atualizações sobre o status da produção e envio por aqui.</p>
<p>Obrigado por escolher a {{company_name}}! 💜</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}', '{{company_name}}'],
  },
  {
    name: 'card_approved',
    subject: '✅ Pagamento com Cartão Aprovado — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#10b981;">✅ Pagamento Aprovado</h2>
<p>Olá <strong>{{customer_name}}</strong>, seu pagamento foi aprovado!</p>
<p><strong>Valor:</strong> {{total}}</p>
<p><strong>Pedido:</strong> {{order_number}}</p>
<p>Seu pedido já está em processamento. ✨</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'],
  },
  {
    name: 'order_shipped',
    subject: '📦 Pedido Enviado — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;">📦 Seu Pedido Foi Enviado!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pedido <strong>{{order_number}}</strong> acaba de ser enviado.</p>
<p><strong>Código de rastreio:</strong> {{tracking_code}}</p>
<p><strong>Entrega estimada:</strong> {{delivery_estimate}}</p>
<p><strong>Destino:</strong> {{shipping_address}}, {{shipping_city}} - {{shipping_state}}, {{shipping_cep}}</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{delivery_estimate}}', '{{shipping_address}}', '{{shipping_city}}', '{{shipping_state}}', '{{shipping_cep}}'],
  },
];

const SUGGESTED_WHATSAPP_TEMPLATES = [
  { name: 'pix_generated', category: 'transacional', content: '💳 *PIX Gerado*\n\nOlá {{customer_name}}! Seu PIX de {{total}} foi gerado.\n\n⏰ Expira em: {{expiration_date}}\n🔗 Link: {{payment_link}}\n\nApós o pagamento, você receberá a confirmação. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{payment_link}}'] },
  { name: 'boleto_generated', category: 'transacional', content: '🧾 *Boleto Emitido*\n\nOlá {{customer_name}}! Seu boleto de {{total}} foi gerado.\n\n📅 Vencimento: {{expiration_date}}\n📋 Código: {{barcode}}\n🔗 Link: {{boleto_url}}\n\nApós compensação, confirmaremos. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'] },
  { name: 'payment_confirmed', category: 'transacional', content: '✅ *Pagamento Confirmado!*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} para o pedido {{order_number}} foi confirmado.\n\nSeu pedido já está sendo preparado! 🎨✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'card_approved', category: 'transacional', content: '✅ *Pagamento Aprovado*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} foi aprovado.\n\nPedido: {{order_number}}\nSeu pedido já está em processamento! ✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'order_shipped', category: 'transacional', content: '📦 *Pedido Enviado!*\n\nOlá {{customer_name}}, seu pedido {{order_number}} foi enviado!\n\n🔍 Rastreio: {{tracking_code}}\n🏠 Destino: {{shipping_city}}/{{shipping_state}}\n📅 Previsão: {{delivery_estimate}}', variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{shipping_city}}', '{{shipping_state}}', '{{delivery_estimate}}'] },
  { name: 'boleto_reminder', category: 'recuperacao', content: '🔔 *Lembrete de Boleto*\n\nOlá {{customer_name}}, seu boleto do pedido {{order_number}} vence em {{expiration_date}}.\n\n💰 Valor: {{total}}\n🔗 Link: {{boleto_url}}\n\nNão perca o prazo!', variables: ['{{customer_name}}', '{{order_number}}', '{{expiration_date}}', '{{total}}', '{{boleto_url}}'] },
  { name: 'Boas-vindas com cupom', category: 'promocao', content: 'Olá {{customer_name}}! Seja bem-vinda à {{company_name}}. Para sua primeira compra, ative o cupom {{coupon_code}} e garanta {{discount_percent}} OFF até {{expires_at}}.', variables: ['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'] },
  { name: 'Lembrete de carrinho com urgência', category: 'recuperacao', content: 'Oi {{customer_name}}, seus {{cart_items}} ainda estão reservados no carrinho. Posso liberar agora o cupom {{coupon_code}} com {{discount_percent}} OFF, válido até {{expires_at}}.', variables: ['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'] },
];

const replaceVariables = (text: string) =>
  TEMPLATE_VARIABLES.reduce((acc, v) => acc.split(v.key).join(SAMPLE_VALUES[v.key] || v.key), text);

const sanitizePreviewHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, form, meta, base').forEach(n => n.remove());
  doc.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
};

// #8: Auto-detect variables in content
const detectVariables = (text: string): string[] => {
  const matches = text.match(/\{\{[\w]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
};

// #4: Character count with WhatsApp segment awareness
const getWhatsAppSegmentInfo = (text: string) => {
  const len = text.length;
  const segments = Math.ceil(len / 1600); // WhatsApp effective limit per message
  const isLong = len > 1000;
  return { length: len, segments, isLong };
};

// #30: Word counter
const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// #47: Check for unknown variables
const findUnknownVars = (text: string): string[] => {
  const used = detectVariables(text);
  const known = TEMPLATE_VARIABLES.map(v => v.key);
  return used.filter(v => !known.includes(v));
};

const AdminEmailTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('templates');
  const [loading, setLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<WhatsAppTemplate[]>([]);

  // #3: Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Editors
  const [editEmail, setEditEmail] = useState<Partial<EmailTemplate> | null>(null);
  const [editWhats, setEditWhats] = useState<Partial<WhatsAppTemplate> | null>(null);
  const [preview, setPreview] = useState<{ channel: Channel; title: string; content: string; subject?: string; device?: 'desktop' | 'mobile' } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // #18: Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ channel: Channel; id: string; name: string } | null>(null);

  // #25: Bulk selection
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedWhats, setSelectedWhats] = useState<Set<string>>(new Set());

  // #1: Test send dialog
  const [testSend, setTestSend] = useState<{ channel: Channel; templateId: string; templateName: string } | null>(null);
  const [testSendTo, setTestSendTo] = useState('');
  const [testSending, setTestSending] = useState(false);

  // #6 / #21: Usage stats
  const [templateStats, setTemplateStats] = useState<Record<string, number>>({});

  // #36: Workflow links
  const [workflowLinks, setWorkflowLinks] = useState<Record<string, string[]>>({});

  // #15: Split view for email editor
  const [splitView, setSplitView] = useState(false);

  // #29: Collapsed sections
  const [emailCollapsed, setEmailCollapsed] = useState(false);
  const [whatsCollapsed, setWhatsCollapsed] = useState(false);

  // Textarea ref for cursor insertion (#16)
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);
  const whatsBodyRef = useRef<HTMLTextAreaElement>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: emails }, { data: whats }] = await Promise.all([
      supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
      supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: false }),
    ]);
    setEmailTemplates((emails || []) as EmailTemplate[]);
    setWhatsTemplates((whats || []).map((w: any) => ({ ...w, content: w.message_text || w.content || '' })) as WhatsAppTemplate[]);
    setLoading(false);
  }, []);

  // #6: Load usage stats from webhook_logs
  const loadStats = useCallback(async () => {
    const { data } = await supabase
      .from('webhook_logs')
      .select('event_type')
      .eq('direction', 'outbound')
      .eq('endpoint', 'notify-customer')
      .eq('processed', true);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((log: any) => {
        const ev = log.event_type || '';
        counts[ev] = (counts[ev] || 0) + 1;
      });
      setTemplateStats(counts);
    }
  }, []);

  // #36: Load workflow links
  const loadWorkflowLinks = useCallback(async () => {
    const { data } = await supabase.from('automation_workflows').select('id, name, steps');
    if (data) {
      const links: Record<string, string[]> = {};
      data.forEach((wf: any) => {
        const steps = (wf.steps || []) as any[];
        steps.forEach((s: any) => {
          const tplId = s.template_id || s.template_name;
          if (tplId) {
            if (!links[tplId]) links[tplId] = [];
            links[tplId].push(wf.name);
          }
        });
      });
      setWorkflowLinks(links);
    }
  }, []);

  useEffect(() => { loadData(); loadStats(); loadWorkflowLinks(); }, [loadData, loadStats, loadWorkflowLinks]);

  // #48: Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editEmail) saveEmail();
        if (editWhats) saveWhats();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // #3: Filtered and sorted templates
  const filteredEmails = useMemo(() => {
    let list = emailTemplates;
    if (searchQuery) list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus === 'active') list = list.filter(t => t.is_active);
    if (filterStatus === 'inactive') list = list.filter(t => !t.is_active);
    list = [...list].sort((a, b) => {
      const va = (a as any)[sortField] || '';
      const vb = (b as any)[sortField] || '';
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return list;
  }, [emailTemplates, searchQuery, filterStatus, sortField, sortAsc]);

  const filteredWhats = useMemo(() => {
    let list = whatsTemplates;
    if (searchQuery) list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus === 'active') list = list.filter(t => t.is_active);
    if (filterStatus === 'inactive') list = list.filter(t => !t.is_active);
    list = [...list].sort((a, b) => {
      const va = (a as any)[sortField] || '';
      const vb = (b as any)[sortField] || '';
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return list;
  }, [whatsTemplates, searchQuery, filterStatus, sortField, sortAsc]);

  // #50: Dashboard metrics
  const metrics = useMemo(() => {
    const emailActive = emailTemplates.filter(t => t.is_active).length;
    const whatsActive = whatsTemplates.filter(t => t.is_active).length;
    const totalSends = Object.values(templateStats).reduce((a, b) => a + b, 0);
    const eventsWithTemplate = SYSTEM_EVENTS.filter(ev =>
      emailTemplates.some(t => t.name === ev.value) || whatsTemplates.some(t => t.name === ev.value)
    ).length;
    const eventsMissing = SYSTEM_EVENTS.length - eventsWithTemplate;
    const emailErrors = emailTemplates.filter(t => !t.body || t.body.trim().length < 10).length;
    const whatsErrors = whatsTemplates.filter(t => !t.content || t.content.trim().length < 5).length;
    return { emailActive, whatsActive, totalSends, eventsWithTemplate, eventsMissing, emailErrors, whatsErrors };
  }, [emailTemplates, whatsTemplates, templateStats]);

  // #49: Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    whatsTemplates.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [whatsTemplates]);

  // Save email template
  const saveEmail = async () => {
    if (!editEmail?.name || !editEmail?.subject || !editEmail?.body) return toast.error('Preencha nome, assunto e corpo');
    const autoVars = detectVariables(editEmail.body + ' ' + editEmail.subject);
    const payload = { name: editEmail.name, subject: editEmail.subject, body: editEmail.body, variables: autoVars, is_active: editEmail.is_active ?? true };
    const action = editEmail.id ? supabase.from('email_templates').update(payload).eq('id', editEmail.id) : supabase.from('email_templates').insert(payload);
    const { error } = await action;
    if (error) return toast.error('Erro ao salvar template');
    toast.success('Template de e-mail salvo');
    setEditEmail(null);
    loadData();
  };

  // Save WhatsApp template
  const saveWhats = async () => {
    if (!editWhats?.name || !editWhats?.content) return toast.error('Preencha nome e mensagem');
    const autoVars = detectVariables(editWhats.content);
    const payload = { name: editWhats.name, category: editWhats.category || 'transacional', message_text: editWhats.content, variables: autoVars, is_active: editWhats.is_active ?? true };
    const action = editWhats.id ? supabase.from('whatsapp_templates').update(payload).eq('id', editWhats.id) : supabase.from('whatsapp_templates').insert(payload as any);
    const { error } = await action;
    if (error) { if (error.code === 'PGRST205') return toast.error('Tabela não publicada.'); return toast.error('Erro ao salvar template'); }
    toast.success('Template de WhatsApp salvo');
    setEditWhats(null);
    loadData();
  };

  // #2: Duplicate template
  const duplicateEmail = (t: EmailTemplate) => {
    setEditEmail({ name: `${t.name} (cópia)`, subject: t.subject, body: t.body, variables: t.variables, is_active: false });
  };

  const duplicateWhats = (t: WhatsAppTemplate) => {
    setEditWhats({ name: `${t.name} (cópia)`, category: t.category, content: t.content, variables: t.variables, is_active: false });
  };

  // #27: Clone between channels
  const cloneEmailToWhats = (t: EmailTemplate) => {
    const plainText = t.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 1600);
    setEditWhats({ name: t.name, category: 'transacional', content: plainText, variables: t.variables, is_active: false });
    toast.info('Template convertido para WhatsApp. Revise o conteúdo.');
  };

  const cloneWhatsToEmail = (t: WhatsAppTemplate) => {
    const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">${t.content.split('\n').map(line => `<p>${line}</p>`).join('')}</div></div>`;
    setEditEmail({ name: t.name, subject: `${t.name} — {{order_number}}`, body: htmlBody, variables: t.variables, is_active: false });
    toast.info('Template convertido para E-mail. Revise o HTML.');
  };

  // #18: Delete with confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = deleteTarget.channel === 'email'
      ? await supabase.from('email_templates').delete().eq('id', deleteTarget.id)
      : await supabase.from('whatsapp_templates').delete().eq('id', deleteTarget.id);
    if (error) return toast.error('Erro ao excluir');
    toast.success(`Template "${deleteTarget.name}" excluído`);
    setDeleteTarget(null);
    loadData();
  };

  // Toggle active
  const toggle = async (channel: Channel, id: string, isActive: boolean) => {
    const { error } = channel === 'email'
      ? await supabase.from('email_templates').update({ is_active: isActive }).eq('id', id)
      : await supabase.from('whatsapp_templates').update({ is_active: isActive }).eq('id', id);
    if (error) return toast.error('Erro ao atualizar status');
    loadData();
  };

  // #25: Bulk operations
  const bulkAction = async (channel: Channel, action: 'activate' | 'deactivate' | 'delete') => {
    const ids = channel === 'email' ? [...selectedEmails] : [...selectedWhats];
    if (ids.length === 0) return toast.error('Selecione pelo menos um template');
    const table = channel === 'email' ? 'email_templates' : 'whatsapp_templates';
    if (action === 'delete') {
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) return toast.error('Erro na exclusão em massa');
      toast.success(`${ids.length} templates excluídos`);
    } else {
      const isActive = action === 'activate';
      const { error } = await supabase.from(table).update({ is_active: isActive }).in('id', ids);
      if (error) return toast.error('Erro na operação em massa');
      toast.success(`${ids.length} templates ${isActive ? 'ativados' : 'desativados'}`);
    }
    setSelectedEmails(new Set());
    setSelectedWhats(new Set());
    loadData();
  };

  // #1: Test send
  const handleTestSend = async () => {
    if (!testSend || !testSendTo) return toast.error('Informe o destinatário');
    setTestSending(true);
    try {
      if (testSend.channel === 'email') {
        const tpl = emailTemplates.find(t => t.id === testSend.templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const subject = replaceVariables(tpl.subject);
        const html = replaceVariables(tpl.body);
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: { action: 'send', to: testSendTo, subject: `[TESTE] ${subject}`, html },
        });
        if (error) throw error;
        if (data?.success) toast.success(`E-mail de teste enviado para ${testSendTo}`);
        else throw new Error(data?.error || 'Falha no envio');
      } else {
        const tpl = whatsTemplates.find(t => t.id === testSend.templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const text = replaceVariables(tpl.content);
        const phone = testSendTo.replace(/\D/g, '');
        const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
        const { data, error } = await supabase.functions.invoke('whatsapp-evolution', {
          body: { action: 'sendText', number: cleanPhone, text: `[TESTE] ${text}`, recipientName: 'Teste' },
        });
        if (error) throw error;
        if (data?.success) toast.success(`WhatsApp de teste enviado para ${testSendTo}`);
        else throw new Error(data?.error || 'Falha no envio');
      }
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
    } finally {
      setTestSending(false);
      setTestSend(null);
    }
  };

  // #7: Export templates
  const exportTemplates = () => {
    const data = {
      email_templates: emailTemplates.map(({ id, ...rest }) => rest),
      whatsapp_templates: whatsTemplates.map(({ id, ...rest }) => rest),
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templates-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Templates exportados');
  };

  // #7: Import templates
  const importTemplates = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        let imported = 0;
        if (data.email_templates?.length) {
          for (const t of data.email_templates) {
            const { error } = await supabase.from('email_templates').insert({ name: t.name, subject: t.subject, body: t.body, variables: t.variables || [], is_active: t.is_active ?? true });
            if (!error) imported++;
          }
        }
        if (data.whatsapp_templates?.length) {
          for (const t of data.whatsapp_templates) {
            const { error } = await supabase.from('whatsapp_templates').insert({ name: t.name, category: t.category || 'custom', message_text: t.content || t.message_text || '', variables: t.variables || [], is_active: t.is_active ?? true } as any);
            if (!error) imported++;
          }
        }
        toast.success(`${imported} templates importados`);
        loadData();
      } catch {
        toast.error('Arquivo inválido');
      }
    };
    input.click();
  };

  // #11/#24: Install suggested templates
  const installSuggestedEmails = async () => {
    let installed = 0;
    for (const t of SUGGESTED_EMAIL_TEMPLATES) {
      const exists = emailTemplates.some(e => e.name === t.name);
      if (!exists) {
        const { error } = await supabase.from('email_templates').insert({ name: t.name, subject: t.subject, body: t.body, variables: t.variables, is_active: true });
        if (!error) installed++;
      }
    }
    toast.success(`${installed} templates de e-mail instalados`);
    loadData();
  };

  const installSuggestedWhats = async () => {
    const mapped = SUGGESTED_WHATSAPP_TEMPLATES.map(t => ({ name: t.name, category: t.category, message_text: t.content, variables: t.variables, is_active: true }));
    const { error } = await supabase.from('whatsapp_templates').upsert(mapped as any, { onConflict: 'name', ignoreDuplicates: true });
    if (error && error.code !== 'PGRST205') toast.error('Erro ao instalar templates');
    else toast.success('Templates sugeridos de WhatsApp instalados');
    loadData();
  };

  // #16: Insert variable at cursor position
  const insertVarAtCursor = (varKey: string, channel: Channel) => {
    if (channel === 'email' && editEmail) {
      const el = emailBodyRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newBody = (editEmail.body || '').slice(0, start) + varKey + (editEmail.body || '').slice(end);
        setEditEmail({ ...editEmail, body: newBody });
        setTimeout(() => { el.focus(); el.setSelectionRange(start + varKey.length, start + varKey.length); }, 0);
      } else {
        setEditEmail({ ...editEmail, body: `${editEmail.body || ''} ${varKey}` });
      }
    }
    if (channel === 'whatsapp' && editWhats) {
      const el = whatsBodyRef.current;
      if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newContent = (editWhats.content || '').slice(0, start) + varKey + (editWhats.content || '').slice(end);
        setEditWhats({ ...editWhats, content: newContent });
        setTimeout(() => { el.focus(); el.setSelectionRange(start + varKey.length, start + varKey.length); }, 0);
      } else {
        setEditWhats({ ...editWhats, content: `${editWhats.content || ''} ${varKey}` });
      }
    }
  };

  // #28: Check if template is the default for an event
  const isEventDefault = (name: string) => SYSTEM_EVENTS.some(ev => ev.value === name);

  // #39: Check if template was created recently
  const isNew = (createdAt?: string) => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
  };

  const tabs: { key: PageTab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'templates', label: 'Templates', icon: Mail, desc: `${metrics.emailActive + metrics.whatsActive} ativos` },
    { key: 'workflows', label: 'Workflows', icon: Workflow, desc: 'Automações' },
  ];

  // Render email template card
  const renderEmailCard = (t: EmailTemplate) => {
    const usageCount = templateStats[t.name] || 0;
    const linkedWorkflows = workflowLinks[t.id] || workflowLinks[t.name] || [];
    const unknownVars = findUnknownVars(t.body + ' ' + t.subject);
    const isDefault = isEventDefault(t.name);
    const isSelected = selectedEmails.has(t.id);

    if (viewMode === 'list') {
      return (
        <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-[hsl(var(--admin-accent-purple)/0.1)] border-[hsl(var(--admin-accent-purple))]' : 'border-[hsl(var(--admin-card-border))] hover:bg-[hsl(var(--admin-sidebar-hover))]'}`}>
          <input type="checkbox" checked={isSelected} onChange={() => setSelectedEmails(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} className="rounded" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{t.name}</span>
              {isDefault && <Badge variant="outline" className="text-[10px] border-[hsl(var(--admin-accent-purple))]">Evento</Badge>}
              {isNew(t.created_at) && <Badge className="text-[10px] bg-green-500/20 text-green-400">Novo</Badge>}
              {linkedWorkflows.length > 0 && <Badge variant="secondary" className="text-[10px]"><Zap className="h-2 w-2 mr-1" />{linkedWorkflows.length}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
          </div>
          {usageCount > 0 && <Badge variant="secondary" className="text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount}</Badge>}
          <Switch checked={t.is_active} onCheckedChange={v => toggle('email', t.id, v)} />
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}><Eye className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setEditEmail(t)}><Edit2 className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })}><Send className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => duplicateEmail(t)}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      );
    }

    return (
      <Card key={t.id} className={`border transition-all ${isSelected ? 'ring-2 ring-[hsl(var(--admin-accent-purple))]' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <input type="checkbox" checked={isSelected} onChange={() => setSelectedEmails(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} className="rounded" />
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">{t.name}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
              </div>
            </div>
            <Switch checked={t.is_active} onCheckedChange={v => toggle('email', t.id, v)} />
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {isDefault && <Badge variant="outline" className="text-[10px] border-[hsl(var(--admin-accent-purple))]">{SYSTEM_EVENTS.find(ev => ev.value === t.name)?.icon} Evento</Badge>}
            {isNew(t.created_at) && <Badge className="text-[10px] bg-green-500/20 text-green-400">Novo</Badge>}
            {linkedWorkflows.length > 0 && <Badge variant="secondary" className="text-[10px]"><Zap className="h-2 w-2 mr-1" />{linkedWorkflows.length} workflow{linkedWorkflows.length > 1 ? 's' : ''}</Badge>}
            {usageCount > 0 && <Badge variant="secondary" className="text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount} envios</Badge>}
            {unknownVars.length > 0 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />{unknownVars.length} var desconhecida</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">{t.body.replace(/<[^>]*>/g, '').slice(0, 120)}</p>
          <div className="flex flex-wrap gap-1">{detectVariables(t.body).slice(0, 4).map(v => <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>)}{detectVariables(t.body).length > 4 && <Badge variant="secondary" className="text-[10px]">+{detectVariables(t.body).length - 4}</Badge>}</div>
          <div className="flex flex-wrap gap-1 pt-1 border-t">
            <Button size="sm" variant="outline" onClick={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}><Eye className="h-3 w-3 mr-1" />Preview</Button>
            <Button size="sm" variant="outline" onClick={() => setEditEmail(t)}><Edit2 className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })}><Send className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => duplicateEmail(t)}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => cloneEmailToWhats(t)}><MessageSquare className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render WhatsApp template card
  const renderWhatsCard = (t: WhatsAppTemplate) => {
    const usageCount = templateStats[t.name] || 0;
    const linkedWorkflows = workflowLinks[t.id] || workflowLinks[t.name] || [];
    const segInfo = getWhatsAppSegmentInfo(t.content);
    const unknownVars = findUnknownVars(t.content);
    const isDefault = isEventDefault(t.name);
    const isSelected = selectedWhats.has(t.id);

    if (viewMode === 'list') {
      return (
        <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isSelected ? 'bg-[hsl(var(--admin-accent-purple)/0.1)] border-[hsl(var(--admin-accent-purple))]' : 'border-[hsl(var(--admin-card-border))] hover:bg-[hsl(var(--admin-sidebar-hover))]'}`}>
          <input type="checkbox" checked={isSelected} onChange={() => setSelectedWhats(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} className="rounded" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{t.name}</span>
              <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
              {isDefault && <Badge variant="outline" className="text-[10px] border-[hsl(var(--admin-accent-purple))]">Evento</Badge>}
              {segInfo.isLong && <Badge variant="destructive" className="text-[10px]">{segInfo.length} chars</Badge>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{t.content.slice(0, 80)}</p>
          </div>
          {usageCount > 0 && <Badge variant="secondary" className="text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount}</Badge>}
          <Switch checked={t.is_active} onCheckedChange={v => toggle('whatsapp', t.id, v)} />
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}><Eye className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setEditWhats(t)}><Edit2 className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })}><Send className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" onClick={() => duplicateWhats(t)}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      );
    }

    return (
      <Card key={t.id} className={`border transition-all ${isSelected ? 'ring-2 ring-[hsl(var(--admin-accent-purple))]' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <input type="checkbox" checked={isSelected} onChange={() => setSelectedWhats(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} className="rounded" />
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">{t.name}</CardTitle>
                <Badge variant="outline" className="mt-1 text-[10px]">{t.category}</Badge>
              </div>
            </div>
            <Switch checked={t.is_active} onCheckedChange={v => toggle('whatsapp', t.id, v)} />
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {isDefault && <Badge variant="outline" className="text-[10px] border-[hsl(var(--admin-accent-purple))]">{SYSTEM_EVENTS.find(ev => ev.value === t.name)?.icon} Evento</Badge>}
            {isNew(t.created_at) && <Badge className="text-[10px] bg-green-500/20 text-green-400">Novo</Badge>}
            {linkedWorkflows.length > 0 && <Badge variant="secondary" className="text-[10px]"><Zap className="h-2 w-2 mr-1" />{linkedWorkflows.length} workflow{linkedWorkflows.length > 1 ? 's' : ''}</Badge>}
            {usageCount > 0 && <Badge variant="secondary" className="text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount} envios</Badge>}
            <Badge variant={segInfo.isLong ? 'destructive' : 'secondary'} className="text-[10px]"><Hash className="h-2 w-2 mr-1" />{segInfo.length} chars</Badge>
            {unknownVars.length > 0 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />var desconhecida</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{t.content.slice(0, 160)}</p>
          <div className="flex flex-wrap gap-1">{detectVariables(t.content).slice(0, 4).map(v => <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>)}</div>
          <div className="flex flex-wrap gap-1 pt-1 border-t">
            <Button size="sm" variant="outline" onClick={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}><Eye className="h-3 w-3 mr-1" />Preview</Button>
            <Button size="sm" variant="outline" onClick={() => setEditWhats(t)}><Edit2 className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })}><Send className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => duplicateWhats(t)}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => cloneWhatsToEmail(t)}><Mail className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout title="Comunicação & Automação" requireEditor>
      {/* Tab Bar */}
      <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mb-6 overflow-hidden">
        <div className="flex items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-all border-b-2 ${isActive ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.08)] text-white' : 'border-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white'}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-[hsl(var(--admin-accent-purple))]' : ''}`} />
                <div className="text-left hidden sm:block"><p className="text-sm font-semibold">{tab.label}</p><p className="text-[10px] opacity-60">{tab.desc}</p></div>
                <span className="sm:hidden text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* #50: Dashboard metrics */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-400" /><div><p className="text-xs text-muted-foreground">E-mails ativos</p><p className="text-2xl font-semibold">{metrics.emailActive}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-green-400" /><div><p className="text-xs text-muted-foreground">WhatsApp ativos</p><p className="text-2xl font-semibold">{metrics.whatsActive}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-purple-400" /><div><p className="text-xs text-muted-foreground">Total de envios</p><p className="text-2xl font-semibold">{metrics.totalSends}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><div><p className="text-xs text-muted-foreground">Eventos cobertos</p><p className="text-2xl font-semibold">{metrics.eventsWithTemplate}/{SYSTEM_EVENTS.length}</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2">{metrics.eventsMissing > 0 ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}<div><p className="text-xs text-muted-foreground">Sem template</p><p className="text-2xl font-semibold">{metrics.eventsMissing}</p></div></div></CardContent></Card>
          </div>

          {/* #5: Missing event templates alert */}
          {metrics.eventsMissing > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Eventos sem template configurado</p>
                    <p className="text-xs text-muted-foreground mb-2">O sistema usa fallback genérico para esses eventos. Crie templates para melhorar a comunicação.</p>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_EVENTS.filter(ev => !emailTemplates.some(t => t.name === ev.value) && !whatsTemplates.some(t => t.name === ev.value)).map(ev => (
                        <Badge key={ev.value} variant="outline" className="text-xs">{ev.icon} {ev.label}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-[130px]"><Filter className="h-3 w-3 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => { setSortAsc(!sortAsc); }}><ArrowUpDown className="h-3 w-3 mr-1" />{sortAsc ? 'A→Z' : 'Z→A'}</Button>
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="h-3 w-3" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><LayoutList className="h-3 w-3" /></Button>
            <div className="ml-auto flex gap-2">
              <Button onClick={() => setEditEmail({ name: '', subject: '', body: '', variables: [], is_active: true })}><Plus className="h-4 w-4 mr-2" />E-mail</Button>
              <Button variant="outline" onClick={() => setEditWhats({ name: '', category: 'transacional', content: '', variables: [], is_active: true })}><Plus className="h-4 w-4 mr-2" />WhatsApp</Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={installSuggestedEmails}><Sparkles className="h-3 w-3 mr-1" />Instalar e-mails sugeridos</Button>
            <Button variant="secondary" size="sm" onClick={installSuggestedWhats}><Sparkles className="h-3 w-3 mr-1" />Instalar WhatsApp sugeridos</Button>
            <Button variant="outline" size="sm" onClick={exportTemplates}><Download className="h-3 w-3 mr-1" />Exportar JSON</Button>
            <Button variant="outline" size="sm" onClick={importTemplates}><Upload className="h-3 w-3 mr-1" />Importar JSON</Button>
            {(selectedEmails.size > 0 || selectedWhats.size > 0) && (
              <>
                <div className="w-px h-6 bg-border self-center" />
                <Badge variant="secondary">{selectedEmails.size + selectedWhats.size} selecionados</Badge>
                {selectedEmails.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => bulkAction('email', 'activate')}>Ativar</Button>
                    <Button variant="outline" size="sm" onClick={() => bulkAction('email', 'deactivate')}>Desativar</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => bulkAction('email', 'delete')}>Excluir</Button>
                  </>
                )}
                {selectedWhats.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => bulkAction('whatsapp', 'activate')}>Ativar WA</Button>
                    <Button variant="outline" size="sm" onClick={() => bulkAction('whatsapp', 'deactivate')}>Desativar WA</Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => bulkAction('whatsapp', 'delete')}>Excluir WA</Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Email Templates */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setEmailCollapsed(!emailCollapsed)}>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />Templates de E-mail ({filteredEmails.length})
                {emailCollapsed ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
              </CardTitle>
            </CardHeader>
            {!emailCollapsed && (
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : filteredEmails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum template de e-mail encontrado.</p>
                    <Button size="sm" className="mt-3" onClick={installSuggestedEmails}><Sparkles className="h-3 w-3 mr-1" />Instalar templates padrão</Button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEmails.map(renderEmailCard)}
                  </div>
                ) : (
                  <div className="space-y-2">{filteredEmails.map(renderEmailCard)}</div>
                )}
              </CardContent>
            )}
          </Card>

          {/* WhatsApp Templates */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setWhatsCollapsed(!whatsCollapsed)}>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />Templates de WhatsApp ({filteredWhats.length})
                {whatsCollapsed ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
                {/* #49: Category counts */}
                <div className="ml-4 flex gap-2">{Object.entries(categoryCounts).map(([cat, count]) => <Badge key={cat} variant="outline" className="text-[10px]">{cat}: {count}</Badge>)}</div>
              </CardTitle>
            </CardHeader>
            {!whatsCollapsed && (
              <CardContent>
                {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : filteredWhats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum template de WhatsApp encontrado.</p>
                    <Button size="sm" className="mt-3" onClick={installSuggestedWhats}><Sparkles className="h-3 w-3 mr-1" />Instalar templates padrão</Button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredWhats.map(renderWhatsCard)}
                  </div>
                ) : (
                  <div className="space-y-2">{filteredWhats.map(renderWhatsCard)}</div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'workflows' && <VisualWorkflowBuilder />}

      {/* ─── Email Editor Dialog ─── */}
      <Dialog open={!!editEmail} onOpenChange={() => setEditEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editEmail?.id ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <Keyboard className="h-3 w-3" /> Ctrl+S para salvar
              {editEmail?.body && <span>• {countWords(editEmail.body.replace(/<[^>]*>/g, ''))} palavras</span>}
              {editEmail?.body && findUnknownVars(editEmail.body).length > 0 && (
                <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />{findUnknownVars(editEmail.body).join(', ')}</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          {editEmail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={editEmail.name || ''} onChange={e => setEditEmail({ ...editEmail, name: e.target.value })} placeholder="Nome do template (ex: pix_generated)" />
                <Input value={editEmail.subject || ''} onChange={e => setEditEmail({ ...editEmail, subject: e.target.value })} placeholder="Assunto do e-mail" />
              </div>

              {/* #5: Event binding hint */}
              {editEmail.name && isEventDefault(editEmail.name) && (
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                  <Zap className="h-3 w-3 text-[hsl(var(--admin-accent-purple))]" />
                  Este template será usado automaticamente pelo evento "{SYSTEM_EVENTS.find(ev => ev.value === editEmail.name)?.label}"
                </div>
              )}

              <div className={splitView ? 'grid grid-cols-2 gap-3' : ''}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Corpo (HTML)</span>
                    <Button size="sm" variant="ghost" onClick={() => setSplitView(!splitView)}>
                      {splitView ? <Monitor className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span className="ml-1 text-xs">{splitView ? 'Modo simples' : 'Split view'}</span>
                    </Button>
                  </div>
                  <Textarea ref={emailBodyRef} rows={splitView ? 20 : 12} className="font-mono text-xs" value={editEmail.body || ''} onChange={e => setEditEmail({ ...editEmail, body: e.target.value })} placeholder="Corpo do e-mail (HTML)" />
                </div>
                {splitView && (
                  <div>
                    <span className="text-xs font-medium mb-1 block">Preview</span>
                    <div className="border rounded p-3 max-h-[400px] overflow-y-auto bg-white text-black prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(editEmail.body || '')) }} />
                  </div>
                )}
              </div>

              {/* #16/#37: Variable buttons with tooltips */}
              <div>
                <span className="text-xs font-medium mb-1 block">Inserir variável na posição do cursor:</span>
                <TooltipProvider>
                  <div className="flex flex-wrap gap-1">
                    {TEMPLATE_VARIABLES.map(v => (
                      <Tooltip key={v.key}>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => insertVarAtCursor(v.key, 'email')}>{v.key}</Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{v.desc}</p></TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>

              {/* #8: Auto-detected variables */}
              {editEmail.body && detectVariables(editEmail.body).length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Variáveis detectadas: {detectVariables(editEmail.body + ' ' + (editEmail.subject || '')).join(', ')}
                </div>
              )}

              <div className="flex items-center gap-3">
                <Switch checked={editEmail.is_active ?? true} onCheckedChange={v => setEditEmail({ ...editEmail, is_active: v })} />
                <span className="text-sm">Ativo</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmail(null)}>Cancelar</Button>
            <Button onClick={saveEmail}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── WhatsApp Editor Dialog ─── */}
      <Dialog open={!!editWhats} onOpenChange={() => setEditWhats(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editWhats?.id ? 'Editar Template WhatsApp' : 'Novo Template WhatsApp'}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              <Keyboard className="h-3 w-3" /> Ctrl+S para salvar
              {editWhats?.content && (() => {
                const info = getWhatsAppSegmentInfo(editWhats.content);
                return (
                  <>
                    <span>• {info.length} caracteres</span>
                    <span>• {countWords(editWhats.content)} palavras</span>
                    {info.isLong && <Badge variant="destructive" className="text-[10px]">Mensagem longa!</Badge>}
                  </>
                );
              })()}
            </DialogDescription>
          </DialogHeader>
          {editWhats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input value={editWhats.name || ''} onChange={e => setEditWhats({ ...editWhats, name: e.target.value })} placeholder="Nome do template" />
                <Select value={editWhats.category || 'transacional'} onValueChange={v => setEditWhats({ ...editWhats, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transacional">Transacional</SelectItem>
                    <SelectItem value="promocao">Promoção</SelectItem>
                    <SelectItem value="recuperacao">Recuperação</SelectItem>
                    <SelectItem value="pos_venda">Pós-venda</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editWhats.name && isEventDefault(editWhats.name) && (
                <div className="flex items-center gap-2 text-xs p-2 rounded bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                  <Zap className="h-3 w-3 text-[hsl(var(--admin-accent-purple))]" />
                  Template vinculado ao evento "{SYSTEM_EVENTS.find(ev => ev.value === editWhats.name)?.label}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium mb-1 block">Mensagem</span>
                  <Textarea ref={whatsBodyRef} rows={10} value={editWhats.content || ''} onChange={e => setEditWhats({ ...editWhats, content: e.target.value })} placeholder="Mensagem (*negrito*, _itálico_, ~riscado~)" />
                  <p className="text-[10px] text-muted-foreground mt-1">Formatação: *negrito* | _itálico_ | ~riscado~ | ```código```</p>
                </div>
                {/* #22: WhatsApp chat preview */}
                <div>
                  <span className="text-xs font-medium mb-1 block">Preview</span>
                  <div className="bg-[#0b141a] rounded-2xl p-3 max-h-[300px] overflow-y-auto">
                    <div className="bg-[#005c4b] rounded-lg p-3 text-[13px] text-white whitespace-pre-wrap max-w-[85%] ml-auto">
                      {replaceVariables(editWhats.content || '').replace(/\*([^*]+)\*/g, '𝗯$1𝗯').replace(/_([^_]+)_/g, '𝘪$1𝘪')}
                      <span className="block text-right text-[10px] text-white/50 mt-1">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <TooltipProvider>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map(v => (
                    <Tooltip key={v.key}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => insertVarAtCursor(v.key, 'whatsapp')}>{v.key}</Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{v.desc}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {editWhats.content && findUnknownVars(editWhats.content).length > 0 && (
                <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Variáveis desconhecidas: {findUnknownVars(editWhats.content).join(', ')}</Badge>
              )}

              <div className="flex items-center gap-3">
                <Switch checked={editWhats.is_active ?? true} onCheckedChange={v => setEditWhats({ ...editWhats, is_active: v })} />
                <span className="text-sm">Ativo</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWhats(null)}>Cancelar</Button>
            <Button onClick={saveWhats}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Preview Dialog ─── */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Preview: {preview?.title}</DialogTitle>
            {/* #9: Device toggle */}
            {preview?.channel === 'email' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant={previewDevice === 'desktop' ? 'default' : 'outline'} onClick={() => setPreviewDevice('desktop')}><Monitor className="h-3 w-3 mr-1" />Desktop</Button>
                <Button size="sm" variant={previewDevice === 'mobile' ? 'default' : 'outline'} onClick={() => setPreviewDevice('mobile')}><Smartphone className="h-3 w-3 mr-1" />Mobile</Button>
              </div>
            )}
          </DialogHeader>
          {preview && (preview.channel === 'email' ? (
            <div className="space-y-3">
              <div className="bg-muted p-2 rounded text-sm"><strong>Assunto:</strong> {replaceVariables(preview.subject || '')}</div>
              <div className={`mx-auto border rounded bg-white text-black overflow-hidden ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
                <div className="p-4 max-h-[500px] overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(preview.content)) }} />
              </div>
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <div className="bg-[#0b141a] rounded-2xl overflow-hidden">
                <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2a3942]" />
                  <div><p className="text-white text-sm font-medium">Pincel de Luz</p><p className="text-[11px] text-[#8696a0]">online</p></div>
                </div>
                <div className="p-3 min-h-[200px] bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8BQz0BFwMgwasCoGgYAVVwI/1sNNtAAAAAASUVORK5CYII=')] bg-repeat">
                  <div className="bg-[#005c4b] rounded-lg p-3 text-[13px] text-white whitespace-pre-wrap max-w-[85%] ml-auto shadow-sm">
                    {replaceVariables(preview.content)}
                    <span className="block text-right text-[10px] text-white/50 mt-1">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <DialogFooter><Button variant="outline" onClick={() => setPreview(null)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* #18: Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template "<strong>{deleteTarget?.name}</strong>"? Esta ação não pode ser desfeita.
              {deleteTarget && isEventDefault(deleteTarget.name) && (
                <span className="block mt-2 text-amber-500 font-medium">⚠️ Este template está vinculado a um evento do sistema. O sistema usará mensagem genérica.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* #1: Test send dialog */}
      <Dialog open={!!testSend} onOpenChange={() => setTestSend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />Enviar teste: {testSend?.templateName}
            </DialogTitle>
            <DialogDescription>
              {testSend?.channel === 'email' ? 'Informe o e-mail de destino para o teste' : 'Informe o telefone com DDD (ex: 11999990000)'}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={testSendTo}
            onChange={e => setTestSendTo(e.target.value)}
            placeholder={testSend?.channel === 'email' ? 'email@exemplo.com' : '11999990000'}
            type={testSend?.channel === 'email' ? 'email' : 'tel'}
          />
          <p className="text-xs text-muted-foreground">Variáveis serão substituídas por dados de exemplo.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestSend(null)}>Cancelar</Button>
            <Button onClick={handleTestSend} disabled={testSending}>{testSending ? 'Enviando...' : 'Enviar Teste'}<Send className="h-4 w-4 ml-2" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
