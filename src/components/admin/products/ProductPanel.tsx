import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trash2, Loader2, Save, X,
  DollarSign, Ruler, Layers, TrendingUp,
  ImageIcon, Eye,
} from 'lucide-react';
import { ImageUpload, MultiImageUpload } from '@/components/admin';
import { LiquidSection, Field, KPI, fmtBRL, generateSlug } from './primitives';
import { buildForm } from './buildForm';
import type { Product, ProductFormData } from '@/hooks/useAdminProducts';

interface Props {
  product: Product | null;
  categories: { id: string; name: string; parent_id: string | null }[];
  canEdit: boolean;
  onSave: (data: ProductFormData, id?: string) => Promise<void>;
  isSaving: boolean;
  onDelete?: (p: Product) => void;
  onClose?: () => void;
  isNew?: boolean;
}

export function ProductPanel({ product, categories, canEdit, onSave, isSaving, onDelete, onClose, isNew }: Props) {
  const [form, setForm] = useState(() => buildForm(product || undefined));
  const [lastId, setLastId] = useState(product?.id || '__new__');

  const currentId = product?.id || '__new__';
  if (currentId !== lastId) {
    setLastId(currentId);
    setForm(buildForm(product || undefined));
  }

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

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

      <ScrollArea className="flex-1">
        <div className="flex h-full">
          <div className="w-2/3 p-4 space-y-3 border-r border-white/[0.04]">
            {product && (
              <div className="grid grid-cols-3 gap-2 mb-1">
                <KPI label="Preço" value={fmtBRL(hasPromo ? promo! : price)} sub={hasPromo ? `de ${fmtBRL(price)}` : undefined} accent={hasPromo ? 'green' : 'cyan'} />
                <KPI label="Estoque" value={`${stock}`} sub={`mín. ${form.min_stock}`} accent={stockAccent} />
                <KPI label="Margem" value={`${margin.toFixed(0)}%`} sub={fmtBRL(price - costT)} accent={marginAccent} />
              </div>
            )}
            <LiquidSection icon={Layers} title="Informações Básicas" color="cyan">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nome *" value={form.name} onChange={(v) => set('name', v)} placeholder="Nome do produto" />
                  <Field label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} placeholder="auto-gerado" />
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
            <LiquidSection icon={DollarSign} title="Preços & Estoque" color="green">
              <div className="grid grid-cols-4 gap-2">
                <Field label="Preço Venda *" value={form.price} onChange={(v) => set('price', v)} type="number" prefix="R$" />
                <Field label="Preço Promo" value={form.promotional_price} onChange={(v) => set('promotional_price', v)} type="number" prefix="R$" />
                <Field label="Estoque" value={form.stock} onChange={(v) => set('stock', v)} type="number" />
                <Field label="Est. Mínimo" value={form.min_stock} onChange={(v) => set('min_stock', v)} type="number" />
              </div>
            </LiquidSection>
            <LiquidSection icon={TrendingUp} title="Custos" color="amber">
              <div className="grid grid-cols-3 gap-2">
                <Field label="Material" value={form.cost_material} onChange={(v) => set('cost_material', v)} type="number" prefix="R$" />
                <Field label="Mão de Obra" value={form.cost_labor} onChange={(v) => set('cost_labor', v)} type="number" prefix="R$" />
                <Field label="Frete Custo" value={form.cost_shipping} onChange={(v) => set('cost_shipping', v)} type="number" prefix="R$" />
              </div>
            </LiquidSection>
            <LiquidSection icon={Ruler} title="Peso & Dimensões" color="purple">
              <div className="grid grid-cols-4 gap-2">
                <Field label="Peso" value={form.weight_kg} onChange={(v) => set('weight_kg', v)} type="number" suffix="kg" />
                <Field label="Comp." value={form.length_cm} onChange={(v) => set('length_cm', v)} type="number" suffix="cm" />
                <Field label="Largura" value={form.width_cm} onChange={(v) => set('width_cm', v)} type="number" suffix="cm" />
                <Field label="Altura" value={form.height_cm} onChange={(v) => set('height_cm', v)} type="number" suffix="cm" />
              </div>
            </LiquidSection>
            <LiquidSection icon={Layers} title="Organização" color="pink">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Field label="SKU" value={form.sku} onChange={(v) => set('sku', v)} />
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
            <LiquidSection icon={ImageIcon} title="Imagem Principal" color="purple">
              <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} folder="products" aspectRatio="aspect-square" />
            </LiquidSection>
            <LiquidSection icon={ImageIcon} title="Galeria" color="cyan">
              <MultiImageUpload value={form.gallery_images} onChange={(urls) => set('gallery_images', urls)} folder="products" maxImages={6} />
            </LiquidSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
