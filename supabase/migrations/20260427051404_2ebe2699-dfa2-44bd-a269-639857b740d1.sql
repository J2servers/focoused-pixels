
-- Fix Security Definer View warning by using security_invoker
DROP VIEW IF EXISTS public.reviews_public;

CREATE VIEW public.reviews_public
WITH (security_invoker = true)
AS
SELECT
  id,
  product_slug,
  customer_name,
  rating,
  title,
  comment,
  images,
  is_verified_purchase,
  created_at,
  updated_at
FROM public.reviews
WHERE is_approved = true;

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Allow public to SELECT approved rows via the view (RLS still applies on base table)
CREATE POLICY "Public can read approved reviews via view"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (is_approved = true);
