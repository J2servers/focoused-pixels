import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload, MultiImageUpload } from '@/components/admin';
import { FormFieldInfo } from '@/components/admin/FormFieldInfo';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

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
  gallery_images: string[] | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  cost_material?: number | null;
  cost_labor?: number | null;
  cost_shipping?: number | null;
  min_stock?: number | null;
  weight_kg?: number | null;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
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
    cover_image: '' as string | null,
    gallery_images: [] as string[],
    cost_material: '',
    cost_labor: '',
    cost_shipping: '',
    min_stock: '5',
    weight_kg: '0.5',
    length_cm: '20',
    width_cm: '15',
    height_cm: '10',
  });

  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const fetchData = async () => {
    setIsLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, parent_id').eq('status', 'active').order('name'),
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
      cover_image: null,
      gallery_images: [],
      cost_material: '',
      cost_labor: '',
      cost_shipping: '',
      min_stock: '5',
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
      cover_image: product.cover_image || null,
      gallery_images: product.gallery_images || [],
      cost_material: product.cost_material?.toString() || '',
      cost_labor: product.cost_labor?.toString() || '',
      cost_shipping: product.cost_shipping?.toString() || '',
      min_stock: product.min_stock?.toString() || '5',
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
      gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : null,
      cost_material: formData.cost_material ? parseFloat(formData.cost_material) : 0,
      cost_labor: formData.cost_labor ? parseFloat(formData.cost_labor) : 0,
      cost_shipping: formData.cost_shipping ? parseFloat(formData.cost_shipping) : 0,
      min_stock: parseInt(formData.min_stock) || 5,
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar produto';
      toast.error(message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir produto';
      toast.error(message);
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
        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
          {product.cover_image ? (
            <img 
              src={product.cover_image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<span class="text-muted-foreground text-xs">Erro</span>';
              }}
            />
          ) : (
            <span className="text-muted-foreground text-xs">Sem</span>
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

  const parentCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  const filteredProducts = filterCategoryId === 'all'
    ? products
    : products.filter(p => {
        if (p.category_id === filterCategoryId) return true;
        // Also include products from subcategories of the selected parent
        const childIds = categories.filter(c => c.parent_id === filterCategoryId).map(c => c.id);
        return childIds.includes(p.category_id || '');
      });

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
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
              {subCategories.length > 0 && parentCategories.length > 0 && (
                <>
                  {subCategories.map(sub => {
                    const parent = categories.find(c => c.id === sub.parent_id);
                    return (
                      <SelectItem key={sub.id} value={sub.id}>
                        &nbsp;&nbsp;↳ {sub.name} {parent ? `(${parent.name})` : ''}
                      </SelectItem>
                    );
                  })}
                </>
              )}
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
            {/* Seção: Informações Básicas */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                📋 Informações Básicas
              </h3>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Dados principais que identificam o produto</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Nome do Produto" 
                  description="Título principal que identifica o produto"
                  showsIn="Listagem, página do produto, carrinho e busca"
                  required
                />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Letreiro Neon LED Personalizado"
                />
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Slug (URL)" 
                  description="Identificador único para a URL do produto. Gerado automaticamente a partir do nome."
                  showsIn="URL da página do produto (ex: /produto/letreiro-neon-led)"
                />
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="gerado-automaticamente"
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormFieldInfo 
                label="Descrição Curta" 
                description="Resumo do produto em 1-2 frases. Destaque os principais benefícios."
                showsIn="Card do produto na listagem e busca do Google"
              />
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Ex: Letreiro em LED neon flexível, totalmente personalizável com sua logo ou frase."
                rows={3}
              />
            </div>

            <Separator />

            {/* Seção: Preços e Estoque */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                💰 Preços e Estoque
              </h3>
              <p className="text-xs text-muted-foreground">Valores de venda e controle de disponibilidade</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Preço de Venda" 
                  description="Valor base do produto que o cliente irá pagar"
                  showsIn="Card do produto, página do produto e carrinho"
                  required
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Preço Promocional" 
                  description="Valor com desconto. Se preenchido, o preço normal aparece riscado."
                  showsIn="Card do produto (badge de desconto) e página do produto"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="promotional_price"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={formData.promotional_price}
                    onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Estoque Atual" 
                  description="Quantidade disponível para venda. Zerado = produto indisponível."
                  showsIn="Interno - usado para alertas de estoque baixo"
                />
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Estoque Mínimo" 
                  description="Alerta quando o estoque ficar abaixo deste valor no dashboard"
                  showsIn="Dashboard administrativo (alertas)"
                />
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>

            <Separator />

            {/* Seção: Custos (para cálculo de margem) */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                📊 Custos do Produto
              </h3>
              <p className="text-xs text-muted-foreground">Informações internas para cálculo de margem de lucro (não visíveis ao cliente)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Custo de Material" 
                  description="Valor gasto em matéria-prima (acrílico, MDF, LED, etc)"
                  showsIn="Interno - relatório de margem no dashboard"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="cost_material"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={formData.cost_material}
                    onChange={(e) => setFormData({ ...formData, cost_material: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Custo de Mão de Obra" 
                  description="Valor estimado de produção/montagem por unidade"
                  showsIn="Interno - relatório de margem no dashboard"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="cost_labor"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={formData.cost_labor}
                    onChange={(e) => setFormData({ ...formData, cost_labor: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Custo de Frete/Embalagem" 
                  description="Valor médio de envio e embalagem por unidade"
                  showsIn="Interno - relatório de margem no dashboard"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="cost_shipping"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={formData.cost_shipping}
                    onChange={(e) => setFormData({ ...formData, cost_shipping: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção: Organização */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                🏷️ Organização e Visibilidade
              </h3>
              <p className="text-xs text-muted-foreground">Classificação e controle de exibição do produto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Código SKU" 
                  description="Código interno de identificação do produto (opcional)"
                  showsIn="Interno - controle de estoque e pedidos"
                />
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ex: LET-NEON-001"
                />
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Categoria" 
                  description="Agrupa o produto para navegação e filtros"
                  showsIn="Menu de categorias, filtros e página de categoria"
                />
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormFieldInfo 
                  label="Status" 
                  description="Rascunho: não visível. Ativo: visível para clientes. Inativo: oculto temporariamente."
                  showsIn="Controla se o produto aparece no site"
                />
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">📝 Rascunho</SelectItem>
                    <SelectItem value="active">✅ Ativo</SelectItem>
                    <SelectItem value="inactive">⏸️ Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Seção: Imagens */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                🖼️ Imagens do Produto
              </h3>
              <p className="text-xs text-muted-foreground">Fotos que serão exibidas aos clientes (recomendado: fundo branco, 800x800px mínimo)</p>
            </div>

            <div className="space-y-2">
              <FormFieldInfo 
                label="Imagem Principal" 
                description="Foto principal exibida em destaque. Use imagem de alta qualidade."
                showsIn="Card do produto, busca, carrinho e compartilhamentos"
              />
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                folder="products"
                aspectRatio="aspect-square"
                placeholder="Arraste ou clique para enviar a imagem principal"
              />
            </div>

            <div className="space-y-2">
              <FormFieldInfo 
                label="Galeria de Imagens" 
                description="Fotos adicionais mostrando detalhes, ângulos diferentes ou aplicações"
                showsIn="Página do produto (carrossel de imagens)"
              />
              <MultiImageUpload
                value={formData.gallery_images}
                onChange={(urls) => setFormData({ ...formData, gallery_images: urls })}
                folder="products"
                maxImages={6}
              />
            </div>

            <Separator />

            {/* Seção: Destaque */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
              />
              <div>
                <FormFieldInfo 
                  label="Produto em Destaque" 
                  description="Produtos em destaque aparecem na página inicial e seções especiais"
                  showsIn="Seção 'Destaques' na home e banners promocionais"
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

