
-- 1. Create a secure view for company_info that excludes payment secrets
-- First, null out payment secrets from company_info since they're now in payment_credentials
UPDATE public.company_info SET
  mercadopago_public_key = NULL,
  mercadopago_access_token = NULL,
  efi_client_id = NULL,
  efi_client_secret = NULL,
  efi_pix_key = NULL,
  pagseguro_email = NULL,
  pagseguro_token = NULL,
  stripe_public_key = NULL,
  stripe_secret_key = NULL,
  asaas_api_key = NULL;

-- 2. Fix reviews RLS: Allow admins to see ALL reviews (including unapproved)
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
CREATE POLICY "Anyone can read approved reviews or admin sees all"
  ON public.reviews FOR SELECT
  USING (is_approved = true OR has_admin_access(auth.uid()));

-- 3. Create audit triggers on critical tables
CREATE OR REPLACE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_quotes
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_coupons
  AFTER INSERT OR UPDATE OR DELETE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE OR REPLACE TRIGGER audit_payment_credentials
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_credentials
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

-- 4. Create profile creation trigger (server-side instead of client-side)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists to avoid error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Add unique constraint on profiles.user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_unique'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- 6. Add rate limiting index on page_views for efficient querying
CREATE INDEX IF NOT EXISTS idx_page_views_session_created 
  ON public.page_views (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at 
  ON public.page_views (created_at DESC);
