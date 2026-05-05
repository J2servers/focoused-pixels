
-- 1) REVIEWS: remove public read of base table (reviews_public view is used for storefront)
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;

-- 2) COMPANY_INFO_PUBLIC: drop sensitive operational columns
ALTER TABLE public.company_info_public
  DROP COLUMN IF EXISTS notification_email,
  DROP COLUMN IF EXISTS enable_stock_alerts,
  DROP COLUMN IF EXISTS low_stock_threshold,
  DROP COLUMN IF EXISTS enable_order_notifications,
  DROP COLUMN IF EXISTS abandoned_cart_reminder_hours,
  DROP COLUMN IF EXISTS shipping_origin_cep,
  DROP COLUMN IF EXISTS min_order_value,
  DROP COLUMN IF EXISTS max_order_value,
  DROP COLUMN IF EXISTS fixed_shipping_value,
  DROP COLUMN IF EXISTS express_shipping_multiplier,
  DROP COLUMN IF EXISTS shipping_calculation_method,
  DROP COLUMN IF EXISTS lgpd_contact_email;

-- Update refresher to match new column set
CREATE OR REPLACE FUNCTION public.refresh_company_info_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    show_recently_viewed,
    enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
    ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
    quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
    enable_coupon_codes,
    maintenance_mode, maintenance_message, store_status, store_closed_message,
    cookie_consent_enabled, cookie_consent_message,
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
    show_recently_viewed,
    enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
    ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
    quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
    enable_coupon_codes,
    maintenance_mode, maintenance_message, store_status, store_closed_message,
    cookie_consent_enabled, cookie_consent_message,
    google_analytics_id, facebook_pixel_id, google_tag_manager_id, whatsapp_message_template,
    enable_reviews_auto_approve, reviews_min_rating_to_show, why_choose_us_config,
    logo_sidebar_size, logo_header_size, logo_mobile_size, header_logo_height, header_logo_mobile_height,
    footer_logo_height, updated_at
  FROM public.company_info
  ORDER BY updated_at DESC, id DESC
  LIMIT 1;

  RETURN NULL;
END;
$function$;

-- Force refresh now
DELETE FROM public.company_info_public;
INSERT INTO public.company_info_public (
  id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
  social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
  copyright_text, privacy_policy, terms_of_service, returns_policy, footer_logo, header_logo,
  free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
  seo_title, seo_description, seo_keywords, og_image, favicon_url,
  primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
  products_per_page, show_product_ratings, show_product_stock, enable_wishlist, enable_compare_products,
  show_recently_viewed,
  enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
  ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes,
  maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message,
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
  show_recently_viewed,
  enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
  ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes,
  maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message,
  google_analytics_id, facebook_pixel_id, google_tag_manager_id, whatsapp_message_template,
  enable_reviews_auto_approve, reviews_min_rating_to_show, why_choose_us_config,
  logo_sidebar_size, logo_header_size, logo_mobile_size, header_logo_height, header_logo_mobile_height,
  footer_logo_height, updated_at
FROM public.company_info
ORDER BY updated_at DESC, id DESC
LIMIT 1;

-- 3) QUOTES: tighten guest insert — anon must NOT specify someone else's email
DROP POLICY IF EXISTS "Guests and owners can create quotes" ON public.quotes;
CREATE POLICY "Guests and owners can create quotes"
ON public.quotes
FOR INSERT
WITH CHECK (
  -- Authenticated users: must match own jwt email, OR be admin
  (auth.uid() IS NOT NULL AND (
    customer_email = (auth.jwt() ->> 'email')
    OR has_admin_access(auth.uid())
  ))
  -- Anonymous guests: allowed but restricted; basic email format & length only
  OR (
    auth.uid() IS NULL
    AND customer_email IS NOT NULL
    AND length(customer_email) BETWEEN 3 AND 320
    AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(coalesce(customer_name, '')) BETWEEN 1 AND 200
  )
);

-- 4) ABANDONED_CART_SESSIONS: restrict PII insertion
DROP POLICY IF EXISTS "Anyone can insert abandoned cart sessions" ON public.abandoned_cart_sessions;
CREATE POLICY "Anyone can insert abandoned cart sessions"
ON public.abandoned_cart_sessions
FOR INSERT
WITH CHECK (
  length(session_id) BETWEEN 8 AND 128
  AND cart_total >= 0
  AND cart_total < 1000000
  AND (
    -- Anonymous: no PII allowed
    (auth.uid() IS NULL AND user_email IS NULL AND user_phone IS NULL)
    -- Authenticated: email must match own jwt
    OR (auth.uid() IS NOT NULL AND (
      user_email IS NULL OR user_email = (auth.jwt() ->> 'email')
    ))
  )
);
