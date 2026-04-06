-- Add size control columns
ALTER TABLE public.company_info
  ADD COLUMN IF NOT EXISTS login_logo_height integer DEFAULT 48,
  ADD COLUMN IF NOT EXISTS login_title_size integer DEFAULT 48,
  ADD COLUMN IF NOT EXISTS login_subtitle_size integer DEFAULT 14;

-- Create a public view exposing ONLY login visual settings (no sensitive data)
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
  company_name,
  header_logo
FROM public.company_info
LIMIT 1;

-- Grant public access to the view
GRANT SELECT ON public.login_page_settings TO anon, authenticated;