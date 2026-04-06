import { useState, ReactNode } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Loader2, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getItemId?: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  actions?: ReactNode;
  filterContent?: ReactNode;
  pageSize?: number;
  showAllRows?: boolean;
}

export function DataTable<T>({
  data, columns, isLoading = false, searchable = true,
  searchPlaceholder = 'Buscar...', selectable = false,
  selectedItems = [], onSelectionChange,
  getItemId = (item: any) => item.id, onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  actions, filterContent, pageSize = 10, showAllRows = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = search
    ? data.filter(item => Object.values(item as any).some(value => String(value).toLowerCase().includes(search.toLowerCase())))
    : data;

  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const comparison = String((a as any)[sortColumn]).localeCompare(String((b as any)[sortColumn]));
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  const effectivePageSize = showAllRows ? sortedData.length || 1 : pageSize;
  const totalPages = Math.ceil(sortedData.length / effectivePageSize);
  const paginatedData = showAllRows ? sortedData : sortedData.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
  };

  const handleSelectAll = (checked: boolean) => onSelectionChange?.(checked ? paginatedData.map(getItemId) : []);
  const handleSelectItem = (id: string, checked: boolean) => onSelectionChange?.(checked ? [...selectedItems, id] : selectedItems.filter(i => i !== id));
  const allSelected = paginatedData.length > 0 && paginatedData.every(item => selectedItems.includes(getItemId(item)));

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-white/20" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-violet-400" /> : <ArrowDown className="h-3.5 w-3.5 text-violet-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input type="search" placeholder={searchPlaceholder} value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="pl-10 h-10 liquid-input" />
            </div>
          )}
          {filterContent}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <div className="liquid-glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/[0.06] hover:bg-transparent"
              style={{ background: 'hsl(250 30% 8% / 0.6)' }}>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} className="border-white/20" />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead key={column.key}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider text-white/40',
                    column.sortable && 'cursor-pointer hover:text-white/70 transition-colors select-none',
                    column.className,
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}>
                  <div className="flex items-center gap-1.5">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-lg opacity-30"
                        style={{ background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(210 100% 55%))' }} />
                      <div className="relative w-10 h-10 rounded-xl liquid-glass flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-white/35">Carregando dados...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-xl liquid-glass-lighter flex items-center justify-center">
                      <Search className="h-5 w-5 text-white/25" />
                    </div>
                    <p className="text-sm text-white/35">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedItems.includes(id);
                return (
                  <TableRow key={id}
                    className={cn(
                      'border-b border-white/[0.04] transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected ? 'bg-violet-500/[0.08]' : 'hover:bg-white/[0.03]',
                    )}
                    onClick={() => onRowClick?.(item)}>
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelectItem(id, c as boolean)} className="border-white/20" />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key} className={cn('py-3.5 text-white/90', column.className)}>
                        {column.render ? column.render(item) : (item as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!showAllRows && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-white/35">
            <span className="font-medium text-white/80">{((currentPage - 1) * effectivePageSize) + 1}-{Math.min(currentPage * effectivePageSize, sortedData.length)}</span>
            {' '}de{' '}
            <span className="font-medium text-white/80">{sortedData.length}</span> registros
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
              className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/[0.06]"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
              className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/[0.06]"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'ghost'} size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn('h-8 w-8 text-sm',
                      currentPage === pageNum
                        ? 'text-white shadow-lg'
                        : 'text-white/30 hover:text-white hover:bg-white/[0.06]',
                    )}
                    style={currentPage === pageNum ? { background: 'linear-gradient(135deg, hsl(280 80% 50% / 0.8), hsl(210 90% 50% / 0.8))', boxShadow: '0 4px 16px hsl(280 80% 50% / 0.3)' } : undefined}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
              className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/[0.06]"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
              className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/[0.06]"><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
