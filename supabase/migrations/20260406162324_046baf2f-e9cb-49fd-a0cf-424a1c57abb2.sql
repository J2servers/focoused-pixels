
-- 1. Create a public view that excludes sensitive fields
CREATE OR REPLACE VIEW public.company_info_public AS
SELECT
  id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
  social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
  copyright_text, privacy_policy, terms_of_service, returns_policy,
  footer_logo, header_logo, updated_at,
  free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
  seo_title, seo_description, seo_keywords, og_image, favicon_url,
  primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
  products_per_page, show_product_ratings, show_product_stock, enable_wishlist,
  enable_compare_products, show_recently_viewed,
  min_order_value, max_order_value, enable_guest_checkout, require_phone_on_checkout,
  checkout_success_message, low_stock_threshold, enable_stock_alerts, enable_order_notifications,
  notification_email, ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes, shipping_origin_cep, shipping_calculation_method, fixed_shipping_value,
  express_shipping_multiplier, maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
  google_analytics_id, facebook_pixel_id, google_tag_manager_id,
  whatsapp_message_template, enable_reviews_auto_approve, reviews_min_rating_to_show,
  payment_gateway_primary, mercadopago_enabled, efi_enabled, pagseguro_enabled, stripe_enabled, asaas_enabled,
  payment_methods_enabled, pix_discount_percent, boleto_extra_days, max_installments, min_installment_value,
  why_choose_us_config, logo_sidebar_size, logo_header_size, logo_mobile_size,
  header_logo_height, header_logo_mobile_height, footer_logo_height,
  -- Expose whether external AI is enabled but NOT the key/url
  ai_external_enabled, ai_external_provider, ai_external_model,
  abandoned_cart_reminder_hours
FROM public.company_info;

-- 2. Drop the overly permissive public SELECT policy  
DROP POLICY IF EXISTS "Anyone can view company info" ON public.company_info;

-- 3. Create a restricted policy: only admins can read company_info directly (for the API key)
CREATE POLICY "Only admins can read company_info directly"
ON public.company_info
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- 4. Grant SELECT on the public view to anon and authenticated
GRANT SELECT ON public.company_info_public TO anon, authenticated;

-- 5. Fix order-files bucket to be private
UPDATE storage.buckets SET public = false WHERE id = 'order-files';
