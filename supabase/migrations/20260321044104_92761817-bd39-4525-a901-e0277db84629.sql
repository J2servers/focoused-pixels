
-- Create the email_credentials table that the frontend code expects
CREATE TABLE IF NOT EXISTS public.email_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_enabled BOOLEAN DEFAULT false,
  business_email TEXT,
  sender_name TEXT DEFAULT 'Pincel de Luz',
  reply_to_email TEXT,
  smtp_host TEXT DEFAULT 'smtp.hostinger.com',
  smtp_port INTEGER DEFAULT 465,
  smtp_secure BOOLEAN DEFAULT true,
  smtp_username TEXT,
  smtp_password TEXT,
  test_mode BOOLEAN DEFAULT true,
  test_recipient TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_credentials ENABLE ROW LEVEL SECURITY;

-- Admins can manage email credentials
CREATE POLICY "Admins can manage email credentials"
  ON public.email_credentials FOR ALL
  USING (has_admin_access(auth.uid()));

-- Migrate data from hostinger_email_credentials if it exists
INSERT INTO public.email_credentials (
  smtp_host, smtp_port, smtp_username, smtp_password, 
  reply_to_email, test_recipient, test_mode, email_enabled
)
SELECT 
  smtp_host, smtp_port, smtp_user, smtp_password,
  reply_to, test_email, test_mode, is_active
FROM public.hostinger_email_credentials
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add missing columns to company_info for logo height fields
ALTER TABLE public.company_info 
  ADD COLUMN IF NOT EXISTS header_logo_height INTEGER DEFAULT 64,
  ADD COLUMN IF NOT EXISTS header_logo_mobile_height INTEGER DEFAULT 36,
  ADD COLUMN IF NOT EXISTS footer_logo_height INTEGER DEFAULT 48;
