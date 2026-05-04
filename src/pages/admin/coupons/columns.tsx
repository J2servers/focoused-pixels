import { AdminStatusBadge } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Percent, DollarSign, Copy, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Column } from '@/components/admin/DataTable';
import type { Coupon } from '@/hooks/useCoupons';

interface Handlers {
  onDuplicate: (c: Coupon) => void;
  onEdit: (c: Coupon) => void;
  onDelete: (id: string) => void;
}

export function buildCouponsColumns({ onDuplicate, onEdit, onDelete }: Handlers): Column<Coupon>[] {
  return [
    {
      key: 'code', header: 'Código', sortable: true,
      render: (coupon) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${coupon.type === 'percentage' ? 'bg-purple-500/15' : 'bg-green-500/15'}`}>
            {coupon.type === 'percentage' ? <Percent className="h-5 w-5 text-purple-400" /> : <DollarSign className="h-5 w-5 text-green-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white">{coupon.code}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-white/50 hover:text-white"
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(coupon.code); toast.success('Código copiado!'); }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {coupon.description && <p className="text-xs text-white/50 mt-0.5 max-w-[200px] truncate">{coupon.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'value', header: 'Desconto', sortable: true,
      render: (coupon) => (
        <div>
          <span className="text-lg font-bold text-white">
            {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`}
          </span>
          {coupon.max_discount && coupon.type === 'percentage' && (
            <p className="text-[10px] text-white/50">máx R$ {coupon.max_discount.toFixed(2).replace('.', ',')}</p>
          )}
        </div>
      ),
    },
    {
      key: 'usage_count', header: 'Utilização',
      render: (coupon) => {
        const pct = coupon.usage_limit ? Math.round((coupon.usage_count / coupon.usage_limit) * 100) : 0;
        return (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-medium">{coupon.usage_count}</span>
              <span className="text-white/50">{coupon.usage_limit ? `de ${coupon.usage_limit}` : '∞'}</span>
            </div>
            {coupon.usage_limit && <Progress value={pct} className="h-1.5 bg-white/[0.03]" />}
          </div>
        );
      },
    },
    {
      key: 'min_order_value', header: 'Pedido Mín.',
      render: (coupon) => (
        <span className="text-sm text-white/50">
          {coupon.min_order_value ? `R$ ${coupon.min_order_value.toFixed(2).replace('.', ',')}` : '—'}
        </span>
      ),
    },
    {
      key: 'end_date', header: 'Validade',
      render: (coupon) => {
        if (!coupon.end_date) return <span className="text-xs text-white/50">Sem limite</span>;
        const endDate = new Date(coupon.end_date);
        const isExpired = isPast(endDate);
        const daysLeft = differenceInDays(endDate, new Date());
        const isExpiring = !isExpired && daysLeft <= 7;
        const tone = isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-white/50';
        return (
          <div className="space-y-0.5">
            <span className={`text-sm font-medium ${tone}`}>
              {format(endDate, 'dd/MM/yy', { locale: ptBR })}
            </span>
            <p className={`text-[10px] ${tone}`}>
              {isExpired ? 'Expirado' : `${daysLeft}d restantes`}
            </p>
          </div>
        );
      },
    },
    {
      key: 'is_active', header: 'Status', sortable: true,
      render: (coupon) => {
        const isExpired = coupon.end_date && isPast(new Date(coupon.end_date));
        if (isExpired) return <AdminStatusBadge label="Expirado" variant="danger" />;
        return <AdminStatusBadge label={coupon.is_active ? 'Ativo' : 'Inativo'} variant={coupon.is_active ? 'success' : 'neutral'} />;
      },
    },
    {
      key: 'actions', header: '', className: 'w-28',
      render: (coupon) => (
        <div className="flex justify-end gap-1">
          <Button className="admin-btn admin-btn-create admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => onDuplicate(coupon)} title="Duplicar">
            <Copy className="h-4 w-4" />
          </Button>
          <Button className="admin-btn admin-btn-edit admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => onEdit(coupon)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button className="admin-btn admin-btn-delete admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => onDelete(coupon.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
