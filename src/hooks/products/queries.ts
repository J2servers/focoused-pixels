import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDbProduct } from './mapper';
import { FIVE_MIN, PRODUCT_SELECT, TEN_MIN, TWO_MIN } from './types';

const baseProductQuery = () =>
  supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('status', 'active')
    .is('deleted_at', null);

/** Sanitise free-text search to prevent SQL/ilike injection vectors. */
const sanitiseSearchQuery = (query: string): string =>
  query
    .replace(/[%_\\]/g, '')
    .replace(/['"`;()]/g, '')
    .trim()
    .slice(0, 100);

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await baseProductQuery().order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}

export function useProductsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];

      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (!categoryData) return [];

      const { data: childCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryData.id);

      const categoryIds = [categoryData.id, ...(childCategories?.map((c) => c.id) || [])];

      const { data, error } = await baseProductQuery()
        .in('category_id', categoryIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    enabled: !!categorySlug,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await baseProductQuery().eq('slug', slug).single();
      if (error) return null;
      return mapDbProduct(data);
    },
    enabled: !!slug,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const sanitized = sanitiseSearchQuery(query);
      if (sanitized.length < 2) return [];

      const { data, error } = await baseProductQuery()
        .or(`name.ilike.%${sanitized}%,short_description.ilike.%${sanitized}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    enabled: query.length >= 2,
    staleTime: TWO_MIN,
    gcTime: FIVE_MIN,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await baseProductQuery()
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}
