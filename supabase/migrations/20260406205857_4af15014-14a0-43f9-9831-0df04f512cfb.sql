
-- Add login page customization fields to company_info
ALTER TABLE public.company_info
ADD COLUMN IF NOT EXISTS login_logo text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS login_bg_image text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS login_title text DEFAULT 'Painel de Controle',
ADD COLUMN IF NOT EXISTS login_subtitle text DEFAULT 'Acesse o centro de comando do seu negócio.';

-- Create server-side login attempts table for military-grade rate limiting
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  email_hash text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  user_agent_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast IP-based lookups
CREATE INDEX idx_login_attempts_ip_hash ON public.login_attempts(ip_hash, created_at DESC);
CREATE INDEX idx_login_attempts_email_hash ON public.login_attempts(email_hash, created_at DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (via edge function), admins can read for audit
CREATE POLICY "Service role inserts login attempts"
  ON public.login_attempts FOR INSERT
  TO public
  WITH CHECK (false);

CREATE POLICY "Admins can view login attempts"
  ON public.login_attempts FOR SELECT
  TO authenticated
  USING (has_admin_access(auth.uid()));

-- Create IP blocklist table
CREATE TABLE public.ip_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL UNIQUE,
  reason text DEFAULT 'brute_force',
  blocked_until timestamptz,
  permanent boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.ip_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage IP blocklist"
  ON public.ip_blocklist FOR ALL
  TO authenticated
  USING (has_admin_access(auth.uid()));

-- Auto-cleanup old login attempts (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.login_attempts WHERE created_at < now() - interval '30 days';
  DELETE FROM public.ip_blocklist WHERE permanent = false AND blocked_until < now();
$$;
