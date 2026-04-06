import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Mail, MessageSquare, Plus, Download, Upload, Sparkles,
  Search, ArrowUpDown, LayoutGrid, LayoutList,
  CheckCircle2, AlertTriangle, Activity, Workflow,
  ChevronDown, ChevronUp, Zap, Filter, Radio, Trash2,
} from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { SYSTEM_EVENTS } from '@/components/admin/templates/TemplateConstants';
import type { EmailTemplate, WhatsAppTemplate, Channel } from '@/components/admin/templates/TemplateConstants';
import { EmailTemplateCard, WhatsAppTemplateCard } from '@/components/admin/templates/TemplateCards';
import { EmailEditorDialog, WhatsAppEditorDialog, PreviewDialog, DeleteTemplateDialog, TestSendDialog } from '@/components/admin/templates/TemplateDialogs';
import { VisualWorkflowBuilder } from '@/components/admin/workflows';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

/* ─── Shared admin styles ─── */
const cardCls = "liquid-glass";
const inputCls = "liquid-input text-white";
const mutedText = "text-white/50";
const btnOutline = "border-white/10 bg-transparent text-white hover:bg-white/[0.06] transition-colors";

type PageTab = 'templates' | 'workflows';

const AdminEmailTemplatesPage = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('templates');
  const [channelTab, setChannelTab] = useState<'all' | 'email' | 'whatsapp'>('all');

  const tpl = useTemplates();

  // ─── Dialog State ───
  const [editEmail, setEditEmail] = useState<Partial<EmailTemplate> | null>(null);
  const [editWhats, setEditWhats] = useState<Partial<WhatsAppTemplate> | null>(null);
  const [preview, setPreview] = useState<{ channel: Channel; title: string; content: string; subject?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ channel: Channel; id: string; name: string } | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedWhats, setSelectedWhats] = useState<Set<string>>(new Set());
  const [testSend, setTestSend] = useState<{ channel: Channel; templateId: string; templateName: string } | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [emailCollapsed, setEmailCollapsed] = useState(false);
  const [whatsCollapsed, setWhatsCollapsed] = useState(false);

  // ─── Keyboard shortcut ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editEmail) handleSaveEmail();
        if (editWhats) handleSaveWhats();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // ─── Handlers ───
  const handleSaveEmail = useCallback(async () => {
    if (!editEmail) return;
    const ok = await tpl.saveEmail(editEmail);
    if (ok) setEditEmail(null);
  }, [editEmail, tpl]);

  const handleSaveWhats = useCallback(async () => {
    if (!editWhats) return;
    const ok = await tpl.saveWhats(editWhats);
    if (ok) setEditWhats(null);
  }, [editWhats, tpl]);

  const handleTestSend = useCallback(async (to: string) => {
    if (!testSend) return;
    setTestSending(true);
    const ok = await tpl.sendTest(testSend.channel, testSend.templateId, to);
    setTestSending(false);
    if (ok) setTestSend(null);
  }, [testSend, tpl]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await tpl.deleteTemplate(deleteTarget.channel, deleteTarget.id, deleteTarget.name);
    setDeleteTarget(null);
  }, [deleteTarget, tpl]);

  const handleBulk = useCallback(async (channel: Channel, action: 'activate' | 'deactivate' | 'delete') => {
    const ids = channel === 'email' ? [...selectedEmails] : [...selectedWhats];
    await tpl.bulkAction(channel, ids, action);
    if (channel === 'email') setSelectedEmails(new Set());
    else setSelectedWhats(new Set());
  }, [selectedEmails, selectedWhats, tpl]);

  const toggleSelect = useCallback((channel: Channel, id: string) => {
    if (channel === 'email') {
      setSelectedEmails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    } else {
      setSelectedWhats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
  }, []);

  const { metrics } = tpl;
  const totalSelected = selectedEmails.size + selectedWhats.size;
  const showEmail = channelTab === 'all' || channelTab === 'email';
  const showWhats = channelTab === 'all' || channelTab === 'whatsapp';

  return (
    <AdminLayout title="Comunicação & Automação" requireEditor>
      <div className="space-y-6">

        <AdminPageGuide
          title="📧 Guia de Comunicação & Automação"
          description="Gerencie templates de e-mail, WhatsApp e workflows automatizados."
          steps={[
            { title: "Criar template", description: "Clique em 'Novo Template' e escolha entre e-mail ou WhatsApp." },
            { title: "Variáveis dinâmicas", description: "Use variáveis como {{nome}}, {{pedido}} para personalizar mensagens automaticamente." },
            { title: "Pré-visualizar", description: "Clique no ícone de olho para ver como o template ficará antes de enviar." },
            { title: "Testar envio", description: "Envie uma mensagem de teste para validar formatação e conteúdo." },
            { title: "Workflows", description: "Na aba 'Workflows', crie automações visuais com gatilhos e ações encadeadas." },
          ]}
        />

        {/* ═══════════ HEADER ═══════════ */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Radio className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Comunicação & Automação</h1>
              <p className={`text-sm ${mutedText}`}>Central de templates, notificações e workflows</p>
            </div>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className={btnOutline} onClick={tpl.exportTemplates}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exportar templates</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className={btnOutline} onClick={tpl.importTemplates}>
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Importar templates</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ═══════════ TAB BAR (Templates / Workflows) ═══════════ */}
        <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
          <div className="flex">
            {([
              { key: 'templates' as PageTab, label: 'Templates', icon: Mail, desc: `${metrics.emailActive + metrics.whatsActive} ativos` },
              { key: 'workflows' as PageTab, label: 'Workflows', icon: Workflow, desc: 'Automações visuais' },
            ]).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-all border-b-2
                    ${isActive
                      ? 'border-[hsl(var(--admin-accent-purple))] bg-purple-500/[0.06] text-white'
                      : 'border-transparent text-white/50 hover:bg-white/3 hover:text-white'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : ''}`} />
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

        {/* ═══════════ TEMPLATES TAB ═══════════ */}
        {activeTab === 'templates' && (
          <div className="space-y-6">

            {/* ─── KPI Metrics ─── */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              <AdminSummaryCard title="E-mails Ativos" value={`${metrics.emailActive}/${metrics.emailTotal}`} icon={Mail} variant="blue" />
              <AdminSummaryCard title="WhatsApp Ativos" value={`${metrics.whatsActive}/${metrics.whatsTotal}`} icon={MessageSquare} variant="green" />
              <AdminSummaryCard title="Total de Envios" value={metrics.totalSends} icon={Activity} variant="purple" />
              <AdminSummaryCard title="Eventos Cobertos" value={`${metrics.coveredCount}/${SYSTEM_EVENTS.length}`} icon={CheckCircle2} variant="green" />
              <AdminSummaryCard
                title="Sem Template"
                value={metrics.uncoveredEvents.length}
                icon={AlertTriangle}
                variant={metrics.uncoveredEvents.length > 0 ? 'orange' : 'green'}
              />
            </div>

            {/* ─── Event Coverage Matrix ─── */}
            <Card className={`${cardCls} rounded-2xl`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple)/0.2)] to-[hsl(var(--admin-accent-pink)/0.1)] flex items-center justify-center border border-purple-500/20">
                      <Zap className="h-4.5 w-4.5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Matriz de Cobertura de Eventos</h3>
                      <p className={`text-[11px] ${mutedText}`}>{metrics.coveredCount}/{SYSTEM_EVENTS.length} eventos cobertos</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="admin-btn admin-btn-save h-7 text-xs !min-h-0 !px-2" onClick={tpl.installSuggestedEmails}>
                      <Sparkles className="h-3 w-3 mr-1.5" />Instalar e-mails
                    </Button>
                    <Button size="sm" className="admin-btn admin-btn-save h-7 text-xs !min-h-0 !px-2" onClick={tpl.installSuggestedWhats}>
                      <Sparkles className="h-3 w-3 mr-1.5" />Instalar WhatsApp
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {SYSTEM_EVENTS.map(ev => {
                    const hasEmail = tpl.emailTemplates.some(t => t.name === ev.value);
                    const hasWhats = tpl.whatsTemplates.some(t => t.name === ev.value);
                    const bothCovered = hasEmail && hasWhats;
                    const partial = hasEmail || hasWhats;
                    return (
                      <div
                        key={ev.value}
                        className={`p-3 rounded-xl border transition-all ${
                          bothCovered
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : partial
                              ? 'bg-amber-500/5 border-amber-500/20'
                              : 'bg-red-500/5 border-red-500/15'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{ev.icon}</span>
                          <span className="text-xs font-medium text-white truncate">{ev.label}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Badge className={`text-[9px] border-0 px-1.5 py-0 ${hasEmail ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-white/20'}`}>
                            <Mail className="h-2.5 w-2.5 mr-0.5" />{hasEmail ? '✓' : '✗'}
                          </Badge>
                          <Badge className={`text-[9px] border-0 px-1.5 py-0 ${hasWhats ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-white/20'}`}>
                            <MessageSquare className="h-2.5 w-2.5 mr-0.5" />{hasWhats ? '✓' : '✗'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* ─── Toolbar ─── */}
            <div className={`rounded-2xl border p-4 ${cardCls}`}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
                  <Input
                    placeholder="Buscar templates por nome, assunto ou conteúdo..."
                    value={tpl.searchQuery}
                    onChange={e => tpl.setSearchQuery(e.target.value)}
                    className={`pl-10 ${inputCls}`}
                  />
                </div>

                {/* Channel filter */}
                <Tabs value={channelTab} onValueChange={v => setChannelTab(v as any)}>
                  <TabsList className="admin-tabs-vivid bg-white/[0.03] border border-white/[0.08] h-9">
                    <TabsTrigger value="all" className="text-xs h-7 data-[state=active]:bg-purple-500/15 data-[state=active]:text-white">Todos</TabsTrigger>
                    <TabsTrigger value="email" className="text-xs h-7 gap-1 data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400">
                      <Mail className="h-3 w-3" />E-mail
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="text-xs h-7 gap-1 data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400">
                      <MessageSquare className="h-3 w-3" />WhatsApp
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Status filter */}
                <Select value={tpl.filterStatus} onValueChange={(v: any) => tpl.setFilterStatus(v)}>
                  <SelectTrigger className={`w-[120px] h-9 ${inputCls}`}>
                    <Filter className="h-3 w-3 mr-1.5" /><SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Button variant="outline" size="sm" className={`h-9 ${btnOutline}`} onClick={() => tpl.setSortAsc(!tpl.sortAsc)}>
                  <ArrowUpDown className="h-3 w-3 mr-1.5" />{tpl.sortAsc ? 'A→Z' : 'Z→A'}
                </Button>

                {/* View mode */}
                <div className="flex border rounded-lg overflow-hidden border-white/[0.08]">
                  <Button
                    variant="ghost" size="sm"
                    className={`h-9 rounded-none px-2.5 ${tpl.viewMode === 'grid' ? 'bg-purple-500/15 text-white' : `text-white/50 hover:text-white`}`}
                    onClick={() => tpl.setViewMode('grid')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className={`h-9 rounded-none px-2.5 ${tpl.viewMode === 'list' ? 'bg-purple-500/15 text-white' : `text-white/50 hover:text-white`}`}
                    onClick={() => tpl.setViewMode('list')}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Create buttons */}
                <div className="ml-auto flex gap-2">
                  {(channelTab === 'all' || channelTab === 'email') && (
                    <Button
                      onClick={() => setEditEmail({ name: '', subject: '', body: '', variables: [], is_active: true })}
                      className="admin-btn admin-btn-create h-9"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />Novo E-mail
                    </Button>
                  )}
                  {(channelTab === 'all' || channelTab === 'whatsapp') && (
                    <Button
                      onClick={() => setEditWhats({ name: '', category: 'transacional', content: '', variables: [], is_active: true })}
                      className="admin-btn admin-btn-create h-9"
                    >
                      <Plus className="h-4 w-4 mr-1.5" />Novo WhatsApp
                    </Button>
                  )}
                </div>
              </div>

              {/* Bulk actions bar */}
              {totalSelected > 0 && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                  <Badge className="bg-purple-500/15 text-purple-400 border-0">
                    {totalSelected} selecionado{totalSelected > 1 ? 's' : ''}
                  </Badge>
                  {selectedEmails.size > 0 && (
                    <>
                      <Button className="admin-btn admin-btn-save !min-h-0 !py-1 !px-3 text-xs" onClick={() => handleBulk('email', 'activate')}>Ativar</Button>
                      <Button className="admin-btn admin-btn-edit !min-h-0 !py-1 !px-3 text-xs" onClick={() => handleBulk('email', 'deactivate')}>Desativar</Button>
                      <Button className="admin-btn admin-btn-delete !min-h-0 !py-1 !px-3 text-xs" onClick={() => handleBulk('email', 'delete')}><Trash2 className="h-3 w-3 mr-1" />Deletar</Button>
                    </>
                  )}
                  {selectedWhats.size > 0 && (
                    <>
                      <div className="w-px h-4 bg-white/10" />
                      <Button className="admin-btn admin-btn-save !min-h-0 !py-1 !px-3 text-xs" onClick={() => handleBulk('whatsapp', 'activate')}>Ativar WA</Button>
                      <Button className="admin-btn admin-btn-delete !min-h-0 !py-1 !px-3 text-xs" onClick={() => handleBulk('whatsapp', 'delete')}><Trash2 className="h-3 w-3 mr-1" />Deletar WA</Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ═══════════ EMAIL TEMPLATES ═══════════ */}
            {showEmail && (
              <section>
                <button
                  className="flex items-center gap-3 w-full mb-3 group"
                  onClick={() => setEmailCollapsed(!emailCollapsed)}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Templates de E-mail</h2>
                  <Badge className="bg-blue-500/10 text-blue-400 border-0 text-xs">{tpl.filteredEmails.length}</Badge>
                  <div className="flex-1" />
                  {emailCollapsed ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronUp className="h-4 w-4 text-white/50" />}
                </button>

                {!emailCollapsed && (
                  tpl.loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white/[0.03] animate-pulse rounded-2xl border border-white/[0.08]" />
                      ))}
                    </div>
                  ) : tpl.filteredEmails.length === 0 ? (
                    <Card className={`${cardCls} rounded-2xl`}>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                          <Mail className="h-8 w-8 text-blue-400" />
                        </div>
                        <p className="text-white font-semibold mb-1">Nenhum template de e-mail</p>
                        <p className={`text-sm ${mutedText} mb-4`}>Comece instalando os templates sugeridos</p>
                        <Button onClick={tpl.installSuggestedEmails} className="admin-btn admin-btn-save">
                          <Sparkles className="h-4 w-4 mr-2" />Instalar templates padrão
                        </Button>
                      </CardContent>
                    </Card>
                  ) : tpl.viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tpl.filteredEmails.map(t => (
                        <EmailTemplateCard
                          key={t.id} t={t} viewMode={tpl.viewMode}
                          isSelected={selectedEmails.has(t.id)}
                          onSelect={() => toggleSelect('email', t.id)}
                          templateStats={tpl.templateStats}
                          workflowLinks={tpl.workflowLinks}
                          onPreview={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}
                          onEdit={() => setEditEmail(t)}
                          onTestSend={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })}
                          onDuplicate={() => setEditEmail({ name: `${t.name} (cópia)`, subject: t.subject, body: t.body, variables: t.variables, is_active: false })}
                          onCloneToWhats={() => { setEditWhats(tpl.cloneEmailToWhats(t)); }}
                          onDelete={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })}
                          onToggle={(v) => tpl.toggleTemplate('email', t.id, v)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tpl.filteredEmails.map(t => (
                        <EmailTemplateCard
                          key={t.id} t={t} viewMode={tpl.viewMode}
                          isSelected={selectedEmails.has(t.id)}
                          onSelect={() => toggleSelect('email', t.id)}
                          templateStats={tpl.templateStats}
                          workflowLinks={tpl.workflowLinks}
                          onPreview={() => setPreview({ channel: 'email', title: t.name, subject: t.subject, content: t.body })}
                          onEdit={() => setEditEmail(t)}
                          onTestSend={() => setTestSend({ channel: 'email', templateId: t.id, templateName: t.name })}
                          onDuplicate={() => setEditEmail({ name: `${t.name} (cópia)`, subject: t.subject, body: t.body, variables: t.variables, is_active: false })}
                          onCloneToWhats={() => { setEditWhats(tpl.cloneEmailToWhats(t)); }}
                          onDelete={() => setDeleteTarget({ channel: 'email', id: t.id, name: t.name })}
                          onToggle={(v) => tpl.toggleTemplate('email', t.id, v)}
                        />
                      ))}
                    </div>
                  )
                )}
              </section>
            )}

            {/* ═══════════ WHATSAPP TEMPLATES ═══════════ */}
            {showWhats && (
              <section>
                <button
                  className="flex items-center gap-3 w-full mb-3 group"
                  onClick={() => setWhatsCollapsed(!whatsCollapsed)}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 flex items-center justify-center border border-green-500/20">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Templates WhatsApp</h2>
                  <Badge className="bg-green-500/10 text-green-400 border-0 text-xs">{tpl.filteredWhats.length}</Badge>
                  <div className="flex-1" />
                  {whatsCollapsed ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronUp className="h-4 w-4 text-white/50" />}
                </button>

                {!whatsCollapsed && (
                  tpl.loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white/[0.03] animate-pulse rounded-2xl border border-white/[0.08]" />
                      ))}
                    </div>
                  ) : tpl.filteredWhats.length === 0 ? (
                    <Card className={`${cardCls} rounded-2xl`}>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                          <MessageSquare className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-white font-semibold mb-1">Nenhum template WhatsApp</p>
                        <p className={`text-sm ${mutedText} mb-4`}>Comece instalando os templates sugeridos</p>
                        <Button onClick={tpl.installSuggestedWhats} className="admin-btn admin-btn-save">
                          <Sparkles className="h-4 w-4 mr-2" />Instalar templates padrão
                        </Button>
                      </CardContent>
                    </Card>
                  ) : tpl.viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {tpl.filteredWhats.map(t => (
                        <WhatsAppTemplateCard
                          key={t.id} t={t} viewMode={tpl.viewMode}
                          isSelected={selectedWhats.has(t.id)}
                          onSelect={() => toggleSelect('whatsapp', t.id)}
                          templateStats={tpl.templateStats}
                          workflowLinks={tpl.workflowLinks}
                          onPreview={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}
                          onEdit={() => setEditWhats(t)}
                          onTestSend={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })}
                          onDuplicate={() => setEditWhats({ name: `${t.name} (cópia)`, category: t.category, content: t.content, variables: t.variables, is_active: false })}
                          onCloneToEmail={() => { setEditEmail(tpl.cloneWhatsToEmail(t)); }}
                          onDelete={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })}
                          onToggle={(v) => tpl.toggleTemplate('whatsapp', t.id, v)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tpl.filteredWhats.map(t => (
                        <WhatsAppTemplateCard
                          key={t.id} t={t} viewMode={tpl.viewMode}
                          isSelected={selectedWhats.has(t.id)}
                          onSelect={() => toggleSelect('whatsapp', t.id)}
                          templateStats={tpl.templateStats}
                          workflowLinks={tpl.workflowLinks}
                          onPreview={() => setPreview({ channel: 'whatsapp', title: t.name, content: t.content })}
                          onEdit={() => setEditWhats(t)}
                          onTestSend={() => setTestSend({ channel: 'whatsapp', templateId: t.id, templateName: t.name })}
                          onDuplicate={() => setEditWhats({ name: `${t.name} (cópia)`, category: t.category, content: t.content, variables: t.variables, is_active: false })}
                          onCloneToEmail={() => { setEditEmail(tpl.cloneWhatsToEmail(t)); }}
                          onDelete={() => setDeleteTarget({ channel: 'whatsapp', id: t.id, name: t.name })}
                          onToggle={(v) => tpl.toggleTemplate('whatsapp', t.id, v)}
                        />
                      ))}
                    </div>
                  )
                )}
              </section>
            )}
          </div>
        )}

        {/* ═══════════ WORKFLOWS TAB ═══════════ */}
        {activeTab === 'workflows' && <VisualWorkflowBuilder />}
      </div>

      {/* ═══════════ DIALOGS ═══════════ */}
      <EmailEditorDialog editEmail={editEmail} setEditEmail={setEditEmail} onSave={handleSaveEmail} />
      <WhatsAppEditorDialog editWhats={editWhats} setEditWhats={setEditWhats} onSave={handleSaveWhats} />
      <PreviewDialog preview={preview} setPreview={() => setPreview(null)} />
      <DeleteTemplateDialog deleteTarget={deleteTarget} setDeleteTarget={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      <TestSendDialog testSend={testSend} setTestSend={() => setTestSend(null)} onSend={handleTestSend} isSending={testSending} />
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
