import { useState, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item: any) => item.id,
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
  actions,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter data
  const filteredData = search
    ? data.filter(item =>
        Object.values(item as any).some(value =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = (a as any)[sortColumn];
        const bVal = (b as any)[sortColumn];
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? paginatedData.map(getItemId) : []);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedItems, id]);
      } else {
        onSelectionChange(selectedItems.filter(i => i !== id));
      }
    }
  };

  const allSelected = paginatedData.length > 0 && 
    paginatedData.every(item => selectedItems.includes(getItemId(item)));

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {searchable && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-10 bg-card border-border/50 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        )}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-muted-foreground/30"
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    column.sortable && 'cursor-pointer hover:text-foreground transition-colors select-none',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
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
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="h-40"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Carregando dados...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="h-40"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedItems.includes(id);

                return (
                  <TableRow
                    key={id}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-primary/5',
                      !isSelected && 'hover:bg-muted/30'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSelectItem(id, checked as boolean)
                          }
                          className="border-muted-foreground/30"
                        />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key} className={cn("py-3.5", column.className)}>
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)}</span>
            {' '}de{' '}
            <span className="font-medium text-foreground">{sortedData.length}</span> registros
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 text-sm",
                      currentPage === pageNum && "bg-primary text-primary-foreground shadow-sm"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
