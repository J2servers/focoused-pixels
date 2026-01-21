import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  price: number;
  promotional_price: number | null;
  stock: number | null;
  sku: string | null;
  status: string | null;
  cover_image: string | null;
  gallery_images: string[] | null;
  category_id: string | null;
  is_featured: boolean | null;
  tags: string[] | null;
  attributes: Json | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number | null;
  status: string | null;
}

// Helper to safely extract string array from attributes
function getStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

// Convert DB product to frontend-compatible format
export function mapDbProduct(p: DbProduct) {
  const discount = p.promotional_price && p.price > p.promotional_price
    ? Math.round(((p.price - p.promotional_price) / p.price) * 100)
    : undefined;

  const attrs = p.attributes as Record<string, unknown> | null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.short_description || '',
    fullDescription: p.full_description || '',
    price: p.promotional_price || p.price,
    originalPrice: p.promotional_price ? p.price : undefined,
    discount,
    image: p.cover_image || '/placeholder.svg',
    images: p.gallery_images || [],
    category: p.category?.slug || '',
    subcategory: undefined,
    rating: 4.5,
    reviews: 0,
    freeShipping: p.price >= 199,
    badge: p.is_featured ? 'lancamento' as const : (discount && discount >= 10 ? 'desconto' as const : undefined),
    sizes: getStringArray(attrs?.sizes),
    colors: getStringArray(attrs?.colors),
    materials: getStringArray(attrs?.materials),
    customizable: true,
    minQuantity: 1,
    inStock: (p.stock || 0) > 0,
    tags: p.tags || [],
    specifications: [],
  };
}

// Fetch all active products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
  });
}

// Fetch products by category
export function useProductsByCategory(categorySlug: string | undefined) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];

      // First find the category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!categoryData) return [];

      // Also get child categories
      const { data: childCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryData.id);

      const categoryIds = [categoryData.id, ...(childCategories?.map(c => c.id) || [])];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .in('category_id', categoryIds)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    enabled: !!categorySlug,
  });
}

// Fetch single product by slug
export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .is('deleted_at', null)
        .single();

      if (error) return null;
      return mapDbProduct(data);
    },
    enabled: !!slug,
  });
}

// Search products
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq('status', 'active')
        .is('deleted_at', null)
        .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
    enabled: query.length >= 2,
  });
}

// Fetch featured products
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq('status', 'active')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    },
  });
}

// Fetch categories
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
  });
}

// Fetch category by slug with subcategories
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

      // Get subcategories
      const { data: subcategories } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id)
        .eq('status', 'active')
        .order('display_order', { ascending: true });

      return {
        ...category,
        subcategories: subcategories || [],
      };
    },
    enabled: !!slug,
  });
}

// Fetch hero slides
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
  });
}
