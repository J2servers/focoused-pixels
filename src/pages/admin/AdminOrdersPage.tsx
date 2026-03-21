import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Search, Eye, Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500' },
  processing: { label: 'Em processamento', color: 'bg-purple-500' },
  shipped: { label: 'Enviado', color: 'bg-teal-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Aguardando', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500' },
};

const EXPORT_COLUMNS = [
  { key: 'order_number', header: 'Numero Pedido' },
  { key: 'customer_name', header: 'Cliente' },
  { key: 'customer_email', header: 'Email' },
  { key: 'customer_phone', header: 'Telefone' },
  { key: 'total_fmt', header: 'Total' },
  { key: 'order_status_label', header: 'Status' },
  { key: 'payment_status_label', header: 'Pagamento' },
  { key: 'production_status_label', header: 'Producao' },
  { key: 'created_at_fmt', header: 'Data' },
  { key: 'shipping_address', header: 'Endereco' },
  { key: 'shipping_cep', header: 'CEP' },
  { key: 'tracking_code', header: 'Rastreio' },
];

const isCompletedSale = (order: Order) =>
  order.payment_status === 'paid' &&
  order.payment_status !== 'refunded' &&
  order.order_status !== 'cancelled';

const isAwaitingPayment = (order: Order) =>
  order.payment_status === 'pending' &&
  order.order_status !== 'cancelled';

const sumOrders = (list: Order[]) => list.reduce((sum, order) => sum + (order.total || 0), 0);

const AdminOrdersPage = () => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'paid' | 'awaiting'>('paid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const updateProductionStatus = useUpdateProductionStatus();

  const paidOrders = useMemo(() => orders.filter(isCompletedSale), [orders]);
  const awaitingPaymentOrders = useMemo(() => orders.filter(isAwaitingPayment), [orders]);

  const applyFilters = (list: Order[]) =>
    list.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
        (order.customer_phone && order.customer_phone.includes(search));

      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && order.created_at >= `${dateFrom}T00:00:00`;
      if (dateTo) matchesDate = matchesDate && order.created_at <= `${dateTo}T23:59:59`;

      return matchesSearch && matchesStatus && matchesDate;
    });

  const filteredPaidOrders = useMemo(
    () => applyFilters(paidOrders),
    [paidOrders, search, statusFilter, dateFrom, dateTo]
  );

  const filteredAwaitingOrders = useMemo(
    () => applyFilters(awaitingPaymentOrders),
    [awaitingPaymentOrders, search, statusFilter, dateFrom, dateTo]
  );

  const filteredOrders = viewMode === 'paid' ? filteredPaidOrders : filteredAwaitingOrders;

  const paidRevenue = useMemo(() => sumOrders(paidOrders), [paidOrders]);
  const awaitingRevenue = useMemo(() => sumOrders(awaitingPaymentOrders), [awaitingPaymentOrders]);

  const awaitingOver24h = useMemo(
    () =>
      awaitingPaymentOrders.filter(
        (order) => Date.now() - new Date(order.created_at).getTime() > 24 * 60 * 60 * 1000
      ).length,
    [awaitingPaymentOrders]
  );

  const exportData = filteredOrders.map((o) => ({
    ...o,
    total_fmt: `R$ ${o.total.toFixed(2).replace('.', ',')}`,
    order_status_label:
      ORDER_STATUS_CONFIG[o.order_status as keyof typeof ORDER_STATUS_CONFIG]?.label || o.order_status,
    payment_status_label:
      PAYMENT_STATUS_CONFIG[o.payment_status as keyof typeof PAYMENT_STATUS_CONFIG]?.label || o.payment_status,
    production_status_label: PRODUCTION_STATUS_LABELS[o.production_status as ProductionStatus] || o.production_status,
    created_at_fmt: format(new Date(o.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  }));

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await updateOrder.mutateAsync({ id: orderId, order_status: status });
  };

  const handleUpdateProductionStatus = async (orderId: string, status: ProductionStatus) => {
    await updateProductionStatus.mutateAsync({ id: orderId, status });
  };

  return (
    <AdminLayout title="Vendas Feitas" requireEditor>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="admin-card border-amber-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{awaitingPaymentOrders.length}</p>
              <p className="text-sm text-muted-foreground">Vendas aguardando pagamento</p>
            </CardContent>
          </Card>
          <Card className="admin-card border-amber-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-300">
                R$ {awaitingRevenue.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">Valor aguardando</p>
            </CardContent>
          </Card>
          <Card className="admin-card border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{paidOrders.length}</p>
              <p className="text-sm text-muted-foreground">Vendas feitas (pagas)</p>
            </CardContent>
          </Card>
          <Card className="admin-card border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-300">
                R$ {paidRevenue.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento realizado</p>
            </CardContent>
          </Card>
        </div>

        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por numero, nome, email ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
              />
              <ExportButtons
                data={exportData}
                columns={EXPORT_COLUMNS}
                filename={viewMode === 'paid' ? 'vendas-feitas' : 'vendas-aguardando-pagamento'}
                title={
                  viewMode === 'paid'
                    ? 'Relatorio de Vendas Feitas'
                    : 'Relatorio de Vendas Aguardando Pagamento'
                }
              />
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'paid' | 'awaiting')}
          className="space-y-4"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="paid">Vendas Feitas</TabsTrigger>
            <TabsTrigger value="awaiting">Aguardando Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="paid" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Vendas feitas', value: filteredPaidOrders.length, color: 'text-emerald-400' },
                {
                  label: 'Faturamento',
                  value: `R$ ${sumOrders(filteredPaidOrders).toFixed(2).replace('.', ',')}`,
                  color: 'text-emerald-300',
                },
                {
                  label: 'Em producao',
                  value: filteredPaidOrders.filter((o) => o.production_status === 'in_production').length,
                  color: 'text-blue-400',
                },
                {
                  label: 'Enviados',
                  value: filteredPaidOrders.filter(
                    (o) => o.order_status === 'shipped' || o.order_status === 'delivered'
                  ).length,
                  color: 'text-green-400',
                },
              ].map((stat) => (
                <Card key={stat.label} className="admin-card">
                  <CardContent className="p-4 text-center">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="awaiting" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Aguardando', value: filteredAwaitingOrders.length, color: 'text-amber-400' },
                {
                  label: 'Valor aguardando',
                  value: `R$ ${sumOrders(filteredAwaitingOrders).toFixed(2).replace('.', ',')}`,
                  color: 'text-amber-300',
                },
                {
                  label: 'Mais de 24h',
                  value: awaitingOver24h,
                  color: 'text-orange-400',
                },
                {
                  label: 'Pendentes',
                  value: filteredAwaitingOrders.filter((o) => o.order_status === 'pending').length,
                  color: 'text-yellow-400',
                },
              ].map((stat) => (
                <Card key={stat.label} className="admin-card">
                  <CardContent className="p-4 text-center">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle>
              {viewMode === 'paid' ? 'Lista de Vendas Feitas' : 'Lista de Vendas Aguardando Pagamento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {viewMode === 'paid'
                  ? 'Nenhuma venda feita encontrada'
                  : 'Nenhuma venda aguardando pagamento encontrada'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Venda</th>
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Total</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Pagamento</th>
                      <th className="text-left p-3 font-medium">Producao</th>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-right p-3 font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const orderStatus =
                        ORDER_STATUS_CONFIG[order.order_status as keyof typeof ORDER_STATUS_CONFIG] ||
                        ORDER_STATUS_CONFIG.pending;
                      const paymentStatus =
                        PAYMENT_STATUS_CONFIG[order.payment_status as keyof typeof PAYMENT_STATUS_CONFIG] ||
                        PAYMENT_STATUS_CONFIG.pending;
                      const prodStatus = order.production_status as ProductionStatus;

                      return (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/5">
                          <td className="p-3">
                            <span className="font-mono font-semibold text-primary">{order.order_number}</span>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">R$ {order.total.toFixed(2).replace('.', ',')}</td>
                          <td className="p-3">
                            <Badge className={`${orderStatus.color} text-white`}>{orderStatus.label}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${paymentStatus.color} text-white`}>{paymentStatus.label}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${PRODUCTION_STATUS_COLORS[prodStatus]} text-white`}>
                              {PRODUCTION_STATUS_LABELS[prodStatus]}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Venda {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                    <p>
                      <strong>Nome:</strong> {selectedOrder.customer_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer_email}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {selectedOrder.customer_phone}
                    </p>
                    {(selectedOrder as any).shipping_address && (
                      <p>
                        <strong>Endereco:</strong> {(selectedOrder as any).shipping_address}
                      </p>
                    )}
                    {(selectedOrder as any).shipping_cep && (
                      <p>
                        <strong>CEP:</strong> {(selectedOrder as any).shipping_cep}
                      </p>
                    )}
                    {(selectedOrder as any).shipping_city && (
                      <p>
                        <strong>Cidade:</strong> {(selectedOrder as any).shipping_city} -{' '}
                        {(selectedOrder as any).shipping_state}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Status da venda</label>
                    <Select
                      value={selectedOrder.order_status}
                      onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Status de producao</label>
                    <Select
                      value={selectedOrder.production_status}
                      onValueChange={(value) =>
                        handleUpdateProductionStatus(selectedOrder.id, value as ProductionStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRODUCTION_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Resumo</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {selectedOrder.subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {selectedOrder.shipping_cost && (
                      <div className="flex justify-between">
                        <span>Frete:</span>
                        <span>R$ {selectedOrder.shipping_cost.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    {selectedOrder.discount && selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Desconto:</span>
                        <span>- R$ {selectedOrder.discount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.tracking_code && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Rastreio</h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p>
                          <strong>Codigo:</strong> {selectedOrder.tracking_code}
                        </p>
                        <p>
                          <strong>Transportadora:</strong> {selectedOrder.shipping_company || 'Correios'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Observacoes</h4>
                      <p className="text-muted-foreground">{selectedOrder.notes}</p>
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
