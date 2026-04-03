import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useAdminPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion,
  type Promotion, type PromotionFormData,
} from '@/hooks/useAdminPromotions';
import { toast } from 'sonner';

const INITIAL_FORM = {
  name: '', type: 'percentage', value: '', rule: 'general',
  start_date: '', end_date: '', status: 'inactive', priority: '0', banner_url: '',
};

const AdminPromotionsPage = () => {
  const { canEdit } = useAuthContext();
  const { data: promotions = [], isLoading } = useAdminPromotions();
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const deletePromo = useDeletePromotion();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const isSaving = createPromo.isPending || updatePromo.isPending || deletePromo.isPending;

  const openCreateDialog = () => {
    setSelectedPromo(null);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setFormData({
      ...INITIAL_FORM,
      start_date: now.toISOString().slice(0, 16),
      end_date: nextWeek.toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (promo: Promotion) => {
    setSelectedPromo(promo);
    setFormData({
      name: promo.name, type: promo.type, value: promo.value.toString(),
      rule: promo.rule, start_date: promo.start_date.slice(0, 16),
      end_date: promo.end_date.slice(0, 16), status: promo.status,
      priority: promo.priority.toString(), banner_url: promo.banner_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.value || !formData.start_date || !formData.end_date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const value = parseFloat(formData.value);
    if (formData.type === 'percentage' && (value < 1 || value > 100)) {
      toast.error('Desconto percentual deve ser entre 1% e 100%');
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('Data de fim deve ser posterior à data de início');
      return;
    }

    const data: PromotionFormData = {
      name: formData.name, type: formData.type, value,
      rule: formData.rule,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      status: formData.status, priority: parseInt(formData.priority) || 0,
      banner_url: formData.banner_url || null,
    };

    if (selectedPromo) {
      await updatePromo.mutateAsync({ id: selectedPromo.id, data });
    } else {
      await createPromo.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedPromo) return;
    await deletePromo.mutateAsync(selectedPromo.id);
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Promotion>[] = [
    { key: 'name', header: 'Nome', sortable: true },
    {
      key: 'type', header: 'Desconto',
      render: (p) => <span className="font-medium">{p.type === 'percentage' ? `${p.value}%` : `R$ ${p.value.toFixed(2)}`}</span>,
    },
    {
      key: 'rule', header: 'Regra',
      render: (p) => ({ general: 'Geral', category: 'Por Categoria', product: 'Por Produto' }[p.rule] || p.rule),
    },
    {
      key: 'start_date', header: 'Período',
      render: (p) => (
        <span className="text-sm">
          {format(new Date(p.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(p.end_date), 'dd/MM/yy', { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p) => <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status === 'active' ? 'Ativa' : 'Inativa'}</Badge>,
    },
    { key: 'priority', header: 'Prioridade', sortable: true },
    {
      key: 'actions', header: 'Ações', className: 'w-24',
      render: (promo) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(promo)} disabled={!canEdit()}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedPromo(promo); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Promoções" requireEditor>
      <DataTable data={promotions} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar promoções..."
        actions={<Button onClick={openCreateDialog} disabled={!canEdit()}><Plus className="h-4 w-4 mr-2" />Nova Promoção</Button>} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedPromo ? 'Editar Promoção' : 'Nova Promoção'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentual (%)</SelectItem><SelectItem value="fixed">Valor Fixo (R$)</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Valor *</Label><Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Regra</Label>
                <Select value={formData.rule} onValueChange={(v) => setFormData({ ...formData, rule: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="general">Geral</SelectItem><SelectItem value="category">Por Categoria</SelectItem><SelectItem value="product">Por Produto</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Prioridade</Label><Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Início *</Label><Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fim *</Label><Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Ativa</SelectItem><SelectItem value="inactive">Inativa</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Banner URL</Label><Input value={formData.banner_url} onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir "{selectedPromo?.name}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;
