import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Package, DollarSign, BarChart3, Ruler, Tag, Star,
  Pencil, Trash2, ExternalLink, X, ImageIcon, Layers,
  TrendingUp, Box, Weight,
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

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2">
      <span className="text-xs text-white/50 flex items-center gap-1.5 shrink-0">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm text-white font-medium text-right">{value}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-1">
      <Icon className="h-4 w-4 text-[hsl(var(--admin-accent-cyan))]" />
      <h4 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-accent-cyan))]">{title}</h4>
      <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--admin-accent-cyan)/0.3)] to-transparent" />
    </div>
  );
}

export function ProductDetailPanel({ product, categories, onEdit, onDelete, onClose, canEdit }: ProductDetailPanelProps) {
  const category = categories.find(c => c.id === product.category_id);
  const totalCost = (product.cost_material || 0) + (product.cost_labor || 0) + (product.cost_shipping || 0);
  const margin = product.price > 0 ? ((product.price - totalCost) / product.price * 100) : 0;
  const stockValue = (product.stock || 0) * product.price;
  const hasPromo = product.promotional_price && product.promotional_price < product.price;
  const discountPercent = hasPromo ? Math.round(((product.price - product.promotional_price!) / product.price) * 100) : 0;

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    inactive: { label: 'Inativo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    draft: { label: 'Rascunho', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const st = statusMap[product.status] || statusMap.draft;

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--admin-card))] border-l border-[hsl(var(--admin-accent-cyan)/0.15)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--admin-accent-purple)/0.2)]">
        <h3 className="text-sm font-bold text-white truncate flex-1">{product.name}</h3>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white" onClick={() => onEdit(product)} disabled={!canEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/60 hover:text-red-400" onClick={() => onDelete(product)} disabled={!canEdit}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white/60 hover:text-white lg:hidden" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden aspect-video bg-black/30 border border-[hsl(var(--admin-accent-purple)/0.15)] mb-4">
            {product.cover_image ? (
              <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-white/10" />
              </div>
            )}
            <div className="absolute top-2 left-2 flex gap-1.5">
              <Badge className={`${st.color} border text-[10px]`}>{st.label}</Badge>
              {product.is_featured && (
                <Badge className="bg-[hsl(var(--admin-accent-purple)/0.2)] text-[hsl(var(--admin-accent-purple))] border border-[hsl(var(--admin-accent-purple)/0.3)] text-[10px]">
                  <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />Destaque
                </Badge>
              )}
              {hasPromo && (
                <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">-{discountPercent}%</Badge>
              )}
            </div>
          </div>

          {/* Gallery thumbnails */}
          {product.gallery_images && product.gallery_images.length > 0 && (
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {product.gallery_images.map((img, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.short_description && (
            <p className="text-xs text-white/60 leading-relaxed mb-4">{product.short_description}</p>
          )}

          {/* PREÇOS */}
          <SectionHeader icon={DollarSign} title="Preços" />
          <div className="rounded-lg border border-[hsl(var(--admin-accent-cyan)/0.1)] bg-white/[0.02] p-3 space-y-0.5">
            <InfoRow label="Preço" value={`R$ ${product.price.toFixed(2)}`} icon={DollarSign} />
            {hasPromo && (
              <InfoRow label="Promocional" value={<span className="text-emerald-400">R$ {product.promotional_price!.toFixed(2)}</span>} />
            )}
            <InfoRow label="12x de" value={`R$ ${(product.price / 12).toFixed(2)}`} />
          </div>

          {/* ESTOQUE */}
          <SectionHeader icon={Package} title="Estoque" />
          <div className="rounded-lg border border-[hsl(var(--admin-accent-cyan)/0.1)] bg-white/[0.02] p-3 space-y-0.5">
            <InfoRow label="Disponível" icon={Box} value={
              <span className={product.stock <= 0 ? 'text-red-400' : product.stock <= (product.min_stock || 5) ? 'text-amber-400' : 'text-emerald-400'}>
                {product.stock} un.
              </span>
            } />
            <InfoRow label="Mínimo" value={`${product.min_stock || 5} un.`} />
            <InfoRow label="Valor em estoque" value={`R$ ${stockValue.toFixed(2)}`} />
            {product.sku && <InfoRow label="SKU" icon={Tag} value={product.sku} />}
          </div>

          {/* CUSTOS & MARGEM */}
          <SectionHeader icon={TrendingUp} title="Custos & Margem" />
          <div className="rounded-lg border border-[hsl(var(--admin-accent-cyan)/0.1)] bg-white/[0.02] p-3 space-y-0.5">
            <InfoRow label="Material" value={`R$ ${(product.cost_material || 0).toFixed(2)}`} />
            <InfoRow label="Mão de obra" value={`R$ ${(product.cost_labor || 0).toFixed(2)}`} />
            <InfoRow label="Frete" value={`R$ ${(product.cost_shipping || 0).toFixed(2)}`} />
            <Separator className="bg-white/5 my-1" />
            <InfoRow label="Custo total" value={`R$ ${totalCost.toFixed(2)}`} />
            <InfoRow label="Margem" value={
              <span className={margin >= 50 ? 'text-emerald-400' : margin >= 20 ? 'text-amber-400' : 'text-red-400'}>
                {margin.toFixed(1)}%
              </span>
            } icon={BarChart3} />
          </div>

          {/* DIMENSÕES */}
          <SectionHeader icon={Ruler} title="Peso & Dimensões" />
          <div className="rounded-lg border border-[hsl(var(--admin-accent-cyan)/0.1)] bg-white/[0.02] p-3 space-y-0.5">
            <InfoRow label="Peso" icon={Weight} value={`${product.weight_kg || 0} kg`} />
            <InfoRow label="Dimensões" icon={Ruler} value={`${product.length_cm || 0} × ${product.width_cm || 0} × ${product.height_cm || 0} cm`} />
          </div>

          {/* ORGANIZAÇÃO */}
          <SectionHeader icon={Layers} title="Organização" />
          <div className="rounded-lg border border-[hsl(var(--admin-accent-cyan)/0.1)] bg-white/[0.02] p-3 space-y-0.5">
            {category && <InfoRow label="Categoria" value={category.name} icon={Layers} />}
            <InfoRow label="Slug" value={<span className="font-mono text-[10px]">/{product.slug}</span>} />
            <InfoRow label="Criado em" value={new Date(product.created_at).toLocaleDateString('pt-BR')} />
            {product.updated_at && <InfoRow label="Atualizado" value={new Date(product.updated_at).toLocaleDateString('pt-BR')} />}
          </div>

          {/* Link para loja */}
          <div className="pt-4 pb-2">
            <a
              href={`/produto/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[hsl(var(--admin-accent-purple)/0.3)] bg-[hsl(var(--admin-accent-purple)/0.08)] text-[hsl(var(--admin-accent-purple))] text-xs font-medium hover:bg-[hsl(var(--admin-accent-purple)/0.15)] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver na loja
            </a>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
