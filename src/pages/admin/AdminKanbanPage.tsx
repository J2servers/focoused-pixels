import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useOrders, useUpdateProductionStatus, PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS, type ProductionStatus, type Order } from '@/hooks/useOrders';
import { Package, Clock, Wrench, CheckCircle, Truck, AlertTriangle, GripVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const KANBAN_COLUMNS: { status: ProductionStatus; icon: React.ElementType; color: string }[] = [
  { status: 'pending', icon: Clock, color: 'border-gray-500' },
  { status: 'awaiting_material', icon: AlertTriangle, color: 'border-yellow-500' },
  { status: 'in_production', icon: Wrench, color: 'border-blue-500' },
  { status: 'quality_check', icon: CheckCircle, color: 'border-purple-500' },
  { status: 'ready', icon: Package, color: 'border-green-500' },
  { status: 'shipped', icon: Truck, color: 'border-teal-500' },
];

const AdminKanbanPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [movingTo, setMovingTo] = useState<{ order: Order; status: ProductionStatus } | null>(null);
  const [notes, setNotes] = useState('');

  const { data: orders = [], isLoading } = useOrders();
  const updateProductionStatus = useUpdateProductionStatus();

  const getOrdersByStatus = (status: ProductionStatus) => {
    return orders.filter(order => order.production_status === status);
  };

  const handleMoveOrder = async () => {
    if (movingTo) {
      await updateProductionStatus.mutateAsync({
        id: movingTo.order.id,
        status: movingTo.status,
        notes: notes || undefined,
      });
      setMovingTo(null);
      setNotes('');
    }
  };

  const handleQuickMove = (order: Order, newStatus: ProductionStatus) => {
    if (newStatus === 'in_production' || newStatus === 'quality_check') {
      setMovingTo({ order, status: newStatus });
    } else {
      updateProductionStatus.mutate({ id: order.id, status: newStatus });
    }
  };

  return (
    <AdminLayout title="Kanban de Produção" requireEditor>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {KANBAN_COLUMNS.map(({ status, icon: Icon }) => (
            <Card key={status} className="admin-card">
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${PRODUCTION_STATUS_COLORS[status].replace('bg-', 'text-')}`} />
                <div>
                  <p className="text-lg font-bold">{getOrdersByStatus(status).length}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{PRODUCTION_STATUS_LABELS[status]}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(({ status, icon: Icon, color }) => (
              <Card key={status} className={`admin-card w-72 shrink-0 border-t-4 ${color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4" />
                    {PRODUCTION_STATUS_LABELS[status]}
                    <Badge variant="secondary" className="ml-auto">
                      {getOrdersByStatus(status).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="space-y-2 pr-2">
                      {isLoading ? (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          Carregando...
                        </div>
                      ) : getOrdersByStatus(status).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Nenhum pedido
                        </div>
                      ) : (
                        getOrdersByStatus(status).map((order) => (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-background/50 border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-xs font-semibold text-primary">
                                    {order.order_number}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium truncate">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  R$ {order.total.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                </p>

                                {/* Quick Actions */}
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {status !== 'shipped' && (
                                    <>
                                      {status === 'pending' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => handleQuickMove(order, 'in_production')}
                                        >
                                          Iniciar
                                        </Button>
                                      )}
                                      {status === 'awaiting_material' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => handleQuickMove(order, 'in_production')}
                                        >
                                          Produzir
                                        </Button>
                                      )}
                                      {status === 'in_production' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => handleQuickMove(order, 'quality_check')}
                                        >
                                          Revisar
                                        </Button>
                                      )}
                                      {status === 'quality_check' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => handleQuickMove(order, 'ready')}
                                        >
                                          Pronto
                                        </Button>
                                      )}
                                      {status === 'ready' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[10px] px-2"
                                          onClick={() => handleQuickMove(order, 'shipped')}
                                        >
                                          Enviar
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedido {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={`${PRODUCTION_STATUS_COLORS[selectedOrder.production_status as ProductionStatus]}`}>
                    {PRODUCTION_STATUS_LABELS[selectedOrder.production_status as ProductionStatus]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {selectedOrder.production_notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notas de Produção</p>
                  <p className="text-sm mt-1">{selectedOrder.production_notes}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Observações do Pedido</p>
                  <p className="text-sm mt-1">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Status Modal */}
      <Dialog open={!!movingTo} onOpenChange={() => setMovingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mover para {movingTo ? PRODUCTION_STATUS_LABELS[movingTo.status] : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Adicionar nota de produção (opcional)
              </p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Material recebido, iniciando corte..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMovingTo(null)}>
              Cancelar
            </Button>
            <Button onClick={handleMoveOrder}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminKanbanPage;
