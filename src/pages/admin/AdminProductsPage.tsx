import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload, MultiImageUpload } from '@/components/admin';
import { FormFieldInfo } from '@/components/admin/FormFieldInfo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import {
  useAdminProducts,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
  type ProductFormData,
} from '@/hooks/useAdminProducts';

const INITIAL_FORM = {
  name: '', slug: '', short_description: '', full_description: '', price: '', promotional_price: '',
  stock: '0', sku: '', status: 'draft', category_id: '', is_featured: false,
  cover_image: '' as string | null, gallery_images: [] as string[],
  cost_material: '', cost_labor: '', cost_shipping: '',
  min_stock: '5', weight_kg: '0.5', length_cm: '20', width_cm: '15', height_cm: '10',
};

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminProductsPage = () => {
  const { canEdit } = useAuthContext();
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [filterCategoryId, setFilterCategoryId] = useState('all');

  const isSaving = createProduct.isPending || updateProduct.isPending || deleteProduct.isPending;

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setFormData(INITIAL_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name, slug: product.slug,
      short_description: product.short_description || '',
      full_description: product.full_description || '',
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || '',
      stock: product.stock.toString(), sku: product.sku || '',
      status: product.status, category_id: product.category_id || '',
      is_featured: product.is_featured,
      cover_image: product.cover_image || null,
      gallery_images: product.gallery_images || [],
      cost_material: product.cost_material?.toString() || '',
      cost_labor: product.cost_labor?.toString() || '',
      cost_shipping: product.cost_shipping?.toString() || '',
      min_stock: product.min_stock?.toString() || '5',
      weight_kg: product.weight_kg?.toString() || '0.5',
      length_cm: product.length_cm?.toString() || '20',
      width_cm: product.width_cm?.toString() || '15',
      height_cm: product.height_cm?.toString() || '10',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    const slug = formData.slug || generateSlug(formData.name);
    const data: ProductFormData = {
      name: formData.name, slug,
      short_description: formData.short_description || null,
      full_description: formData.full_description || null,
      price: parseFloat(formData.price),
      promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
      stock: parseInt(formData.stock) || 0, sku: formData.sku || null,
      status: formData.status, category_id: formData.category_id || null,
      is_featured: formData.is_featured,
      cover_image: formData.cover_image || null,
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      cost_material: parseFloat(formData.cost_material) || 0,
      cost_labor: parseFloat(formData.cost_labor) || 0,
      cost_shipping: parseFloat(formData.cost_shipping) || 0,
      min_stock: parseInt(formData.min_stock) || 5,
      weight_kg: parseFloat(formData.weight_kg) || 0.5,
      length_cm: parseFloat(formData.length_cm) || 20,
      width_cm: parseFloat(formData.width_cm) || 15,
      height_cm: parseFloat(formData.height_cm) || 10,
    };

    if (selectedProduct) {
      await updateProduct.mutateAsync({ id: selectedProduct.id, data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct.mutateAsync(selectedProduct.id);
    setIsDeleteDialogOpen(false);
  };

  const parentCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  const filteredProducts = filterCategoryId === 'all'
    ? products
    : products.filter(p => {
        if (p.category_id === filterCategoryId) return true;
        const childIds = categories.filter(c => c.parent_id === filterCategoryId).map(c => c.id);
        return childIds.includes(p.category_id || '');
      });

  const columns: Column<Product>[] = [
    {
      key: 'cover_image', header: 'Imagem', className: 'w-16',
      render: (product) => (
        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
          {product.cover_image ? (
            <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : <span className="text-muted-foreground text-xs">Sem</span>}
        </div>
      ),
    },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'price', header: 'Preço', sortable: true, render: (p) => `R$ ${p.price.toFixed(2)}` },
    { key: 'stock', header: 'Estoque', sortable: true },
    {
      key: 'status', header: 'Status',
      render: (p) => (
        <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
          {p.status === 'active' ? 'Ativo' : p.status === 'inactive' ? 'Inativo' : 'Rascunho'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: 'Ações', className: 'w-24',
      render: (product) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} disabled={!canEdit()}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon"
            onClick={() => { setSelectedProduct(product); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Produtos" requireEditor>
      <DataTable
        data={filteredProducts}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar produtos..."
        showAllRows
        filterContent={
          <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
            <SelectTrigger className="w-full sm:w-56 h-10 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {parentCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
              {subCategories.map(sub => {
                const parent = categories.find(c => c.id === sub.parent_id);
                return (
                  <SelectItem key={sub.id} value={sub.id}>
                    &nbsp;&nbsp;↳ {sub.name} {parent ? `(${parent.name})` : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        }
        actions={
          <Button onClick={openCreateDialog} disabled={!canEdit()} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.4)] hover:shadow-xl">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        }
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">📋 Informações Básicas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormFieldInfo label="Nome do Produto" description="Título principal" showsIn="Listagem, página do produto" required />
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Letreiro Neon LED" />
              </div>
              <div className="space-y-2">
                <FormFieldInfo label="Slug (URL)" description="Gerado automaticamente" showsIn="URL do produto" />
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="gerado-automaticamente" />
              </div>
            </div>
            <div className="space-y-2">
              <FormFieldInfo label="Descrição Curta" description="Resumo em 1-2 frases" showsIn="Card e busca" />
              <Textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <FormFieldInfo label="Descrição Completa" description="Texto detalhado do produto" showsIn="Página do produto" />
              <Textarea value={formData.full_description || ''} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} rows={5} placeholder="Descreva o produto em detalhes..." />
            </div>

            <Separator />
            <div className="space-y-1"><h3 className="text-sm font-semibold text-white">💰 Preços e Estoque</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { key: 'price', label: 'Preço de Venda', required: true },
                { key: 'promotional_price', label: 'Preço Promocional' },
                { key: 'stock', label: 'Estoque', type: 'number' },
                { key: 'min_stock', label: 'Estoque Mínimo', type: 'number' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <FormFieldInfo label={f.label} description="" showsIn="" required={f.required} />
                  <div className="relative">
                    {f.key !== 'stock' && f.key !== 'min_stock' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>}
                    <Input type="number" step="0.01" className={f.key !== 'stock' && f.key !== 'min_stock' ? 'pl-9' : ''}
                      value={(formData as any)[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>

            <Separator />
            <div className="space-y-1"><h3 className="text-sm font-semibold text-white">📊 Custos</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['cost_material', 'cost_labor', 'cost_shipping'].map(key => (
                <div key={key} className="space-y-2">
                  <FormFieldInfo label={key === 'cost_material' ? 'Material' : key === 'cost_labor' ? 'Mão de Obra' : 'Frete'} description="" showsIn="Interno" />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                    <Input type="number" step="0.01" className="pl-9"
                      value={(formData as any)[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>

            <Separator />
            <div className="space-y-1"><h3 className="text-sm font-semibold text-white">📦 Peso e Dimensões</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: 'weight_kg', label: 'Peso (kg)' },
                { key: 'length_cm', label: 'Comprimento (cm)' },
                { key: 'width_cm', label: 'Largura (cm)' },
                { key: 'height_cm', label: 'Altura (cm)' },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <FormFieldInfo label={f.label} description="" showsIn="Frete" />
                  <Input type="number" step="0.1"
                    value={(formData as any)[f.key]} onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>

            <Separator />
            <div className="space-y-1"><h3 className="text-sm font-semibold text-white">🏷️ Organização</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormFieldInfo label="SKU" description="Código interno" showsIn="Interno" />
                <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <FormFieldInfo label="Categoria" description="" showsIn="Navegação" />
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormFieldInfo label="Status" description="" showsIn="Visibilidade" />
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 Rascunho</SelectItem>
                    <SelectItem value="active">✅ Ativo</SelectItem>
                    <SelectItem value="inactive">⏸️ Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <div className="space-y-1"><h3 className="text-sm font-semibold text-white">🖼️ Imagens</h3></div>
            <div className="space-y-2">
              <FormFieldInfo label="Imagem Principal" description="" showsIn="Card do produto" />
              <ImageUpload value={formData.cover_image} onChange={(url) => setFormData({ ...formData, cover_image: url })} folder="products" aspectRatio="aspect-square" />
            </div>
            <div className="space-y-2">
              <FormFieldInfo label="Galeria" description="" showsIn="Página do produto" />
              <MultiImageUpload value={formData.gallery_images} onChange={(urls) => setFormData({ ...formData, gallery_images: urls })} folder="products" maxImages={6} />
            </div>

            <Separator />
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
              <Switch checked={formData.is_featured} onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })} />
              <FormFieldInfo label="Produto em Destaque" description="Aparece na home" showsIn="Seção Destaques" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
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

export default AdminProductsPage;
