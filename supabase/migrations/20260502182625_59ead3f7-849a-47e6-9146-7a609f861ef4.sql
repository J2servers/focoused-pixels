DROP VIEW IF EXISTS public.company_info_public;

CREATE TABLE IF NOT EXISTS public.company_info_public (
  id uuid PRIMARY KEY,
  company_name text,
  cnpj text,
  address text,
  phone text,
  whatsapp text,
  email text,
  business_hours text,
  social_instagram text,
  social_facebook text,
  social_tiktok text,
  social_youtube text,
  social_linkedin text,
  social_pinterest text,
  copyright_text text,
  privacy_policy text,
  terms_of_service text,
  returns_policy text,
  footer_logo text,
  header_logo text,
  free_shipping_minimum numeric,
  free_shipping_message text,
  installments integer,
  production_time text,
  warranty text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  og_image text,
  favicon_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  dark_mode_enabled boolean,
  custom_css text,
  products_per_page integer,
  show_product_ratings boolean,
  show_product_stock boolean,
  enable_wishlist boolean,
  enable_compare_products boolean,
  show_recently_viewed boolean,
  min_order_value numeric,
  max_order_value numeric,
  abandoned_cart_reminder_hours integer,
  enable_guest_checkout boolean,
  require_phone_on_checkout boolean,
  checkout_success_message text,
  low_stock_threshold integer,
  enable_stock_alerts boolean,
  enable_order_notifications boolean,
  notification_email text,
  ai_assistant_enabled boolean,
  ai_assistant_name text,
  ai_assistant_greeting text,
  ai_assistant_avatar text,
  quantity_discount_10 numeric,
  quantity_discount_20 numeric,
  quantity_discount_50 numeric,
  quantity_discount_100 numeric,
  enable_coupon_codes boolean,
  shipping_origin_cep text,
  shipping_calculation_method text,
  fixed_shipping_value numeric,
  express_shipping_multiplier numeric,
  maintenance_mode boolean,
  maintenance_message text,
  store_status text,
  store_closed_message text,
  cookie_consent_enabled boolean,
  cookie_consent_message text,
  lgpd_contact_email text,
  google_analytics_id text,
  facebook_pixel_id text,
  google_tag_manager_id text,
  whatsapp_message_template text,
  enable_reviews_auto_approve boolean,
  reviews_min_rating_to_show integer,
  why_choose_us_config jsonb,
  logo_sidebar_size integer,
  logo_header_size integer,
  logo_mobile_size integer,
  header_logo_height integer,
  header_logo_mobile_height integer,
  footer_logo_height integer,
  updated_at timestamp with time zone
);

ALTER TABLE public.company_info_public ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view public company info" ON public.company_info_public;
CREATE POLICY "Anyone can view public company info"
ON public.company_info_public
FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.refresh_company_info_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.company_info_public;

  INSERT INTO public.company_info_public (
    id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
    social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
    copyright_text, privacy_policy, terms_of_service, returns_policy, footer_logo, header_logo,
    free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
    seo_title, seo_description, seo_keywords, og_image, favicon_url,
    primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
    products_per_page, show_product_ratings, show_product_stock, enable_wishlist, enable_compare_products,
    show_recently_viewed, min_order_value, max_order_value, abandoned_cart_reminder_hours,
    enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
    low_stock_threshold, enable_stock_alerts, enable_order_notifications, notification_email,
    ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
    quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
    enable_coupon_codes, shipping_origin_cep, shipping_calculation_method, fixed_shipping_value,
    express_shipping_multiplier, maintenance_mode, maintenance_message, store_status, store_closed_message,
    cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
    google_analytics_id, facebook_pixel_id, google_tag_manager_id, whatsapp_message_template,
    enable_reviews_auto_approve, reviews_min_rating_to_show, why_choose_us_config,
    logo_sidebar_size, logo_header_size, logo_mobile_size, header_logo_height, header_logo_mobile_height,
    footer_logo_height, updated_at
  )
  SELECT
    id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
    social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
    copyright_text, privacy_policy, terms_of_service, returns_policy, footer_logo, header_logo,
    free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
    seo_title, seo_description, seo_keywords, og_image, favicon_url,
    primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
    products_per_page, show_product_ratings, show_product_stock, enable_wishlist, enable_compare_products,
    show_recently_viewed, min_order_value, max_order_value, abandoned_cart_reminder_hours,
    enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
    low_stock_threshold, enable_stock_alerts, enable_order_notifications, notification_email,
    ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
    quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
    enable_coupon_codes, shipping_origin_cep, shipping_calculation_method, fixed_shipping_value,
    express_shipping_multiplier, maintenance_mode, maintenance_message, store_status, store_closed_message,
    cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
    google_analytics_id, facebook_pixel_id, google_tag_manager_id, whatsapp_message_template,
    enable_reviews_auto_approve, reviews_min_rating_to_show, why_choose_us_config,
    logo_sidebar_size, logo_header_size, logo_mobile_size, header_logo_height, header_logo_mobile_height,
    footer_logo_height, updated_at
  FROM public.company_info
  ORDER BY updated_at DESC, id DESC
  LIMIT 1;

  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_company_info_public() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS refresh_company_info_public_after_change ON public.company_info;
CREATE TRIGGER refresh_company_info_public_after_change
AFTER INSERT OR UPDATE OR DELETE ON public.company_info
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_company_info_public();

DELETE FROM public.company_info_public;
INSERT INTO public.company_info_public
SELECT
  id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
  social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
  copyright_text, privacy_policy, terms_of_service, returns_policy, footer_logo, header_logo,
  free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
  seo_title, seo_description, seo_keywords, og_image, favicon_url,
  primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
  products_per_page, show_product_ratings, show_product_stock, enable_wishlist, enable_compare_products,
  show_recently_viewed, min_order_value, max_order_value, abandoned_cart_reminder_hours,
  enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
  low_stock_threshold, enable_stock_alerts, enable_order_notifications, notification_email,
  ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes, shipping_origin_cep, shipping_calculation_method, fixed_shipping_value,
  express_shipping_multiplier, maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
  google_analytics_id, facebook_pixel_id, google_tag_manager_id, whatsapp_message_template,
  enable_reviews_auto_approve, reviews_min_rating_to_show, why_choose_us_config,
  logo_sidebar_size, logo_header_size, logo_mobile_size, header_logo_height, header_logo_mobile_height,
  footer_logo_height, updated_at
FROM public.company_info
ORDER BY updated_at DESC, id DESC
LIMIT 1;