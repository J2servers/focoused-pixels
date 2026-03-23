
-- Create customer_checkout_profiles table (referenced by useCheckoutProfile.ts)
CREATE TABLE public.customer_checkout_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  phone text,
  address text,
  cep text,
  company text,
  cnpj text,
  shipping_method text DEFAULT 'sedex',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_checkout_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profile
CREATE POLICY "Users can manage own checkout profile"
  ON public.customer_checkout_profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all checkout profiles"
  ON public.customer_checkout_profiles
  FOR SELECT
  TO authenticated
  USING (has_admin_access(auth.uid()));

-- Update trigger
CREATE TRIGGER update_customer_checkout_profiles_updated_at
  BEFORE UPDATE ON public.customer_checkout_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
