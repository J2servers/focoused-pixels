import { useState, useMemo } from 'react';
import { AdminLayout, DataTable, Column, AdminFilterBar } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminQuotes, useUpdateQuoteStatus, type Quote } from '@/hooks/useAdminQuotes';
import { useCreateOrderFromQuote } from '@/hooks/useOrders';
import { Eye, FileText, ArrowRightCircle, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, BarChart3, Package, User, Mail, Phone, Building2 } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const STATUS_MAP: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'info'; color: string }> = {
  pending: { label: 'Pendente', variant: 'warning', color: 'amber' },
  approved: { label: 'Aprovado', variant: 'success', color: 'green' },
  rejected: { label: 'Rejeitado', variant: 'danger', color: 'red' },
  converted: { label: 'Convertido', variant: 'info', color: 'blue' },
};

const AdminQuotesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const { data: quotes = [], isLoading } = useAdminQuotes();
  const updateStatus = useUpdateQuoteStatus();
  const createOrderFromQuote = useCreateOrderFromQuote();

  const pendingCount = useMemo(() => quotes.filter(q => q.status === 'pending').length, [quotes]);
  const approvedCount = useMemo(() => quotes.filter(q => q.status === 'approved').length, [quotes]);
  const convertedCount = useMemo(() => quotes.filter(q => q.status === 'converted').length, [quotes]);
  const recentCount = useMemo(() => quotes.filter(q => isAfter(new Date(q.created_at), subDays(new Date(), 7))).length, [quotes]);

  const totalValue = useMemo(() => quotes.reduce((s, q) => s + (q.cart_total || 0), 0), [quotes]);
  const approvedValue = useMemo(() => quotes.filter(q => q.status === 'approved' || q.status === 'converted').reduce((s, q) => s + (q.cart_total || 0), 0), [quotes]);
  const conversionRate = quotes.length > 0 ? Math.round((convertedCount / quotes.length) * 100) : 0;

  // Pipeline visualization
  const pipeline = useMemo(() => {
    const stages = ['pending', 'approved', 'converted', 'rejected'];
    return stages.map(s => ({
      key: s,
      ...STATUS_MAP[s],
      count: quotes.filter(q => q.status === s).length,
      value: quotes.filter(q => q.status === s).reduce((sum, q) => sum + (q.cart_total || 0), 0),
    }));
  }, [quotes]);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customer_name.toLowerCase().includes(search.toLowerCase()) || quote.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleConvertToOrder = async (quoteId: string) => {
    await createOrderFromQuote.mutateAsync(quoteId);
    setSelectedQuote(null);
  };

  const columns: Column<Quote>[] = [
    {
      key: 'customer_name', header: 'Cliente', sortable: true,
      render: (q) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{q.customer_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{q.customer_name}</p>
            <p className="text-[11px] text-[hsl(var(--admin-text-muted))]">{q.customer_email}</p>
            {q.customer_company && <p className="text-[10px] text-[hsl(var(--admin-text-muted))] flex items-center gap-1"><Building2 className="h-3 w-3" />{q.customer_company}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'product_types', header: 'Produtos',
      render: (q) => (
        <div className="flex flex-wrap gap-1">
          {q.product_types.slice(0, 2).map((type) => (
            <span key={type} className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--admin-accent-purple)/0.1)] text-[hsl(var(--admin-accent-purple))] border border-[hsl(var(--admin-accent-purple)/0.2)]">{type}</span>
          ))}
          {q.product_types.length > 2 && <span className="text-[10px] text-[hsl(var(--admin-text-muted))]">+{q.product_types.length - 2}</span>}
        </div>
      ),
    },
    {
      key: 'quantity', header: 'Qtd', sortable: true,
      render: (q) => <span className="text-sm font-medium text-white">{q.quantity}</span>,
    },
    {
      key: 'cart_total', header: 'Valor', sortable: true,
      render: (q) => (
        <span className="text-sm font-bold text-white">
          {q.cart_total ? `R$ ${q.cart_total.toFixed(2).replace('.', ',')}` : <span className="text-[hsl(var(--admin-text-muted))] font-normal">A calcular</span>}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (q) => {
        const s = STATUS_MAP[q.status] || STATUS_MAP.pending;
        return <AdminStatusBadge label={s.label} variant={s.variant} />;
      },
    },
    {
      key: 'created_at', header: 'Data', sortable: true,
      render: (q) => {
        const isRecent = isAfter(new Date(q.created_at), subDays(new Date(), 1));
        return (
          <div>
            <span className="text-sm text-[hsl(var(--admin-text-muted))]">{format(new Date(q.created_at), "dd/MM/yy", { locale: ptBR })}</span>
            {isRecent && <Badge className="ml-2 text-[9px] bg-green-500/20 text-green-400 border-0">Novo</Badge>}
          </div>
        );
      },
    },
    {
      key: 'id', header: '', className: 'w-28',
      render: (q) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => setSelectedQuote(q)}>
            <Eye className="h-4 w-4" />
          </Button>
          {q.status === 'approved' && (
            <Button size="sm" onClick={() => handleConvertToOrder(q.id)} disabled={createOrderFromQuote.isPending}
              className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white text-xs h-8">
              <ArrowRightCircle className="h-3 w-3 mr-1" />Converter
            </Button>
          )}
        </div>
      ),
    },
  ];

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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminSummaryCard title="Total" value={quotes.length} icon={FileText} variant="purple" />
          <AdminSummaryCard title="Pendentes" value={pendingCount} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Aprovados" value={approvedCount} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Convertidos" value={convertedCount} icon={ArrowRightCircle} variant="blue" />
          <AdminSummaryCard title="Últimos 7 dias" value={recentCount} icon={TrendingUp} variant="purple" />
        </div>

        {/* Pipeline + Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pipeline Funnel */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] lg:col-span-2">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
                <h3 className="text-sm font-semibold text-white">Pipeline de Orçamentos</h3>
              </div>
              <div className="flex items-stretch gap-2">
                {pipeline.filter(p => p.key !== 'rejected').map((stage, i) => (
                  <div key={stage.key} className="flex-1 relative">
                    <div className={`p-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] text-center ${statusFilter === stage.key ? 'ring-1 ring-[hsl(var(--admin-accent-purple))]' : ''}`}
                      role="button" onClick={() => setStatusFilter(statusFilter === stage.key ? 'all' : stage.key)}>
                      <p className="text-2xl font-bold text-white">{stage.count}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mt-0.5">{stage.label}</p>
                      {stage.value > 0 && (
                        <p className="text-xs text-[hsl(var(--admin-accent-purple))] mt-1 font-medium">
                          R$ {stage.value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        </p>
                      )}
                    </div>
                    {i < 2 && (
                      <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 text-[hsl(var(--admin-text-muted))] z-10">→</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Stats */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Resumo Financeiro</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Valor Total Orçado</p>
                  <p className="text-xl font-bold text-white">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Aprovado / Convertido</p>
                  <p className="text-lg font-bold text-green-400">R$ {approvedValue.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Taxa de Conversão</p>
                    <span className="text-sm font-bold text-white">{conversionRate}%</span>
                  </div>
                  <Progress value={conversionRate} className="h-2 bg-[hsl(var(--admin-bg))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Table */}
        <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar por nome ou email...">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
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

        <DataTable data={filteredQuotes} columns={columns} isLoading={isLoading} emptyMessage="Nenhum orçamento encontrado"
          actions={
            <ExportButtons data={filteredQuotes.map(q => ({ cliente: q.customer_name, email: q.customer_email, telefone: q.customer_phone, quantidade: q.quantity, status: q.status || 'pending', data: q.created_at }))} filename="orcamentos" title="Orçamentos" columns={[{key:'cliente',header:'Cliente'},{key:'email',header:'Email'},{key:'telefone',header:'Telefone'},{key:'quantidade',header:'Qtd'},{key:'status',header:'Status'},{key:'data',header:'Data'}]} />
          }
        />
      </div>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.15)] flex items-center justify-center">
                <FileText className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
              </div>
              <div>
                <p>Orçamento</p>
                <p className="text-xs font-normal text-[hsl(var(--admin-text-muted))]">
                  {selectedQuote && format(new Date(selectedQuote.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-5 p-1">
                {/* Customer Info */}
                <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4">
                  <h4 className="text-xs uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-3">Dados do Cliente</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2"><User className="h-4 w-4 text-[hsl(var(--admin-text-muted))]" /><span className="text-sm text-white">{selectedQuote.customer_name}</span></div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(var(--admin-text-muted))]" /><span className="text-sm text-white">{selectedQuote.customer_email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[hsl(var(--admin-text-muted))]" /><span className="text-sm text-white">{selectedQuote.customer_phone}</span></div>
                    {selectedQuote.customer_company && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[hsl(var(--admin-text-muted))]" /><span className="text-sm text-white">{selectedQuote.customer_company}</span></div>}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-2">Produtos Solicitados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.product_types.map((type) => (
                      <span key={type} className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-accent-purple)/0.1)] text-[hsl(var(--admin-accent-purple))] border border-[hsl(var(--admin-accent-purple)/0.2)] flex items-center gap-1.5">
                        <Package className="h-3 w-3" />{type}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--admin-card-border))]" />

                {/* Status Update */}
                <div>
                  <Label className="text-xs uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">Alterar Status</Label>
                  <Select value={selectedQuote.status} onValueChange={(value) => updateStatus.mutate({ id: selectedQuote.id, status: value })}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                {selectedQuote.cart_total && (
                  <div className="bg-[hsl(var(--admin-bg))] rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm text-[hsl(var(--admin-text-muted))]">Valor do Orçamento</span>
                    <span className="text-xl font-bold text-white">R$ {selectedQuote.cart_total.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            {selectedQuote?.status === 'approved' && (
              <Button onClick={() => handleConvertToOrder(selectedQuote.id)} disabled={createOrderFromQuote.isPending}
                className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
                <ArrowRightCircle className="h-4 w-4 mr-2" />Converter em Pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQuotesPage;
