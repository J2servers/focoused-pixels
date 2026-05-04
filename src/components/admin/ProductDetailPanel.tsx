import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload, MultiImageUpload } from './ImageUpload';
import {
  Package, DollarSign, Ruler, Pencil, ImageIcon, Layers,
  TrendingUp, Loader2, Check, Eye,
} from 'lucide-react';
import { LiquidSection, Field, InfoLine, KPI, fmtBRL } from './products/primitives';
import { buildForm, type ProductLike } from './products/buildForm';
import { PanelHeader } from './products/PanelHeader';

interface Category { id: string; name: string; parent_id: string | null; }

interface Product extends ProductLike {
  id: string;
  created_at: string;
  updated_at?: string;
}

interface ProductDetailPanelProps {
  product: Product;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onClose?: () => void;
  canEdit: boolean;
  onSave?: (id: string, data: Partial<Product>) => Promise<void>;
  isSaving?: boolean;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: 'Ativo', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  inactive: { label: 'Inativo', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  draft: { label: 'Rascunho', cls: 'bg-white/10 text-white/50 border-white/15' },
};

export function ProductDetailPanel({ product, categories, onEdit, onDelete, onClose, canEdit, onSave, isSaving }: ProductDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => buildForm(product));
  const [lastId, setLastId] = useState(product.id);

  if (product.id !== lastId) { setLastId(product.id); setEditing(false); setForm(buildForm(product)); }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const price = editing ? parseFloat(form.price) || 0 : product.price;
  const promo = editing ? (parseFloat(form.promotional_price) || null) : product.promotional_price;
  const stock = editing ? parseInt(form.stock) || 0 : product.stock;
  const costM = editing ? parseFloat(form.cost_material) || 0 : (product.cost_material || 0);
  const costL = editing ? parseFloat(form.cost_labor) || 0 : (product.cost_labor || 0);
  const costS = editing ? parseFloat(form.cost_shipping) || 0 : (product.cost_shipping || 0);
  const totalCost = costM + costL + costS;
  const margin = price > 0 ? ((price - totalCost) / price * 100) : 0;
  const hasPromo = !!(promo && promo < price);
  const discountPct = hasPromo ? Math.round(((price - (promo as number)) / price) * 100) : 0;
  const stockAccent = stock <= 0 ? 'red' as const : stock <= (parseInt(form.min_stock) || 5) ? 'amber' as const : 'green' as const;
  const marginAccent = margin >= 50 ? 'green' as const : margin >= 20 ? 'amber' as const : 'red' as const;
  const category = categories.find(c => c.id === (editing ? form.category_id : product.category_id));
  const currentStatus = editing ? form.status : product.status;
  const status = STATUS_MAP[currentStatus] || STATUS_MAP.draft;

  const handleSaveInline = async () => {
    if (!onSave) { onEdit(product); return; }
    await onSave(product.id, {
      name: form.name, slug: form.slug,
      short_description: form.short_description || null, full_description: form.full_description || null,
      price: parseFloat(form.price) || 0, promotional_price: form.promotional_price ? parseFloat(form.promotional_price) : null,
      stock: parseInt(form.stock) || 0, min_stock: parseInt(form.min_stock) || 5,
      sku: form.sku || null, status: form.status, category_id: form.category_id || null, is_featured: form.is_featured,
      cover_image: form.cover_image || null, gallery_images: form.gallery_images.length > 0 ? form.gallery_images : null,
      cost_material: parseFloat(form.cost_material) || 0, cost_labor: parseFloat(form.cost_labor) || 0, cost_shipping: parseFloat(form.cost_shipping) || 0,
      weight_kg: parseFloat(form.weight_kg) || 0, length_cm: parseFloat(form.length_cm) || 0, width_cm: parseFloat(form.width_cm) || 0, height_cm: parseFloat(form.height_cm) || 0,
    });
    setEditing(false);
  };

  return (
    <div className="h-full flex flex-col">
      <PanelHeader
        product={product}
        editing={editing}
        hasPromo={hasPromo}
        discountPct={discountPct}
        status={status}
        canEdit={canEdit}
        isSaving={isSaving}
        onEdit={() => canEdit && setEditing(true)}
        onCancelEdit={() => { setEditing(false); setForm(buildForm(product)); }}
        onSave={handleSaveInline}
        onDelete={() => onDelete(product)}
        onClose={onClose}
      />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 min-w-0 space-y-4">
              <LiquidSection icon={Layers} title="Informações Básicas" color="cyan">
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nome do Produto" value={form.name} onChange={(v) => set('name', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} />
                      <Field label="SKU" value={form.sku} onChange={(v) => set('sku', v)} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium mb-1 block">Descrição Curta</label>
                      <Textarea value={form.short_description} onChange={(e) => set('short_description', e.target.value)} className="text-xs liquid-input min-h-[50px]" rows={2} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium mb-1 block">Descrição Completa</label>
                      <Textarea value={form.full_description} onChange={(e) => set('full_description', e.target.value)} className="text-xs liquid-input min-h-[80px]" rows={4} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <InfoLine label="Nome" value={product.name} />
                    <InfoLine label="Slug" value={<span className="font-mono text-[10px] text-white/50">/{product.slug}</span>} />
                    {product.sku && <InfoLine label="SKU" value={<span className="font-mono text-[11px]">{product.sku}</span>} />}
                    {product.short_description && <p className="text-[11px] text-white/45 leading-relaxed pt-1">{product.short_description}</p>}
                  </div>
                )}
              </LiquidSection>

              <div className="grid grid-cols-3 gap-2">
                <KPI label="Preço" value={fmtBRL(hasPromo ? (promo as number) : price)} sub={hasPromo ? `de ${fmtBRL(price)}` : undefined} accent={hasPromo ? 'green' : 'cyan'} />
                <KPI label="Estoque" value={`${stock}`} sub={`mín. ${form.min_stock}`} accent={stockAccent} />
                <KPI label="Margem" value={`${margin.toFixed(0)}%`} sub={fmtBRL(price - totalCost)} accent={marginAccent} />
              </div>
            </div>

            <div className="w-1/5 shrink-0 self-start sticky top-0">
              {editing ? (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium block">Capa</label>
                  <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} folder="products" aspectRatio="aspect-square" className="max-h-[40vh]" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/[0.08] aspect-square backdrop-blur-sm" style={{ background: 'hsl(250 30% 10% / 0.4)' }}>
                  {product.cover_image
                    ? <img src={product.cover_image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-white/[0.06]" /></div>
                  }
                </div>
              )}
              {!editing && product.gallery_images && product.gallery_images.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-1.5">
                  {product.gallery_images.slice(0, 4).map((img, i) => (
                    <div key={i} className="rounded-md overflow-hidden border border-white/[0.06] aspect-square">
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <LiquidSection icon={DollarSign} title="Preços" color="green">
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço de Venda" value={form.price} onChange={(v) => set('price', v)} type="number" prefix="R$" />
                <Field label="Preço Promocional" value={form.promotional_price} onChange={(v) => set('promotional_price', v)} type="number" prefix="R$" />
              </div>
            ) : (
              <>
                <InfoLine label="Preço de venda" value={fmtBRL(price)} />
                {hasPromo && <InfoLine label="Preço promo" value={<span className="text-emerald-400">{fmtBRL(promo as number)}</span>} />}
                <InfoLine label="12x s/ juros" value={fmtBRL(price / 12)} />
                <InfoLine label="Valor em estoque" value={fmtBRL(stock * price)} />
              </>
            )}
          </LiquidSection>

          <LiquidSection icon={TrendingUp} title="Custos & Margem" color="amber">
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Material" value={form.cost_material} onChange={(v) => set('cost_material', v)} type="number" prefix="R$" />
                <Field label="Mão de Obra" value={form.cost_labor} onChange={(v) => set('cost_labor', v)} type="number" prefix="R$" />
                <Field label="Frete" value={form.cost_shipping} onChange={(v) => set('cost_shipping', v)} type="number" prefix="R$" />
              </div>
            ) : (
              <>
                <InfoLine label="Material" value={fmtBRL(costM)} />
                <InfoLine label="Mão de obra" value={fmtBRL(costL)} />
                <InfoLine label="Frete custo" value={fmtBRL(costS)} />
              </>
            )}
            <div className="border-t border-white/[0.06] pt-2 mt-2">
              <InfoLine label="Custo total" value={<strong>{fmtBRL(totalCost)}</strong>} />
              <InfoLine label="Margem líquida" value={
                <span className={marginAccent === 'green' ? 'text-emerald-400' : marginAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                  {margin.toFixed(1)}%
                </span>
              } />
            </div>
          </LiquidSection>

          <LiquidSection icon={Package} title="Estoque" color="cyan">
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Disponível" value={form.stock} onChange={(v) => set('stock', v)} type="number" />
                <Field label="Estoque Mínimo" value={form.min_stock} onChange={(v) => set('min_stock', v)} type="number" />
                <Field label="SKU" value={form.sku} onChange={(v) => set('sku', v)} />
              </div>
            ) : (
              <>
                <InfoLine label="Disponível" value={
                  <span className={stockAccent === 'green' ? 'text-emerald-400' : stockAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                    {stock} un.
                  </span>
                } />
                <InfoLine label="Estoque mínimo" value={`${product.min_stock || 5} un.`} />
              </>
            )}
          </LiquidSection>

          <LiquidSection icon={Ruler} title="Peso & Dimensões" color="purple">
            {editing ? (
              <div className="grid grid-cols-4 gap-3">
                <Field label="Peso" value={form.weight_kg} onChange={(v) => set('weight_kg', v)} type="number" suffix="kg" />
                <Field label="Comp." value={form.length_cm} onChange={(v) => set('length_cm', v)} type="number" suffix="cm" />
                <Field label="Larg." value={form.width_cm} onChange={(v) => set('width_cm', v)} type="number" suffix="cm" />
                <Field label="Alt." value={form.height_cm} onChange={(v) => set('height_cm', v)} type="number" suffix="cm" />
              </div>
            ) : (
              <>
                <InfoLine label="Peso" value={`${product.weight_kg || 0} kg`} />
                <InfoLine label="C × L × A" value={`${product.length_cm || 0} × ${product.width_cm || 0} × ${product.height_cm || 0} cm`} />
              </>
            )}
          </LiquidSection>

          <LiquidSection icon={Layers} title="Organização" color="pink">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium mb-1 block">Categoria</label>
                    <Select value={form.category_id} onValueChange={(v) => set('category_id', v)}>
                      <SelectTrigger className="h-8 text-xs liquid-input"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent className="liquid-glass text-white">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/35 font-medium mb-1 block">Status</label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger className="h-8 text-xs liquid-input"><SelectValue /></SelectTrigger>
                      <SelectContent className="liquid-glass text-white">
                        <SelectItem value="draft">📝 Rascunho</SelectItem>
                        <SelectItem value="active">✅ Ativo</SelectItem>
                        <SelectItem value="inactive">⏸️ Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg backdrop-blur-sm"
                  style={{ background: 'hsl(280 90% 60% / 0.06)', border: '1px solid hsl(280 90% 60% / 0.15)' }}>
                  <Switch checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} className="admin-switch-orange" />
                  <span className="text-[11px] text-white/50">Produto em Destaque</span>
                </div>
              </div>
            ) : (
              <>
                {category && <InfoLine label="Categoria" value={category.name} />}
                <InfoLine label="Criado em" value={new Date(product.created_at).toLocaleDateString('pt-BR')} />
                {product.updated_at && <InfoLine label="Atualizado" value={new Date(product.updated_at).toLocaleDateString('pt-BR')} />}
              </>
            )}
          </LiquidSection>

          {editing && (
            <LiquidSection icon={ImageIcon} title="Galeria de Imagens" color="purple">
              <MultiImageUpload value={form.gallery_images} onChange={(urls) => set('gallery_images', urls)} folder="products" maxImages={6} />
            </LiquidSection>
          )}

          <div className="flex gap-2 pt-2 pb-4">
            {editing ? (
              <>
                <Button className="admin-btn admin-btn-save flex-1 !min-h-0 h-9 text-xs" onClick={handleSaveInline} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Check className="h-3 w-3 mr-1.5" />}
                  Salvar alterações
                </Button>
                <Button size="sm" variant="outline" className="h-9 text-xs border-white/10 text-white/35 hover:bg-white/[0.06]"
                  onClick={() => { setEditing(false); setForm(buildForm(product)); }}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button className="admin-btn admin-btn-edit flex-1 !min-h-0 h-9 text-xs" onClick={() => setEditing(true)} disabled={!canEdit}>
                  <Pencil className="h-3 w-3 mr-1.5" />Editar
                </Button>
                <a href={`/produto/${product.slug}`} target="_blank" rel="noopener noreferrer"
                  className="admin-btn admin-btn-view flex-1 !min-h-0 h-9 text-xs inline-flex items-center justify-center">
                  <Eye className="h-3 w-3 mr-1.5" />Ver na loja
                </a>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
