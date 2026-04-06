import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Plus, Pencil, Trash2, Loader2, Boxes, AlertTriangle, Package } from 'lucide-react';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { useRawMaterials, useCreateRawMaterial, useUpdateRawMaterial, useDeleteRawMaterial, type RawMaterial, type RawMaterialInput } from '@/hooks/useRawMaterials';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const UNITS = ['un', 'kg', 'm', 'm²', 'cm', 'ml', 'L', 'pç', 'rolo', 'folha'];
const CATEGORIES = ['Acrílico', 'MDF', 'LED', 'Vinil', 'Cola', 'Parafusos', 'Embalagem', 'Elétrica', 'Outros'];

const INITIAL_FORM = { name: '', sku: '', unit: 'un', quantity: '0', min_quantity: '0', cost_per_unit: '', supplier: '', category: '', notes: '' };

const EXPORT_COLUMNS = [
  { key: 'name', header: 'Nome' },
  { key: 'sku', header: 'SKU' },
  { key: 'quantity', header: 'Qtd' },
  { key: 'unit', header: 'Unidade' },
  { key: 'cost_fmt', header: 'Custo Unit.' },
  { key: 'supplier', header: 'Fornecedor' },
  { key: 'category', header: 'Categoria' },
];

const AdminRawMaterialsPage = () => {
  const { data: materials = [], isLoading } = useRawMaterials();
  const createMat = useCreateRawMaterial();
  const updateMat = useUpdateRawMaterial();
  const deleteMat = useDeleteRawMaterial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const isSaving = createMat.isPending || updateMat.isPending || deleteMat.isPending;
  const lowStockCount = materials.filter(m => m.min_quantity && m.quantity <= m.min_quantity).length;
  const totalValue = materials.reduce((s, m) => s + (m.quantity * (m.cost_per_unit || 0)), 0);

  const openCreate = () => { setSelected(null); setForm(INITIAL_FORM); setDialogOpen(true); };
  const openEdit = (m: RawMaterial) => {
    setSelected(m);
    setForm({
      name: m.name, sku: m.sku || '', unit: m.unit, quantity: m.quantity.toString(),
      min_quantity: m.min_quantity?.toString() || '0', cost_per_unit: m.cost_per_unit?.toString() || '',
      supplier: m.supplier || '', category: m.category || '', notes: m.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const data: RawMaterialInput = {
      name: form.name, sku: form.sku || undefined, unit: form.unit,
      quantity: parseFloat(form.quantity) || 0, min_quantity: parseFloat(form.min_quantity) || 0,
      cost_per_unit: parseFloat(form.cost_per_unit) || undefined,
      supplier: form.supplier || undefined, category: form.category || undefined,
      notes: form.notes || undefined,
    };
    if (selected) { await updateMat.mutateAsync({ id: selected.id, data }); }
    else { await createMat.mutateAsync(data); }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    await deleteMat.mutateAsync(selected.id);
    setDeleteDialogOpen(false);
  };

  const columns: Column<RawMaterial>[] = [
    { key: 'name', header: 'Material', render: (m) => <span className="font-medium text-white">{m.name}</span> },
    { key: 'sku', header: 'SKU', render: (m) => <span className="text-xs text-white/50">{m.sku || '—'}</span> },
    { key: 'quantity', header: 'Estoque', render: (m) => {
      const low = m.min_quantity && m.quantity <= m.min_quantity;
      return <AdminStatusBadge label={`${m.quantity} ${m.unit}`} variant={low ? 'danger' : 'success'} />;
    }},
    { key: 'cost_per_unit', header: 'Custo Unit.', render: (m) => <span className="text-sm text-white">{m.cost_per_unit ? `R$ ${m.cost_per_unit.toFixed(2)}` : '—'}</span> },
    { key: 'supplier', header: 'Fornecedor', render: (m) => <span className="text-sm text-white/50">{m.supplier || '—'}</span> },
    { key: 'category', header: 'Categoria', render: (m) => m.category ? <AdminStatusBadge label={m.category} variant="info" /> : <span className="text-white/50">—</span> },
    { key: 'actions', header: 'Ações', className: 'w-24', render: (m) => (
      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="admin-btn admin-btn-edit !min-h-0 !p-1 h-8 w-8" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="admin-btn admin-btn-delete !min-h-0 !p-1 h-8 w-8" onClick={() => { setSelected(m); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  const exportData = materials.map(m => ({ ...m, cost_fmt: m.cost_per_unit ? `R$ ${m.cost_per_unit.toFixed(2)}` : '' }));

  return (
    <AdminLayout title="Matérias-Primas" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="🧱 Guia de Matérias-Primas"
          description="Controle o estoque de insumos para produção."
          steps={[
            { title: "Cadastrar material", description: "Clique em 'Novo Material' e preencha nome, SKU, unidade, quantidade e custo." },
            { title: "Estoque mínimo", description: "Defina a quantidade mínima para receber alertas de reposição." },
            { title: "Categorias", description: "Organize materiais por categoria: Acrílico, MDF, LED, Vinil, etc." },
            { title: "Custo por unidade", description: "Mantenha o custo atualizado para cálculo automático de margem dos produtos." },
            { title: "Exportar", description: "Exporte a lista de materiais para controle externo ou compras." },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminSummaryCard title="Total Materiais" value={materials.length} icon={Boxes} variant="blue" />
          <AdminSummaryCard title="Estoque Baixo" value={lowStockCount} icon={AlertTriangle} variant="pink" />
          <AdminSummaryCard title="Valor Inventário" value={`R$ ${totalValue.toFixed(2)}`} icon={Package} variant="green" />
        </div>

        <DataTable data={materials} columns={columns} isLoading={isLoading}
          searchPlaceholder="Buscar material..." emptyMessage="Nenhum material cadastrado"
          actions={
            <div className="flex gap-2">
              <ExportButtons data={exportData} columns={EXPORT_COLUMNS} filename="materias-primas" title="Matérias-Primas" />
              <Button onClick={openCreate} className="admin-btn admin-btn-create">
                <Plus className="h-4 w-4 mr-2" />Novo Material
              </Button>
            </div>
          }
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg liquid-glass">
          <DialogHeader>
            <DialogTitle className="text-white">{selected ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            <DialogDescription className="text-white/50">Preencha os dados da matéria-prima</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Nome *</Label>
                <Input className="bg-white/[0.03] border-white/[0.08] text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">SKU</Label>
                <Input className="bg-white/[0.03] border-white/[0.08] text-white" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Quantidade</Label>
                <Input type="number" className="bg-white/[0.03] border-white/[0.08] text-white" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Estoque Mín.</Label>
                <Input type="number" className="bg-white/[0.03] border-white/[0.08] text-white" value={form.min_quantity} onChange={e => setForm({ ...form, min_quantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Unidade</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Custo Unitário (R$)</Label>
                <Input type="number" step="0.01" className="bg-white/[0.03] border-white/[0.08] text-white" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-white/50 text-xs">Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-white/50 text-xs">Fornecedor</Label>
              <Input className="bg-white/[0.03] border-white/[0.08] text-white" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-white/50 text-xs">Observações</Label>
              <Textarea className="bg-white/[0.03] border-white/[0.08] text-white" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-white/[0.08] bg-transparent text-white">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="admin-btn admin-btn-save">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{selected ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="liquid-glass">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir material</DialogTitle>
            <DialogDescription className="text-white/50">Excluir "{selected?.name}"? Essa ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-white/[0.08] bg-transparent text-white">Cancelar</Button>
            <Button className="admin-btn admin-btn-delete" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Trash2 className="h-4 w-4 mr-1" />Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRawMaterialsPage;
