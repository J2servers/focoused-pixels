-- Create API keys table for CRM integrations
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['read']::text[],
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  expires_at timestamptz
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys" ON public.api_keys
  FOR ALL USING (has_admin_access(auth.uid()));

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL DEFAULT 'inbound',
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  request_body jsonb,
  response_body jsonb,
  status_code integer,
  source text,
  event_type text,
  processed boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (has_admin_access(auth.uid()));

CREATE POLICY "System can insert webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (true);