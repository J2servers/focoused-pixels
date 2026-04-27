DROP VIEW IF EXISTS public.products_public CASCADE;

CREATE VIEW public.products_public
WITH (security_invoker = true)
AS
SELECT
  id, name, slug, short_description, full_description,
  price, promotional_price, stock, sku, status,
  cover_image, gallery_images, category_id, tags,
  is_featured, attributes, deleted_at, created_at, updated_at,
  min_stock, weight_kg, length_cm, width_cm, height_cm
FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;

COMMENT ON VIEW public.products_public IS
  'Public view of products excluding cost_* fields. security_invoker preserves RLS.';