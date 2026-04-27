
-- 1. tracking_events: restrict via function-based lookup
DROP POLICY IF EXISTS "Anyone can view tracking by code" ON public.tracking_events;

CREATE OR REPLACE FUNCTION public.lookup_tracking(_code text)
RETURNS SETOF public.tracking_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.tracking_events
  WHERE tracking_code = _code
  ORDER BY event_date DESC NULLS LAST
  LIMIT 100
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_tracking(text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_tracking(text) TO anon, authenticated;

-- 2. Isolate AI external credentials
CREATE TABLE IF NOT EXISTS public.ai_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text,
  api_url text,
  api_key text,
  model text,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage AI credentials"
  ON public.ai_credentials
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing data
INSERT INTO public.ai_credentials (provider, api_url, api_key, model, enabled)
SELECT ai_external_provider, ai_external_api_url, ai_external_api_key, ai_external_model, COALESCE(ai_external_enabled, false)
FROM public.company_info
WHERE ai_external_api_key IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

-- Null out sensitive columns in company_info (kept as columns to avoid breaking types until refactor)
UPDATE public.company_info SET ai_external_api_key = NULL;
