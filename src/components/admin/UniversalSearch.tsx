import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingCart, Users, Tag, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'order' | 'lead' | 'category' | 'quote';
  link: string;
}

const TYPE_CONFIG = {
  product: { icon: Package, label: 'Produto', color: 'text-blue-400' },
  order: { icon: ShoppingCart, label: 'Venda', color: 'text-green-400' },
  lead: { icon: Users, label: 'Lead', color: 'text-purple-400' },
  category: { icon: Tag, label: 'Categoria', color: 'text-yellow-400' },
  quote: { icon: FileText, label: 'Orçamento', color: 'text-orange-400' },
};

export const UniversalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setIsSearching(true);

    const term = `%${q}%`;
    const allResults: SearchResult[] = [];

    const [products, orders, leads, categories, quotes] = await Promise.all([
      supabase.from('products').select('id, name, slug, sku').ilike('name', term).limit(5),
      supabase.from('orders').select('id, order_number, customer_name, customer_email').or(`order_number.ilike.${term},customer_name.ilike.${term},customer_email.ilike.${term}`).limit(5),
      supabase.from('leads').select('id, name, email').or(`name.ilike.${term},email.ilike.${term}`).limit(5),
      supabase.from('categories').select('id, name, slug').ilike('name', term).limit(5),
      supabase.from('quotes').select('id, customer_name, customer_email').or(`customer_name.ilike.${term},customer_email.ilike.${term}`).limit(5),
    ]);

    products.data?.forEach(p => allResults.push({
      id: p.id, title: p.name, subtitle: p.sku || p.slug, type: 'product', link: '/admin/produtos'
    }));
    orders.data?.forEach(o => allResults.push({
      id: o.id, title: `Venda ${o.order_number}`, subtitle: o.customer_name, type: 'order', link: '/admin/pedidos'
    }));
    leads.data?.forEach(l => allResults.push({
      id: l.id, title: l.name, subtitle: l.email, type: 'lead', link: '/admin/leads'
    }));
    categories.data?.forEach(c => allResults.push({
      id: c.id, title: c.name, subtitle: c.slug, type: 'category', link: '/admin/categorias'
    }));
    quotes.data?.forEach(q => allResults.push({
      id: q.id, title: q.customer_name, subtitle: q.customer_email, type: 'quote', link: '/admin/orcamentos'
    }));

    setResults(allResults);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (query) search(query); else setResults([]); }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-white/[0.04] border-white/[0.08]">
        <div className="flex items-center border-b border-white/[0.08] px-4">
          <Search className="h-4 w-4 text-white/50 shrink-0" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produtos, vendas, leads, categorias..."
            className="border-0 focus-visible:ring-0 bg-transparent text-white placeholder:text-white/50"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {isSearching && (
            <div className="p-4 text-center text-sm text-white/50">Buscando...</div>
          )}
          
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-white/50">
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
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                      {config.label}s
                    </div>
                    {typeResults.map(result => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/[0.06] transition-colors text-left"
                        >
                          <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{result.title}</p>
                            <p className="text-xs text-white/50 truncate">{result.subtitle}</p>
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
            <div className="p-6 text-center text-sm text-white/50">
              <p>Use <kbd className="px-1.5 py-0.5 bg-white/[0.03] rounded text-xs">Ctrl+K</kbd> para abrir</p>
              <p className="mt-1">Busque por produtos, vendas, leads e mais</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

