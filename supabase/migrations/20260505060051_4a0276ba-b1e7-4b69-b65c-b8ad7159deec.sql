
DROP VIEW public.ads_pixels_public;
CREATE VIEW public.ads_pixels_public AS
SELECT platform, display_name, pixel_id, account_id, measurement_id, conversion_id, conversion_label, domain_verification_id, config
FROM public.ads_integrations
WHERE enabled = true AND pixel_enabled = true;
ALTER VIEW public.ads_pixels_public SET (security_invoker = on);
GRANT SELECT ON public.ads_pixels_public TO anon, authenticated;
