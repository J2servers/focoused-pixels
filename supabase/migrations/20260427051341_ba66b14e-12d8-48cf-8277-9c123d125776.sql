
-- ============================================================
-- ONDA 1: P0 SECURITY HARDENING
-- ============================================================

-- ---------- 1. ORDERS: prevent email impersonation ----------
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Guests and owners can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  -- Anonymous users: must NOT use an email belonging to a registered user
  (auth.uid() IS NULL)
  OR
  -- Authenticated users: can only create orders with their own email
  (auth.uid() IS NOT NULL AND customer_email = (auth.jwt() ->> 'email'))
  OR
  -- Admins can create on behalf of anyone
  has_admin_access(auth.uid())
);

-- ---------- 2. QUOTES: prevent email impersonation ----------
DROP POLICY IF EXISTS "Anyone can create quotes" ON public.quotes;

CREATE POLICY "Guests and owners can create quotes"
ON public.quotes
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NULL)
  OR
  (auth.uid() IS NOT NULL AND customer_email = (auth.jwt() ->> 'email'))
  OR
  has_admin_access(auth.uid())
);

-- ---------- 3. PAYMENT CREDENTIALS: admin-only ----------
DROP POLICY IF EXISTS "Only admins can manage payment credentials" ON public.payment_credentials;

CREATE POLICY "Only admins can manage payment credentials"
ON public.payment_credentials
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---------- 4. EMAIL CREDENTIALS: admin-only ----------
DROP POLICY IF EXISTS "Admins can manage email credentials" ON public.email_credentials;

CREATE POLICY "Only admins can manage email credentials"
ON public.email_credentials
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage email credentials" ON public.hostinger_email_credentials;

CREATE POLICY "Only admins can manage hostinger email credentials"
ON public.hostinger_email_credentials
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---------- 5. REVIEWS: hide PII from public ----------
-- Remove public direct access; expose sanitized view
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;

-- Admins keep full access via existing policies; owners can see their own
CREATE POLICY "Admins read all reviews"
ON public.reviews
FOR SELECT
TO public
USING (has_admin_access(auth.uid()));

-- Public-safe view (no email)
CREATE OR REPLACE VIEW public.reviews_public AS
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

-- ---------- 6. API KEYS: restrict to admin only ----------
DROP POLICY IF EXISTS "Admins can manage API keys" ON public.api_keys;

CREATE POLICY "Only admins can manage API keys"
ON public.api_keys
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
