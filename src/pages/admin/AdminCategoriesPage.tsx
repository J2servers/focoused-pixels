import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Pencil, Trash2, Loader2, ImageIcon, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  useAdminCategoriesAll, useCreateCategory, useUpdateCategory, useDeleteCategory,
  type Category, type CategoryFormData,
} from '@/hooks/useAdminCategories';

type CategoryType = 'parent' | 'child';

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const INITIAL_FORM = { name: '', slug: '', description: '', image_url: '', parent_id: '', display_order: '0', status: 'active' };

const AdminCategoriesPage = () => {
  const { canEdit } = useAuthContext();
  const { data: categories = [], isLoading } = useAdminCategoriesAll();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dialogType, setDialogType] = useState<CategoryType>('parent');
  const [parentSectionOpen, setParentSectionOpen] = useState(true);
  const [childSectionOpen, setChildSectionOpen] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const isSaving = createCat.isPending || updateCat.isPending || deleteCat.isPending;
  const parentCategories = categories.filter(c => !c.parent_id);
  const childCategories = categories.filter(c => c.parent_id);

  const openCreateDialog = (type: CategoryType) => {
    setDialogType(type); setSelectedCategory(null); setFormData(INITIAL_FORM); setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category, type: CategoryType) => {
    setDialogType(type); setSelectedCategory(cat);
    setFormData({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      image_url: cat.image_url || '', parent_id: cat.parent_id || '',
      display_order: cat.display_order.toString(), status: cat.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) { toast.error('Nome é obrigatório'); return; }
    if (dialogType === 'child' && !formData.parent_id) { toast.error('Categoria pai é obrigatória'); return; }

    const slug = formData.slug || generateSlug(formData.name);
    const data: CategoryFormData = {
      name: formData.name, slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      parent_id: dialogType === 'parent' ? null : formData.parent_id || null,
      display_order: parseInt(formData.display_order) || 0,
      status: formData.status,
    };

    if (selectedCategory) { await updateCat.mutateAsync({ id: selectedCategory.id, data }); }
    else { await createCat.mutateAsync(data); }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    if (!selectedCategory.parent_id) {
      const hasChildren = childCategories.some(c => c.parent_id === selectedCategory.id);
      if (hasChildren) { toast.error('Remova as subcategorias antes'); setIsDeleteDialogOpen(false); return; }
    }
    await deleteCat.mutateAsync(selectedCategory.id);
    setIsDeleteDialogOpen(false);
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    return categories.find(c => c.id === parentId)?.name || '-';
  };

  const imageColumn = (cat: Category) => (
    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--admin-sidebar))] overflow-hidden flex items-center justify-center border border-[hsl(var(--admin-card-border))]">
      {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        : <ImageIcon className="w-5 h-5 text-[hsl(var(--admin-text-muted))]" />}
    </div>
  );

  const statusColumn = (cat: Category) => (
    <Badge variant={cat.status === 'active' ? 'default' : 'secondary'}
      className={cat.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-text-muted))]'}>
      {cat.status === 'active' ? 'Ativa' : 'Inativa'}
    </Badge>
  );

  const actionsColumn = (cat: Category, type: CategoryType) => (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={() => openEditDialog(cat, type)} disabled={!canEdit()}
        className="hover:bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-text-muted))] hover:text-white"><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" onClick={() => { setSelectedCategory(cat); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}
        className="hover:bg-red-500/20 text-red-400"><Trash2 className="h-4 w-4" /></Button>
    </div>
  );

  const parentColumns: Column<Category>[] = [
    { key: 'image_url', header: 'Imagem', className: 'w-16', render: imageColumn },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'slug', header: 'Slug' },
    { key: 'children_count', header: 'Subcategorias', render: (cat) => {
      const count = childCategories.filter(c => c.parent_id === cat.id).length;
      return <Badge variant="outline" className="border-[hsl(var(--admin-accent-cyan))] text-[hsl(var(--admin-accent-cyan))]">{count} {count === 1 ? 'subcategoria' : 'subcategorias'}</Badge>;
    }},
    { key: 'display_order', header: 'Ordem', sortable: true },
    { key: 'status', header: 'Status', render: statusColumn },
    { key: 'actions', header: 'Ações', className: 'w-24', render: (cat) => actionsColumn(cat, 'parent') },
  ];

  const childColumns: Column<Category>[] = [
    { key: 'image_url', header: 'Imagem', className: 'w-16', render: imageColumn },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'slug', header: 'Slug' },
    { key: 'parent_id', header: 'Categoria Pai', render: (cat) => <Badge variant="outline" className="border-[hsl(var(--admin-accent-purple))] text-[hsl(var(--admin-accent-purple))]">{getParentName(cat.parent_id)}</Badge> },
    { key: 'display_order', header: 'Ordem', sortable: true },
    { key: 'status', header: 'Status', render: statusColumn },
    { key: 'actions', header: 'Ações', className: 'w-24', render: (cat) => actionsColumn(cat, 'child') },
  ];

  return (
    <AdminLayout title="Categorias" requireEditor>
      <div className="space-y-6">
        <div className="flex justify-end">
          <ExportButtons data={[...parentCategories, ...childCategories].map(c => ({ nome: c.name, slug: c.slug, status: c.status || 'active', ordem: c.display_order ?? 0 }))} filename="categorias" title="Categorias" columns={[{key:'nome',header:'Nome'},{key:'slug',header:'Slug'},{key:'status',header:'Status'},{key:'ordem',header:'Ordem'}]} />
        </div>
        <Collapsible open={parentSectionOpen} onOpenChange={setParentSectionOpen}>
          <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]"><FolderOpen className="h-5 w-5 text-white" /></div>
                  <div><h3 className="text-lg font-semibold text-white">Categorias Principais</h3><p className="text-sm text-[hsl(var(--admin-text-muted))]">{parentCategories.length} categorias</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={(e) => { e.stopPropagation(); openCreateDialog('parent'); }} disabled={!canEdit()}
                    className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg"><Plus className="h-4 w-4 mr-2" />Nova Categoria</Button>
                  <ChevronDown className={`h-5 w-5 text-[hsl(var(--admin-text-muted))] transition-transform ${parentSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent><div className="border-t border-[hsl(var(--admin-card-border))]"><DataTable data={parentCategories} columns={parentColumns} isLoading={isLoading} searchPlaceholder="Buscar categorias..." /></div></CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible open={childSectionOpen} onOpenChange={setChildSectionOpen}>
          <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))]"><Folder className="h-5 w-5 text-white" /></div>
                  <div><h3 className="text-lg font-semibold text-white">Subcategorias</h3><p className="text-sm text-[hsl(var(--admin-text-muted))]">{childCategories.length} subcategorias</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={(e) => { e.stopPropagation(); openCreateDialog('child'); }} disabled={!canEdit() || parentCategories.length === 0}
                    className="bg-gradient-to-r from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))] text-white shadow-lg"><Plus className="h-4 w-4 mr-2" />Nova Subcategoria</Button>
                  <ChevronDown className={`h-5 w-5 text-[hsl(var(--admin-text-muted))] transition-transform ${childSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-[hsl(var(--admin-card-border))]">
                {parentCategories.length === 0 ? (
                  <div className="p-8 text-center text-[hsl(var(--admin-text-muted))]"><Folder className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Crie uma categoria principal primeiro.</p></div>
                ) : <DataTable data={childCategories} columns={childColumns} isLoading={isLoading} searchPlaceholder="Buscar subcategorias..." />}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {dialogType === 'parent' ? <><FolderOpen className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</> :
                <><Folder className="h-5 w-5 text-[hsl(var(--admin-accent-cyan))]" />{selectedCategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}</>}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label className="text-white">Nome *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Slug</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="gerado-automaticamente" className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white" /></div>
            <div className="space-y-2"><Label className="text-white">Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white" /></div>
            {dialogType === 'child' && (
              <div className="space-y-2"><Label className="text-white">Categoria Pai *</Label>
                <Select value={formData.parent_id || 'none'} onValueChange={(v) => setFormData({ ...formData, parent_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
                    <SelectItem value="none" className="text-white">Selecione...</SelectItem>
                    {parentCategories.map(cat => <SelectItem key={cat.id} value={cat.id} className="text-white">{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select></div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-white">Ordem</Label>
                <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white" /></div>
              <div className="space-y-2"><Label className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
                    <SelectItem value="active" className="text-white">Ativa</SelectItem><SelectItem value="inactive" className="text-white">Inativa</SelectItem>
                  </SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label className="text-white">Imagem</Label>
              <ImageUpload value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url || '' })} folder="categories" aspectRatio="aspect-square" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}
              className={dialogType === 'parent' ? "bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white" : "bg-gradient-to-r from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))] text-white"}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">Excluir "{selectedCategory?.name}"? Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
