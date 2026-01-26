import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Mail, 
  Phone, 
  Users, 
  UserCheck, 
  UserX,
  Download,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { useLeads, useUpdateLead, useDeleteLead, Lead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminLeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterSubscribed, setFilterSubscribed] = useState<boolean | null>(null);

  const { data: leads = [], isLoading, refetch } = useLeads();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesFilter = filterSubscribed === null || lead.is_subscribed === filterSubscribed;
    
    return matchesSearch && matchesFilter;
  });

  const subscribedCount = leads.filter(l => l.is_subscribed).length;
  const unsubscribedCount = leads.filter(l => !l.is_subscribed).length;

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

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout title="Leads">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Leads</h1>
            <p className="text-[hsl(var(--admin-text-muted))]">
              Gerencie sua base de contatos para promoções e marketing
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg admin-stat-card admin-stat-purple">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total de Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg admin-stat-card admin-stat-green">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-green))] to-emerald-600 shadow-lg">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Inscritos</p>
                <p className="text-2xl font-bold text-white">{subscribedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg admin-stat-card admin-stat-orange">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-orange))] to-red-500 shadow-lg">
                <UserX className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Cancelados</p>
                <p className="text-2xl font-bold text-white">{unsubscribedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--admin-text-muted))] h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterSubscribed === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSubscribed(null)}
                  className={filterSubscribed === null ? "bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white" : "border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white"}
                >
                  Todos
                </Button>
                <Button
                  variant={filterSubscribed === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSubscribed(true)}
                  className={filterSubscribed === true ? "bg-gradient-to-r from-[hsl(var(--admin-accent-green))] to-emerald-600 text-white" : "border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white"}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Inscritos
                </Button>
                <Button
                  variant={filterSubscribed === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSubscribed(false)}
                  className={filterSubscribed === false ? "bg-gradient-to-r from-[hsl(var(--admin-accent-orange))] to-red-500 text-white" : "border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white"}
                >
                  <UserX className="h-4 w-4 mr-1" />
                  Cancelados
                </Button>
                <Button variant="ghost" size="icon" onClick={() => refetch()} className="text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
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

        {/* Leads Table */}
        <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-[hsl(var(--admin-sidebar))]" />
                ))}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-[hsl(var(--admin-text-muted))] mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Nenhum lead encontrado</h3>
                <p className="text-[hsl(var(--admin-text-muted))]">
                  {searchTerm ? 'Tente buscar por outros termos' : 'Os leads aparecerão aqui quando clientes se cadastrarem'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(var(--admin-sidebar))] hover:bg-[hsl(var(--admin-sidebar))] border-b border-[hsl(var(--admin-card-border))]">
                    <TableHead className="w-12 text-[hsl(var(--admin-text-muted))]">
                      <Checkbox
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-[hsl(var(--admin-text-muted))]"
                      />
                    </TableHead>
                    <TableHead className="text-[hsl(var(--admin-text-muted))]">Contato</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text-muted))]">Origem</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text-muted))]">Tags</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text-muted))]">Cadastro</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="border-b border-[hsl(var(--admin-card-border)/0.5)] hover:bg-[hsl(var(--admin-sidebar-hover))]">
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleSelectLead(lead.id)}
                          className="border-[hsl(var(--admin-text-muted))]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-white">{lead.name}</p>
                          <div className="flex items-center gap-1 text-sm text-[hsl(var(--admin-text-muted))]">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm text-[hsl(var(--admin-text-muted))]">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))]">{lead.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-card-border))]">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.is_subscribed ? 'default' : 'destructive'} className={lead.is_subscribed ? "bg-[hsl(var(--admin-accent-green))] text-white" : ""}>
                          {lead.is_subscribed ? 'Inscrito' : 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
                            <DropdownMenuItem onClick={() => handleToggleSubscription(lead)} className="hover:bg-[hsl(var(--admin-sidebar-hover))] focus:bg-[hsl(var(--admin-sidebar-hover))]">
                              {lead.is_subscribed ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Cancelar Inscrição
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Reativar Inscrição
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                              onClick={() => setDeleteId(lead.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
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
      </div>
    </AdminLayout>
  );
};

export default AdminLeadsPage;
