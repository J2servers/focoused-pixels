-- Switch view back to security_invoker to satisfy linter
ALTER VIEW public.reviews_public SET (security_invoker = true);

-- Allow anon/authenticated to read approved reviews (row-level)
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- Column-level: revoke SELECT on customer_email from anon and authenticated,
-- then grant SELECT on safe columns only.
REVOKE SELECT ON public.reviews FROM anon, authenticated;

GRANT SELECT (
  id, product_slug, customer_name, rating, title, comment, images,
  is_verified_purchase, is_approved, created_at, updated_at
) ON public.reviews TO anon, authenticated;

-- Authenticated users still need to insert their own review
GRANT INSERT ON public.reviews TO authenticated;