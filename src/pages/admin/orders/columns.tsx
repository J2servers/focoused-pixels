import { Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS, type ProductionStatus, type Order } from '@/hooks/useOrders';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, fmtCurrency } from './constants';

interface Args {
  onView: (o: Order) => void;
  onDelete: (id: string) => void;
}

export function buildOrderColumns({ onView, onDelete }: Args): Column<Order>[] {
  return [
    {
      key: 'order_number', header: 'Pedido', sortable: true,
      render: (o) => <span className="font-mono font-semibold text-purple-400">{o.order_number}</span>,
    },
    {
      key: 'customer_name', header: 'Cliente', sortable: true,
      render: (o) => (
        <div>
          <p className="font-medium text-white">{o.customer_name}</p>
          <p className="text-xs text-white/40">{o.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'total', header: 'Total', sortable: true,
      render: (o) => <span className="font-semibold text-white">{fmtCurrency(o.total)}</span>,
    },
    {
      key: 'order_status', header: 'Status',
      render: (o) => {
        const cfg = ORDER_STATUS_CONFIG[o.order_status] || ORDER_STATUS_CONFIG.pending;
        return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'payment_status', header: 'Pagamento',
      render: (o) => {
        const cfg = PAYMENT_STATUS_CONFIG[o.payment_status] || PAYMENT_STATUS_CONFIG.pending;
        return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'production_status', header: 'Produção',
      render: (o) => {
        const ps = o.production_status as ProductionStatus;
        return <Badge className={`${PRODUCTION_STATUS_COLORS[ps]} text-white`}>{PRODUCTION_STATUS_LABELS[ps]}</Badge>;
      },
    },
    {
      key: 'created_at', header: 'Data', sortable: true,
      render: (o) => <span className="text-sm text-white/50">{format(new Date(o.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}</span>,
    },
    {
      key: 'actions', header: '', className: 'w-24',
      render: (o) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            className="admin-btn admin-btn-view admin-btn-icon !min-h-0 !p-1 h-9 w-9"
            onClick={(e) => { e.stopPropagation(); onView(o); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            className="admin-btn admin-btn-delete admin-btn-icon !min-h-0 !p-1 h-9 w-9"
            onClick={(e) => { e.stopPropagation(); onDelete(o.id); }}
            title="Excluir pedido"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
