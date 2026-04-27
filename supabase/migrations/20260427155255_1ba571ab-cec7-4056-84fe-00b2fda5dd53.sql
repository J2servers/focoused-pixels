-- Wave 4: Column-level revoke of cost fields from public roles
-- Admins/editors retain access via 'is_admin_or_editor' RLS plus table grants.

REVOKE SELECT (cost_material, cost_labor, cost_shipping) ON public.products FROM anon;
REVOKE SELECT (cost_material, cost_labor, cost_shipping) ON public.products FROM authenticated;

-- Re-grant SELECT on safe columns explicitly to keep storefront working
GRANT SELECT (
  id, name, slug, short_description, full_description,
  price, promotional_price, stock, sku, status,
  cover_image, gallery_images, category_id, tags,
  is_featured, attributes, deleted_at, created_at, updated_at,
  min_stock, weight_kg, length_cm, width_cm, height_cm
) ON public.products TO anon, authenticated;

COMMENT ON COLUMN public.products.cost_material IS 'Sensitive: revoked from anon/authenticated; admin only via RLS bypass.';
COMMENT ON COLUMN public.products.cost_labor IS 'Sensitive: revoked from anon/authenticated.';
COMMENT ON COLUMN public.products.cost_shipping IS 'Sensitive: revoked from anon/authenticated.';