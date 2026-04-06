import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Package, DollarSign, BarChart3, Ruler, Tag, Star,
  Pencil, Trash2, ExternalLink, X, ImageIcon, Layers,
  TrendingUp, Box, Weight, Calendar, Link2, Hash,
  Save, Loader2, Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  min_stock: number | null;
  sku: string | null;
  status: string;
  category_id: string | null;
  is_featured: boolean;
  cover_image: string | null;
  gallery_images: string[] | null;
  cost_material: number | null;
  cost_labor: number | null;
  cost_shipping: number | null;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
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

/* ── Editable Field ─────────────────────────────── */
function EditableField({
  label, value, onChange, type = 'text', prefix, suffix, disabled, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; suffix?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-white/30">{prefix}</span>}
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90 focus:border-[hsl(var(--admin-accent-cyan)/0.5)] ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-7' : ''}`}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/30">{suffix}</span>}
      </div>
    </div>
  );
}

/* ── Section pieces ─────────────────────────────── */
function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--admin-accent-cyan)/0.1)] border border-[hsl(var(--admin-accent-cyan)/0.15)]">
        <Icon className="h-3 w-3 text-[hsl(var(--admin-accent-cyan))]" />
      </div>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">{title}</h4>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-3">
      {children}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] text-white/40 shrink-0">{label}</span>
      <span className="text-xs text-white/90 font-medium text-right tabular-nums">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'green' | 'amber' | 'red' | 'cyan' }) {
  const colors = {
    green: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    cyan: 'border-[hsl(var(--admin-accent-cyan)/0.2)] bg-[hsl(var(--admin-accent-cyan)/0.05)]',
  };
  const textColors = { green: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', cyan: 'text-[hsl(var(--admin-accent-cyan))]' };
  const c = accent || 'cyan';
  return (
    <div className={`rounded-xl border p-2.5 ${colors[c]} flex flex-col items-center justify-center text-center min-h-[60px]`}>
      <span className={`text-base font-bold ${textColors[c]} leading-none`}>{value}</span>
      {sub && <span className="text-[9px] text-white/30 mt-0.5">{sub}</span>}
      <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────── */

export function ProductDetailPanel({ product, categories, onEdit, onDelete, onClose, canEdit, onSave, isSaving }: ProductDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    short_description: product.short_description || '',
    price: product.price.toString(),
    promotional_price: product.promotional_price?.toString() || '',
    stock: product.stock.toString(),
    min_stock: (product.min_stock || 5).toString(),
    sku: product.sku || '',
    status: product.status,
    category_id: product.category_id || '',
    is_featured: product.is_featured,
    cost_material: (product.cost_material || 0).toString(),
    cost_labor: (product.cost_labor || 0).toString(),
    cost_shipping: (product.cost_shipping || 0).toString(),
    weight_kg: (product.weight_kg || 0).toString(),
    length_cm: (product.length_cm || 0).toString(),
    width_cm: (product.width_cm || 0).toString(),
    height_cm: (product.height_cm || 0).toString(),
  });

  // Sync form when product changes
  const [lastProductId, setLastProductId] = useState(product.id);
  if (product.id !== lastProductId) {
    setLastProductId(product.id);
    setEditing(false);
    setForm({
      name: product.name,
      short_description: product.short_description || '',
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || '',
      stock: product.stock.toString(),
      min_stock: (product.min_stock || 5).toString(),
      sku: product.sku || '',
      status: product.status,
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      cost_material: (product.cost_material || 0).toString(),
      cost_labor: (product.cost_labor || 0).toString(),
      cost_shipping: (product.cost_shipping || 0).toString(),
      weight_kg: (product.weight_kg || 0).toString(),
      length_cm: (product.length_cm || 0).toString(),
      width_cm: (product.width_cm || 0).toString(),
      height_cm: (product.height_cm || 0).toString(),
    });
  }

  const category = categories.find(c => c.id === (editing ? form.category_id : product.category_id));
  const price = editing ? parseFloat(form.price) || 0 : product.price;
  const promoPrice = editing ? (parseFloat(form.promotional_price) || null) : product.promotional_price;
  const stock = editing ? parseInt(form.stock) || 0 : product.stock;
  const costMat = editing ? parseFloat(form.cost_material) || 0 : (product.cost_material || 0);
  const costLab = editing ? parseFloat(form.cost_labor) || 0 : (product.cost_labor || 0);
  const costShip = editing ? parseFloat(form.cost_shipping) || 0 : (product.cost_shipping || 0);
  const totalCost = costMat + costLab + costShip;
  const margin = price > 0 ? ((price - totalCost) / price * 100) : 0;
  const hasPromo = promoPrice && promoPrice < price;
  const discountPercent = hasPromo ? Math.round(((price - promoPrice!) / price) * 100) : 0;
  const stockAccent = stock <= 0 ? 'red' as const : stock <= (parseInt(form.min_stock) || 5) ? 'amber' as const : 'green' as const;
  const marginAccent = margin >= 50 ? 'green' as const : margin >= 20 ? 'amber' as const : 'red' as const;

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    inactive: { label: 'Inativo', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    draft: { label: 'Rascunho', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const currentStatus = editing ? form.status : product.status;
  const st = statusMap[currentStatus] || statusMap.draft;
  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const handleSaveInline = async () => {
    if (onSave) {
      await onSave(product.id, {
        name: form.name,
        short_description: form.short_description || null,
        price: parseFloat(form.price) || 0,
        promotional_price: form.promotional_price ? parseFloat(form.promotional_price) : null,
        stock: parseInt(form.stock) || 0,
        min_stock: parseInt(form.min_stock) || 5,
        sku: form.sku || null,
        status: form.status,
        category_id: form.category_id || null,
        is_featured: form.is_featured,
        cost_material: parseFloat(form.cost_material) || 0,
        cost_labor: parseFloat(form.cost_labor) || 0,
        cost_shipping: parseFloat(form.cost_shipping) || 0,
        weight_kg: parseFloat(form.weight_kg) || 0,
        length_cm: parseFloat(form.length_cm) || 0,
        width_cm: parseFloat(form.width_cm) || 0,
        height_cm: parseFloat(form.height_cm) || 0,
      } as any);
      setEditing(false);
    } else {
      onEdit(product);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--admin-bg))]">
      {/* ── Sticky Header with image ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-accent-purple)/0.15)] bg-[hsl(var(--admin-card))]">
        {/* Thumbnail */}
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/20 shrink-0">
          {product.cover_image ? (
            <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-3.5 w-3.5 text-white/15" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate leading-tight">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge className={`${st.className} border text-[9px] px-1.5 py-0 h-4 leading-none`}>{st.label}</Badge>
            {product.is_featured && (
              <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border border-[hsl(var(--admin-accent-purple)/0.25)] text-[9px] px-1.5 py-0 h-4 leading-none">
                <Star className="h-2 w-2 mr-0.5 fill-current" />Destaque
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {editing ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" onClick={handleSaveInline} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={() => canEdit && setEditing(true)} disabled={!canEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/5" onClick={() => onDelete(product)} disabled={!canEdit}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-0">

          {/* ── Image fixed top-right, content flows left ── */}
          <div className="flex gap-4">
            {/* Left: content area (4/5) */}
            <div className="flex-1 min-w-0 space-y-0">

              {/* Name (editable) */}
              {editing && (
                <div className="mb-3">
                  <EditableField label="Nome" value={form.name} onChange={(v) => setForm(p => ({ ...p, name: v }))} />
                </div>
              )}

              {/* Description */}
              {editing ? (
                <div className="mb-3 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Descrição</label>
                  <Textarea value={form.short_description} onChange={(e) => setForm(p => ({ ...p, short_description: e.target.value }))}
                    className="text-xs bg-white/[0.04] border-white/[0.08] text-white/90 min-h-[60px]" rows={2} />
                </div>
              ) : product.short_description ? (
                <p className="text-xs text-white/50 leading-relaxed mb-3">{product.short_description}</p>
              ) : null}

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-2 mb-1">
                <MetricCard
                  label="Preço"
                  value={formatCurrency(hasPromo ? promoPrice! : price)}
                  sub={hasPromo ? `de ${formatCurrency(price)}` : undefined}
                  accent={hasPromo ? 'green' : 'cyan'}
                />
                <MetricCard label="Estoque" value={`${stock}`} sub={`mín. ${form.min_stock}`} accent={stockAccent} />
                <MetricCard label="Margem" value={`${margin.toFixed(0)}%`} sub={formatCurrency(price - totalCost)} accent={marginAccent} />
              </div>
            </div>

            {/* Right: Image (1/5 width, max half height) */}
            <div className="w-1/5 shrink-0 sticky top-0 self-start">
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-black/20 aspect-square max-h-[50%]">
                {product.cover_image ? (
                  <img src={product.cover_image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center aspect-square">
                    <ImageIcon className="h-8 w-8 text-white/[0.08]" />
                  </div>
                )}
              </div>
              {/* Gallery thumbs */}
              {product.gallery_images && product.gallery_images.length > 0 && (
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

          {/* ── Preços ── */}
          <SectionTitle icon={DollarSign} title="Preços" />
          <SectionCard>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <EditableField label="Preço Venda" value={form.price} onChange={(v) => setForm(p => ({ ...p, price: v }))} type="number" prefix="R$" />
                <EditableField label="Promo" value={form.promotional_price} onChange={(v) => setForm(p => ({ ...p, promotional_price: v }))} type="number" prefix="R$" />
              </div>
            ) : (
              <>
                <InfoLine label="Preço de venda" value={formatCurrency(price)} />
                {hasPromo && <InfoLine label="Preço promocional" value={<span className="text-emerald-400">{formatCurrency(promoPrice!)}</span>} />}
                <InfoLine label="Parcelamento 12x" value={formatCurrency(price / 12)} />
                <InfoLine label="Valor em estoque" value={formatCurrency(stock * price)} />
              </>
            )}
          </SectionCard>

          {/* ── Custos ── */}
          <SectionTitle icon={TrendingUp} title="Custos & Margem" />
          <SectionCard>
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <EditableField label="Material" value={form.cost_material} onChange={(v) => setForm(p => ({ ...p, cost_material: v }))} type="number" prefix="R$" />
                <EditableField label="M. Obra" value={form.cost_labor} onChange={(v) => setForm(p => ({ ...p, cost_labor: v }))} type="number" prefix="R$" />
                <EditableField label="Frete" value={form.cost_shipping} onChange={(v) => setForm(p => ({ ...p, cost_shipping: v }))} type="number" prefix="R$" />
              </div>
            ) : (
              <>
                <InfoLine label="Material" value={formatCurrency(costMat)} />
                <InfoLine label="Mão de obra" value={formatCurrency(costLab)} />
                <InfoLine label="Frete custo" value={formatCurrency(costShip)} />
              </>
            )}
            <div className="border-t border-white/[0.06] pt-2">
              <InfoLine label="Custo total" value={<span className="font-semibold">{formatCurrency(totalCost)}</span>} />
              <InfoLine label="Margem líquida" value={
                <span className={marginAccent === 'green' ? 'text-emerald-400' : marginAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                  {margin.toFixed(1)}%
                </span>
              } />
            </div>
          </SectionCard>

          {/* ── Estoque ── */}
          <SectionTitle icon={Package} title="Estoque" />
          <SectionCard>
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <EditableField label="Disponível" value={form.stock} onChange={(v) => setForm(p => ({ ...p, stock: v }))} type="number" />
                <EditableField label="Mínimo" value={form.min_stock} onChange={(v) => setForm(p => ({ ...p, min_stock: v }))} type="number" />
                <EditableField label="SKU" value={form.sku} onChange={(v) => setForm(p => ({ ...p, sku: v }))} />
              </div>
            ) : (
              <>
                <InfoLine label="Disponível" value={
                  <span className={stockAccent === 'green' ? 'text-emerald-400' : stockAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                    {stock} un.
                  </span>
                } />
                <InfoLine label="Estoque mínimo" value={`${product.min_stock || 5} un.`} />
                {product.sku && <InfoLine label="SKU" value={<span className="font-mono text-[11px]">{product.sku}</span>} />}
              </>
            )}
          </SectionCard>

          {/* ── Peso & Dimensões ── */}
          <SectionTitle icon={Ruler} title="Peso & Dimensões" />
          <SectionCard>
            {editing ? (
              <div className="grid grid-cols-4 gap-3">
                <EditableField label="Peso" value={form.weight_kg} onChange={(v) => setForm(p => ({ ...p, weight_kg: v }))} type="number" suffix="kg" />
                <EditableField label="Comp." value={form.length_cm} onChange={(v) => setForm(p => ({ ...p, length_cm: v }))} type="number" suffix="cm" />
                <EditableField label="Larg." value={form.width_cm} onChange={(v) => setForm(p => ({ ...p, width_cm: v }))} type="number" suffix="cm" />
                <EditableField label="Alt." value={form.height_cm} onChange={(v) => setForm(p => ({ ...p, height_cm: v }))} type="number" suffix="cm" />
              </div>
            ) : (
              <>
                <InfoLine label="Peso" value={`${product.weight_kg || 0} kg`} />
                <InfoLine label="C × L × A" value={`${product.length_cm || 0} × ${product.width_cm || 0} × ${product.height_cm || 0} cm`} />
              </>
            )}
          </SectionCard>

          {/* ── Organização ── */}
          <SectionTitle icon={Layers} title="Organização" />
          <SectionCard>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Categoria</label>
                    <Select value={form.category_id} onValueChange={(v) => setForm(p => ({ ...p, category_id: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Status</label>
                    <Select value={form.status} onValueChange={(v) => setForm(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm(p => ({ ...p, is_featured: v }))} />
                  <span className="text-[10px] text-white/60">Produto em Destaque</span>
                </div>
              </div>
            ) : (
              <>
                {category && <InfoLine label="Categoria" value={category.name} />}
                <InfoLine label="Slug" value={<span className="font-mono text-[10px] text-white/60">/{product.slug}</span>} />
                <InfoLine label="Criado em" value={new Date(product.created_at).toLocaleDateString('pt-BR')} />
              </>
            )}
          </SectionCard>

          {/* ── Actions ── */}
          <div className="flex gap-2 mt-5 pb-4">
            {editing ? (
              <>
                <Button size="sm" className="flex-1 h-9 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30" onClick={handleSaveInline} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Check className="h-3 w-3 mr-1.5" />}
                  Salvar alterações
                </Button>
                <Button size="sm" variant="outline" className="h-9 text-xs border-white/10 text-white/50" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1 h-9 border-[hsl(var(--admin-accent-purple)/0.25)] text-[hsl(var(--admin-accent-purple))] hover:bg-[hsl(var(--admin-accent-purple)/0.1)] text-xs" onClick={() => setEditing(true)} disabled={!canEdit}>
                  <Pencil className="h-3 w-3 mr-1.5" />
                  Editar inline
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 border-white/10 text-white/50 hover:bg-white/5 text-xs" onClick={() => onEdit(product)} disabled={!canEdit}>
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Editar completo
                </Button>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
