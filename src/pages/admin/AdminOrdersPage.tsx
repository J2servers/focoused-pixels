import { useMemo, useState } from 'react';
import { AdminLayout, AdminSummaryCard } from '@/components/admin';
import { DataTable } from '@/components/admin/DataTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useOrders, useUpdateOrder, useUpdateProductionStatus, useDeleteOrder,
  type Order,
} from '@/hooks/useOrders';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Clock, CheckCircle, DollarSign, AlertTriangle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, EXPORT_COLUMNS, fmtCurrency } from './orders/constants';
import { buildOrderColumns } from './orders/columns';
import { OrderDetailDialog } from './orders/OrderDetailDialog';

const isCompletedSale = (o: Order) => o.payment_status === 'paid' && o.order_status !== 'cancelled';
const isAwaitingPayment = (o: Order) => o.payment_status === 'pending' && o.order_status !== 'cancelled';
const sumOrders = (list: Order[]) => list.reduce((s, o) => s + (o.total || 0), 0);

const AdminOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'paid' | 'awaiting'>('paid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const updateProductionStatus = useUpdateProductionStatus();
  const deleteOrder = useDeleteOrder();

  const paidOrders = useMemo(() => orders.filter(isCompletedSale), [orders]);
  const awaitingOrders = useMemo(() => orders.filter(isAwaitingPayment), [orders]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteOrder.mutateAsync(deleteId);
    setDeleteId(null);
    if (selectedOrder?.id === deleteId) setSelectedOrder(null);
  };

  const filteredOrders = useMemo(() => {
    const list = viewMode === 'paid' ? paidOrders : awaitingOrders;
    return list.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && o.created_at >= `${dateFrom}T00:00:00`;
      if (dateTo) matchesDate = matchesDate && o.created_at <= `${dateTo}T23:59:59`;
      return matchesStatus && matchesDate;
    });
  }, [paidOrders, awaitingOrders, viewMode, statusFilter, dateFrom, dateTo]);

  const paidRevenue = useMemo(() => sumOrders(paidOrders), [paidOrders]);
  const awaitingRevenue = useMemo(() => sumOrders(awaitingOrders), [awaitingOrders]);

  const exportData = filteredOrders.map((o) => ({
    ...o,
    total_fmt: fmtCurrency(o.total),
    order_status_label: ORDER_STATUS_CONFIG[o.order_status]?.label || o.order_status,
    payment_status_label: PAYMENT_STATUS_CONFIG[o.payment_status]?.label || o.payment_status,
    created_at_fmt: format(new Date(o.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  }));

  const columns = buildOrderColumns({ onView: setSelectedOrder, onDelete: setDeleteId });

  const filterContent = (
    <div className="flex gap-2 flex-wrap">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] liquid-input text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[150px] liquid-input text-white" />
      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[150px] liquid-input text-white" />
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
          <TabsList className="grid w-full max-w-md grid-cols-2 liquid-glass">
            <TabsTrigger value="paid" className="data-[state=active]:bg-white/[0.1] data-[state=active]:text-white">Vendas Feitas</TabsTrigger>
            <TabsTrigger value="awaiting" className="data-[state=active]:bg-white/[0.1] data-[state=active]:text-white">Aguardando Pagamento</TabsTrigger>
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

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={(id, data) => updateOrder.mutateAsync({ id, ...data })}
        onUpdateProduction={(id, status) => updateProductionStatus.mutateAsync({ id, status })}
        onDelete={setDeleteId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[hsl(250_25%_12%)] border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Excluir Pedido</AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Tem certeza? Esta ação removerá o pedido e seus itens permanentemente e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="admin-btn admin-btn-delete">
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
