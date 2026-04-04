import { useEffect, useMemo, useState, useCallback } from 'react';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Mail, MessageSquare, Plus, Download, Upload, Sparkles,
  Search, Filter, ArrowUpDown, LayoutGrid, LayoutList,
  CheckCircle2, AlertTriangle, Activity, Workflow, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  EmailTemplate, WhatsAppTemplate, Channel, PageTab, ViewMode, SortField,
  SYSTEM_EVENTS, detectVariables, replaceVariables, cardCls, mutedText, inputCls,
} from '@/components/admin/templates/TemplateConstants';
import { SUGGESTED_EMAIL_TEMPLATES, SUGGESTED_WHATSAPP_TEMPLATES } from '@/components/admin/templates/SuggestedTemplates';
import { EmailTemplateCard, WhatsAppTemplateCard } from '@/components/admin/templates/TemplateCards';
import { EmailEditorDialog, WhatsAppEditorDialog, PreviewDialog, DeleteTemplateDialog, TestSendDialog } from '@/components/admin/templates/TemplateDialogs';

const btnOutline = "border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]";

const AdminEmailTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('templates');
  const [loading, setLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [whatsTemplates, setWhatsTemplates] = useState<WhatsAppTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [editEmail, setEditEmail] = useState<Partial<EmailTemplate> | null>(null);
  const [editWhats, setEditWhats] = useState<Partial<WhatsAppTemplate> | null>(null);
  const [preview, setPreview] = useState<{ channel: Channel; title: string; content: string; subject?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ channel: Channel; id: string; name: string } | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedWhats, setSelectedWhats] = useState<Set<string>>(new Set());
  const [testSend, setTestSend] = useState<{ channel: Channel; templateId: string; templateName: string } | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [templateStats, setTemplateStats] = useState<Record<string, number>>({});
  const [workflowLinks, setWorkflowLinks] = useState<Record<string, string[]>>({});
  const [emailCollapsed, setEmailCollapsed] = useState(false);
  const [whatsCollapsed, setWhatsCollapsed] = useState(false);

  // ─── Data Loading ───
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

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from('webhook_logs').select('event_type').eq('direction', 'outbound').eq('endpoint', 'notify-customer').eq('processed', true);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((log: any) => { counts[log.event_type || ''] = (counts[log.event_type || ''] || 0) + 1; });
      setTemplateStats(counts);
    }
  }, []);

  const loadWorkflowLinks = useCallback(async () => {
    const { data } = await supabase.from('automation_workflows').select('id, name, steps');
    if (data) {
      const links: Record<string, string[]> = {};
      data.forEach((wf: any) => {
        ((wf.steps || []) as any[]).forEach((s: any) => {
          const tplId = s.template_id || s.template_name;
          if (tplId) { if (!links[tplId]) links[tplId] = []; links[tplId].push(wf.name); }
        });
      });
      setWorkflowLinks(links);
    }
  }, []);

  useEffect(() => { loadData(); loadStats(); loadWorkflowLinks(); }, [loadData, loadStats, loadWorkflowLinks]);

  // Keyboard shortcuts
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

  // ─── Filtered Data ───
  const filteredEmails = useMemo(() => {
    let list = emailTemplates;
    if (searchQuery) list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus === 'active') list = list.filter(t => t.is_active);
    if (filterStatus === 'inactive') list = list.filter(t => !t.is_active);
    return [...list].sort((a, b) => { const va = (a as any)[sortField] || ''; const vb = (b as any)[sortField] || ''; return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)); });
  }, [emailTemplates, searchQuery, filterStatus, sortField, sortAsc]);

  const filteredWhats = useMemo(() => {
    let list = whatsTemplates;
    if (searchQuery) list = list.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus === 'active') list = list.filter(t => t.is_active);
    if (filterStatus === 'inactive') list = list.filter(t => !t.is_active);
    return [...list].sort((a, b) => { const va = (a as any)[sortField] || ''; const vb = (b as any)[sortField] || ''; return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)); });
  }, [whatsTemplates, searchQuery, filterStatus, sortField, sortAsc]);

  const metrics = useMemo(() => {
    const emailActive = emailTemplates.filter(t => t.is_active).length;
    const whatsActive = whatsTemplates.filter(t => t.is_active).length;
    const totalSends = Object.values(templateStats).reduce((a, b) => a + b, 0);
    const eventsWithTemplate = SYSTEM_EVENTS.filter(ev => emailTemplates.some(t => t.name === ev.value) || whatsTemplates.some(t => t.name === ev.value)).length;
    const eventsMissing = SYSTEM_EVENTS.length - eventsWithTemplate;
    return { emailActive, whatsActive, totalSends, eventsWithTemplate, eventsMissing };
  }, [emailTemplates, whatsTemplates, templateStats]);

  // ─── CRUD Operations ───
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

  const saveWhats = async () => {
    if (!editWhats?.name || !editWhats?.content) return toast.error('Preencha nome e mensagem');
    const autoVars = detectVariables(editWhats.content);
    const payload = { name: editWhats.name, category: editWhats.category || 'transacional', message_text: editWhats.content, variables: autoVars, is_active: editWhats.is_active ?? true };
    const action = editWhats.id ? supabase.from('whatsapp_templates').update(payload).eq('id', editWhats.id) : supabase.from('whatsapp_templates').insert(payload as any);
    const { error } = await action;
    if (error) return toast.error('Erro ao salvar template');
    toast.success('Template WhatsApp salvo');
    setEditWhats(null);
    loadData();
  };

  const toggle = async (channel: Channel, id: string, isActive: boolean) => {
    const { error } = channel === 'email'
      ? await supabase.from('email_templates').update({ is_active: isActive }).eq('id', id)
      : await supabase.from('whatsapp_templates').update({ is_active: isActive }).eq('id', id);
    if (error) return toast.error('Erro ao atualizar');
    loadData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = deleteTarget.channel === 'email'
      ? await supabase.from('email_templates').delete().eq('id', deleteTarget.id)
      : await supabase.from('whatsapp_templates').delete().eq('id', deleteTarget.id);
    if (error) return toast.error('Erro ao excluir');
    toast.success(`"${deleteTarget.name}" excluído`);
    setDeleteTarget(null);
    loadData();
  };

  const bulkAction = async (channel: Channel, action: 'activate' | 'deactivate' | 'delete') => {
    const ids = channel === 'email' ? [...selectedEmails] : [...selectedWhats];
    if (ids.length === 0) return toast.error('Selecione pelo menos um');
    const table = channel === 'email' ? 'email_templates' : 'whatsapp_templates';
    if (action === 'delete') { await supabase.from(table).delete().in('id', ids); toast.success(`${ids.length} excluídos`); }
    else { const isActive = action === 'activate'; await supabase.from(table).update({ is_active: isActive }).in('id', ids); toast.success(`${ids.length} ${isActive ? 'ativados' : 'desativados'}`); }
    setSelectedEmails(new Set());
    setSelectedWhats(new Set());
    loadData();
  };

  const handleTestSend = async (to: string) => {
    if (!testSend || !to) return toast.error('Informe o destinatário');
    setTestSending(true);
    try {
      if (testSend.channel === 'email') {
        const tpl = emailTemplates.find(t => t.id === testSend.templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const { data, error } = await supabase.functions.invoke('send-email', { body: { action: 'send', to, subject: `[TESTE] ${replaceVariables(tpl.subject)}`, html: replaceVariables(tpl.body) } });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Falha');
        toast.success(`E-mail de teste enviado para ${to}`);
      } else {
        const tpl = whatsTemplates.find(t => t.id === testSend.templateId);
        if (!tpl) throw new Error('Template não encontrado');
        const phone = to.replace(/\D/g, '');
        const { data, error } = await supabase.functions.invoke('whatsapp-evolution', { body: { action: 'sendText', number: phone.startsWith('55') ? phone : `55${phone}`, text: `[TESTE] ${replaceVariables(tpl.content)}`, recipientName: 'Teste' } });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Falha');
        toast.success(`WhatsApp de teste enviado`);
      }
    } catch (e: any) { toast.error(`Erro: ${e.message}`); }
    finally { setTestSending(false); setTestSend(null); }
  };

  const duplicateEmail = (t: EmailTemplate) => setEditEmail({ name: `${t.name} (cópia)`, subject: t.subject, body: t.body, variables: t.variables, is_active: false });
  const duplicateWhats = (t: WhatsAppTemplate) => setEditWhats({ name: `${t.name} (cópia)`, category: t.category, content: t.content, variables: t.variables, is_active: false });
  const cloneEmailToWhats = (t: EmailTemplate) => { setEditWhats({ name: t.name, category: 'transacional', content: t.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 1600), variables: t.variables, is_active: false }); toast.info('Convertido para WhatsApp'); };
  const cloneWhatsToEmail = (t: WhatsAppTemplate) => { setEditEmail({ name: t.name, subject: `${t.name} — {{order_number}}`, body: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;"><div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">${t.content.split('\n').map(l => `<p>${l}</p>`).join('')}</div></div>`, variables: t.variables, is_active: false }); toast.info('Convertido para E-mail'); };

  const exportTemplates = () => {
    const blob = new Blob([JSON.stringify({ email_templates: emailTemplates.map(({ id, ...r }) => r), whatsapp_templates: whatsTemplates.map(({ id, ...r }) => r), exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `templates-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    toast.success('Exportado');
  };

  const importTemplates = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      try {
        const data = JSON.parse(await file.text()); let imported = 0;
        if (data.email_templates?.length) for (const t of data.email_templates) { const { error } = await supabase.from('email_templates').insert({ name: t.name, subject: t.subject, body: t.body, variables: t.variables || [], is_active: t.is_active ?? true }); if (!error) imported++; }
        if (data.whatsapp_templates?.length) for (const t of data.whatsapp_templates) { const { error } = await supabase.from('whatsapp_templates').insert({ name: t.name, category: t.category || 'custom', message_text: t.content || t.message_text || '', variables: t.variables || [], is_active: t.is_active ?? true } as any); if (!error) imported++; }
        toast.success(`${imported} importados`); loadData();
      } catch { toast.error('Arquivo inválido'); }
    };
    input.click();
  };

  const installSuggestedEmails = async () => { let n = 0; for (const t of SUGGESTED_EMAIL_TEMPLATES) { if (!emailTemplates.some(e => e.name === t.name)) { const { error } = await supabase.from('email_templates').insert({ name: t.name, subject: t.subject, body: t.body, variables: t.variables, is_active: true }); if (!error) n++; } } toast.success(`${n} e-mails instalados`); loadData(); };
  const installSuggestedWhats = async () => { const mapped = SUGGESTED_WHATSAPP_TEMPLATES.map(t => ({ name: t.name, category: t.category, message_text: t.content, variables: t.variables, is_active: true })); await supabase.from('whatsapp_templates').upsert(mapped as any, { onConflict: 'name', ignoreDuplicates: true }); toast.success('WhatsApp sugeridos instalados'); loadData(); };

  const tabs: { key: PageTab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'templates', label: 'Templates', icon: Mail, desc: `${metrics.emailActive + metrics.whatsActive} ativos` },
    { key: 'workflows', label: 'Workflows', icon: Workflow, desc: 'Automações' },
  ];

  return (
    <AdminLayout title="Comunicação & Automação" requireEditor>
      {/* ─── Header ─── */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center"><Mail className="h-5 w-5 text-blue-400" /></div>
              Comunicação & Automação
            </h1>
            <p className={`${mutedText} mt-1 text-sm`}>Templates de e-mail, WhatsApp e workflows de automação</p>
          </div>
        </div>

        {/* ─── Tab Bar ─── */}
        <div className={`rounded-xl border overflow-hidden ${cardCls}`}>
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
            {/* ─── Metrics ─── */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <AdminSummaryCard title="E-mails Ativos" value={metrics.emailActive} icon={Mail} variant="blue" />
              <AdminSummaryCard title="WhatsApp Ativos" value={metrics.whatsActive} icon={MessageSquare} variant="green" />
              <AdminSummaryCard title="Total de Envios" value={metrics.totalSends} icon={Activity} variant="purple" />
              <AdminSummaryCard title="Eventos Cobertos" value={`${metrics.eventsWithTemplate}/${SYSTEM_EVENTS.length}`} icon={CheckCircle2} variant="green" />
              <AdminSummaryCard title="Sem Template" value={metrics.eventsMissing} icon={AlertTriangle} variant={metrics.eventsMissing > 0 ? 'orange' : 'green'} />
            </div>

            {/* Missing events alert */}
            {metrics.eventsMissing > 0 && (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0"><AlertTriangle className="h-5 w-5 text-amber-400" /></div>
                    <div>
                      <p className="text-sm font-semibold text-amber-300">Eventos sem template configurado</p>
                      <p className={`text-xs ${mutedText} mb-2`}>O sistema usa fallback genérico.</p>
                      <div className="flex flex-wrap gap-2">
                        {SYSTEM_EVENTS.filter(ev => !emailTemplates.some(t => t.name === ev.value) && !whatsTemplates.some(t => t.name === ev.value)).map(ev => (
                          <Badge key={ev.value} className="bg-[hsl(var(--admin-bg))] text-white border-0 text-xs">{ev.icon} {ev.label}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ─── Toolbar ─── */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
                <Input placeholder="Buscar templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`pl-9 ${inputCls}`} />
              </div>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className={`w-[130px] ${inputCls}`}><Filter className="h-3 w-3 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Ativos</SelectItem><SelectItem value="inactive">Inativos</SelectItem></SelectContent>
              </Select>
              <Button variant="outline" size="sm" className={btnOutline} onClick={() => setSortAsc(!sortAsc)}><ArrowUpDown className="h-3 w-3 mr-1" />{sortAsc ? 'A→Z' : 'Z→A'}</Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" className={viewMode !== 'grid' ? btnOutline : ''} onClick={() => setViewMode('grid')}><LayoutGrid className="h-3 w-3" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" className={viewMode !== 'list' ? btnOutline : ''} onClick={() => setViewMode('list')}><LayoutList className="h-3 w-3" /></Button>
              <div className="ml-auto flex gap-2">
                <Button onClick={() => setEditEmail({ name: '', subject: '', body: '', variables: [], is_active: true })} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white"><Plus className="h-4 w-4 mr-2" />E-mail</Button>
                <Button variant="outline" className={btnOutline} onClick={() => setEditWhats({ name: '', category: 'transacional', content: '', variables: [], is_active: true })}><Plus className="h-4 w-4 mr-2" />WhatsApp</Button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className={btnOutline} onClick={installSuggestedEmails}><Sparkles className="h-3 w-3 mr-1" />E-mails sugeridos</Button>
              <Button variant="outline" size="sm" className={btnOutline} onClick={installSuggestedWhats}><Sparkles className="h-3 w-3 mr-1" />WhatsApp sugeridos</Button>
              <Button variant="outline" size="sm" className={btnOutline} onClick={exportTemplates}><Download className="h-3 w-3 mr-1" />Exportar</Button>
              <Button variant="outline" size="sm" className={btnOutline} onClick={importTemplates}><Upload className="h-3 w-3 mr-1" />Importar</Button>
              {(selectedEmails.size > 0 || selectedWhats.size > 0) && (
                <>
                  <div className="w-px h-6 bg-[hsl(var(--admin-card-border))] self-center" />
                  <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-0">{selectedEmails.size + selectedWhats.size} selecionados</Badge>
                  {selectedEmails.size > 0 && (<><Button variant="outline" size="sm" className={btnOutline} onClick={() => bulkAction('email', 'activate')}>Ativar</Button><Button variant="outline" size="sm" className={btnOutline} onClick={() => bulkAction('email', 'deactivate')}>Desativar</Button><Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => bulkAction('email', 'delete')}>Excluir</Button></>)}
                  {selectedWhats.size > 0 && (<><Button variant="outline" size="sm" className={btnOutline} onClick={() => bulkAction('whatsapp', 'activate')}>Ativar WA</Button><Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => bulkAction('whatsapp', 'delete')}>Excluir WA</Button></>)}
                </>
              )}
            </div>

            {/* ─── Email Templates Section ─── */}
            <Card className={cardCls}>
              <CardHeader className="cursor-pointer p-4" onClick={() => setEmailCollapsed(!emailCollapsed)}>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center"><Mail className="h-4 w-4 text-blue-400" /></div>
                  Templates de E-mail ({filteredEmails.length})
                  {emailCollapsed ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
                </CardTitle>
              </CardHeader>
              {!emailCollapsed && (
                <CardContent className="p-4 pt-0">
                  {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[hsl(var(--admin-bg))] animate-pulse rounded-xl" />)}</div>
                  : filteredEmails.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3"><Mail className="h-8 w-8 text-blue-400" /></div>
                      <p className="text-white font-medium">Nenhum template de e-mail</p>
                      <Button size="sm" className="mt-3" onClick={installSuggestedEmails}><Sparkles className="h-3 w-3 mr-1" />Instalar padrão</Button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredEmails.map(t => <EmailTemplateCard key={t.id} t={t} viewMode={viewMode} isSelected={selectedEmails.has(t.id)} onSelect={() => setSelectedEmails(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} templateStats={templateStats} workflowLinks={workflowLinks} onPreview={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })} onEdit={() => setEditEmail(t)} onTestSend={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })} onDuplicate={() => duplicateEmail(t)} onCloneToWhats={() => cloneEmailToWhats(t)} onDelete={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })} onToggle={(v) => toggle('email', t.id, v)} />)}
                    </div>
                  ) : (
                    <div className="space-y-2">{filteredEmails.map(t => <EmailTemplateCard key={t.id} t={t} viewMode={viewMode} isSelected={selectedEmails.has(t.id)} onSelect={() => setSelectedEmails(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} templateStats={templateStats} workflowLinks={workflowLinks} onPreview={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })} onEdit={() => setEditEmail(t)} onTestSend={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })} onDuplicate={() => duplicateEmail(t)} onCloneToWhats={() => cloneEmailToWhats(t)} onDelete={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })} onToggle={(v) => toggle('email', t.id, v)} />)}</div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* ─── WhatsApp Templates Section ─── */}
            <Card className={cardCls}>
              <CardHeader className="cursor-pointer p-4" onClick={() => setWhatsCollapsed(!whatsCollapsed)}>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-green-400" /></div>
                  Templates WhatsApp ({filteredWhats.length})
                  {whatsCollapsed ? <ChevronDown className="h-4 w-4 ml-auto" /> : <ChevronUp className="h-4 w-4 ml-auto" />}
                </CardTitle>
              </CardHeader>
              {!whatsCollapsed && (
                <CardContent className="p-4 pt-0">
                  {loading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[hsl(var(--admin-bg))] animate-pulse rounded-xl" />)}</div>
                  : filteredWhats.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-3"><MessageSquare className="h-8 w-8 text-green-400" /></div>
                      <p className="text-white font-medium">Nenhum template WhatsApp</p>
                      <Button size="sm" className="mt-3" onClick={installSuggestedWhats}><Sparkles className="h-3 w-3 mr-1" />Instalar padrão</Button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredWhats.map(t => <WhatsAppTemplateCard key={t.id} t={t} viewMode={viewMode} isSelected={selectedWhats.has(t.id)} onSelect={() => setSelectedWhats(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} templateStats={templateStats} workflowLinks={workflowLinks} onPreview={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })} onEdit={() => setEditWhats(t)} onTestSend={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })} onDuplicate={() => duplicateWhats(t)} onCloneToEmail={() => cloneWhatsToEmail(t)} onDelete={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })} onToggle={(v) => toggle('whatsapp', t.id, v)} />)}
                    </div>
                  ) : (
                    <div className="space-y-2">{filteredWhats.map(t => <WhatsAppTemplateCard key={t.id} t={t} viewMode={viewMode} isSelected={selectedWhats.has(t.id)} onSelect={() => setSelectedWhats(prev => { const n = new Set(prev); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })} templateStats={templateStats} workflowLinks={workflowLinks} onPreview={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })} onEdit={() => setEditWhats(t)} onTestSend={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })} onDuplicate={() => duplicateWhats(t)} onCloneToEmail={() => cloneWhatsToEmail(t)} onDelete={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })} onToggle={(v) => toggle('whatsapp', t.id, v)} />)}</div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'workflows' && <VisualWorkflowBuilder />}
      </div>

      {/* ─── Dialogs ─── */}
      <EmailEditorDialog editEmail={editEmail} setEditEmail={setEditEmail} onSave={saveEmail} />
      <WhatsAppEditorDialog editWhats={editWhats} setEditWhats={setEditWhats} onSave={saveWhats} />
      <PreviewDialog preview={preview} setPreview={() => setPreview(null)} />
      <DeleteTemplateDialog deleteTarget={deleteTarget} setDeleteTarget={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      <TestSendDialog testSend={testSend} setTestSend={() => setTestSend(null)} onSend={handleTestSend} isSending={testSending} />
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
