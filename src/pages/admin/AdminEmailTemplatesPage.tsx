import { useEffect, useMemo, useState } from 'react';
import { WorkflowBuilder } from '@/components/admin/workflows';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageSquare, Plus, Edit2, Trash2, Eye, Copy, Save, Zap, Workflow } from 'lucide-react';

type Channel = 'email' | 'whatsapp';
type PageTab = 'templates' | 'workflows';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[] | null;
  is_active: boolean;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[] | null;
  is_active: boolean;
}

interface SuggestedWhatsAppTemplate {
  name: string;
  category: string;
  content: string;
  variables: string[];
}

const TEMPLATE_VARIABLES = [
  '{{customer_name}}',
  '{{order_number}}',
  '{{total}}',
  '{{tracking_code}}',
  '{{production_status}}',
  '{{coupon_code}}',
  '{{discount_percent}}',
  '{{expires_at}}',
  '{{cart_items}}',
  '{{company_name}}',
];

const SUGGESTED_WHATSAPP_TEMPLATES: SuggestedWhatsAppTemplate[] = [
  {
    name: 'Boas-vindas com cupom',
    category: 'promocao',
    content: 'Olá {{customer_name}}! Seja bem-vinda à {{company_name}}. Para sua primeira compra, ative o cupom {{coupon_code}} e garanta {{discount_percent}} OFF até {{expires_at}}.',
    variables: ['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'],
  },
  {
    name: 'Lembrete de carrinho com urgência',
    category: 'recuperacao',
    content: 'Oi {{customer_name}}, seus {{cart_items}} ainda estão reservados no carrinho. Posso liberar agora o cupom {{coupon_code}} com {{discount_percent}} OFF, válido até {{expires_at}}.',
    variables: ['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'],
  },
  {
    name: 'Produção iniciada',
    category: 'transacional',
    content: 'Seu pedido {{order_number}} entrou em produção. Status atual: {{production_status}}. Assim que avançar para a próxima etapa, eu te aviso por aqui.',
    variables: ['{{order_number}}', '{{production_status}}'],
  },
  {
    name: 'Pedido enviado com rastreio',
    category: 'transacional',
    content: 'Pedido {{order_number}} enviado com sucesso. Total: {{total}}. Seu código de rastreio é {{tracking_code}}. Se quiser, posso te explicar como acompanhar a entrega.',
    variables: ['{{order_number}}', '{{total}}', '{{tracking_code}}'],
  },
  {
    name: 'Pós-venda com avaliação',
    category: 'pos_venda',
    content: 'Olá {{customer_name}}, seu pedido {{order_number}} já foi entregue. Como foi sua experiência com a {{company_name}}? Sua avaliação ajuda muito e posso te enviar um benefício na próxima compra.',
    variables: ['{{customer_name}}', '{{order_number}}', '{{company_name}}'],
  },
  {
    name: 'Recompra VIP',
    category: 'promocao',
    content: '{{customer_name}}, preparamos uma condição VIP para você: {{discount_percent}} OFF com o cupom {{coupon_code}}. Aproveite até {{expires_at}} e responda esta mensagem para receber sua seleção personalizada.',
    variables: ['{{customer_name}}', '{{discount_percent}}', '{{coupon_code}}', '{{expires_at}}'],
  },
];

const SAMPLE_VALUES: Record<string, string> = {
  '{{customer_name}}': 'Ana Paula',
  '{{order_number}}': '#PL-1024',
  '{{total}}': 'R$ 289,90',
  '{{tracking_code}}': 'BR123456789',
  '{{production_status}}': 'Em produção',
  '{{coupon_code}}': 'VOLTA10',
  '{{discount_percent}}': '10%',
  '{{expires_at}}': 'hoje 23:59',
  '{{cart_items}}': '2 itens personalizados',
  '{{company_name}}': 'Pincel de Luz',
};

const replaceVariables = (text: string) => TEMPLATE_VARIABLES.reduce((acc, key) => acc.split(key).join(SAMPLE_VALUES[key] || key), text);

const sanitizePreviewHtml = (html: string) => {
  if (typeof window === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, form, meta, base').forEach((node) => node.remove());
  doc.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on')) { element.removeAttribute(attribute.name); return; }
      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) { element.removeAttribute(attribute.name); }
    });
  });
  return doc.body.innerHTML;
};

const AdminEmailTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('templates');
  const [presetCategory, setPresetCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<WhatsAppTemplate[]>([]);

  const [editEmail, setEditEmail] = useState<Partial<EmailTemplate> | null>(null);
  const [editWhats, setEditWhats] = useState<Partial<WhatsAppTemplate> | null>(null);
  const [preview, setPreview] = useState<{ channel: Channel; title: string; content: string; subject?: string } | null>(null);

  // Workflow preset import
  const [presetToImport, setPresetToImport] = useState<WorkflowPreset | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [{ data: emails, error: emailError }, { data: whats, error: whatsError }] = await Promise.all([
      supabase.from('email_templates').select('*').order('created_at', { ascending: false }),
      supabase.from('whatsapp_templates').select('*').order('created_at', { ascending: false }),
    ]);
    if (emailError && emailError.code !== 'PGRST205') toast.error('Não foi possível carregar os templates de e-mail.');
    if (whatsError && whatsError.code !== 'PGRST205') toast.error('Não foi possível carregar os templates de WhatsApp.');
    setEmailTemplates((emails || []) as EmailTemplate[]);
    setWhatsTemplates((whats || []).map((w: any) => ({ ...w, content: w.message_text || w.content || '' })) as WhatsAppTemplate[]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => ({
    email: emailTemplates.filter((t) => t.is_active).length,
    whatsapp: whatsTemplates.filter((t) => t.is_active).length,
  }), [emailTemplates, whatsTemplates]);

  const saveEmail = async () => {
    if (!editEmail?.name || !editEmail?.subject || !editEmail?.body) return toast.error('Preencha nome, assunto e corpo do e-mail');
    const payload = { name: editEmail.name, subject: editEmail.subject, body: editEmail.body, variables: editEmail.variables || [], is_active: editEmail.is_active ?? true };
    const action = editEmail.id ? supabase.from('email_templates').update(payload).eq('id', editEmail.id) : supabase.from('email_templates').insert(payload);
    const { error } = await action;
    if (error) return toast.error('Erro ao salvar template de e-mail');
    toast.success('Template de e-mail salvo');
    setEditEmail(null);
    loadData();
  };

  const saveWhats = async () => {
    if (!editWhats?.name || !editWhats?.content) return toast.error('Preencha nome e mensagem do WhatsApp');
    const payload = { name: editWhats.name, category: editWhats.category || 'promocao', message_text: editWhats.content, variables: editWhats.variables || [], is_active: editWhats.is_active ?? true };
    const action = editWhats.id ? supabase.from('whatsapp_templates').update(payload).eq('id', editWhats.id) : supabase.from('whatsapp_templates').insert(payload as any);
    const { error } = await action;
    if (error) {
      if (error.code === 'PGRST205') return toast.error('A tabela de templates de WhatsApp ainda não foi publicada.');
      return toast.error('Erro ao salvar template de WhatsApp');
    }
    toast.success('Template de WhatsApp salvo');
    setEditWhats(null);
    loadData();
  };

  const installSuggestedWhatsTemplates = async () => {
    const mapped = SUGGESTED_WHATSAPP_TEMPLATES.map(t => ({ name: t.name, category: t.category, message_text: t.content, variables: t.variables, is_active: true }));
    const { error } = await supabase.from('whatsapp_templates').upsert(mapped as any, { onConflict: 'name', ignoreDuplicates: false });
    if (error) {
      if (error.code === 'PGRST205') { toast.error('A tabela de templates de WhatsApp ainda não foi publicada.'); return; }
      toast.error('Erro ao adicionar templates sugeridos'); return;
    }
    toast.success('Templates sugeridos adicionados ao sistema');
    loadData();
  };

  const del = async (channel: Channel, id: string) => {
    const { error } = channel === 'email' ? await supabase.from('email_templates').delete().eq('id', id) : await supabase.from('whatsapp_templates').delete().eq('id', id);
    if (error) { if (error.code === 'PGRST205') return toast.error('Tabela não publicada.'); return toast.error('Erro ao excluir template'); }
    toast.success('Template excluido');
    loadData();
  };

  const toggle = async (channel: Channel, id: string, isActive: boolean) => {
    const { error } = channel === 'email' ? await supabase.from('email_templates').update({ is_active: isActive }).eq('id', id) : await supabase.from('whatsapp_templates').update({ is_active: isActive }).eq('id', id);
    if (error) { if (error.code === 'PGRST205') return toast.error('Tabela não publicada.'); return toast.error('Erro ao atualizar status'); }
    loadData();
  };

  const handleUsePreset = (preset: WorkflowPreset) => {
    setPresetToImport(preset);
    setActiveTab('workflows');
  };

  const tabs: { key: PageTab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'templates', label: 'Templates', icon: Mail, desc: 'E-mail e WhatsApp' },
    { key: 'workflows', label: 'Workflows', icon: Workflow, desc: 'Automações' },
    { key: 'presets', label: 'Modelos Prontos', icon: LayoutGrid, desc: 'Workflows pré-configurados' },
  ];

  return (
    <AdminLayout title="Comunicação & Automação" requireEditor>
      {/* ─── Top Bar ─── */}
      <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] mb-6 overflow-hidden">
        <div className="flex items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-all border-b-2 ${
                  isActive
                    ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.08)] text-white'
                    : 'border-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[hsl(var(--admin-accent-purple))]' : ''}`} />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className="text-[10px] opacity-60">{tab.desc}</p>
                </div>
                <span className="sm:hidden text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">E-mails ativos</p><p className="text-2xl font-semibold">{totals.email}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">WhatsApp ativos</p><p className="text-2xl font-semibold">{totals.whatsapp}</p></CardContent></Card>
            <Card className="md:col-span-2"><CardContent className="p-4 text-sm text-muted-foreground">Use variáveis para promoção, recuperação de carrinho e atualizações de pedido com dados dinâmicos.</CardContent></Card>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEditEmail({ name: '', subject: '', body: '', variables: [], is_active: true })}><Plus className="h-4 w-4 mr-2" />Novo E-mail</Button>
            <Button variant="outline" onClick={() => setEditWhats({ name: '', category: 'promocao', content: '', variables: [], is_active: true })}><Plus className="h-4 w-4 mr-2" />Novo WhatsApp</Button>
            <Button variant="secondary" onClick={installSuggestedWhatsTemplates}><MessageSquare className="h-4 w-4 mr-2" />Adicionar templates sugeridos</Button>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Templates de E-mail</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {emailTemplates.map((t) => (
                    <Card key={t.id} className="border">
                      <CardHeader className="pb-2"><div className="flex justify-between gap-3"><CardTitle className="text-sm">{t.name}</CardTitle><Switch checked={t.is_active} onCheckedChange={(v) => toggle('email', t.id, v)} /></div><p className="text-xs text-muted-foreground">{t.subject}</p></CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-3">{t.body.replace(/<[^>]*>/g, '').slice(0, 140)}</p>
                        <div className="flex flex-wrap gap-1">{(t.variables || []).slice(0, 4).map((v) => <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>)}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditEmail(t)}><Edit2 className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => del('email', t.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Templates de WhatsApp</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {whatsTemplates.map((t) => (
                    <Card key={t.id} className="border">
                      <CardHeader className="pb-2"><div className="flex justify-between gap-3"><div><CardTitle className="text-sm">{t.name}</CardTitle><Badge variant="outline" className="mt-1 text-[10px]">{t.category}</Badge></div><Switch checked={t.is_active} onCheckedChange={(v) => toggle('whatsapp', t.id, v)} /></div></CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-3">{t.content.slice(0, 160)}</p>
                        <div className="flex flex-wrap gap-1">{(t.variables || []).slice(0, 4).map((v) => <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>)}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditWhats(t)}><Edit2 className="h-3 w-3" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => del('whatsapp', t.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'workflows' && (
        <WorkflowBuilder presetToImport={presetToImport} onPresetImported={() => setPresetToImport(null)} />
      )}

      {activeTab === 'presets' && (
        <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] overflow-hidden" style={{ minHeight: 480 }}>
          <div className="border-b border-[hsl(var(--admin-card-border)/0.5)] px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />Modelos Prontos</h3>
              <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">Clique em um modelo para usá-lo como base de um novo workflow</p>
            </div>
            <Badge variant="secondary" className="text-xs">{WORKFLOW_PRESETS.length} modelos</Badge>
          </div>
          <WorkflowPresets
            selectedCategory={presetCategory}
            onSelectCategory={setPresetCategory}
            onUsePreset={handleUsePreset}
          />
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <Dialog open={!!editEmail} onOpenChange={() => setEditEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editEmail?.id ? 'Editar e-mail' : 'Novo e-mail'}</DialogTitle></DialogHeader>
          {editEmail && <div className="space-y-3"><Input value={editEmail.name || ''} onChange={(e) => setEditEmail({ ...editEmail, name: e.target.value })} placeholder="Nome do template" /><Input value={editEmail.subject || ''} onChange={(e) => setEditEmail({ ...editEmail, subject: e.target.value })} placeholder="Assunto" /><Textarea rows={10} className="font-mono text-xs" value={editEmail.body || ''} onChange={(e) => setEditEmail({ ...editEmail, body: e.target.value })} placeholder="Corpo do e-mail (HTML aceito)" /><div className="flex flex-wrap gap-2">{TEMPLATE_VARIABLES.map((v) => <Button key={v} variant="outline" size="sm" onClick={() => setEditEmail({ ...editEmail, body: `${editEmail.body || ''} ${v}`, variables: [...new Set([...(editEmail.variables || []), v])] })}><Copy className="h-3 w-3 mr-1" />{v}</Button>)}</div><div className="flex items-center gap-2"><Switch checked={editEmail.is_active ?? true} onCheckedChange={(v) => setEditEmail({ ...editEmail, is_active: v })} /><span className="text-sm">Ativo</span></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setEditEmail(null)}>Cancelar</Button><Button onClick={saveEmail}><Save className="h-4 w-4 mr-2" />Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editWhats} onOpenChange={() => setEditWhats(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editWhats?.id ? 'Editar WhatsApp' : 'Novo WhatsApp'}</DialogTitle></DialogHeader>
          {editWhats && <div className="space-y-3"><Input value={editWhats.name || ''} onChange={(e) => setEditWhats({ ...editWhats, name: e.target.value })} placeholder="Nome do template" /><Select value={editWhats.category || 'promocao'} onValueChange={(v) => setEditWhats({ ...editWhats, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="promocao">Promoção</SelectItem><SelectItem value="transacional">Transacional</SelectItem><SelectItem value="recuperacao">Recuperação</SelectItem><SelectItem value="pos_venda">Pós-venda</SelectItem><SelectItem value="custom">Personalizado</SelectItem></SelectContent></Select><Textarea rows={6} value={editWhats.content || ''} onChange={(e) => setEditWhats({ ...editWhats, content: e.target.value })} placeholder="Mensagem do WhatsApp" /><div className="flex flex-wrap gap-2">{TEMPLATE_VARIABLES.map((v) => <Button key={v} variant="outline" size="sm" onClick={() => setEditWhats({ ...editWhats, content: `${editWhats.content || ''} ${v}`, variables: [...new Set([...(editWhats.variables || []), v])] })}><Copy className="h-3 w-3 mr-1" />{v}</Button>)}</div><div className="flex items-center gap-2"><Switch checked={editWhats.is_active ?? true} onCheckedChange={(v) => setEditWhats({ ...editWhats, is_active: v })} /><span className="text-sm">Ativo</span></div></div>}
          <DialogFooter><Button variant="outline" onClick={() => setEditWhats(null)}>Cancelar</Button><Button onClick={saveWhats}><Save className="h-4 w-4 mr-2" />Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Pré-visualização: {preview?.title}</DialogTitle></DialogHeader>
          {preview && (preview.channel === 'email' ? (
            <div className="space-y-3"><div className="bg-muted p-2 rounded text-sm"><strong>Assunto:</strong> {replaceVariables(preview.subject || '')}</div><div className="border rounded p-4 max-h-96 overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(preview.content)) }} /></div>
          ) : (
            <div className="max-w-sm mx-auto bg-[#075E54] rounded-2xl p-4"><div className="bg-[#DCF8C6] rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">{replaceVariables(preview.content)}<span className="block text-right text-[10px] text-gray-500 mt-1">12:00 ✓✓</span></div></div>
          ))}
          <DialogFooter><Button variant="outline" onClick={() => setPreview(null)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
