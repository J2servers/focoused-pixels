import type { DbProduct } from './types';

const getStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
};

/** Convert a DB product into the frontend-friendly representation. */
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
    categoryId: p.category?.id || undefined,
    subcategory: undefined,
    rating: 4.5,
    reviews: 0,
    freeShipping: p.price >= 199,
    badge: p.is_featured
      ? ('lancamento' as const)
      : (discount && discount >= 10 ? ('desconto' as const) : undefined),
    sizes: getStringArray(attrs?.sizes),
    colors: getStringArray(attrs?.colors),
    materials: getStringArray(attrs?.materials),
    customizable: true,
    minQuantity: 1,
    inStock: (p.stock || 0) > 0,
    stock: p.stock ?? undefined,
    tags: p.tags || [],
    specifications: [],
  };
}

export type MappedProduct = ReturnType<typeof mapDbProduct>;
