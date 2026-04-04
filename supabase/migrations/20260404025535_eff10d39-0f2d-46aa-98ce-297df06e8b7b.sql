ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS ai_external_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_external_provider text DEFAULT null,
  ADD COLUMN IF NOT EXISTS ai_external_api_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS ai_external_api_key text DEFAULT null,
  ADD COLUMN IF NOT EXISTS ai_external_model text DEFAULT null;