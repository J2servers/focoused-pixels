import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSummaryCard, AdminStatusBadge } from '@/components/admin';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreVertical, Trash2, Mail, Phone, Users, UserCheck, UserX,
  Download, Tag, TrendingUp, Globe, MessageSquare, Sparkles, BarChart3,
} from 'lucide-react';
import { useLeads, useUpdateLead, useDeleteLead, Lead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminLeadsPage = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterSubscribed, setFilterSubscribed] = useState<string>('all');

  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const subscribedCount = useMemo(() => leads.filter(l => l.is_subscribed).length, [leads]);
  const unsubscribedCount = useMemo(() => leads.filter(l => !l.is_subscribed).length, [leads]);
  const recentLeads = useMemo(() => leads.filter(l => isAfter(new Date(l.created_at), subDays(new Date(), 7))).length, [leads]);
  const withPhoneCount = useMemo(() => leads.filter(l => l.phone).length, [leads]);

  // Source distribution
  const sourceDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { map[l.source] = (map[l.source] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [leads]);

  // Tag distribution
  const tagDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => l.tags?.forEach(t => { map[t] = (map[t] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [leads]);

  // Conversion rate (subscribed/total)
  const conversionRate = leads.length > 0 ? Math.round((subscribedCount / leads.length) * 100) : 0;

  const filteredLeads = useMemo(() => {
    if (filterSubscribed === 'all') return leads;
    return leads.filter(l => filterSubscribed === 'subscribed' ? l.is_subscribed : !l.is_subscribed);
  }, [leads, filterSubscribed]);

  const handleToggleSubscription = async (lead: Lead) => {
    try {
      await updateLead.mutateAsync({ id: lead.id, updates: { is_subscribed: !lead.is_subscribed, unsubscribed_at: !lead.is_subscribed ? null : new Date().toISOString() } });
      toast.success(lead.is_subscribed ? 'Inscrição cancelada' : 'Lead reativado');
    } catch { toast.error('Erro ao atualizar lead'); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { await deleteLead.mutateAsync(deleteId); setDeleteId(null); } catch { toast.error('Erro ao remover lead'); } };

  const handleBulkDelete = async () => {
    try { await Promise.all(selectedLeads.map(id => deleteLead.mutateAsync(id))); toast.success(`${selectedLeads.length} leads removidos`); setSelectedLeads([]); }
    catch { toast.error('Erro ao remover leads'); }
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Origem', 'Inscrito', 'Tags', 'Data'];
    const rows = filteredLeads.map(lead => [lead.name, lead.email, lead.phone || '', lead.source, lead.is_subscribed ? 'Sim' : 'Não', (lead.tags || []).join(';'), format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`; link.click();
    toast.success('CSV exportado!');
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name', header: 'Contato', sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{lead.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{lead.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-white/50 flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
            </div>
            {lead.phone && <span className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{lead.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'source', header: 'Origem', sortable: true,
      render: (lead) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-500/15 flex items-center justify-center">
            <Globe className="h-3 w-3 text-purple-400" />
          </div>
          <span className="text-sm text-white">{lead.source}</span>
        </div>
      ),
    },
    {
      key: 'tags', header: 'Tags',
      render: (lead) => (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {(lead.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {tag}
            </span>
          ))}
          {(lead.tags || []).length > 3 && <span className="text-[10px] text-white/50">+{lead.tags.length - 3}</span>}
        </div>
      ),
    },
    {
      key: 'is_subscribed', header: 'Status', sortable: true,
      render: (lead) => <AdminStatusBadge label={lead.is_subscribed ? 'Inscrito' : 'Cancelado'} variant={lead.is_subscribed ? 'success' : 'danger'} />,
    },
    {
      key: 'created_at', header: 'Cadastro', sortable: true,
      render: (lead) => {
        const isRecent = isAfter(new Date(lead.created_at), subDays(new Date(), 1));
        return (
          <div>
            <span className="text-sm text-white/50">{format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
            {isRecent && <Badge className="ml-2 text-[9px] bg-green-500/20 text-green-400 border-0">Novo</Badge>}
          </div>
        );
      },
    },
    {
      key: 'actions', header: '', className: 'w-12',
      render: (lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06]"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="liquid-glass text-white">
            <DropdownMenuItem onClick={() => handleToggleSubscription(lead)} className="hover:bg-white/[0.06]">
              {lead.is_subscribed ? <><UserX className="h-4 w-4 mr-2" />Cancelar Inscrição</> : <><UserCheck className="h-4 w-4 mr-2" />Reativar</>}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10" onClick={() => setDeleteId(lead.id)}><Trash2 className="h-4 w-4 mr-2" />Remover</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filterButtons = (
    <div className="flex gap-2">
      {[
        { value: 'all', label: 'Todos' },
        { value: 'subscribed', label: 'Inscritos', icon: UserCheck },
        { value: 'unsubscribed', label: 'Cancelados', icon: UserX },
      ].map(f => (
        <Button key={f.value} variant={filterSubscribed === f.value ? 'default' : 'outline'} size="sm" onClick={() => setFilterSubscribed(f.value)}
          className={filterSubscribed === f.value ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "border-white/[0.08] bg-transparent text-white/50 hover:bg-white/[0.06] hover:text-white"}>
          {f.icon && <f.icon className="h-4 w-4 mr-1" />}{f.label}
        </Button>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Leads">
      <div className="space-y-6">
        <AdminPageGuide
          title="👥 Guia de Leads"
          description="Gerencie contatos capturados e acompanhe conversões."
          steps={[
            { title: "Visualizar leads", description: "Todos os contatos capturados por formulários e pop-ups aparecem listados aqui." },
            { title: "Filtrar status", description: "Filtre entre todos, inscritos ou desinscritos na newsletter." },
            { title: "Ações em massa", description: "Selecione múltiplos leads para aplicar tags ou excluir em lote." },
            { title: "Exportar lista", description: "Exporte a lista de leads em CSV para usar em ferramentas de e-mail marketing." },
            { title: "Editar lead", description: "Clique em um lead para editar nome, e-mail, telefone e tags." },
          ]}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminSummaryCard title="Total de Leads" value={leads.length} icon={Users} variant="purple" />
          <AdminSummaryCard title="Inscritos" value={subscribedCount} icon={UserCheck} variant="green" />
          <AdminSummaryCard title="Cancelados" value={unsubscribedCount} icon={UserX} variant="orange" />
          <AdminSummaryCard title="Últimos 7 dias" value={recentLeads} icon={TrendingUp} variant="blue" />
          <AdminSummaryCard title="Com Telefone" value={withPhoneCount} icon={Phone} variant="purple" />
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Conversion Rate */}
          <Card className="liquid-glass">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Taxa de Inscrição</h3>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white">{conversionRate}%</span>
                <span className="text-xs text-white/50 mb-1">dos leads estão inscritos</span>
              </div>
              <Progress value={conversionRate} className="h-2 mt-3 bg-white/[0.03]" />
            </CardContent>
          </Card>

          {/* Source Distribution */}
          <Card className="liquid-glass">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Origens</h3>
              </div>
              {sourceDistribution.length === 0 ? (
                <p className="text-sm text-white/50 text-center py-3">Sem dados</p>
              ) : (
                <div className="space-y-2">
                  {sourceDistribution.map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-xs text-white">{source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.03] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${(count / leads.length) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-white/50 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tag Cloud */}
          <Card className="liquid-glass">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Tags Populares</h3>
              </div>
              {tagDistribution.length === 0 ? (
                <p className="text-sm text-white/50 text-center py-3">Sem tags</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tagDistribution.map(([tag, count]) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {tag} <span className="text-white/50">({count})</span>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <span className="text-sm font-medium text-white">{selectedLeads.length} lead(s) selecionado(s)</span>
            <Button className="admin-btn admin-btn-delete" size="sm" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-2" />Deletar Selecionados</Button>
          </div>
        )}

        {/* Table */}
        <DataTable
          data={filteredLeads}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por nome, email ou telefone..."
          selectable
          selectedItems={selectedLeads}
          onSelectionChange={setSelectedLeads}
          emptyMessage="Nenhum lead encontrado"
          filterContent={filterButtons}
          actions={
            <Button onClick={handleExportCSV} className="admin-btn admin-btn-view">
              <Download className="h-4 w-4 mr-2" />Exportar CSV
            </Button>
          }
        />
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="liquid-glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="admin-btn admin-btn-delete"><Trash2 className="h-4 w-4 mr-1" />Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminLeadsPage;
