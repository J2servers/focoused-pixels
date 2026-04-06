import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload, MultiImageUpload } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Plus, Trash2, Loader2, Save, X,
  DollarSign, Package, Ruler, Layers, TrendingUp, Star,
  ImageIcon, Eye,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct,
  type Product, type ProductFormData,
} from '@/hooks/useAdminProducts';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ═══ Liquid helpers ═══ */
function LiquidSection({ icon: Icon, title, accent = 'cyan', children }: { icon: React.ComponentType<{ className?: string }>; title: string; accent?: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    cyan: 'border-cyan-500/20 bg-cyan-500/[0.04]',
    green: 'border-emerald-500/20 bg-emerald-500/[0.04]',
    amber: 'border-amber-500/20 bg-amber-500/[0.04]',
    purple: 'border-purple-500/20 bg-purple-500/[0.04]',
    pink: 'border-pink-500/20 bg-pink-500/[0.04]',
  };
  const textColors: Record<string, string> = {
    cyan: 'text-cyan-400', green: 'text-emerald-400', amber: 'text-amber-400', purple: 'text-purple-400', pink: 'text-pink-400',
  };
  return (
    <div className={`rounded-xl border ${colors[accent] || colors.cyan} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${colors[accent] || colors.cyan}`}>
        <Icon className={`h-3.5 w-3.5 ${textColors[accent] || textColors.cyan}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${textColors[accent] || textColors.cyan}`}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function LiquidField({ label, value, onChange, type = 'text', prefix, suffix, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/30">{prefix}</span>}
        <Input type={type} step={type === 'number' ? '0.01' : undefined} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`h-8 text-xs liquid-input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`} />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30">{suffix}</span>}
      </div>
    </div>
  );
}

function LiquidKPI({ label, value, sub, accent = 'cyan' }: { label: string; value: string; sub?: string; accent?: 'green' | 'amber' | 'red' | 'cyan' }) {
  const bg = { green: 'border-emerald-500/20 bg-emerald-500/5', amber: 'border-amber-500/20 bg-amber-500/5', red: 'border-red-500/20 bg-red-500/5', cyan: 'border-cyan-500/20 bg-cyan-500/5' };
  const txt = { green: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', cyan: 'text-cyan-400' };
  return (
    <div className={`rounded-xl border p-2 ${bg[accent]} flex flex-col items-center text-center min-h-[50px]`}>
      <span className={`text-sm font-bold ${txt[accent]} leading-none`}>{value}</span>
      {sub && <span className="text-[8px] text-white/30 mt-0.5">{sub}</span>}
      <span className="text-[8px] text-white/50 mt-0.5 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

/* ═══ FORM STATE ═══ */
function buildForm(p?: Product) {
  if (!p) return {
    name: '', slug: '', short_description: '', full_description: '',
    price: '', promotional_price: '', stock: '0', sku: '', status: 'draft',
    category_id: '', is_featured: false, cover_image: null as string | null,
    gallery_images: [] as string[],
    cost_material: '', cost_labor: '', cost_shipping: '',
    min_stock: '5', weight_kg: '0.5', length_cm: '20', width_cm: '15', height_cm: '10',
  };
  return {
    name: p.name, slug: p.slug,
    short_description: p.short_description || '', full_description: p.full_description || '',
    price: p.price.toString(), promotional_price: p.promotional_price?.toString() || '',
    stock: p.stock.toString(), sku: p.sku || '', status: p.status,
    category_id: p.category_id || '', is_featured: p.is_featured,
    cover_image: p.cover_image || null, gallery_images: p.gallery_images || [],
    cost_material: (p.cost_material || 0).toString(), cost_labor: (p.cost_labor || 0).toString(),
    cost_shipping: (p.cost_shipping || 0).toString(),
    min_stock: (p.min_stock || 5).toString(), weight_kg: (p.weight_kg || 0.5).toString(),
    length_cm: (p.length_cm || 20).toString(), width_cm: (p.width_cm || 15).toString(), height_cm: (p.height_cm || 10).toString(),
  };
}

/* ═══ DETAIL PANEL ═══ */
function ProductPanel({ product, categories, canEdit, onSave, isSaving, onDelete, onClose, isNew }: {
  product: Product | null; categories: { id: string; name: string; parent_id: string | null }[];
  canEdit: boolean; onSave: (data: ProductFormData, id?: string) => Promise<void>;
  isSaving: boolean; onDelete?: (p: Product) => void; onClose?: () => void; isNew?: boolean;
}) {
  const [form, setForm] = useState(() => buildForm(product || undefined));
  const [lastId, setLastId] = useState(product?.id || '__new__');

  const currentId = product?.id || '__new__';
  if (currentId !== lastId) {
    setLastId(currentId);
    setForm(buildForm(product || undefined));
  }

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const price = parseFloat(form.price) || 0;
  const promo = parseFloat(form.promotional_price) || null;
  const stock = parseInt(form.stock) || 0;
  const costT = (parseFloat(form.cost_material) || 0) + (parseFloat(form.cost_labor) || 0) + (parseFloat(form.cost_shipping) || 0);
  const margin = price > 0 ? ((price - costT) / price * 100) : 0;
  const hasPromo = promo && promo < price;
  const stockAccent = stock <= 0 ? 'red' as const : stock <= (parseInt(form.min_stock) || 5) ? 'amber' as const : 'green' as const;
  const marginAccent = margin >= 50 ? 'green' as const : margin >= 20 ? 'amber' as const : 'red' as const;

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    const slug = form.slug || generateSlug(form.name);
    const data: ProductFormData = {
      name: form.name, slug,
      short_description: form.short_description || null, full_description: form.full_description || null,
      price: parseFloat(form.price), promotional_price: form.promotional_price ? parseFloat(form.promotional_price) : null,
      stock: parseInt(form.stock) || 0, sku: form.sku || null, status: form.status,
      category_id: form.category_id || null, is_featured: form.is_featured,
      cover_image: form.cover_image || null,
      gallery_images: form.gallery_images.length > 0 ? form.gallery_images : null,
      cost_material: parseFloat(form.cost_material) || 0, cost_labor: parseFloat(form.cost_labor) || 0,
      cost_shipping: parseFloat(form.cost_shipping) || 0,
      min_stock: parseInt(form.min_stock) || 5, weight_kg: parseFloat(form.weight_kg) || 0.5,
      length_cm: parseFloat(form.length_cm) || 20, width_cm: parseFloat(form.width_cm) || 15, height_cm: parseFloat(form.height_cm) || 10,
    };
    await onSave(data, product?.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.08] liquid-glass">
        <h3 className="text-sm font-bold text-white truncate">
          {isNew ? '✨ Novo Produto' : product?.name || 'Produto'}
        </h3>
        <div className="flex items-center gap-1">
          <Button size="sm" className="admin-btn admin-btn-save h-8 text-xs !min-h-0 !px-3"
            onClick={handleSave} disabled={isSaving || !canEdit}>
            {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
            Salvar
          </Button>
          {product && onDelete && (
            <Button size="sm" className="admin-btn admin-btn-delete h-8 text-xs !min-h-0 !px-3" onClick={() => onDelete(product)} disabled={!canEdit}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />Deletar
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Body: 2/3 fields + 1/3 images */}
      <ScrollArea className="flex-1">
        <div className="flex h-full">
          <div className="w-2/3 p-4 space-y-3 border-r border-white/[0.04]">
            {product && (
              <div className="grid grid-cols-3 gap-2 mb-1">
                <LiquidKPI label="Preço" value={fmt(hasPromo ? promo! : price)} sub={hasPromo ? `de ${fmt(price)}` : undefined} accent={hasPromo ? 'green' : 'cyan'} />
                <LiquidKPI label="Estoque" value={`${stock}`} sub={`mín. ${form.min_stock}`} accent={stockAccent} />
                <LiquidKPI label="Margem" value={`${margin.toFixed(0)}%`} sub={fmt(price - costT)} accent={marginAccent} />
              </div>
            )}
            <LiquidSection icon={Layers} title="Informações Básicas" accent="cyan">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <LiquidField label="Nome *" value={form.name} onChange={(v) => set('name', v)} placeholder="Nome do produto" />
                  <LiquidField label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} placeholder="auto-gerado" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Descrição Curta</label>
                  <Textarea value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className="text-xs liquid-input min-h-[40px]" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Descrição Completa</label>
                  <Textarea value={form.full_description} onChange={(e) => set('full_description', e.target.value)} className="text-xs liquid-input min-h-[60px]" rows={4} />
                </div>
              </div>
            </LiquidSection>
            <LiquidSection icon={DollarSign} title="Preços & Estoque" accent="green">
              <div className="grid grid-cols-4 gap-2">
                <LiquidField label="Preço Venda *" value={form.price} onChange={(v) => set('price', v)} type="number" prefix="R$" />
                <LiquidField label="Preço Promo" value={form.promotional_price} onChange={(v) => set('promotional_price', v)} type="number" prefix="R$" />
                <LiquidField label="Estoque" value={form.stock} onChange={(v) => set('stock', v)} type="number" />
                <LiquidField label="Est. Mínimo" value={form.min_stock} onChange={(v) => set('min_stock', v)} type="number" />
              </div>
            </LiquidSection>
            <LiquidSection icon={TrendingUp} title="Custos" accent="amber">
              <div className="grid grid-cols-3 gap-2">
                <LiquidField label="Material" value={form.cost_material} onChange={(v) => set('cost_material', v)} type="number" prefix="R$" />
                <LiquidField label="Mão de Obra" value={form.cost_labor} onChange={(v) => set('cost_labor', v)} type="number" prefix="R$" />
                <LiquidField label="Frete Custo" value={form.cost_shipping} onChange={(v) => set('cost_shipping', v)} type="number" prefix="R$" />
              </div>
            </LiquidSection>
            <LiquidSection icon={Ruler} title="Peso & Dimensões" accent="purple">
              <div className="grid grid-cols-4 gap-2">
                <LiquidField label="Peso" value={form.weight_kg} onChange={(v) => set('weight_kg', v)} type="number" suffix="kg" />
                <LiquidField label="Comp." value={form.length_cm} onChange={(v) => set('length_cm', v)} type="number" suffix="cm" />
                <LiquidField label="Largura" value={form.width_cm} onChange={(v) => set('width_cm', v)} type="number" suffix="cm" />
                <LiquidField label="Altura" value={form.height_cm} onChange={(v) => set('height_cm', v)} type="number" suffix="cm" />
              </div>
            </LiquidSection>
            <LiquidSection icon={Layers} title="Organização" accent="pink">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <LiquidField label="SKU" value={form.sku} onChange={(v) => set('sku', v)} />
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Categoria</label>
                    <Select value={form.category_id} onValueChange={(v) => set('category_id', v)}>
                      <SelectTrigger className="h-8 text-xs liquid-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Status</label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger className="h-8 text-xs liquid-input"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Rascunho</SelectItem>
                        <SelectItem value="active">✅ Ativo</SelectItem>
                        <SelectItem value="inactive">⏸️ Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg liquid-glass">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} className="admin-switch-orange" />
                  <span className="text-[11px] text-white/60">Produto em Destaque</span>
                </div>
              </div>
            </LiquidSection>
            {product && (
              <a href={`/produto/${product.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/[0.08] text-xs font-medium transition-colors w-full">
                <Eye className="h-3 w-3" />Ver na loja
              </a>
            )}
          </div>
          <div className="w-1/3 p-4 space-y-4">
            <LiquidSection icon={ImageIcon} title="Imagem Principal" accent="purple">
              <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} folder="products" aspectRatio="aspect-square" />
            </LiquidSection>
            <LiquidSection icon={ImageIcon} title="Galeria" accent="cyan">
              <MultiImageUpload value={form.gallery_images} onChange={(urls) => set('gallery_images', urls)} folder="products" maxImages={6} />
            </LiquidSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
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
