-- Recriar view do zero (DROP+CREATE em vez de OR REPLACE para permitir mudança de colunas)
DROP VIEW IF EXISTS public.company_info_public;

CREATE VIEW public.company_info_public
WITH (security_invoker = true)
AS
SELECT
  id, company_name, cnpj, address, phone, whatsapp, email, business_hours,
  social_instagram, social_facebook, social_tiktok, social_youtube, social_linkedin, social_pinterest,
  copyright_text, privacy_policy, terms_of_service, returns_policy,
  footer_logo, header_logo,
  free_shipping_minimum, free_shipping_message, installments, production_time, warranty,
  seo_title, seo_description, seo_keywords, og_image, favicon_url,
  primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
  products_per_page, show_product_ratings, show_product_stock,
  enable_wishlist, enable_compare_products, show_recently_viewed,
  min_order_value, max_order_value,
  abandoned_cart_reminder_hours, enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
  low_stock_threshold, enable_stock_alerts, enable_order_notifications, notification_email,
  ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes, shipping_origin_cep, shipping_calculation_method,
  fixed_shipping_value, express_shipping_multiplier,
  maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
  google_analytics_id, facebook_pixel_id, google_tag_manager_id,
  whatsapp_message_template, enable_reviews_auto_approve, reviews_min_rating_to_show,
  why_choose_us_config,
  logo_sidebar_size, logo_header_size, logo_mobile_size,
  header_logo_height, header_logo_mobile_height, footer_logo_height,
  updated_at
FROM company_info
ORDER BY updated_at DESC, id DESC
LIMIT 1;

GRANT SELECT ON public.company_info_public TO anon, authenticated;

-- Drop colunas duplicadas de pagamento (já em payment_credentials)
ALTER TABLE public.company_info
  DROP COLUMN IF EXISTS mercadopago_enabled,
  DROP COLUMN IF EXISTS mercadopago_sandbox,
  DROP COLUMN IF EXISTS efi_enabled,
  DROP COLUMN IF EXISTS efi_sandbox,
  DROP COLUMN IF EXISTS pagseguro_enabled,
  DROP COLUMN IF EXISTS pagseguro_sandbox,
  DROP COLUMN IF EXISTS stripe_enabled,
  DROP COLUMN IF EXISTS stripe_sandbox,
  DROP COLUMN IF EXISTS asaas_enabled,
  DROP COLUMN IF EXISTS asaas_sandbox,
  DROP COLUMN IF EXISTS payment_gateway_primary,
  DROP COLUMN IF EXISTS payment_methods_enabled,
  DROP COLUMN IF EXISTS pix_discount_percent,
  DROP COLUMN IF EXISTS boleto_extra_days,
  DROP COLUMN IF EXISTS max_installments,
  DROP COLUMN IF EXISTS min_installment_value;

-- Drop colunas duplicadas de IA externa (já em ai_credentials)
ALTER TABLE public.company_info
  DROP COLUMN IF EXISTS ai_external_enabled,
  DROP COLUMN IF EXISTS ai_external_provider,
  DROP COLUMN IF EXISTS ai_external_api_url,
  DROP COLUMN IF EXISTS ai_external_api_key,
  DROP COLUMN IF EXISTS ai_external_model;

-- Drop tabela duplicada de e-mail (substituída por email_credentials)
DROP TABLE IF EXISTS public.hostinger_email_credentials CASCADE;