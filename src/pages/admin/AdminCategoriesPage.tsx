import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload } from '@/components/admin';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Pencil, Trash2, Loader2, ImageIcon, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  status: string;
  created_at: string;
}

type CategoryType = 'parent' | 'child';

const AdminCategoriesPage = () => {
  const { canEdit } = useAuthContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogType, setDialogType] = useState<CategoryType>('parent');
  const [parentSectionOpen, setParentSectionOpen] = useState(true);
  const [childSectionOpen, setChildSectionOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
    display_order: '0',
    status: 'active',
  });

  const parentCategories = categories.filter(c => !c.parent_id);
  const childCategories = categories.filter(c => c.parent_id);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openCreateDialog = (type: CategoryType) => {
    setDialogType(type);
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      parent_id: '',
      display_order: '0',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category, type: CategoryType) => {
    setDialogType(type);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || '',
      display_order: category.display_order.toString(),
      status: category.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (dialogType === 'child' && !formData.parent_id) {
      toast.error('Categoria pai é obrigatória para subcategorias');
      return;
    }

    setIsSaving(true);
    const slug = formData.slug || generateSlug(formData.name);

    const categoryData = {
      name: formData.name,
      slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      parent_id: dialogType === 'parent' ? null : formData.parent_id || null,
      display_order: parseInt(formData.display_order) || 0,
      status: formData.status,
    };

    try {
      if (selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', selectedCategory.id);

        if (error) throw error;
        toast.success('Categoria atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('categories').insert(categoryData);
        if (error) throw error;
        toast.success('Categoria criada com sucesso!');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar categoria';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    // Check if parent category has children
    if (!selectedCategory.parent_id) {
      const hasChildren = childCategories.some(c => c.parent_id === selectedCategory.id);
      if (hasChildren) {
        toast.error('Remova ou mova as subcategorias antes de excluir a categoria pai');
        setIsDeleteDialogOpen(false);
        return;
      }
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);

      if (error) throw error;
      toast.success('Categoria excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir categoria';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  const parentColumns: Column<Category>[] = [
    {
      key: 'image_url',
      header: 'Imagem',
      className: 'w-16',
      render: (cat) => (
        <div className="w-12 h-12 rounded-lg bg-[hsl(var(--admin-sidebar))] overflow-hidden flex items-center justify-center border border-[hsl(var(--admin-card-border))]">
          {cat.image_url ? (
            <img 
              src={cat.image_url} 
              alt={cat.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<span class="text-[hsl(var(--admin-text-muted))] text-xs">Erro</span>';
              }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-[hsl(var(--admin-text-muted))]" />
          )}
        </div>
      ),
    },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'slug', header: 'Slug' },
    { 
      key: 'children_count', 
      header: 'Subcategorias',
      render: (cat) => {
        const count = childCategories.filter(c => c.parent_id === cat.id).length;
        return (
          <Badge variant="outline" className="border-[hsl(var(--admin-accent-cyan))] text-[hsl(var(--admin-accent-cyan))]">
            {count} {count === 1 ? 'subcategoria' : 'subcategorias'}
          </Badge>
        );
      },
    },
    { key: 'display_order', header: 'Ordem', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (cat) => (
        <Badge 
          variant={cat.status === 'active' ? 'default' : 'secondary'}
          className={cat.status === 'active' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-text-muted))]'
          }
        >
          {cat.status === 'active' ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (cat) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => openEditDialog(cat, 'parent')} 
            disabled={!canEdit()}
            className="hover:bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-text-muted))] hover:text-white"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedCategory(cat); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
            className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const childColumns: Column<Category>[] = [
    {
      key: 'image_url',
      header: 'Imagem',
      className: 'w-16',
      render: (cat) => (
        <div className="w-12 h-12 rounded-lg bg-[hsl(var(--admin-sidebar))] overflow-hidden flex items-center justify-center border border-[hsl(var(--admin-card-border))]">
          {cat.image_url ? (
            <img 
              src={cat.image_url} 
              alt={cat.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<span class="text-[hsl(var(--admin-text-muted))] text-xs">Erro</span>';
              }}
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-[hsl(var(--admin-text-muted))]" />
          )}
        </div>
      ),
    },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'slug', header: 'Slug' },
    { 
      key: 'parent_id', 
      header: 'Categoria Pai',
      render: (cat) => (
        <Badge variant="outline" className="border-[hsl(var(--admin-accent-purple))] text-[hsl(var(--admin-accent-purple))]">
          {getParentName(cat.parent_id)}
        </Badge>
      ),
    },
    { key: 'display_order', header: 'Ordem', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (cat) => (
        <Badge 
          variant={cat.status === 'active' ? 'default' : 'secondary'}
          className={cat.status === 'active' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-[hsl(var(--admin-sidebar))] text-[hsl(var(--admin-text-muted))]'
          }
        >
          {cat.status === 'active' ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (cat) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => openEditDialog(cat, 'child')} 
            disabled={!canEdit()}
            className="hover:bg-[hsl(var(--admin-sidebar-hover))] text-[hsl(var(--admin-text-muted))] hover:text-white"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedCategory(cat); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
            className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Categorias" requireEditor>
      <div className="space-y-6">
        {/* Parent Categories Section */}
        <Collapsible open={parentSectionOpen} onOpenChange={setParentSectionOpen}>
          <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Categorias Principais</h3>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                      {parentCategories.length} {parentCategories.length === 1 ? 'categoria' : 'categorias'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); openCreateDialog('parent'); }} 
                    disabled={!canEdit()} 
                    className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.4)] hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                  <ChevronDown className={`h-5 w-5 text-[hsl(var(--admin-text-muted))] transition-transform ${parentSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-[hsl(var(--admin-card-border))]">
                <DataTable
                  data={parentCategories}
                  columns={parentColumns}
                  isLoading={isLoading}
                  searchPlaceholder="Buscar categorias principais..."
                />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Child Categories Section */}
        <Collapsible open={childSectionOpen} onOpenChange={setChildSectionOpen}>
          <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))]">
                    <Folder className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Subcategorias</h3>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                      {childCategories.length} {childCategories.length === 1 ? 'subcategoria' : 'subcategorias'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); openCreateDialog('child'); }} 
                    disabled={!canEdit() || parentCategories.length === 0} 
                    className="bg-gradient-to-r from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))] text-white shadow-lg shadow-[hsl(var(--admin-accent-cyan)/0.4)] hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Subcategoria
                  </Button>
                  <ChevronDown className={`h-5 w-5 text-[hsl(var(--admin-text-muted))] transition-transform ${childSectionOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-[hsl(var(--admin-card-border))]">
                {parentCategories.length === 0 ? (
                  <div className="p-8 text-center text-[hsl(var(--admin-text-muted))]">
                    <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Crie uma categoria principal primeiro para adicionar subcategorias.</p>
                  </div>
                ) : (
                  <DataTable
                    data={childCategories}
                    columns={childColumns}
                    isLoading={isLoading}
                    searchPlaceholder="Buscar subcategorias..."
                  />
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {dialogType === 'parent' ? (
                <>
                  <FolderOpen className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
                  {selectedCategory ? 'Editar Categoria Principal' : 'Nova Categoria Principal'}
                </>
              ) : (
                <>
                  <Folder className="h-5 w-5 text-[hsl(var(--admin-accent-cyan))]" />
                  {selectedCategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="gerado-automaticamente"
                className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
              />
            </div>

            {dialogType === 'child' && (
              <div className="space-y-2">
                <Label htmlFor="parent_id" className="text-white">Categoria Pai *</Label>
                <Select value={formData.parent_id || 'none'} onValueChange={(v) => setFormData({ ...formData, parent_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white">
                    <SelectValue placeholder="Selecione a categoria pai" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
                    <SelectItem value="none" className="text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Selecione...</SelectItem>
                    {parentCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-white">Ordem</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
                    <SelectItem value="active" className="text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Ativa</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Imagem da Categoria</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                folder="categories"
                aspectRatio="aspect-square"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className={dialogType === 'parent' 
                ? "bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white"
                : "bg-gradient-to-r from-[hsl(var(--admin-accent-cyan))] to-[hsl(var(--admin-accent-purple))] text-white"
              }
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Tem certeza que deseja excluir a {selectedCategory?.parent_id ? 'subcategoria' : 'categoria'} "{selectedCategory?.name}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">
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

export default AdminCategoriesPage;
