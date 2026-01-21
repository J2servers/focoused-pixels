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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  sku: string | null;
  status: string;
  cover_image: string | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const AdminProductsPage = () => {
  const { canEdit } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    price: '',
    promotional_price: '',
    stock: '0',
    sku: '',
    status: 'draft',
    category_id: '',
    is_featured: false,
    cover_image: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name').eq('status', 'active'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
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

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      price: '',
      promotional_price: '',
      stock: '0',
      sku: '',
      status: 'draft',
      category_id: '',
      is_featured: false,
      cover_image: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || '',
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || '',
      stock: product.stock.toString(),
      sku: product.sku || '',
      status: product.status,
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      cover_image: product.cover_image || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    setIsSaving(true);
    const slug = formData.slug || generateSlug(formData.name);

    const productData = {
      name: formData.name,
      slug,
      short_description: formData.short_description || null,
      price: parseFloat(formData.price),
      promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
      stock: parseInt(formData.stock) || 0,
      sku: formData.sku || null,
      status: formData.status,
      category_id: formData.category_id || null,
      is_featured: formData.is_featured,
      cover_image: formData.cover_image || null,
    };

    try {
      if (selectedProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedProduct.id);

      if (error) throw error;
      toast.success('Produto excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'cover_image',
      header: 'Imagem',
      className: 'w-16',
      render: (product) => (
        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
          {product.cover_image ? (
            <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Sem
            </div>
          )}
        </div>
      ),
    },
    { key: 'name', header: 'Nome', sortable: true },
    { 
      key: 'price', 
      header: 'Preço', 
      sortable: true,
      render: (product) => `R$ ${product.price.toFixed(2)}`,
    },
    { key: 'stock', header: 'Estoque', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
          {product.status === 'active' ? 'Ativo' : product.status === 'inactive' ? 'Inativo' : 'Rascunho'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (product) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)} disabled={!canEdit()}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedProduct(product); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Produtos" requireEditor>
      <DataTable
        data={products}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar produtos..."
        actions={
          <Button onClick={openCreateDialog} disabled={!canEdit()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        }
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="gerado-automaticamente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Descrição Curta</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotional_price">Preço Promocional</Label>
                <Input
                  id="promotional_price"
                  type="number"
                  step="0.01"
                  value={formData.promotional_price}
                  onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image">URL da Imagem</Label>
                <Input
                  id="cover_image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
              />
              <Label htmlFor="is_featured">Produto em destaque</Label>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? 
              Esta ação pode ser revertida na lixeira.
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

export default AdminProductsPage;
