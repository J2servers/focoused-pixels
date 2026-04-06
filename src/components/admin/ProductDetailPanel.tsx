import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageUpload, MultiImageUpload } from './ImageUpload';
import {
  Package, DollarSign, BarChart3, Ruler, Star,
  Pencil, Trash2, X, ImageIcon, Layers,
  TrendingUp, Box, Weight, Calendar, Link2, Hash,
  Save, Loader2, Check, ExternalLink, Eye,
} from 'lucide-react';

interface Category { id: string; name: string; parent_id: string | null; }

interface Product {
  id: string; name: string; slug: string;
  short_description: string | null; full_description: string | null;
  price: number; promotional_price: number | null;
  stock: number; min_stock: number | null; sku: string | null;
  status: string; category_id: string | null; is_featured: boolean;
  cover_image: string | null; gallery_images: string[] | null;
  cost_material: number | null; cost_labor: number | null; cost_shipping: number | null;
  weight_kg: number | null; length_cm: number | null; width_cm: number | null; height_cm: number | null;
  created_at: string; updated_at?: string;
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

/* ── Vivid accents ── */
const CYAN = 'hsl(var(--admin-accent-cyan))';
const PURPLE = 'hsl(var(--admin-accent-purple))';
const PINK = 'hsl(var(--admin-accent-pink))';

/* ── Vivid Section Header ── */
function VividSection({ icon: Icon, title, children, accentColor = 'cyan' }: {
  icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode;
  accentColor?: 'cyan' | 'purple' | 'pink' | 'green' | 'amber';
}) {
  const colorMap = {
    cyan: { border: 'border-[hsl(var(--admin-accent-cyan)/0.25)]', bg: 'bg-[hsl(var(--admin-accent-cyan)/0.06)]', text: 'text-[hsl(var(--admin-accent-cyan))]', glow: 'shadow-[0_0_12px_hsl(var(--admin-accent-cyan)/0.15)]' },
    purple: { border: 'border-[hsl(var(--admin-accent-purple)/0.25)]', bg: 'bg-[hsl(var(--admin-accent-purple)/0.06)]', text: 'text-[hsl(var(--admin-accent-purple))]', glow: 'shadow-[0_0_12px_hsl(var(--admin-accent-purple)/0.15)]' },
    pink: { border: 'border-[hsl(var(--admin-accent-pink)/0.25)]', bg: 'bg-[hsl(var(--admin-accent-pink)/0.06)]', text: 'text-[hsl(var(--admin-accent-pink))]', glow: 'shadow-[0_0_12px_hsl(var(--admin-accent-pink)/0.15)]' },
    green: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]' },
    amber: { border: 'border-amber-500/25', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]' },
  };
  const c = colorMap[accentColor];
  return (
    <div className={`rounded-xl ${c.border} border ${c.bg} ${c.glow} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${c.border}`}>
        <Icon className={`h-3.5 w-3.5 ${c.text}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${c.text}`}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ── Editable field ── */
function Field({ label, value, onChange, type = 'text', prefix, suffix, disabled, half }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; prefix?: string; suffix?: string; disabled?: boolean; half?: boolean;
}) {
  return (
    <div className={half ? '' : 'col-span-full'}>
      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/30">{prefix}</span>}
        <Input type={type} step={type === 'number' ? '0.01' : undefined} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          className={`h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90 focus:border-[hsl(var(--admin-accent-cyan)/0.5)] transition-colors ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/30">{suffix}</span>}
      </div>
    </div>
  );
}

/* ── Read-only info line ── */
function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[10px] text-white/40">{label}</span>
      <span className="text-xs text-white/90 font-medium text-right tabular-nums">{value}</span>
    </div>
  );
}

/* ── KPI card ── */
function KPI({ label, value, sub, accent = 'cyan' }: { label: string; value: string; sub?: string; accent?: 'green' | 'amber' | 'red' | 'cyan' }) {
  const bg = { green: 'border-emerald-500/20 bg-emerald-500/5', amber: 'border-amber-500/20 bg-amber-500/5', red: 'border-red-500/20 bg-red-500/5', cyan: 'border-[hsl(var(--admin-accent-cyan)/0.2)] bg-[hsl(var(--admin-accent-cyan)/0.05)]' };
  const txt = { green: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', cyan: 'text-[hsl(var(--admin-accent-cyan))]' };
  return (
    <div className={`rounded-xl border p-2.5 ${bg[accent]} flex flex-col items-center text-center min-h-[56px] shadow-sm`}>
      <span className={`text-base font-bold ${txt[accent]} leading-none`}>{value}</span>
      {sub && <span className="text-[9px] text-white/30 mt-0.5">{sub}</span>}
      <span className="text-[9px] text-white/50 mt-1 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */

export function ProductDetailPanel({ product, categories, onEdit, onDelete, onClose, canEdit, onSave, isSaving }: ProductDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => buildForm(product));
  const [lastId, setLastId] = useState(product.id);

  if (product.id !== lastId) {
    setLastId(product.id);
    setEditing(false);
    setForm(buildForm(product));
  }

  const f = (k: keyof typeof form) => form[k];
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // derived
  const price = editing ? parseFloat(form.price) || 0 : product.price;
  const promo = editing ? (parseFloat(form.promotional_price) || null) : product.promotional_price;
  const stock = editing ? parseInt(form.stock) || 0 : product.stock;
  const costM = editing ? parseFloat(form.cost_material) || 0 : (product.cost_material || 0);
  const costL = editing ? parseFloat(form.cost_labor) || 0 : (product.cost_labor || 0);
  const costS = editing ? parseFloat(form.cost_shipping) || 0 : (product.cost_shipping || 0);
  const totalCost = costM + costL + costS;
  const margin = price > 0 ? ((price - totalCost) / price * 100) : 0;
  const hasPromo = promo && promo < price;
  const discountPct = hasPromo ? Math.round(((price - promo!) / price) * 100) : 0;
  const stockAccent = stock <= 0 ? 'red' as const : stock <= (parseInt(form.min_stock) || 5) ? 'amber' as const : 'green' as const;
  const marginAccent = margin >= 50 ? 'green' as const : margin >= 20 ? 'amber' as const : 'red' as const;
  const category = categories.find(c => c.id === (editing ? form.category_id : product.category_id));
  const currentStatus = editing ? form.status : product.status;
  const stMap: Record<string, { label: string; cls: string }> = {
    active: { label: 'Ativo', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    inactive: { label: 'Inativo', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    draft: { label: 'Rascunho', cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const st = stMap[currentStatus] || stMap.draft;
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const handleSaveInline = async () => {
    if (!onSave) { onEdit(product); return; }
    await onSave(product.id, {
      name: form.name, slug: form.slug,
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      price: parseFloat(form.price) || 0,
      promotional_price: form.promotional_price ? parseFloat(form.promotional_price) : null,
      stock: parseInt(form.stock) || 0, min_stock: parseInt(form.min_stock) || 5,
      sku: form.sku || null, status: form.status, category_id: form.category_id || null,
      is_featured: form.is_featured,
      cover_image: form.cover_image || null,
      gallery_images: form.gallery_images.length > 0 ? form.gallery_images : null,
      cost_material: parseFloat(form.cost_material) || 0,
      cost_labor: parseFloat(form.cost_labor) || 0,
      cost_shipping: parseFloat(form.cost_shipping) || 0,
      weight_kg: parseFloat(form.weight_kg) || 0,
      length_cm: parseFloat(form.length_cm) || 0,
      width_cm: parseFloat(form.width_cm) || 0,
      height_cm: parseFloat(form.height_cm) || 0,
    } as any);
    setEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--admin-bg))]">
      {/* ── HEADER ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--admin-accent-purple)/0.2)] bg-[hsl(var(--admin-card))]"
        style={{ boxShadow: '0 4px 20px hsl(var(--admin-accent-purple) / 0.08)' }}>
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/20 shrink-0">
          {product.cover_image ? <img src={product.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-3.5 w-3.5 text-white/15" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge className={`${st.cls} border text-[9px] px-1.5 py-0 h-4`}>{st.label}</Badge>
            {product.is_featured && <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-[hsl(var(--admin-accent-purple)/0.25)] border text-[9px] px-1.5 py-0 h-4"><Star className="h-2 w-2 mr-0.5 fill-current" />Destaque</Badge>}
            {hasPromo && <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[9px] px-1.5 py-0 h-4">-{discountPct}%</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {editing ? (
            <>
              <Button className="admin-btn admin-btn-save admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={handleSaveInline} disabled={isSaving} title="Salvar">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:bg-white/5" onClick={() => { setEditing(false); setForm(buildForm(product)); }} title="Cancelar"><X className="h-3.5 w-3.5" /></Button>
            </>
          ) : (
            <Button className="admin-btn admin-btn-edit admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => canEdit && setEditing(true)} disabled={!canEdit} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
          )}
          <Button className="admin-btn admin-btn-delete admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={() => onDelete(product)} disabled={!canEdit} title="Deletar"><Trash2 className="h-3.5 w-3.5" /></Button>
          {onClose && <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5" onClick={onClose} title="Fechar"><X className="h-4 w-4" /></Button>}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">

          {/* ═══ ROW: Image (1/5 right) + Content (4/5 left) ═══ */}
          <div className="flex gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* 📋 Informações Básicas */}
              <VividSection icon={Layers} title="Informações Básicas" accentColor="cyan">
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nome do Produto" value={form.name} onChange={(v) => set('name', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} half />
                      <Field label="SKU" value={form.sku} onChange={(v) => set('sku', v)} half />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Descrição Curta</label>
                      <Textarea value={form.short_description} onChange={(e) => set('short_description', e.target.value)}
                        className="text-xs bg-white/[0.04] border-white/[0.08] text-white/90 min-h-[50px]" rows={2} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Descrição Completa</label>
                      <Textarea value={form.full_description} onChange={(e) => set('full_description', e.target.value)}
                        className="text-xs bg-white/[0.04] border-white/[0.08] text-white/90 min-h-[80px]" rows={4} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <InfoLine label="Nome" value={product.name} />
                    <InfoLine label="Slug" value={<span className="font-mono text-[10px] text-white/60">/{product.slug}</span>} />
                    {product.sku && <InfoLine label="SKU" value={<span className="font-mono text-[11px]">{product.sku}</span>} />}
                    {product.short_description && <p className="text-[11px] text-white/50 leading-relaxed pt-1">{product.short_description}</p>}
                  </div>
                )}
              </VividSection>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2">
                <KPI label="Preço" value={fmt(hasPromo ? promo! : price)} sub={hasPromo ? `de ${fmt(price)}` : undefined} accent={hasPromo ? 'green' : 'cyan'} />
                <KPI label="Estoque" value={`${stock}`} sub={`mín. ${form.min_stock}`} accent={stockAccent} />
                <KPI label="Margem" value={`${margin.toFixed(0)}%`} sub={fmt(price - totalCost)} accent={marginAccent} />
              </div>
            </div>

            {/* Image — 1/5 width, fixed right, max 50% height */}
            <div className="w-1/5 shrink-0 self-start sticky top-0">
              {editing ? (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium block">Capa</label>
                  <ImageUpload value={form.cover_image} onChange={(url) => set('cover_image', url)} folder="products" aspectRatio="aspect-square" className="max-h-[40vh]" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-[hsl(var(--admin-accent-cyan)/0.15)] bg-black/20 aspect-square shadow-[0_0_20px_hsl(var(--admin-accent-cyan)/0.08)]">
                  {product.cover_image
                    ? <img src={product.cover_image} alt={product.name} className="w-full h-full object-contain" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-8 w-8 text-white/[0.06]" /></div>
                  }
                </div>
              )}
              {/* Mini gallery */}
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

          {/* 💰 Preços */}
          <VividSection icon={DollarSign} title="Preços" accentColor="green">
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço de Venda" value={form.price} onChange={(v) => set('price', v)} type="number" prefix="R$" half />
                <Field label="Preço Promocional" value={form.promotional_price} onChange={(v) => set('promotional_price', v)} type="number" prefix="R$" half />
              </div>
            ) : (
              <>
                <InfoLine label="Preço de venda" value={fmt(price)} />
                {hasPromo && <InfoLine label="Preço promo" value={<span className="text-emerald-400">{fmt(promo!)}</span>} />}
                <InfoLine label="12x s/ juros" value={fmt(price / 12)} />
                <InfoLine label="Valor em estoque" value={fmt(stock * price)} />
              </>
            )}
          </VividSection>

          {/* 📊 Custos & Margem */}
          <VividSection icon={TrendingUp} title="Custos & Margem" accentColor="amber">
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Material" value={form.cost_material} onChange={(v) => set('cost_material', v)} type="number" prefix="R$" half />
                <Field label="Mão de Obra" value={form.cost_labor} onChange={(v) => set('cost_labor', v)} type="number" prefix="R$" half />
                <Field label="Frete" value={form.cost_shipping} onChange={(v) => set('cost_shipping', v)} type="number" prefix="R$" half />
              </div>
            ) : (
              <>
                <InfoLine label="Material" value={fmt(costM)} />
                <InfoLine label="Mão de obra" value={fmt(costL)} />
                <InfoLine label="Frete custo" value={fmt(costS)} />
              </>
            )}
            <div className="border-t border-white/[0.06] pt-2 mt-2">
              <InfoLine label="Custo total" value={<strong>{fmt(totalCost)}</strong>} />
              <InfoLine label="Margem líquida" value={
                <span className={marginAccent === 'green' ? 'text-emerald-400' : marginAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                  {margin.toFixed(1)}%
                </span>
              } />
            </div>
          </VividSection>

          {/* 📦 Estoque */}
          <VividSection icon={Package} title="Estoque" accentColor="cyan">
            {editing ? (
              <div className="grid grid-cols-3 gap-3">
                <Field label="Disponível" value={form.stock} onChange={(v) => set('stock', v)} type="number" half />
                <Field label="Estoque Mínimo" value={form.min_stock} onChange={(v) => set('min_stock', v)} type="number" half />
                <Field label="SKU" value={form.sku} onChange={(v) => set('sku', v)} half />
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
          </VividSection>

          {/* 📐 Peso & Dimensões */}
          <VividSection icon={Ruler} title="Peso & Dimensões" accentColor="purple">
            {editing ? (
              <div className="grid grid-cols-4 gap-3">
                <Field label="Peso" value={form.weight_kg} onChange={(v) => set('weight_kg', v)} type="number" suffix="kg" half />
                <Field label="Comp." value={form.length_cm} onChange={(v) => set('length_cm', v)} type="number" suffix="cm" half />
                <Field label="Larg." value={form.width_cm} onChange={(v) => set('width_cm', v)} type="number" suffix="cm" half />
                <Field label="Alt." value={form.height_cm} onChange={(v) => set('height_cm', v)} type="number" suffix="cm" half />
              </div>
            ) : (
              <>
                <InfoLine label="Peso" value={`${product.weight_kg || 0} kg`} />
                <InfoLine label="C × L × A" value={`${product.length_cm || 0} × ${product.width_cm || 0} × ${product.height_cm || 0} cm`} />
              </>
            )}
          </VividSection>

          {/* 🏷️ Organização */}
          <VividSection icon={Layers} title="Organização" accentColor="pink">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Categoria</label>
                    <Select value={form.category_id} onValueChange={(v) => set('category_id', v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Status</label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Rascunho</SelectItem>
                        <SelectItem value="active">✅ Ativo</SelectItem>
                        <SelectItem value="inactive">⏸️ Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-[hsl(var(--admin-accent-purple)/0.15)]">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => set('is_featured', v)} className="admin-switch-orange" />
                  <span className="text-[11px] text-white/60">Produto em Destaque</span>
                </div>
              </div>
            ) : (
              <>
                {category && <InfoLine label="Categoria" value={category.name} />}
                <InfoLine label="Criado em" value={new Date(product.created_at).toLocaleDateString('pt-BR')} />
                {product.updated_at && <InfoLine label="Atualizado" value={new Date(product.updated_at).toLocaleDateString('pt-BR')} />}
              </>
            )}
          </VividSection>

          {/* 🖼️ Galeria (editing mode) */}
          {editing && (
            <VividSection icon={ImageIcon} title="Galeria de Imagens" accentColor="purple">
              <MultiImageUpload value={form.gallery_images} onChange={(urls) => set('gallery_images', urls)} folder="products" maxImages={6} />
            </VividSection>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-2 pt-2 pb-4">
            {editing ? (
              <>
                <Button className="admin-btn admin-btn-save flex-1 !min-h-0 h-9 text-xs"
                  onClick={handleSaveInline} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Check className="h-3 w-3 mr-1.5" />}
                  Salvar alterações
                </Button>
                <Button size="sm" variant="outline" className="h-9 text-xs border-white/10 text-white/40 hover:bg-white/5"
                  onClick={() => { setEditing(false); setForm(buildForm(product)); }}>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button className="admin-btn admin-btn-edit flex-1 !min-h-0 h-9 text-xs"
                  onClick={() => setEditing(true)} disabled={!canEdit}>
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

/* ── Build form state from product ── */
function buildForm(p: Product) {
  return {
    name: p.name, slug: p.slug,
    short_description: p.short_description || '',
    full_description: p.full_description || '',
    price: p.price.toString(),
    promotional_price: p.promotional_price?.toString() || '',
    stock: p.stock.toString(), min_stock: (p.min_stock || 5).toString(),
    sku: p.sku || '', status: p.status, category_id: p.category_id || '',
    is_featured: p.is_featured,
    cover_image: p.cover_image || null as string | null,
    gallery_images: (p.gallery_images || []) as string[],
    cost_material: (p.cost_material || 0).toString(),
    cost_labor: (p.cost_labor || 0).toString(),
    cost_shipping: (p.cost_shipping || 0).toString(),
    weight_kg: (p.weight_kg || 0).toString(),
    length_cm: (p.length_cm || 0).toString(),
    width_cm: (p.width_cm || 0).toString(),
    height_cm: (p.height_cm || 0).toString(),
  };
}
