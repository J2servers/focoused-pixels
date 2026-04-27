-- Wave 4 (final): table-level revoke then per-column grant
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.products FROM authenticated;

GRANT SELECT (
  id, name, slug, short_description, full_description,
  price, promotional_price, stock, sku, status,
  cover_image, gallery_images, category_id, tags,
  is_featured, attributes, deleted_at, created_at, updated_at,
  min_stock, weight_kg, length_cm, width_cm, height_cm
) ON public.products TO anon, authenticated;