import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Promotion {
  id: string;
  name: string;
  type: string;
  value: number;
  rule: string;
  product_ids: string[] | null;
  category_ids: string[] | null;
  start_date: string;
  end_date: string;
  status: string;
  priority: number;
  banner_url: string | null;
  created_at: string;
}

const AdminPromotionsPage = () => {
  const { canEdit } = useAuthContext();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage',
    value: '',
    rule: 'general',
    start_date: '',
    end_date: '',
    status: 'inactive',
    priority: '0',
    banner_url: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('priority', { ascending: false });

    if (data) setPromotions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateDialog = () => {
    setSelectedPromotion(null);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setFormData({
      name: '',
      type: 'percentage',
      value: '',
      rule: 'general',
      start_date: now.toISOString().slice(0, 16),
      end_date: nextWeek.toISOString().slice(0, 16),
      status: 'inactive',
      priority: '0',
      banner_url: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setFormData({
      name: promo.name,
      type: promo.type,
      value: promo.value.toString(),
      rule: promo.rule,
      start_date: promo.start_date.slice(0, 16),
      end_date: promo.end_date.slice(0, 16),
      status: promo.status,
      priority: promo.priority.toString(),
      banner_url: promo.banner_url || '',
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

    setIsSaving(true);

    const promoData = {
      name: formData.name,
      type: formData.type,
      value,
      rule: formData.rule,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
      status: formData.status,
      priority: parseInt(formData.priority) || 0,
      banner_url: formData.banner_url || null,
    };

    try {
      if (selectedPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', selectedPromotion.id);

        if (error) throw error;
        toast.success('Promoção atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('promotions').insert(promoData);
        if (error) throw error;
        toast.success('Promoção criada com sucesso!');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar promoção';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', selectedPromotion.id);

      if (error) throw error;
      toast.success('Promoção excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir promoção';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Promotion>[] = [
    { key: 'name', header: 'Nome', sortable: true },
    {
      key: 'type',
      header: 'Desconto',
      render: (promo) => (
        <span className="font-medium">
          {promo.type === 'percentage' ? `${promo.value}%` : `R$ ${promo.value.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'rule',
      header: 'Regra',
      render: (promo) => {
        const rules: Record<string, string> = {
          general: 'Geral',
          category: 'Por Categoria',
          product: 'Por Produto',
        };
        return rules[promo.rule] || promo.rule;
      },
    },
    {
      key: 'start_date',
      header: 'Período',
      render: (promo) => (
        <span className="text-sm">
          {format(new Date(promo.start_date), 'dd/MM/yy', { locale: ptBR })} -{' '}
          {format(new Date(promo.end_date), 'dd/MM/yy', { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (promo) => (
        <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
          {promo.status === 'active' ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    { key: 'priority', header: 'Prioridade', sortable: true },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (promo) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(promo)} disabled={!canEdit()}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedPromotion(promo); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Promoções" requireEditor>
      <DataTable
        data={promotions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar promoções..."
        actions={
          <Button onClick={openCreateDialog} disabled={!canEdit()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Promoção
          </Button>
        }
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPromotion ? 'Editar Promoção' : 'Nova Promoção'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Desconto</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  type="number"
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'percentage' ? '10' : '15.00'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule">Regra de Aplicação</Label>
                <Select value={formData.rule} onValueChange={(v) => setFormData({ ...formData, rule: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral (todos produtos)</SelectItem>
                    <SelectItem value="category">Por Categoria</SelectItem>
                    <SelectItem value="product">Por Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Início *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Fim *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_url">URL do Banner</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a promoção "{selectedPromotion?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPromotionsPage;
