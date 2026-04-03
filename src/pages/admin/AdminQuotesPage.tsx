import { useState } from 'react';
import { AdminLayout, DataTable, Column, AdminFilterBar } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdminQuotes, useUpdateQuoteStatus, type Quote } from '@/hooks/useAdminQuotes';
import { useCreateOrderFromQuote } from '@/hooks/useOrders';
import { Eye, FileText, ArrowRightCircle, Clock, CheckCircle, XCircle, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_MAP: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'info' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  approved: { label: 'Aprovado', variant: 'success' },
  rejected: { label: 'Rejeitado', variant: 'danger' },
  converted: { label: 'Convertido', variant: 'info' },
};

const AdminQuotesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const { data: quotes = [], isLoading } = useAdminQuotes();
  const updateStatus = useUpdateQuoteStatus();
  const createOrderFromQuote = useCreateOrderFromQuote();

  const filteredQuotes = quotes.filter(quote => {
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

  const columns: Column<Quote>[] = [
    {
      key: 'customer_name',
      header: 'Cliente',
      sortable: true,
      render: (q) => (
        <div>
          <p className="font-medium">{q.customer_name}</p>
          <p className="text-xs text-muted-foreground">{q.customer_email}</p>
          {q.customer_company && <p className="text-xs text-muted-foreground">{q.customer_company}</p>}
        </div>
      ),
    },
    {
      key: 'product_types',
      header: 'Produtos',
      render: (q) => (
        <div className="flex flex-wrap gap-1">
          {q.product_types.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
          ))}
          {q.product_types.length > 2 && (
            <Badge variant="outline" className="text-xs">+{q.product_types.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Qtd',
      sortable: true,
    },
    {
      key: 'cart_total',
      header: 'Valor',
      sortable: true,
      render: (q) => q.cart_total ? `R$ ${q.cart_total.toFixed(2).replace('.', ',')}` : 'A calcular',
    },
    {
      key: 'status',
      header: 'Status',
      render: (q) => {
        const s = STATUS_MAP[q.status] || STATUS_MAP.pending;
        return <AdminStatusBadge label={s.label} variant={s.variant} />;
      },
    },
    {
      key: 'created_at',
      header: 'Data',
      sortable: true,
      render: (q) => format(new Date(q.created_at), "dd/MM/yy HH:mm", { locale: ptBR }),
    },
    {
      key: 'id',
      header: '',
      render: (q) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedQuote(q)}>
            <Eye className="h-4 w-4" />
          </Button>
          {q.status === 'approved' && (
            <Button size="sm" onClick={() => handleConvertToOrder(q.id)} disabled={createOrderFromQuote.isPending}>
              <ArrowRightCircle className="h-4 w-4 mr-1" />
              Converter
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Orçamentos" requireEditor>
      <div className="space-y-6">
        <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nome ou email...">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminFilterBar>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSummaryCard title="Total" value={quotes.length} icon={FileText} variant="purple" />
          <AdminSummaryCard title="Pendentes" value={quotes.filter(q => q.status === 'pending').length} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Aprovados" value={quotes.filter(q => q.status === 'approved').length} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Convertidos" value={quotes.filter(q => q.status === 'converted').length} icon={ArrowRightCircle} variant="blue" />
        </div>

        <DataTable
          data={filteredQuotes}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Nenhum orçamento encontrado"
        />
      </div>

      {/* Quote Details Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalhes do Orçamento</DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                    <p><strong>Nome:</strong> {selectedQuote.customer_name}</p>
                    <p><strong>Email:</strong> {selectedQuote.customer_email}</p>
                    <p><strong>Telefone:</strong> {selectedQuote.customer_phone}</p>
                    {selectedQuote.customer_company && (
                      <p><strong>Empresa:</strong> {selectedQuote.customer_company}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Produtos Solicitados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.product_types.map((type) => (
                      <Badge key={type}>{type}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Select
                    value={selectedQuote.status}
                    onValueChange={(value) => updateStatus.mutate({ id: selectedQuote.id, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            {selectedQuote?.status === 'approved' && (
              <Button
                onClick={() => handleConvertToOrder(selectedQuote.id)}
                disabled={createOrderFromQuote.isPending}
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Converter em Pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQuotesPage;
