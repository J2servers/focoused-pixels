import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FIVE_MIN, TEN_MIN, type DbCategory } from './types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as DbCategory[];
    },
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();
      if (error) return null;

      const { data: subcategories } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      return { ...category, subcategories: subcategories || [] };
    },
    enabled: !!slug,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
  });
}
