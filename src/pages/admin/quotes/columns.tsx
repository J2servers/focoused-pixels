import { Column } from '@/components/admin';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRightCircle, Trash2, Building2 } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUOTE_STATUS_MAP, type Quote } from './constants';

interface Args {
  onView: (q: Quote) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  isConverting: boolean;
}

export function buildQuoteColumns({ onView, onConvert, onDelete, isConverting }: Args): Column<Quote>[] {
  return [
    {
      key: 'customer_name', header: 'Cliente', sortable: true,
      render: (q) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{q.customer_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-white text-sm">{q.customer_name}</p>
            <p className="text-[11px] text-white/50">{q.customer_email}</p>
            {q.customer_company && <p className="text-[10px] text-white/50 flex items-center gap-1"><Building2 className="h-3 w-3" />{q.customer_company}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'product_types', header: 'Produtos',
      render: (q) => (
        <div className="flex flex-wrap gap-1">
          {q.product_types.slice(0, 2).map((type) => (
            <span key={type} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{type}</span>
          ))}
          {q.product_types.length > 2 && <span className="text-[10px] text-white/50">+{q.product_types.length - 2}</span>}
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
          {q.cart_total ? `R$ ${q.cart_total.toFixed(2).replace('.', ',')}` : <span className="text-white/50 font-normal">A calcular</span>}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (q) => {
        const s = QUOTE_STATUS_MAP[q.status] || QUOTE_STATUS_MAP.pending;
        return <AdminStatusBadge label={s.label} variant={s.variant} />;
      },
    },
    {
      key: 'created_at', header: 'Data', sortable: true,
      render: (q) => {
        const isRecent = isAfter(new Date(q.created_at), subDays(new Date(), 1));
        return (
          <div>
            <span className="text-sm text-white/50">{format(new Date(q.created_at), "dd/MM/yy", { locale: ptBR })}</span>
            {isRecent && <Badge className="ml-2 text-[9px] bg-green-500/20 text-green-400 border-0">Novo</Badge>}
          </div>
        );
      },
    },
    {
      key: 'id', header: '', className: 'w-36',
      render: (q) => (
        <div className="flex justify-end gap-1">
          <Button className="admin-btn admin-btn-view admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => onView(q)}>
            <Eye className="h-4 w-4" />
          </Button>
          {q.status === 'approved' && (
            <Button onClick={() => onConvert(q.id)} disabled={isConverting}
              className="admin-btn admin-btn-save !min-h-0 !py-1.5 !px-3 text-xs">
              <ArrowRightCircle className="h-3 w-3 mr-1" />Converter
            </Button>
          )}
          <Button
            className="admin-btn admin-btn-delete admin-btn-icon !min-h-0 !p-1 h-9 w-9"
            onClick={() => onDelete(q.id)}
            title="Excluir orçamento"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
