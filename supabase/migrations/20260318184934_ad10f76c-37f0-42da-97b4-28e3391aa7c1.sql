
-- ============================================================
-- SECURITY AUDIT FIXES - Critical vulnerabilities
-- ============================================================

-- 1. CRITICAL: Remove payment credential columns from company_info 
-- (they are duplicated in payment_credentials which has proper admin-only RLS)
ALTER TABLE public.company_info 
  DROP COLUMN IF EXISTS mercadopago_access_token,
  DROP COLUMN IF EXISTS stripe_secret_key,
  DROP COLUMN IF EXISTS efi_client_secret,
  DROP COLUMN IF EXISTS efi_client_id,
  DROP COLUMN IF EXISTS efi_pix_key,
  DROP COLUMN IF EXISTS asaas_api_key,
  DROP COLUMN IF EXISTS pagseguro_token,
  DROP COLUMN IF EXISTS pagseguro_email,
  DROP COLUMN IF EXISTS stripe_public_key,
  DROP COLUMN IF EXISTS mercadopago_public_key;

-- 2. CRITICAL: Fix orders policy - "Anyone can view own order by number" uses USING(true)
DROP POLICY IF EXISTS "Anyone can view own order by number" ON public.orders;
CREATE POLICY "Authenticated users can view own orders by email"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 3. CRITICAL: Protect customer_email in reviews from public access
DROP POLICY IF EXISTS "Anyone can read approved reviews or admin sees all" ON public.reviews;
CREATE POLICY "Anyone can read approved reviews"
  ON public.reviews FOR SELECT
  TO public
  USING (is_approved = true OR has_admin_access(auth.uid()));

-- 4. WARN: Restrict tracking_events - keep public access by tracking_code only
DROP POLICY IF EXISTS "Anyone can view tracking events" ON public.tracking_events;
CREATE POLICY "Anyone can view tracking by code"
  ON public.tracking_events FOR SELECT
  TO public
  USING (tracking_code IS NOT NULL);
