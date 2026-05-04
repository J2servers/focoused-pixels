import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingCart, Users, Tag, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUniversalSearch, type UniversalSearchResult } from '@/hooks/admin/useUniversalSearch';

const TYPE_CONFIG = {
  product: { icon: Package, label: 'Produto', color: 'text-blue-400' },
  order: { icon: ShoppingCart, label: 'Venda', color: 'text-green-400' },
  lead: { icon: Users, label: 'Lead', color: 'text-purple-400' },
  category: { icon: Tag, label: 'Categoria', color: 'text-yellow-400' },
  quote: { icon: FileText, label: 'Orçamento', color: 'text-orange-400' },
};

export const UniversalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { results, isSearching, search, reset } = useUniversalSearch();

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query); else reset(); }, 300);
    return () => clearTimeout(timer);
  }, [query, search, reset]);

  useEffect(() => {
    if (!open) { setQuery(''); reset(); }
  }, [open, reset]);

  const handleSelect = (result: UniversalSearchResult) => {
    navigate(result.link);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
        <div className="flex items-center border-b border-[hsl(var(--admin-card-border))] px-4">
          <Search className="h-4 w-4 text-[hsl(var(--admin-text-muted))] shrink-0" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produtos, vendas, leads, categorias..."
            className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-[hsl(var(--admin-text-muted))]"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[hsl(var(--admin-text-muted))] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isSearching && (
            <div className="p-4 text-center text-sm text-[hsl(var(--admin-text-muted))]">Buscando...</div>
          )}
          
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-[hsl(var(--admin-text-muted))]">
              Nenhum resultado para "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                const typeResults = results.filter(r => r.type === type);
                if (!typeResults.length) return null;
                return (
                  <div key={type} className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))]">
                      {config.label}s
                    </div>
                    {typeResults.map(result => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors text-left"
                        >
                          <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{result.title}</p>
                            <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">{result.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="p-6 text-center text-sm text-[hsl(var(--admin-text-muted))]">
              <p>Use <kbd className="px-1.5 py-0.5 bg-[hsl(var(--admin-bg))] rounded text-xs">Ctrl+K</kbd> para abrir</p>
              <p className="mt-1">Busque por produtos, vendas, leads e mais</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

