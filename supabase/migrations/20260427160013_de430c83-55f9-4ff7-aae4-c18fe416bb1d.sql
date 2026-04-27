
-- 1. Force security_invoker on all public views (fix Security Definer View errors)
ALTER VIEW public.reviews_public SET (security_invoker = true);
ALTER VIEW public.products_public SET (security_invoker = true);
ALTER VIEW public.login_page_settings SET (security_invoker = true);
ALTER VIEW public.coupons_public SET (security_invoker = true);
ALTER VIEW public.company_info_public SET (security_invoker = true);

-- 2. Remove public read of reviews table (it leaks customer_email). Keep view-only access.
DROP POLICY IF EXISTS "Public can read approved reviews via view" ON public.reviews;
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- 3. Restrict coupons exposure: drop "Anyone can read active coupons", expose only via view
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
GRANT SELECT ON public.coupons_public TO anon, authenticated;

-- 4. Allow customers to read their own order items (matched via parent order email)
CREATE POLICY "Customers can view items of own orders"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.customer_email = (auth.jwt() ->> 'email')
    )
  );

-- Revoke cost columns from order_items for non-admins
REVOKE SELECT ON public.order_items FROM anon, authenticated;
GRANT SELECT (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, created_at)
  ON public.order_items TO authenticated;

-- 5. Harden order-files bucket: only admins or order owner can upload
DROP POLICY IF EXISTS "Authenticated users can upload order files" ON storage.objects;
CREATE POLICY "Admins can upload order files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'order-files'
    AND public.has_admin_access(auth.uid())
  );

-- 6. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated.
-- Triggers still run (they execute as table owner regardless of grants).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_audit_action() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_reviews_updated_at() FROM anon, authenticated, public;

-- Keep has_role/has_admin_access/is_admin_or_editor callable (needed by RLS policies; safe — they check roles).
-- They are STABLE and only return boolean about the requesting user.
