ALTER VIEW public.login_page_settings SET (security_invoker = false);
GRANT SELECT ON public.login_page_settings TO anon, authenticated;