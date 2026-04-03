import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSummaryCard, AdminStatusBadge } from '@/components/admin';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreVertical, 
  Trash2, 
  Mail, 
  Phone, 
  Users, 
  UserCheck, 
  UserX,
  Download,
  Tag,
} from 'lucide-react';
import { useLeads, useUpdateLead, useDeleteLead, Lead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminLeadsPage = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterSubscribed, setFilterSubscribed] = useState<string>('all');

  const { data: leads = [], isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const subscribedCount = useMemo(() => leads.filter(l => l.is_subscribed).length, [leads]);
  const unsubscribedCount = useMemo(() => leads.filter(l => !l.is_subscribed).length, [leads]);

  const filteredLeads = useMemo(() => {
    if (filterSubscribed === 'all') return leads;
    return leads.filter(l => filterSubscribed === 'subscribed' ? l.is_subscribed : !l.is_subscribed);
  }, [leads, filterSubscribed]);

  const handleToggleSubscription = async (lead: Lead) => {
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: {
          is_subscribed: !lead.is_subscribed,
          unsubscribed_at: !lead.is_subscribed ? null : new Date().toISOString(),
        },
      });
      toast.success(lead.is_subscribed ? 'Lead cancelou inscrição' : 'Lead reativado');
    } catch {
      toast.error('Erro ao atualizar lead');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLead.mutateAsync(deleteId);
      toast.success('Lead removido com sucesso');
      setDeleteId(null);
    } catch {
      toast.error('Erro ao remover lead');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedLeads.map(id => deleteLead.mutateAsync(id)));
      toast.success(`${selectedLeads.length} leads removidos`);
      setSelectedLeads([]);
    } catch {
      toast.error('Erro ao remover leads');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Origem', 'Inscrito', 'Data de Cadastro'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.source,
      lead.is_subscribed ? 'Sim' : 'Não',
      format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('CSV exportado com sucesso!');
  };

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Contato',
      sortable: true,
      render: (lead) => (
        <div className="space-y-1">
          <p className="font-medium text-white">{lead.name}</p>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--admin-text-muted))]">
            <Mail className="h-3 w-3" />
            {lead.email}
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1 text-xs text-[hsl(var(--admin-text-muted))]">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Origem',
      sortable: true,
      render: (lead) => (
        <Badge variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))]">
          {lead.source}
        </Badge>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (lead) => (
        <div className="flex flex-wrap gap-1">
          {lead.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-text-muted))]">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'is_subscribed',
      header: 'Status',
      sortable: true,
      render: (lead) => (
        <AdminStatusBadge status={lead.is_subscribed ? 'success' : 'error'}>
          {lead.is_subscribed ? 'Inscrito' : 'Cancelado'}
        </AdminStatusBadge>
      ),
    },
    {
      key: 'created_at',
      header: 'Cadastro',
      sortable: true,
      render: (lead) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
            <DropdownMenuItem onClick={() => handleToggleSubscription(lead)} className="hover:bg-[hsl(var(--admin-sidebar-hover))]">
              {lead.is_subscribed ? (
                <><UserX className="h-4 w-4 mr-2" />Cancelar Inscrição</>
              ) : (
                <><UserCheck className="h-4 w-4 mr-2" />Reativar</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 hover:bg-red-500/10" onClick={() => setDeleteId(lead.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remover
            </DropdownMenuItem>
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
        <Button
          key={f.value}
          variant={filterSubscribed === f.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSubscribed(f.value)}
          className={filterSubscribed === f.value
            ? "bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white"
            : "border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white"
          }
        >
          {f.icon && <f.icon className="h-4 w-4 mr-1" />}
          {f.label}
        </Button>
      ))}
    </div>
  );

  return (
    <AdminLayout title="Leads">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminSummaryCard title="Total de Leads" value={leads.length} icon={Users} variant="purple" />
          <AdminSummaryCard title="Inscritos" value={subscribedCount} icon={UserCheck} variant="green" />
          <AdminSummaryCard title="Cancelados" value={unsubscribedCount} icon={UserX} variant="orange" />
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.3)] rounded-lg">
            <span className="text-sm font-medium text-white">
              {selectedLeads.length} lead(s) selecionado(s)
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Selecionados
            </Button>
          </div>
        )}

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
            <Button onClick={handleExportCSV} variant="outline" className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          }
        />
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Lead</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Tem certeza que deseja remover este lead? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminLeadsPage;
