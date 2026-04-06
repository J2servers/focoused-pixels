import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Percent, Tag, CheckCircle, Clock } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useAdminPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion,
  type Promotion, type PromotionFormData,
} from '@/hooks/useAdminPromotions';
import { toast } from 'sonner';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

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
    setFormData({ ...INITIAL_FORM, start_date: now.toISOString().slice(0, 16), end_date: nextWeek.toISOString().slice(0, 16) });
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
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    const value = parseFloat(formData.value);
    if (formData.type === 'percentage' && (value < 1 || value > 100)) {
      toast.error('Desconto percentual deve ser entre 1% e 100%'); return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('Data de fim deve ser posterior à data de início'); return;
    }
    const data: PromotionFormData = {
      name: formData.name, type: formData.type, value,
      rule: formData.rule,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      status: formData.status, priority: parseInt(formData.priority) || 0,
      banner_url: formData.banner_url || null,
    };
    if (selectedPromo) await updatePromo.mutateAsync({ id: selectedPromo.id, data });
    else await createPromo.mutateAsync(data);
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedPromo) return;
    await deletePromo.mutateAsync(selectedPromo.id);
    setIsDeleteDialogOpen(false);
  };

  const activeCount = promotions.filter(p => p.status === 'active').length;

  const columns: Column<Promotion>[] = [
    { key: 'name', header: 'Nome', sortable: true, render: (p) => <span className="font-medium text-white">{p.name}</span> },
    {
      key: 'type', header: 'Desconto',
      render: (p) => <span className="font-medium text-white">{p.type === 'percentage' ? `${p.value}%` : `R$ ${p.value.toFixed(2)}`}</span>,
    },
    {
      key: 'rule', header: 'Regra',
      render: (p) => ({ general: 'Geral', category: 'Por Categoria', product: 'Por Produto' }[p.rule] || p.rule),
    },
    {
      key: 'start_date', header: 'Período',
      render: (p) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {format(new Date(p.start_date), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(p.end_date), 'dd/MM/yy', { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p) => <AdminStatusBadge label={p.status === 'active' ? 'Ativa' : 'Inativa'} variant={p.status === 'active' ? 'success' : 'neutral'} />,
    },
    { key: 'priority', header: 'Prioridade', sortable: true },
    {
      key: 'actions', header: 'Ações', className: 'w-24',
      render: (promo) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="admin-btn admin-btn-edit !min-h-0 !p-1 h-8 w-8" onClick={() => openEditDialog(promo)} disabled={!canEdit()}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="admin-btn admin-btn-delete !min-h-0 !p-1 h-8 w-8" onClick={() => { setSelectedPromo(promo); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Promoções" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="🏷️ Guia de Promoções"
          description="Crie promoções com regras automáticas de desconto."
          steps={[
            { title: "Criar promoção", description: "Defina nome, tipo de desconto (% ou fixo), valor e período de validade." },
            { title: "Regras de aplicação", description: "Escolha se a promoção vale para todos os produtos ou categorias específicas." },
            { title: "Prioridade", description: "Defina a ordem de prioridade quando múltiplas promoções se aplicam ao mesmo produto." },
            { title: "Banner promocional", description: "Faça upload de um banner para exibir na loja durante a promoção." },
            { title: "Ativar/Desativar", description: "Controle quais promoções estão ativas sem precisar excluí-las." },
          ]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSummaryCard title="Total" value={promotions.length} icon={Tag} variant="purple" />
          <AdminSummaryCard title="Ativas" value={activeCount} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Inativas" value={promotions.length - activeCount} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Percentuais" value={promotions.filter(p => p.type === 'percentage').length} icon={Percent} variant="blue" />
        </div>

        <DataTable data={promotions} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar promoções..."
          actions={<Button onClick={openCreateDialog} disabled={!canEdit()} className="admin-btn admin-btn-create"><Plus className="h-4 w-4 mr-2" />Nova Promoção</Button>} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-white">{selectedPromo ? 'Editar Promoção' : 'Nova Promoção'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Nome *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentual (%)</SelectItem><SelectItem value="fixed">Valor Fixo (R$)</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Valor *</Label><Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Regra</Label>
                <Select value={formData.rule} onValueChange={(v) => setFormData({ ...formData, rule: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="general">Geral</SelectItem><SelectItem value="category">Por Categoria</SelectItem><SelectItem value="product">Por Produto</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Prioridade</Label><Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Início *</Label><Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Fim *</Label><Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Ativa</SelectItem><SelectItem value="inactive">Inativa</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Banner URL</Label><Input value={formData.banner_url} onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="admin-btn admin-btn-save">{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">Tem certeza que deseja excluir "{selectedPromo?.name}"?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white">Cancelar</Button>
            <Button className="admin-btn admin-btn-delete" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Trash2 className="h-4 w-4 mr-1" />Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;
