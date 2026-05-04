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

export const PRODUCT_SELECT = `id, name, slug, short_description, full_description, price, promotional_price, stock, sku, status, cover_image, gallery_images, category_id, tags, is_featured, attributes, created_at, category:categories(id, name, slug, parent_id)`;

export const FIVE_MIN = 5 * 60 * 1000;
export const TEN_MIN = 10 * 60 * 1000;
export const TWO_MIN = 2 * 60 * 1000;
