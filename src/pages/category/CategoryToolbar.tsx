import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest' | 'discount';

export function CategoryToolbar({ isMobile, hasActiveFilters, activeFiltersCount, viewMode, setViewMode, sortBy, setSortBy, filterContent }: {
  isMobile: boolean;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  filterContent: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
                {hasActiveFilters && (
                  <span className="ml-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
              <div className="mt-6">{filterContent}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center rounded-lg border border-border overflow-hidden">
          <button onClick={() => setViewMode('grid')}
            className={cn("p-1.5 transition-colors", viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={cn("p-1.5 transition-colors", viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
            <List className="h-4 w-4" />
          </button>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className={cn("h-8 text-xs", isMobile ? "w-[130px]" : "w-[180px]")}>
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevância</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
            <SelectItem value="name-asc">Nome A-Z</SelectItem>
            <SelectItem value="newest">Lançamentos</SelectItem>
            <SelectItem value="discount">Maior desconto</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
