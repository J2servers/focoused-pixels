export interface ProductLike {
  id?: string;
  name: string; slug: string;
  short_description: string | null; full_description: string | null;
  price: number; promotional_price: number | null;
  stock: number; min_stock?: number | null; sku: string | null;
  status: string; category_id: string | null; is_featured: boolean;
  cover_image: string | null; gallery_images: string[] | null;
  cost_material?: number | null; cost_labor?: number | null; cost_shipping?: number | null;
  weight_kg?: number | null; length_cm?: number | null; width_cm?: number | null; height_cm?: number | null;
}

export type ProductFormState = ReturnType<typeof buildForm>;

export function buildForm(p?: ProductLike) {
  if (!p) return {
    name: '', slug: '', short_description: '', full_description: '',
    price: '', promotional_price: '', stock: '0', sku: '', status: 'draft',
    category_id: '', is_featured: false, cover_image: null as string | null,
    gallery_images: [] as string[],
    cost_material: '', cost_labor: '', cost_shipping: '',
    min_stock: '5', weight_kg: '0.5', length_cm: '20', width_cm: '15', height_cm: '10',
  };
  return {
    name: p.name, slug: p.slug,
    short_description: p.short_description || '', full_description: p.full_description || '',
    price: p.price.toString(), promotional_price: p.promotional_price?.toString() || '',
    stock: p.stock.toString(), sku: p.sku || '', status: p.status,
    category_id: p.category_id || '', is_featured: p.is_featured,
    cover_image: p.cover_image || null as string | null,
    gallery_images: (p.gallery_images || []) as string[],
    cost_material: (p.cost_material || 0).toString(), cost_labor: (p.cost_labor || 0).toString(),
    cost_shipping: (p.cost_shipping || 0).toString(),
    min_stock: (p.min_stock || 5).toString(), weight_kg: (p.weight_kg || 0.5).toString(),
    length_cm: (p.length_cm || 20).toString(), width_cm: (p.width_cm || 15).toString(), height_cm: (p.height_cm || 10).toString(),
  };
}
