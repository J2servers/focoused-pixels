
ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS login_brand_text text DEFAULT NULL;

DROP VIEW IF EXISTS public.login_page_settings;

CREATE OR REPLACE VIEW public.login_page_settings
WITH (security_invoker = false)
AS
SELECT
  login_logo,
  login_bg_image,
  login_title,
  login_subtitle,
  login_logo_height,
  login_title_size,
  login_subtitle_size,
  login_brand_text,
  company_name,
  header_logo
FROM public.company_info
LIMIT 1;

GRANT SELECT ON public.login_page_settings TO anon, authenticated;
