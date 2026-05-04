import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UniversalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'product' | 'order' | 'lead' | 'category' | 'quote';
  link: string;
}

export function useUniversalSearch() {
  const [results, setResults] = useState<UniversalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const term = `%${q}%`;
      const all: UniversalSearchResult[] = [];

      const [products, orders, leads, categories, quotes] = await Promise.all([
        supabase.from('products').select('id, name, slug, sku').ilike('name', term).limit(5),
        supabase.from('orders').select('id, order_number, customer_name, customer_email')
          .or(`order_number.ilike.${term},customer_name.ilike.${term},customer_email.ilike.${term}`).limit(5),
        supabase.from('leads').select('id, name, email')
          .or(`name.ilike.${term},email.ilike.${term}`).limit(5),
        supabase.from('categories').select('id, name, slug').ilike('name', term).limit(5),
        supabase.from('quotes').select('id, customer_name, customer_email')
          .or(`customer_name.ilike.${term},customer_email.ilike.${term}`).limit(5),
      ]);

      products.data?.forEach((p) => all.push({
        id: p.id, title: p.name, subtitle: p.sku || p.slug, type: 'product', link: '/admin/produtos',
      }));
      orders.data?.forEach((o) => all.push({
        id: o.id, title: `Venda ${o.order_number}`, subtitle: o.customer_name, type: 'order', link: '/admin/pedidos',
      }));
      leads.data?.forEach((l) => all.push({
        id: l.id, title: l.name, subtitle: l.email, type: 'lead', link: '/admin/leads',
      }));
      categories.data?.forEach((c) => all.push({
        id: c.id, title: c.name, subtitle: c.slug, type: 'category', link: '/admin/categorias',
      }));
      quotes.data?.forEach((q2) => all.push({
        id: q2.id, title: q2.customer_name, subtitle: q2.customer_email, type: 'quote', link: '/admin/orcamentos',
      }));

      setResults(all);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const reset = useCallback(() => setResults([]), []);

  return { results, isSearching, search, reset };
}
