import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Cat {
  name: string;
  description?: string | null;
  image_url?: string | null;
  subcategories?: { id: string; slug: string; name: string }[];
}

export function CategoryBanner({ category, productCount, priceRange }: {
  category: Cat | null | undefined;
  productCount: number;
  priceRange: { min: number; max: number };
}) {
  if (!category) return null;
  const hasImage = !!category.image_url;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={cn("relative rounded-2xl overflow-hidden mb-6", hasImage ? "h-40 md:h-56" : "py-6 md:py-8")}
      style={!hasImage ? {
        background: 'hsl(var(--background))',
        boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.4), inset -4px -4px 10px hsl(var(--neu-light) / 0.6)',
      } : undefined}>
      {hasImage && (
        <>
          <img src={category.image_url!} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      )}
      <div className={cn("relative z-10 px-5 md:px-8", hasImage ? "absolute bottom-0 left-0 right-0 pb-5 md:pb-8" : "")}>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={cn("text-2xl md:text-3xl lg:text-4xl font-bold", hasImage ? "text-white" : "text-foreground")}>
          {category.name}
        </motion.h1>
        {category.description && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={cn("text-sm mt-1.5 max-w-2xl", hasImage ? "text-white/80" : "text-muted-foreground")}>
            {category.description}
          </motion.p>
        )}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className={cn("text-xs mt-2", hasImage ? "text-white/60" : "text-muted-foreground")}>
          {productCount} {productCount === 1 ? 'produto' : 'produtos'}
          {priceRange.max > 0 && ` • R$ ${priceRange.min.toFixed(0)} — R$ ${priceRange.max.toFixed(0)}`}
        </motion.p>
      </div>
    </motion.div>
  );
}

export function SubcategoryChips({ category, categorySlug, subcategorySlug }: {
  category: Cat | null | undefined; categorySlug?: string; subcategorySlug?: string;
}) {
  const subs = category?.subcategories;
  if (!subs || subs.length === 0 || subcategorySlug) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
      <Link to={`/categoria/${categorySlug}`} className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-primary text-primary-foreground">
        Todos
      </Link>
      {subs.map((sub) => (
        <Link key={sub.id} to={`/categoria/${categorySlug}/${sub.slug}`}
          className="shrink-0 px-4 py-2 rounded-full text-xs font-medium border border-border bg-background hover:border-primary/50 hover:text-primary transition-colors">
          {sub.name}
        </Link>
      ))}
    </div>
  );
}

export function ActiveFilterTags({ activeFilters, clearFilters }: {
  activeFilters: { label: string; onRemove: () => void }[]; clearFilters: () => void;
}) {
  if (activeFilters.length === 0) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-xs text-muted-foreground">Filtros ativos:</span>
      <AnimatePresence>
        {activeFilters.map((f, i) => (
          <motion.div key={f.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.05 }}>
            <Badge variant="secondary" className="gap-1 pl-2.5 pr-1 py-1 text-xs cursor-pointer hover:bg-destructive/10" onClick={f.onRemove}>
              {f.label}
              <X className="h-3 w-3" />
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive px-2" onClick={clearFilters}>
        Limpar tudo
      </Button>
    </div>
  );
}
