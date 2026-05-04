import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Plus, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct,
  type Product, type ProductFormData,
} from '@/hooks/useAdminProducts';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { ProductPanel } from '@/components/admin/products/ProductPanel';

const AdminProductsPage = () => {
  const { canEdit } = useAuthContext();
  const isMobile = useIsMobile();
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState('all');

  const isSaving = createProduct.isPending || updateProduct.isPending;
  const panelOpen = !!selectedProduct || isCreating;

  const parentCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  const filteredProducts = filterCategoryId === 'all' ? products : products.filter(p => {
    if (p.category_id === filterCategoryId) return true;
    return categories.filter(c => c.parent_id === filterCategoryId).map(c => c.id).includes(p.category_id || '');
  });

  const handleSave = async (data: ProductFormData, id?: string) => {
    if (id) { await updateProduct.mutateAsync({ id, data }); }
    else { await createProduct.mutateAsync(data); setIsCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProduct.mutateAsync(deleteTarget.id);
    setIsDeleteDialogOpen(false);
    if (selectedProduct?.id === deleteTarget.id) setSelectedProduct(null);
  };

  const columns: Column<Product>[] = [
    {
      key: 'cover_image', header: '', className: 'w-10',
      render: (p) => (
        <div className="w-9 h-9 rounded-lg liquid-glass overflow-hidden flex items-center justify-center">
          {p.cover_image ? <img src={p.cover_image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-3.5 w-3.5 text-white/15" />}
        </div>
      ),
    },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'price', header: 'Preço', sortable: true, render: (p) => `R$ ${p.price.toFixed(2)}` },
    { key: 'stock', header: 'Est.', sortable: true, className: 'w-14' },
    {
      key: 'status', header: '', className: 'w-16',
      render: (p) => (
        <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-[9px] px-1.5">
          {p.status === 'active' ? 'Ativo' : p.status === 'inactive' ? 'Off' : '📝'}
        </Badge>
      ),
    },
  ];

  const panelContent = (
    <ProductPanel
      product={isCreating ? null : selectedProduct}
      categories={categories}
      canEdit={canEdit()}
      onSave={handleSave}
      isSaving={isSaving}
      isNew={isCreating}
      onDelete={(p) => { setDeleteTarget(p); setIsDeleteDialogOpen(true); }}
      onClose={() => { setSelectedProduct(null); setIsCreating(false); }}
    />
  );

  return (
    <AdminLayout title="Produtos" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="📦 Guia de Produtos"
          description="Cadastre, edite e organize todos os produtos da loja."
          steps={[
            { title: "Adicionar produto", description: "Clique em 'Novo Produto' e preencha nome, preço, descrição e imagens." },
            { title: "Editar inline", description: "Selecione um produto na lista para editar todos os campos no painel lateral." },
            { title: "Imagens", description: "Faça upload da imagem de capa e galeria diretamente no painel de edição." },
            { title: "Estoque", description: "Configure quantidade em estoque e estoque mínimo para alertas automáticos." },
            { title: "Custos e margem", description: "Defina custos de material, mão de obra e frete para calcular a margem." },
            { title: "Status", description: "Alterne entre Ativo, Rascunho ou Arquivado para controlar a visibilidade." },
          ]}
        />

        <div className={cn("flex h-[calc(100vh-8rem)]", !isMobile && "flex-row")}>
          <div className={cn(
            "flex flex-col min-h-0 overflow-hidden transition-all duration-300",
            panelOpen && !isMobile ? "w-2/5" : "w-full",
          )}>
            <DataTable
              data={filteredProducts}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Buscar produtos..."
              showAllRows
              onRowClick={(p) => { setIsCreating(false); setSelectedProduct(p); }}
              filterContent={
                <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
                  <SelectTrigger className="w-full sm:w-44 h-9 liquid-input text-xs">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {parentCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    {subCategories.map(s => {
                      const p = categories.find(c => c.id === s.parent_id);
                      return <SelectItem key={s.id} value={s.id}>&nbsp;↳ {s.name}{p ? ` (${p.name})` : ''}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              }
              actions={
                <div className="flex items-center gap-2">
                  <ExportButtons data={filteredProducts.map(p => ({ nome: p.name, sku: p.sku || '', preco: p.price, estoque: p.stock ?? 0, status: p.status }))} filename="produtos" title="Produtos" columns={[{ key: 'nome', header: 'Nome' }, { key: 'sku', header: 'SKU' }, { key: 'preco', header: 'Preço' }, { key: 'estoque', header: 'Estoque' }, { key: 'status', header: 'Status' }]} />
                  <Button onClick={() => { setSelectedProduct(null); setIsCreating(true); }} disabled={!canEdit()} className="admin-btn admin-btn-create">
                    <Plus className="h-4 w-4 mr-1" />Novo Produto
                  </Button>
                </div>
              }
            />
          </div>

          {!isMobile && panelOpen && (
            <div className="w-3/5 border-l border-white/[0.06] liquid-glass overflow-hidden animate-in slide-in-from-right-5 duration-300">
              {panelContent}
            </div>
          )}
        </div>

        {isMobile && (
          <Sheet open={panelOpen} onOpenChange={(open) => { if (!open) { setSelectedProduct(null); setIsCreating(false); } }}>
            <SheetContent side="bottom" className="h-[90vh] p-0 liquid-glass border-t border-cyan-500/20 rounded-t-2xl">
              {panelContent}
            </SheetContent>
          </Sheet>
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="liquid-glass border-white/[0.1]">
            <DialogHeader>
              <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
              <DialogDescription>Tem certeza que deseja excluir "{deleteTarget?.name}"?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white">Cancelar</Button>
              <Button className="admin-btn admin-btn-delete" onClick={handleDelete} disabled={deleteProduct.isPending}>
                {deleteProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Trash2 className="h-4 w-4 mr-1" />Deletar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
