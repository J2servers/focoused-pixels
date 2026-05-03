import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Package, Truck, Percent } from 'lucide-react';

interface Sub { id: string; slug: string; name: string }
interface Cat { subcategories?: Sub[] }

export interface FilterContentProps {
  priceMin: string; setPriceMin: (s: string) => void;
  priceMax: string; setPriceMax: (s: string) => void;
  priceRange: { min: number; max: number };
  availableSizes: string[];
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  showOnlyInStock: boolean; setShowOnlyInStock: (b: boolean) => void;
  showOnlyFreeShipping: boolean; setShowOnlyFreeShipping: (b: boolean) => void;
  showOnlyOnSale: boolean; setShowOnlyOnSale: (b: boolean) => void;
  productCounts: { inStock: number; freeShipping: number; onSale: number };
  hasActiveFilters: boolean;
  clearFilters: () => void;
  category: Cat | null | undefined;
  categorySlug?: string;
  subcategorySlug?: string;
}

export function FilterContent(p: FilterContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Faixa de Preço</Label>
        <div className="flex items-center gap-2 mb-2">
          <Input type="number" placeholder="De" value={p.priceMin} onChange={(e) => p.setPriceMin(e.target.value)} className="w-full h-9 text-sm" />
          <span className="text-muted-foreground text-xs">—</span>
          <Input type="number" placeholder="Até" value={p.priceMax} onChange={(e) => p.setPriceMax(e.target.value)} className="w-full h-9 text-sm" />
        </div>
        {p.priceRange.max > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {[50, 100, 200, 500].filter(v => v <= p.priceRange.max).map(v => (
              <Button key={v} variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => p.setPriceMax(String(v))}>
                Até R${v}
              </Button>
            ))}
          </div>
        )}
      </div>

      {p.availableSizes.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Tamanhos</Label>
          <div className="flex flex-wrap gap-2">
            {p.availableSizes.map((size) => (
              <Button key={size} variant={p.selectedSizes.includes(size) ? 'default' : 'outline'} size="sm"
                onClick={() => p.toggleSize(size)} className="min-w-[3rem] h-8 text-xs">
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-semibold block">Filtros</Label>
        <div className="flex items-center space-x-2">
          <Checkbox id="inStock" checked={p.showOnlyInStock} onCheckedChange={(c) => p.setShowOnlyInStock(c as boolean)} />
          <label htmlFor="inStock" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            Em estoque <span className="text-xs text-muted-foreground">({p.productCounts.inStock})</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="freeShipping" checked={p.showOnlyFreeShipping} onCheckedChange={(c) => p.setShowOnlyFreeShipping(c as boolean)} />
          <label htmlFor="freeShipping" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
            Frete grátis <span className="text-xs text-muted-foreground">({p.productCounts.freeShipping})</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="onSale" checked={p.showOnlyOnSale} onCheckedChange={(c) => p.setShowOnlyOnSale(c as boolean)} />
          <label htmlFor="onSale" className="text-sm cursor-pointer flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
            Em promoção <span className="text-xs text-muted-foreground">({p.productCounts.onSale})</span>
          </label>
        </div>
      </div>

      {p.hasActiveFilters && (
        <Button variant="ghost" onClick={p.clearFilters} className="w-full text-sm">Limpar todos os filtros</Button>
      )}

      {p.category?.subcategories && p.category.subcategories.length > 0 && !p.subcategorySlug && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Subcategorias</Label>
          <ul className="space-y-1.5">
            {p.category.subcategories.map((sub) => (
              <li key={sub.id}>
                <Link to={`/categoria/${p.categorySlug}/${sub.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-muted/50">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
