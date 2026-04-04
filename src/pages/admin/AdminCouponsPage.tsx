import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard, AdminStatusBadge } from '@/components/admin';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, type Coupon } from '@/hooks/useCoupons';
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign, TicketPercent, Copy, Zap, TrendingUp, Clock, AlertTriangle, Gift, Sparkles } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const initialFormData = {
  code: '', description: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 0, min_order_value: null as number | null,
  max_discount: null as number | null, usage_limit: null as number | null,
  is_active: true, start_date: '', end_date: '',
};

const QUICK_TEMPLATES = [
  { name: 'Primeira Compra', code: 'BEMVINDO10', type: 'percentage' as const, value: 10, desc: '10% para novos clientes' },
  { name: 'Frete Grátis', code: 'FRETEGRATIS', type: 'fixed' as const, value: 25, desc: 'R$25 para cobrir frete' },
  { name: 'Black Friday', code: 'BLACK30', type: 'percentage' as const, value: 30, desc: '30% promoção especial' },
  { name: 'Fidelidade', code: 'FIEL15', type: 'percentage' as const, value: 15, desc: '15% para clientes recorrentes' },
];

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
  const totalUsage = useMemo(() => coupons.reduce((sum, c) => sum + c.usage_count, 0), [coupons]);

  const expiringCoupons = useMemo(() =>
    coupons.filter(c => c.end_date && !isPast(new Date(c.end_date)) && differenceInDays(new Date(c.end_date), new Date()) <= 7),
    [coupons]
  );

  const expiredCoupons = useMemo(() =>
    coupons.filter(c => c.end_date && isPast(new Date(c.end_date)) && c.is_active),
    [coupons]
  );

  const topCoupons = useMemo(() =>
    [...coupons].sort((a, b) => b.usage_count - a.usage_count).slice(0, 3),
    [coupons]
  );

  const openCreateDialog = () => { setFormData(initialFormData); setEditingCoupon(null); setIsDialogOpen(true); };
  const openEditDialog = (coupon: Coupon) => {
    setFormData({
      code: coupon.code, description: coupon.description || '', type: coupon.type, value: coupon.value,
      min_order_value: coupon.min_order_value, max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit, is_active: coupon.is_active,
      start_date: coupon.start_date ? coupon.start_date.split('T')[0] : '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
    });
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingCoupon) {
      await updateCoupon.mutateAsync({
        id: editingCoupon.id, ...formData,
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

  const handleDelete = async () => { if (deleteId) { await deleteCoupon.mutateAsync(deleteId); setDeleteId(null); } };

  const handleQuickCreate = (template: typeof QUICK_TEMPLATES[0]) => {
    setFormData({
      ...initialFormData, code: template.code, type: template.type,
      value: template.value, description: template.desc, is_active: true,
    });
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (coupon: Coupon) => {
    setFormData({
      code: `${coupon.code}_COPY`, description: coupon.description || '', type: coupon.type, value: coupon.value,
      min_order_value: coupon.min_order_value, max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit, is_active: true, start_date: '', end_date: '',
    });
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code', header: 'Código', sortable: true,
      render: (coupon) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${coupon.type === 'percentage' ? 'bg-[hsl(var(--admin-accent-purple)/0.15)]' : 'bg-green-500/15'}`}>
            {coupon.type === 'percentage' ? <Percent className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" /> : <DollarSign className="h-5 w-5 text-green-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white">{coupon.code}</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-[hsl(var(--admin-text-muted))] hover:text-white"
                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(coupon.code); toast.success('Código copiado!'); }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {coupon.description && <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5 max-w-[200px] truncate">{coupon.description}</p>}
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
            <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">máx R$ {coupon.max_discount.toFixed(2).replace('.', ',')}</p>
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
              <span className="text-[hsl(var(--admin-text-muted))]">{coupon.usage_limit ? `de ${coupon.usage_limit}` : '∞'}</span>
            </div>
            {coupon.usage_limit && (
              <Progress value={pct} className="h-1.5 bg-[hsl(var(--admin-bg))]" />
            )}
          </div>
        );
      },
    },
    {
      key: 'min_order_value', header: 'Pedido Mín.',
      render: (coupon) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {coupon.min_order_value ? `R$ ${coupon.min_order_value.toFixed(2).replace('.', ',')}` : '—'}
        </span>
      ),
    },
    {
      key: 'end_date', header: 'Validade',
      render: (coupon) => {
        if (!coupon.end_date) return <span className="text-xs text-[hsl(var(--admin-text-muted))]">Sem limite</span>;
        const endDate = new Date(coupon.end_date);
        const isExpired = isPast(endDate);
        const daysLeft = differenceInDays(endDate, new Date());
        const isExpiring = !isExpired && daysLeft <= 7;
        return (
          <div className="space-y-0.5">
            <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
              {format(endDate, 'dd/MM/yy', { locale: ptBR })}
            </span>
            <p className={`text-[10px] ${isExpired ? 'text-red-400' : isExpiring ? 'text-amber-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => handleDuplicate(coupon)} title="Duplicar">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => openEditDialog(coupon)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => setDeleteId(coupon.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Cupons de Desconto" requireEditor>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminSummaryCard title="Total de Cupons" value={coupons.length} icon={Tag} variant="purple" />
          <AdminSummaryCard title="Ativos" value={activeCount} icon={TicketPercent} variant="green" />
          <AdminSummaryCard title="Percentuais" value={percentCount} icon={Percent} variant="blue" />
          <AdminSummaryCard title="Valor Fixo" value={fixedCount} icon={DollarSign} variant="orange" />
          <AdminSummaryCard title="Total de Usos" value={totalUsage} icon={TrendingUp} variant="purple" />
        </div>

        {/* Alerts Row */}
        {(expiringCoupons.length > 0 || expiredCoupons.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiringCoupons.length > 0 && (
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-300">Expirando em breve</h3>
                    <p className="text-xs text-amber-400/70 mt-0.5">
                      {expiringCoupons.map(c => c.code).join(', ')} — expiram nos próximos 7 dias
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {expiredCoupons.length > 0 && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-300">Cupons expirados ativos</h3>
                    <p className="text-xs text-red-400/70 mt-0.5">
                      {expiredCoupons.map(c => c.code).join(', ')} — ainda marcados como ativos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Top Performers + Quick Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Performers */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
                <h3 className="text-sm font-semibold text-white">Cupons Mais Utilizados</h3>
              </div>
              {topCoupons.length === 0 ? (
                <p className="text-sm text-[hsl(var(--admin-text-muted))] text-center py-4">Nenhum dado de uso ainda</p>
              ) : (
                <div className="space-y-3">
                  {topCoupons.map((coupon, i) => (
                    <div key={coupon.id} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-300' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-700/20 text-orange-400'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-white">{coupon.code}</span>
                          <span className="text-xs font-medium text-[hsl(var(--admin-accent-purple))]">{coupon.usage_count} usos</span>
                        </div>
                        {coupon.usage_limit && (
                          <Progress value={(coupon.usage_count / coupon.usage_limit) * 100} className="h-1 mt-1.5 bg-[hsl(var(--admin-bg))]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Create Templates */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-[hsl(var(--admin-accent-pink))]" />
                <h3 className="text-sm font-semibold text-white">Criação Rápida</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button key={tpl.code} onClick={() => handleQuickCreate(tpl)}
                    className="group p-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:border-[hsl(var(--admin-accent-purple)/0.4)] transition-all text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))] group-hover:text-[hsl(var(--admin-accent-pink))] transition-colors" />
                      <span className="text-xs font-semibold text-white">{tpl.name}</span>
                    </div>
                    <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">{tpl.desc}</p>
                    <div className="mt-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--admin-accent-purple)/0.1)] text-[hsl(var(--admin-accent-purple))]">
                        {tpl.code}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <DataTable
          data={coupons}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Buscar por código ou descrição..."
          emptyMessage="Nenhum cupom cadastrado"
          actions={
            <Button onClick={openCreateDialog} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              <Plus className="h-4 w-4 mr-2" />Novo Cupom
            </Button>
          }
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-accent-purple)/0.15)] flex items-center justify-center">
                <TicketPercent className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
              </div>
              {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview Banner */}
            {formData.code && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--admin-accent-purple)/0.1)] to-[hsl(var(--admin-accent-pink)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.2)] text-center">
                <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1">Prévia do cupom</p>
                <p className="text-lg font-bold font-mono text-white">{formData.code}</p>
                <p className="text-sm text-[hsl(var(--admin-accent-purple))]">
                  {formData.type === 'percentage' ? `${formData.value}% OFF` : `R$ ${formData.value.toFixed(2).replace('.', ',')} OFF`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Código</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="PROMO10" className="uppercase bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Tipo</Label>
                <Select value={formData.type} onValueChange={(v: 'percentage' | 'fixed') => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Cupom especial de inauguração" rows={2} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Valor do Desconto</Label>
                <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Pedido Mínimo (R$)</Label>
                <Input type="number" value={formData.min_order_value || ''} onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value ? parseFloat(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Desconto Máximo (R$)</Label>
                <Input type="number" value={formData.max_discount || ''} onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Limite de Uso</Label>
                <Input type="number" value={formData.usage_limit || ''} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Data Início</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs uppercase tracking-wide">Data Fim</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.6)]">
              <div>
                <Label className="text-white text-sm font-medium">Cupom Ativo</Label>
                <p className="text-[10px] text-[hsl(var(--admin-text-muted))]">Desativado, o cupom não poderá ser utilizado</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!formData.code || !formData.value} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
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
