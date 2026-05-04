import { useMemo, useState } from 'react';
import { AdminLayout, DataTable, AdminFilterBar } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminQuotes, useUpdateQuoteStatus, useDeleteQuote, type Quote } from '@/hooks/useAdminQuotes';
import { useCreateOrderFromQuote } from '@/hooks/useOrders';
import { FileText, ArrowRightCircle, Clock, CheckCircle, TrendingUp, Trash2 } from 'lucide-react';
import { subDays, isAfter } from 'date-fns';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { QUOTE_STATUS_MAP } from './quotes/constants';
import { QuotePipeline } from './quotes/QuotePipeline';
import { QuoteDetailDialog } from './quotes/QuoteDetailDialog';
import { buildQuoteColumns } from './quotes/columns';

const AdminQuotesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: quotes = [], isLoading } = useAdminQuotes();
  const updateStatus = useUpdateQuoteStatus();
  const deleteQuote = useDeleteQuote();
  const createOrderFromQuote = useCreateOrderFromQuote();

  const handleDeleteQuote = async () => {
    if (!deleteId) return;
    await deleteQuote.mutateAsync(deleteId);
    if (selectedQuote?.id === deleteId) setSelectedQuote(null);
    setDeleteId(null);
  };

  const pendingCount = useMemo(() => quotes.filter((q) => q.status === 'pending').length, [quotes]);
  const approvedCount = useMemo(() => quotes.filter((q) => q.status === 'approved').length, [quotes]);
  const convertedCount = useMemo(() => quotes.filter((q) => q.status === 'converted').length, [quotes]);
  const recentCount = useMemo(
    () => quotes.filter((q) => isAfter(new Date(q.created_at), subDays(new Date(), 7))).length,
    [quotes]
  );

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConvertToOrder = async (quoteId: string) => {
    await createOrderFromQuote.mutateAsync(quoteId);
    setSelectedQuote(null);
  };

  const columns = buildQuoteColumns({
    onView: setSelectedQuote,
    onConvert: handleConvertToOrder,
    onDelete: setDeleteId,
    isConverting: createOrderFromQuote.isPending,
  });

  return (
    <AdminLayout title="Orçamentos" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="📄 Guia de Orçamentos"
          description="Gerencie solicitações de orçamento dos clientes."
          steps={[
            { title: "Visualizar orçamentos", description: "Todos os pedidos de orçamento enviados pelos clientes aparecem aqui." },
            { title: "Atualizar status", description: "Mude entre Pendente, Aprovado, Rejeitado ou Convertido conforme a negociação." },
            { title: "Converter em pedido", description: "Clique em 'Converter' para transformar um orçamento aprovado em pedido real." },
            { title: "Filtrar", description: "Use filtros de status e busca para encontrar orçamentos específicos." },
            { title: "Detalhes do cliente", description: "Veja nome, e-mail, telefone e empresa do solicitante." },
          ]}
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminSummaryCard title="Total" value={quotes.length} icon={FileText} variant="purple" />
          <AdminSummaryCard title="Pendentes" value={pendingCount} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Aprovados" value={approvedCount} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Convertidos" value={convertedCount} icon={ArrowRightCircle} variant="blue" />
          <AdminSummaryCard title="Últimos 7 dias" value={recentCount} icon={TrendingUp} variant="purple" />
        </div>

        <QuotePipeline
          quotes={quotes}
          statusFilter={statusFilter}
          onStatusToggle={(key) => setStatusFilter(statusFilter === key ? 'all' : key)}
        />

        <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nome ou email...">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] liquid-glass text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(QUOTE_STATUS_MAP).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterBar>

        <DataTable
          data={filteredQuotes}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Nenhum orçamento encontrado"
          actions={
            <ExportButtons
              data={filteredQuotes.map((q) => ({
                cliente: q.customer_name, email: q.customer_email, telefone: q.customer_phone,
                quantidade: q.quantity, status: q.status || 'pending', data: q.created_at,
              }))}
              filename="orcamentos"
              title="Orçamentos"
              columns={[
                { key: 'cliente', header: 'Cliente' },
                { key: 'email', header: 'Email' },
                { key: 'telefone', header: 'Telefone' },
                { key: 'quantidade', header: 'Qtd' },
                { key: 'status', header: 'Status' },
                { key: 'data', header: 'Data' },
              ]}
            />
          }
        />
      </div>

      <QuoteDetailDialog
        quote={selectedQuote}
        onClose={() => setSelectedQuote(null)}
        onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
        onDelete={setDeleteId}
        onConvert={handleConvertToOrder}
        isConverting={createOrderFromQuote.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[hsl(250_25%_12%)] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Orçamento</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuote} className="admin-btn admin-btn-delete">
              <Trash2 className="h-4 w-4 mr-1" />Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminQuotesPage;
