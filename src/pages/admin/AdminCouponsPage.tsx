import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard, AdminStatusBadge } from '@/components/admin';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, type Coupon } from '@/hooks/useCoupons';
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign, TicketPercent } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const initialFormData = {
  code: '',
  description: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0,
  min_order_value: null as number | null,
  max_discount: null as number | null,
  usage_limit: null as number | null,
  is_active: true,
  start_date: '',
  end_date: '',
};

const AdminCouponsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const activeCount = useMemo(() => coupons.filter(c => c.is_active).length, [coupons]);
  const percentCount = useMemo(() => coupons.filter(c => c.type === 'percentage').length, [coupons]);
  const fixedCount = useMemo(() => coupons.filter(c => c.type === 'fixed').length, [coupons]);

  const openCreateDialog = () => {
    setFormData(initialFormData);
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      min_order_value: coupon.min_order_value,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      is_active: coupon.is_active,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
    });
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingCoupon) {
      await updateCoupon.mutateAsync({
        id: editingCoupon.id,
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      });
    } else {
      await createCoupon.mutateAsync({
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCoupon.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Código',
      sortable: true,
      render: (coupon) => (
        <div>
          <span className="font-mono font-bold text-[hsl(var(--admin-accent-purple))]">{coupon.code}</span>
          {coupon.description && (
            <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">{coupon.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (coupon) => (
        <Badge variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))]">
          {coupon.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}
        </Badge>
      ),
    },
    {
      key: 'value',
      header: 'Valor',
      sortable: true,
      render: (coupon) => (
        <span className="font-semibold text-white">
          {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`}
        </span>
      ),
    },
    {
      key: 'usage_count',
      header: 'Uso',
      render: (coupon) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {coupon.usage_count} / {coupon.usage_limit || '∞'}
        </span>
      ),
    },
    {
      key: 'end_date',
      header: 'Validade',
      render: (coupon) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {coupon.start_date && coupon.end_date
            ? `${format(new Date(coupon.start_date), 'dd/MM', { locale: ptBR })} - ${format(new Date(coupon.end_date), 'dd/MM', { locale: ptBR })}`
            : coupon.end_date
            ? `Até ${format(new Date(coupon.end_date), 'dd/MM/yy', { locale: ptBR })}`
            : 'Sem limite'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      sortable: true,
      render: (coupon) => (
        <AdminStatusBadge label={coupon.is_active ? 'Ativo' : 'Inativo'} variant={coupon.is_active ? 'success' : 'neutral'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (coupon) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => openEditDialog(coupon)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteId(coupon.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Cupons de Desconto" requireEditor>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSummaryCard title="Total" value={coupons.length} icon={Tag} variant="purple" />
          <AdminSummaryCard title="Ativos" value={activeCount} icon={TicketPercent} variant="green" />
          <AdminSummaryCard title="Percentuais" value={percentCount} icon={Percent} variant="blue" />
          <AdminSummaryCard title="Valor Fixo" value={fixedCount} icon={DollarSign} variant="orange" />
        </div>

        <DataTable
          data={coupons}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por código ou descrição..."
          emptyMessage="Nenhum cupom cadastrado"
          actions={
            <Button onClick={openCreateDialog} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          }
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Código</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO10"
                  className="uppercase bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white"
                />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Tipo</Label>
                <Select value={formData.type} onValueChange={(v: 'percentage' | 'fixed') => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[hsl(var(--admin-text-muted))]">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Cupom especial de inauguração"
                rows={2}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Valor do Desconto</Label>
                <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Pedido Mínimo (R$)</Label>
                <Input type="number" value={formData.min_order_value || ''} onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value ? parseFloat(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Desconto Máximo (R$)</Label>
                <Input type="number" value={formData.max_discount || ''} onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Limite de Uso</Label>
                <Input type="number" value={formData.usage_limit || ''} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Data Início</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Data Fim</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.6)]">
              <Label className="text-white">Cupom Ativo</Label>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!formData.code || !formData.value} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              {editingCoupon ? 'Salvar' : 'Criar Cupom'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCouponsPage;
