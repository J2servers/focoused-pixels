import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useOrders, useUpdateProductionStatus, PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS, type ProductionStatus, type Order } from '@/hooks/useOrders';
import { Package, Clock, Wrench, CheckCircle, Truck, AlertTriangle, GripVertical, Eye, Plus, Settings, X, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface KanbanColumn {
  status: ProductionStatus;
  icon: React.ElementType;
  color: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { status: 'pending', icon: Clock, color: 'border-gray-500', label: PRODUCTION_STATUS_LABELS.pending, visible: true },
  { status: 'awaiting_material', icon: AlertTriangle, color: 'border-yellow-500', label: PRODUCTION_STATUS_LABELS.awaiting_material, visible: true },
  { status: 'in_production', icon: Wrench, color: 'border-blue-500', label: PRODUCTION_STATUS_LABELS.in_production, visible: true },
  { status: 'quality_check', icon: CheckCircle, color: 'border-purple-500', label: PRODUCTION_STATUS_LABELS.quality_check, visible: true },
  { status: 'ready', icon: Package, color: 'border-green-500', label: PRODUCTION_STATUS_LABELS.ready, visible: true },
  { status: 'shipped', icon: Truck, color: 'border-teal-500', label: PRODUCTION_STATUS_LABELS.shipped, visible: true },
];

const AdminKanbanPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [movingTo, setMovingTo] = useState<{ order: Order; status: ProductionStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  // Load saved config from localStorage
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    try {
      const saved = localStorage.getItem('kanban_columns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COLUMNS;
  });

  const saveColumns = (newCols: KanbanColumn[]) => {
    setColumns(newCols);
    localStorage.setItem('kanban_columns', JSON.stringify(newCols));
  };

  const { data: orders = [], isLoading } = useOrders();
  const updateProductionStatus = useUpdateProductionStatus();

  const visibleColumns = columns.filter(c => c.visible);

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

  const toggleColumn = (status: string) => {
    const newCols = columns.map(c => c.status === status ? { ...c, visible: !c.visible } : c);
    saveColumns(newCols);
  };

  const renameColumn = (status: string) => {
    const newCols = columns.map(c => c.status === status ? { ...c, label: editLabel } : c);
    saveColumns(newCols);
    setEditingColumn(null);
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const newCols = [...columns];
    const target = index + direction;
    if (target < 0 || target >= newCols.length) return;
    [newCols[index], newCols[target]] = [newCols[target], newCols[index]];
    saveColumns(newCols);
  };

  const resetColumns = () => {
    saveColumns(DEFAULT_COLUMNS);
  };

  const getNextStatus = (current: ProductionStatus): ProductionStatus | null => {
    const visibleStatuses = visibleColumns.map(c => c.status);
    const idx = visibleStatuses.indexOf(current);
    return idx < visibleStatuses.length - 1 ? visibleStatuses[idx + 1] : null;
  };

  return (
    <AdminLayout title="Kanban de Produção" requireEditor>
      <div className="space-y-6">
        {/* Stats + Settings */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 flex-1">
            {visibleColumns.map(({ status, icon: Icon, label }) => (
              <Card key={status} className="admin-card">
                <CardContent className="p-3 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${PRODUCTION_STATUS_COLORS[status].replace('bg-', 'text-')}`} />
                  <div>
                    <p className="text-lg font-bold">{getOrdersByStatus(status).length}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-3 gap-2 shrink-0" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            Personalizar
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}>
          {visibleColumns.map(({ status, icon: Icon, color, label }) => (
            <Card key={status} className={`admin-card border-t-4 ${color} flex flex-col`}>
              <CardHeader className="pb-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{label}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                    {getOrdersByStatus(status).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 overflow-y-auto scrollbar-none" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground text-xs">Carregando...</div>
                  ) : getOrdersByStatus(status).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">Nenhum pedido</div>
                  ) : (
                    getOrdersByStatus(status).map((order) => {
                      const nextStatus = getNextStatus(status);
                      return (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-background/50 border rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-1.5">
                            <GripVertical className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-mono text-[10px] font-semibold text-primary">
                                  {order.order_number}
                                </span>
                                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                              <p className="text-xs font-medium truncate">{order.customer_name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                              </p>
                              {nextStatus && (
                                <div className="flex gap-1 mt-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-5 text-[9px] px-1.5"
                                    onClick={() => handleQuickMove(order, nextStatus)}
                                  >
                                    Avançar →
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personalizar Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {columns.map((col, idx) => (
              <div key={col.status} className="flex items-center gap-2 p-2 rounded border bg-muted/20">
                <input
                  type="checkbox"
                  checked={col.visible}
                  onChange={() => toggleColumn(col.status)}
                  className="rounded"
                />
                {editingColumn === col.status ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button size="sm" className="h-7" onClick={() => renameColumn(col.status)}>OK</Button>
                  </div>
                ) : (
                  <span className="flex-1 text-sm">{col.label}</span>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingColumn(col.status); setEditLabel(col.label); }}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveColumn(idx, -1)} disabled={idx === 0}>↑</Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveColumn(idx, 1)} disabled={idx === columns.length - 1}>↓</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetColumns}>Restaurar Padrão</Button>
            <Button onClick={() => setShowSettings(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Status Modal */}
      <Dialog open={!!movingTo} onOpenChange={() => setMovingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mover para {movingTo ? columns.find(c => c.status === movingTo.status)?.label || PRODUCTION_STATUS_LABELS[movingTo.status] : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Adicionar nota de produção (opcional)</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Material recebido, iniciando corte..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovingTo(null)}>Cancelar</Button>
            <Button onClick={handleMoveOrder}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminKanbanPage;
