import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package, DollarSign, BarChart3, Ruler, Tag, Star,
  Pencil, Trash2, ExternalLink, X, ImageIcon, Layers,
  TrendingUp, Box, Weight, Calendar, Link2, Hash,
} from 'lucide-react';

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
}

/* ── Tiny reusable pieces ─────────────────────────────── */

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'green' | 'amber' | 'red' | 'cyan' | 'purple' }) {
  const colors = {
    green: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    cyan: 'border-[hsl(var(--admin-accent-cyan)/0.2)] bg-[hsl(var(--admin-accent-cyan)/0.05)]',
    purple: 'border-[hsl(var(--admin-accent-purple)/0.2)] bg-[hsl(var(--admin-accent-purple)/0.05)]',
  };
  const textColors = {
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    cyan: 'text-[hsl(var(--admin-accent-cyan))]',
    purple: 'text-[hsl(var(--admin-accent-purple))]',
  };
  const c = accent || 'cyan';
  return (
    <div className={`rounded-xl border p-3 ${colors[c]} flex flex-col items-center justify-center text-center min-h-[72px]`}>
      <span className={`text-lg font-bold ${textColors[c]} leading-none`}>{value}</span>
      {sub && <span className="text-[10px] text-white/30 mt-0.5">{sub}</span>}
      <span className="text-[10px] text-white/50 mt-1 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-1 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/40 flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="h-3 w-3 text-white/25" />}
        {label}
      </span>
      <span className="text-xs text-white/90 font-medium text-right tabular-nums">{value}</span>
    </div>
  );
}

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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {children}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */

export function ProductDetailPanel({ product, categories, onEdit, onDelete, onClose, canEdit }: ProductDetailPanelProps) {
  const category = categories.find(c => c.id === product.category_id);
  const totalCost = (product.cost_material || 0) + (product.cost_labor || 0) + (product.cost_shipping || 0);
  const margin = product.price > 0 ? ((product.price - totalCost) / product.price * 100) : 0;
  const stockValue = (product.stock || 0) * product.price;
  const hasPromo = product.promotional_price && product.promotional_price < product.price;
  const discountPercent = hasPromo ? Math.round(((product.price - product.promotional_price!) / product.price) * 100) : 0;

  const stockAccent = product.stock <= 0 ? 'red' as const : product.stock <= (product.min_stock || 5) ? 'amber' as const : 'green' as const;
  const marginAccent = margin >= 50 ? 'green' as const : margin >= 20 ? 'amber' as const : 'red' as const;

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    inactive: { label: 'Inativo', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    draft: { label: 'Rascunho', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const st = statusMap[product.status] || statusMap.draft;

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--admin-bg))]">
      {/* ── Sticky Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-[hsl(var(--admin-accent-purple)/0.15)] bg-[hsl(var(--admin-card))]">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/20 shrink-0">
          {product.cover_image ? (
            <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-white/15" /></div>
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
            {hasPromo && (
              <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/25 text-[9px] px-1.5 py-0 h-4 leading-none">-{discountPercent}%</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={() => onEdit(product)} disabled={!canEdit} aria-label="Editar produto">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-400/5" onClick={() => onDelete(product)} disabled={!canEdit} aria-label="Excluir produto">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/5" onClick={onClose} aria-label="Fechar painel">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-0">

          {/* ── Hero Image ── */}
          <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-black/30 border border-white/[0.06]">
            {product.cover_image ? (
              <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <ImageIcon className="h-12 w-12 text-white/[0.06]" />
                <span className="text-[10px] text-white/20">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Gallery */}
          {product.gallery_images && product.gallery_images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.gallery_images.map((img, i) => (
                <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-white/[0.08] shrink-0 hover:border-[hsl(var(--admin-accent-cyan)/0.3)] transition-colors cursor-pointer">
                  <img src={img} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.short_description && (
            <p className="text-xs text-white/50 leading-relaxed mt-3">{product.short_description}</p>
          )}

          {/* ── KPI Cards Row ── */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <MetricCard
              label="Preço"
              value={formatCurrency(hasPromo ? product.promotional_price! : product.price)}
              sub={hasPromo ? `de ${formatCurrency(product.price)}` : undefined}
              accent={hasPromo ? 'green' : 'cyan'}
            />
            <MetricCard
              label="Estoque"
              value={`${product.stock}`}
              sub={`mín. ${product.min_stock || 5}`}
              accent={stockAccent}
            />
            <MetricCard
              label="Margem"
              value={`${margin.toFixed(0)}%`}
              sub={formatCurrency(product.price - totalCost)}
              accent={marginAccent}
            />
          </div>

          {/* ── Preços detalhados ── */}
          <SectionTitle icon={DollarSign} title="Preços" />
          <SectionCard>
            <InfoLine icon={DollarSign} label="Preço de venda" value={formatCurrency(product.price)} />
            {hasPromo && <InfoLine label="Preço promocional" value={<span className="text-emerald-400">{formatCurrency(product.promotional_price!)}</span>} />}
            <InfoLine label="Parcelamento 12x" value={formatCurrency(product.price / 12)} />
            <InfoLine label="Valor em estoque" value={formatCurrency(stockValue)} />
          </SectionCard>

          {/* ── Custos ── */}
          <SectionTitle icon={TrendingUp} title="Custos & Margem" />
          <SectionCard>
            <InfoLine label="Material" value={formatCurrency(product.cost_material || 0)} />
            <InfoLine label="Mão de obra" value={formatCurrency(product.cost_labor || 0)} />
            <InfoLine label="Frete custo" value={formatCurrency(product.cost_shipping || 0)} />
            <div className="border-t border-white/[0.08]">
              <InfoLine label="Custo total" value={<span className="font-semibold">{formatCurrency(totalCost)}</span>} />
              <InfoLine icon={BarChart3} label="Margem líquida" value={
                <span className={marginAccent === 'green' ? 'text-emerald-400' : marginAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                  {margin.toFixed(1)}%
                </span>
              } />
            </div>
          </SectionCard>

          {/* ── Estoque ── */}
          <SectionTitle icon={Package} title="Estoque" />
          <SectionCard>
            <InfoLine icon={Box} label="Disponível" value={
              <span className={stockAccent === 'green' ? 'text-emerald-400' : stockAccent === 'amber' ? 'text-amber-400' : 'text-red-400'}>
                {product.stock} unidades
              </span>
            } />
            <InfoLine label="Estoque mínimo" value={`${product.min_stock || 5} un.`} />
            {product.sku && <InfoLine icon={Hash} label="SKU" value={<span className="font-mono text-[11px]">{product.sku}</span>} />}
          </SectionCard>

          {/* ── Dimensões ── */}
          <SectionTitle icon={Ruler} title="Peso & Dimensões" />
          <SectionCard>
            <InfoLine icon={Weight} label="Peso" value={`${product.weight_kg || 0} kg`} />
            <InfoLine icon={Ruler} label="C × L × A" value={`${product.length_cm || 0} × ${product.width_cm || 0} × ${product.height_cm || 0} cm`} />
          </SectionCard>

          {/* ── Organização ── */}
          <SectionTitle icon={Layers} title="Organização" />
          <SectionCard>
            {category && <InfoLine icon={Layers} label="Categoria" value={category.name} />}
            <InfoLine icon={Link2} label="Slug" value={<span className="font-mono text-[10px] text-white/60">/{product.slug}</span>} />
            <InfoLine icon={Calendar} label="Criado em" value={new Date(product.created_at).toLocaleDateString('pt-BR')} />
            {product.updated_at && <InfoLine icon={Calendar} label="Atualizado" value={new Date(product.updated_at).toLocaleDateString('pt-BR')} />}
          </SectionCard>

          {/* ── Actions ── */}
          <div className="flex gap-2 mt-6 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 border-[hsl(var(--admin-accent-purple)/0.25)] text-[hsl(var(--admin-accent-purple))] hover:bg-[hsl(var(--admin-accent-purple)/0.1)] text-xs"
              onClick={() => onEdit(product)}
              disabled={!canEdit}
            >
              <Pencil className="h-3 w-3 mr-1.5" />
              Editar
            </Button>
            <a
              href={`/produto/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center h-9 rounded-md border border-[hsl(var(--admin-accent-cyan)/0.25)] text-[hsl(var(--admin-accent-cyan))] hover:bg-[hsl(var(--admin-accent-cyan)/0.1)] text-xs font-medium transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Ver na loja
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
