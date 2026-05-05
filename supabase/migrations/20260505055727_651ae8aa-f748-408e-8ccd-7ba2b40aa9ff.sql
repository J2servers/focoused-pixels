
ALTER VIEW public.ads_pixels_public SET (security_invoker = on);
GRANT SELECT ON public.ads_pixels_public TO anon, authenticated;
