import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useOrders, useUpdateProductionStatus, PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS, type ProductionStatus, type Order } from '@/hooks/useOrders';
import { Package, Clock, Wrench, CheckCircle, Truck, AlertTriangle, GripVertical, Eye, Settings, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

interface KanbanColumn {
  status: ProductionStatus;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { status: 'pending', icon: Clock, color: 'text-gray-400', borderColor: 'border-t-gray-500', label: PRODUCTION_STATUS_LABELS.pending, visible: true },
  { status: 'awaiting_material', icon: AlertTriangle, color: 'text-amber-400', borderColor: 'border-t-amber-500', label: PRODUCTION_STATUS_LABELS.awaiting_material, visible: true },
  { status: 'in_production', icon: Wrench, color: 'text-blue-400', borderColor: 'border-t-blue-500', label: PRODUCTION_STATUS_LABELS.in_production, visible: true },
  { status: 'quality_check', icon: CheckCircle, color: 'text-purple-400', borderColor: 'border-t-purple-500', label: PRODUCTION_STATUS_LABELS.quality_check, visible: true },
  { status: 'ready', icon: Package, color: 'text-emerald-400', borderColor: 'border-t-emerald-500', label: PRODUCTION_STATUS_LABELS.ready, visible: true },
  { status: 'shipped', icon: Truck, color: 'text-cyan-400', borderColor: 'border-t-cyan-500', label: PRODUCTION_STATUS_LABELS.shipped, visible: true },
];

const AdminKanbanPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [movingTo, setMovingTo] = useState<{ order: Order; status: ProductionStatus } | null>(null);
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    try {
      const saved = localStorage.getItem('kanban_columns');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DEFAULT_COLUMNS;
  });

  const saveColumns = (newCols: KanbanColumn[]) => {
    setColumns(newCols);
    localStorage.setItem('kanban_columns', JSON.stringify(newCols));
  };

  const { data: orders = [], isLoading } = useOrders();
  const updateProductionStatus = useUpdateProductionStatus();

  const visibleColumns = columns.filter(c => c.visible);
  const getOrdersByStatus = (status: ProductionStatus) => orders.filter(o => o.production_status === status);

  const handleMoveOrder = async () => {
    if (movingTo) {
      await updateProductionStatus.mutateAsync({ id: movingTo.order.id, status: movingTo.status, notes: notes || undefined });
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

  const toggleColumn = (status: string) => saveColumns(columns.map(c => c.status === status ? { ...c, visible: !c.visible } : c));
  const renameColumn = (status: string) => { saveColumns(columns.map(c => c.status === status ? { ...c, label: editLabel } : c)); setEditingColumn(null); };
  const moveColumn = (idx: number, dir: -1 | 1) => { const a = [...columns]; const t = idx + dir; if (t < 0 || t >= a.length) return; [a[idx], a[t]] = [a[t], a[idx]]; saveColumns(a); };
  const resetColumns = () => saveColumns(DEFAULT_COLUMNS);

  const getNextStatus = (current: ProductionStatus): ProductionStatus | null => {
    const vs = visibleColumns.map(c => c.status);
    const idx = vs.indexOf(current);
    return idx < vs.length - 1 ? vs[idx + 1] : null;
  };

  const totalOrders = orders.length;
  const inProduction = getOrdersByStatus('in_production').length;
  const readyCount = getOrdersByStatus('ready').length;

  return (
    <AdminLayout title="Kanban de Produção" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="📋 Guia do Kanban de Produção"
          description="Acompanhe visualmente o status de produção de cada pedido."
          steps={[
            { title: "Arrastar cards", description: "Mova pedidos entre colunas arrastando os cards para atualizar o status de produção." },
            { title: "Colunas de status", description: "Cada coluna representa uma etapa: Pendente → Material → Produção → Qualidade → Pronto → Enviado." },
            { title: "Filtrar pedidos", description: "Use a busca para encontrar pedidos específicos pelo número ou nome do cliente." },
            { title: "Notas de produção", description: "Adicione observações em cada pedido para comunicar detalhes à equipe." },
            { title: "Configurar colunas", description: "Oculte ou exiba colunas conforme seu fluxo de produção." },
          ]}
        />

        {/* Summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="grid grid-cols-3 gap-3 flex-1">
            <AdminSummaryCard title="Total Pedidos" value={totalOrders} icon={Package} variant="purple" />
            <AdminSummaryCard title="Em Produção" value={inProduction} icon={Wrench} variant="blue" />
            <AdminSummaryCard title="Prontos" value={readyCount} icon={CheckCircle} variant="green" />
          </div>
          <Button className="admin-btn admin-btn-edit !min-h-0 !py-1.5 !px-3 shrink-0 gap-2"
            onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />Personalizar
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}>
          {visibleColumns.map(({ status, icon: Icon, color, borderColor, label }) => (
            <Card key={status} className={cn(
              'flex flex-col border-white/[0.08] bg-white/[0.04] border-t-4',
              borderColor
            )}>
              <CardHeader className="pb-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-xs text-white">
                  <Icon className={cn('h-3.5 w-3.5', color)} />
                  <span className="truncate">{label}</span>
                  <Badge className="ml-auto text-[10px] px-1.5 bg-white/[0.03] text-white/50 border-white/[0.08]">
                    {getOrdersByStatus(status).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 overflow-y-auto scrollbar-none" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-4 text-white/50 text-xs">Carregando...</div>
                  ) : getOrdersByStatus(status).length === 0 ? (
                    <div className="text-center py-6 text-white/50 text-xs opacity-50">Nenhum pedido</div>
                  ) : (
                    getOrdersByStatus(status).map((order) => {
                      const nextStatus = getNextStatus(status);
                      return (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 cursor-pointer hover:border-purple-500/40 transition-all"
                        >
                          <div className="flex items-start gap-1.5">
                            <GripVertical className="h-3 w-3 text-white/20 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-mono text-[10px] font-semibold text-purple-400">
                                  {order.order_number}
                                </span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-white/50 hover:text-white" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                              <p className="text-xs font-medium text-white truncate">{order.customer_name}</p>
                              <p className="text-[10px] text-white/50">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </p>
                              <p className="text-[9px] text-white/30 mt-0.5">
                                {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                              </p>
                              {nextStatus && (
                                <Button
                                  className="admin-btn admin-btn-save !min-h-0 !py-0.5 !px-1.5 h-5 text-[9px]"
                                  onClick={() => handleQuickMove(order, nextStatus)}
                                >
                                  Avançar →
                                </Button>
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
        <DialogContent className="max-w-md liquid-glass">
          <DialogHeader><DialogTitle className="text-white">Personalizar Kanban</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {columns.map((col, idx) => (
              <div key={col.status} className="flex items-center gap-2 p-2 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.status)} className="rounded accent-[hsl(270 70% 60%)]" />
                {editingColumn === col.status ? (
                  <div className="flex-1 flex gap-2">
                    <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="h-7 text-sm border-white/[0.08] bg-white/[0.03] text-white" autoFocus />
                    <Button size="sm" className="admin-btn admin-btn-save !min-h-0 !py-0.5 !px-2 h-7" onClick={() => renameColumn(col.status)}>OK</Button>
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-white">{col.label}</span>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50" onClick={() => { setEditingColumn(col.status); setEditLabel(col.label); }}><Edit2 className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50" onClick={() => moveColumn(idx, -1)} disabled={idx === 0}>↑</Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50" onClick={() => moveColumn(idx, 1)} disabled={idx === columns.length - 1}>↓</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={resetColumns} className="admin-btn admin-btn-edit">Restaurar Padrão</Button>
            <Button onClick={() => setShowSettings(false)} className="admin-btn admin-btn-save">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="liquid-glass">
          <DialogHeader><DialogTitle className="text-white">Pedido {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-white/50">Cliente</p><p className="font-medium text-white">{selectedOrder.customer_name}</p></div>
                <div><p className="text-white/50">Total</p><p className="font-medium text-white">R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</p></div>
                <div><p className="text-white/50">Status</p>
                  <Badge className={PRODUCTION_STATUS_COLORS[selectedOrder.production_status as ProductionStatus]}>
                    {PRODUCTION_STATUS_LABELS[selectedOrder.production_status as ProductionStatus]}
                  </Badge>
                </div>
                <div><p className="text-white/50">Criado em</p><p className="font-medium text-white">{format(new Date(selectedOrder.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p></div>
              </div>
              {selectedOrder.production_notes && (
                <div><p className="text-white/50 text-sm">Notas de Produção</p><p className="text-sm mt-1 text-white">{selectedOrder.production_notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Status */}
      <Dialog open={!!movingTo} onOpenChange={() => setMovingTo(null)}>
        <DialogContent className="liquid-glass">
          <DialogHeader>
            <DialogTitle className="text-white">
              Mover para {movingTo ? columns.find(c => c.status === movingTo.status)?.label || PRODUCTION_STATUS_LABELS[movingTo.status] : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/50 mb-2">Nota de produção (opcional)</p>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Material recebido, iniciando corte..."
                className="border-white/[0.08] bg-white/[0.03] text-white" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovingTo(null)} className="border-white/[0.08] text-white/50">Cancelar</Button>
            <Button onClick={handleMoveOrder} className="admin-btn admin-btn-save">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminKanbanPage;
