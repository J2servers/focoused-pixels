import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useOrders, useUpdateOrder, useUpdateProductionStatus, PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS, type ProductionStatus, type Order } from '@/hooks/useOrders';
import { Search, Eye, Package, Truck, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-500' },
  processing: { label: 'Em Processamento', icon: Package, color: 'bg-purple-500' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-teal-500' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Aguardando', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500' },
};

const AdminOrdersPage = () => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const updateProductionStatus = useUpdateProductionStatus();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await updateOrder.mutateAsync({ id: orderId, order_status: status });
  };

  const handleUpdateProductionStatus = async (orderId: string, status: ProductionStatus) => {
    await updateProductionStatus.mutateAsync({ id: orderId, status });
  };

  return (
    <AdminLayout title="Pedidos" requireEditor>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, nome ou email..."
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
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: orders.length, color: 'text-white' },
            { label: 'Pendentes', value: orders.filter(o => o.order_status === 'pending').length, color: 'text-yellow-400' },
            { label: 'Em Produção', value: orders.filter(o => o.production_status === 'in_production').length, color: 'text-blue-400' },
            { label: 'Enviados', value: orders.filter(o => o.order_status === 'shipped').length, color: 'text-green-400' },
          ].map((stat) => (
            <Card key={stat.label} className="admin-card">
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Pedido</th>
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Total</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Pagamento</th>
                      <th className="text-left p-3 font-medium">Produção</th>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const orderStatus = ORDER_STATUS_CONFIG[order.order_status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG.pending;
                      const paymentStatus = PAYMENT_STATUS_CONFIG[order.payment_status as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.pending;
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
                          <td className="p-3 font-semibold">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="p-3">
                            <Badge className={`${orderStatus.color} text-white`}>
                              {orderStatus.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${paymentStatus.color} text-white`}>
                              {paymentStatus.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${PRODUCTION_STATUS_COLORS[prodStatus]} text-white`}>
                              {PRODUCTION_STATUS_LABELS[prodStatus]}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Pedido {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                    <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customer_phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Status Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Status do Pedido</label>
                    <Select
                      value={selectedOrder.order_status}
                      onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                    >
                      <SelectTrigger>
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
                    <label className="text-sm font-medium block mb-2">Status de Produção</label>
                    <Select
                      value={selectedOrder.production_status}
                      onValueChange={(value) => handleUpdateProductionStatus(selectedOrder.id, value as ProductionStatus)}
                    >
                      <SelectTrigger>
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

                <Separator />

                {/* Order Summary */}
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

                {/* Tracking */}
                {selectedOrder.tracking_code && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Rastreio</h4>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p><strong>Código:</strong> {selectedOrder.tracking_code}</p>
                        <p><strong>Transportadora:</strong> {selectedOrder.shipping_company || 'Correios'}</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Observações</h4>
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
