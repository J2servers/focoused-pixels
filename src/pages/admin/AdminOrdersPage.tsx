import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  useOrders,
  useUpdateOrder,
  useUpdateProductionStatus,
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_COLORS,
  type ProductionStatus,
  type Order,
} from '@/hooks/useOrders';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Search, Eye, Package, Truck, Clock, CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500' },
  processing: { label: 'Em processamento', color: 'bg-purple-500' },
  shipped: { label: 'Enviado', color: 'bg-teal-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500' },
};

const EXPORT_COLUMNS = [
  { key: 'order_number', header: 'Numero Pedido' },
  { key: 'customer_name', header: 'Cliente' },
  { key: 'customer_email', header: 'Email' },
  { key: 'total_fmt', header: 'Total' },
  { key: 'order_status_label', header: 'Status' },
  { key: 'payment_status_label', header: 'Pagamento' },
  { key: 'created_at_fmt', header: 'Data' },
];

const fmtCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const isCompletedSale = (o: Order) => o.payment_status === 'paid' && o.order_status !== 'cancelled';
const isAwaitingPayment = (o: Order) => o.payment_status === 'pending' && o.order_status !== 'cancelled';
const sumOrders = (list: Order[]) => list.reduce((s, o) => s + (o.total || 0), 0);

const AdminOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'paid' | 'awaiting'>('paid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const updateProductionStatus = useUpdateProductionStatus();

  const paidOrders = useMemo(() => orders.filter(isCompletedSale), [orders]);
  const awaitingOrders = useMemo(() => orders.filter(isAwaitingPayment), [orders]);

  const applyFilters = (list: Order[]) =>
    list.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && o.created_at >= `${dateFrom}T00:00:00`;
      if (dateTo) matchesDate = matchesDate && o.created_at <= `${dateTo}T23:59:59`;
      return matchesStatus && matchesDate;
    });

  const filteredOrders = useMemo(
    () => applyFilters(viewMode === 'paid' ? paidOrders : awaitingOrders),
    [paidOrders, awaitingOrders, viewMode, statusFilter, dateFrom, dateTo]
  );

  const paidRevenue = useMemo(() => sumOrders(paidOrders), [paidOrders]);
  const awaitingRevenue = useMemo(() => sumOrders(awaitingOrders), [awaitingOrders]);

  const exportData = filteredOrders.map((o) => ({
    ...o,
    total_fmt: fmtCurrency(o.total),
    order_status_label: ORDER_STATUS_CONFIG[o.order_status]?.label || o.order_status,
    payment_status_label: PAYMENT_STATUS_CONFIG[o.payment_status]?.label || o.payment_status,
    created_at_fmt: format(new Date(o.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  }));

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Pedido',
      sortable: true,
      render: (o) => <span className="font-mono font-semibold text-[hsl(var(--admin-accent-purple))]">{o.order_number}</span>,
    },
    {
      key: 'customer_name',
      header: 'Cliente',
      sortable: true,
      render: (o) => (
        <div>
          <p className="font-medium text-white">{o.customer_name}</p>
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">{o.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      render: (o) => <span className="font-semibold text-white">{fmtCurrency(o.total)}</span>,
    },
    {
      key: 'order_status',
      header: 'Status',
      render: (o) => {
        const cfg = ORDER_STATUS_CONFIG[o.order_status] || ORDER_STATUS_CONFIG.pending;
        return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'payment_status',
      header: 'Pagamento',
      render: (o) => {
        const cfg = PAYMENT_STATUS_CONFIG[o.payment_status] || PAYMENT_STATUS_CONFIG.pending;
        return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'production_status',
      header: 'Produção',
      render: (o) => {
        const ps = o.production_status as ProductionStatus;
        return <Badge className={`${PRODUCTION_STATUS_COLORS[ps]} text-white`}>{PRODUCTION_STATUS_LABELS[ps]}</Badge>;
      },
    },
    {
      key: 'created_at',
      header: 'Data',
      sortable: true,
      render: (o) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {format(new Date(o.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (o) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => setSelectedOrder(o)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const filterContent = (
    <div className="flex gap-2 flex-wrap">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white" />
      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white" />
    </div>
  );

  return (
    <AdminLayout title="Vendas" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="🛒 Guia de Vendas/Pedidos"
          description="Gerencie pedidos, pagamentos, produção e entregas."
          steps={[
            { title: "Status do pedido", description: "Atualize o status entre: Pendente → Confirmado → Em produção → Enviado → Entregue." },
            { title: "Status de pagamento", description: "Acompanhe se o pagamento está pendente, pago ou cancelado." },
            { title: "Código de rastreio", description: "Adicione o código de rastreio dos Correios para o cliente acompanhar a entrega." },
            { title: "Detalhes do pedido", description: "Clique no pedido para ver itens, valores, dados do cliente e histórico." },
            { title: "Exportar vendas", description: "Exporte relatórios de vendas em CSV ou PDF para análise financeira." },
            { title: "Produção", description: "Acompanhe o status de produção de cada pedido com cores indicativas." },
          ]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSummaryCard title="Aguardando Pgto" value={awaitingOrders.length} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Valor Aguardando" value={fmtCurrency(awaitingRevenue)} icon={AlertTriangle} variant="orange" />
          <AdminSummaryCard title="Vendas Pagas" value={paidOrders.length} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Faturamento" value={fmtCurrency(paidRevenue)} icon={DollarSign} variant="green" />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'paid' | 'awaiting')} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-[hsl(var(--admin-sidebar))] border border-[hsl(var(--admin-card-border))]">
            <TabsTrigger value="paid">Vendas Feitas</TabsTrigger>
            <TabsTrigger value="awaiting">Aguardando Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value={viewMode} className="mt-0">
            <DataTable
              data={filteredOrders}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar por número, nome, email..."
              emptyMessage={viewMode === 'paid' ? 'Nenhuma venda paga encontrada' : 'Nenhuma venda aguardando pagamento'}
              filterContent={filterContent}
              actions={
                <ExportButtons
                  data={exportData}
                  columns={EXPORT_COLUMNS}
                  filename={viewMode === 'paid' ? 'vendas-feitas' : 'vendas-aguardando'}
                  title="Relatório de Vendas"
                />
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Venda {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                <div>
                  <h4 className="font-semibold mb-2 text-white">Cliente</h4>
                  <div className="bg-[hsl(var(--admin-bg))] rounded-lg p-4 space-y-1 text-[hsl(var(--admin-text-muted))]">
                    <p><strong className="text-white">Nome:</strong> {selectedOrder.customer_name}</p>
                    <p><strong className="text-white">Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong className="text-white">Telefone:</strong> {selectedOrder.customer_phone}</p>
                    {(selectedOrder as any).shipping_address && <p><strong className="text-white">Endereço:</strong> {(selectedOrder as any).shipping_address}</p>}
                    {(selectedOrder as any).shipping_cep && <p><strong className="text-white">CEP:</strong> {(selectedOrder as any).shipping_cep}</p>}
                    {(selectedOrder as any).shipping_city && <p><strong className="text-white">Cidade:</strong> {(selectedOrder as any).shipping_city} - {(selectedOrder as any).shipping_state}</p>}
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--admin-card-border))]" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2 text-[hsl(var(--admin-text-muted))]">Status da venda</label>
                    <Select
                      value={selectedOrder.order_status}
                      onValueChange={(v) => updateOrder.mutateAsync({ id: selectedOrder.id, order_status: v })}
                    >
                      <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2 text-[hsl(var(--admin-text-muted))]">Status de produção</label>
                    <Select
                      value={selectedOrder.production_status}
                      onValueChange={(v) => updateProductionStatus.mutateAsync({ id: selectedOrder.id, status: v as ProductionStatus })}
                    >
                      <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRODUCTION_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--admin-card-border))]" />

                <div>
                  <h4 className="font-semibold mb-2 text-white">Resumo</h4>
                  <div className="bg-[hsl(var(--admin-bg))] rounded-lg p-4 space-y-2 text-[hsl(var(--admin-text-muted))]">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{fmtCurrency(selectedOrder.subtotal)}</span></div>
                    {selectedOrder.shipping_cost != null && selectedOrder.shipping_cost > 0 && (
                      <div className="flex justify-between"><span>Frete:</span><span>{fmtCurrency(selectedOrder.shipping_cost)}</span></div>
                    )}
                    {selectedOrder.discount != null && selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-400"><span>Desconto:</span><span>- {fmtCurrency(selectedOrder.discount)}</span></div>
                    )}
                    <Separator className="bg-[hsl(var(--admin-card-border))]" />
                    <div className="flex justify-between font-bold text-lg text-white"><span>Total:</span><span>{fmtCurrency(selectedOrder.total)}</span></div>
                  </div>
                </div>

                {selectedOrder.tracking_code && (
                  <>
                    <Separator className="bg-[hsl(var(--admin-card-border))]" />
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Rastreio</h4>
                      <div className="bg-[hsl(var(--admin-bg))] rounded-lg p-4 text-[hsl(var(--admin-text-muted))]">
                        <p><strong className="text-white">Código:</strong> {selectedOrder.tracking_code}</p>
                        <p><strong className="text-white">Transportadora:</strong> {selectedOrder.shipping_company || 'Correios'}</p>
                      </div>
                    </div>
                  </>
                )}

                {selectedOrder.notes && (
                  <>
                    <Separator className="bg-[hsl(var(--admin-card-border))]" />
                    <div>
                      <h4 className="font-semibold mb-2 text-white">Observações</h4>
                      <p className="text-[hsl(var(--admin-text-muted))]">{selectedOrder.notes}</p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
