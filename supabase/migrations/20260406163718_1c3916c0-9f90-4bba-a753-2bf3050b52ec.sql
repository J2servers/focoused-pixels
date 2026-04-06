
-- =============================================
-- PHASE 1: Fix privilege escalation on user_roles
-- =============================================

-- Drop the existing ALL policy that lacks proper WITH CHECK
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create separate policies with explicit checks
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- PHASE 2: Fix abandoned_cart_sessions UPDATE true
-- =============================================

DROP POLICY IF EXISTS "Anyone can update own session" ON public.abandoned_cart_sessions;

-- Only allow updating sessions that match by session_id (passed as a filter)
-- and only non-sensitive fields
CREATE POLICY "Users can update own cart session"
ON public.abandoned_cart_sessions FOR UPDATE
USING (true)
WITH CHECK (
  -- Prevent changing session_id (identity field)
  session_id = session_id
);

-- Actually, the safest approach: require the session_id match
-- Let's use a more restrictive approach
DROP POLICY IF EXISTS "Users can update own cart session" ON public.abandoned_cart_sessions;

-- =============================================
-- PHASE 3: Fix workflow_executions UPDATE true  
-- =============================================

DROP POLICY IF EXISTS "System can update executions" ON public.workflow_executions;

CREATE POLICY "Admins can update workflow executions"
ON public.workflow_executions FOR UPDATE
TO authenticated
USING (has_admin_access(auth.uid()));

-- =============================================
-- PHASE 4: Fix abandoned_cart_reminders INSERT true
-- =============================================

DROP POLICY IF EXISTS "System can insert reminders" ON public.abandoned_cart_reminders;

CREATE POLICY "Admins can insert reminders"
ON public.abandoned_cart_reminders FOR INSERT
TO authenticated
WITH CHECK (has_admin_access(auth.uid()));

-- =============================================
-- PHASE 5: Create secure public views
-- =============================================

-- Products public view (hide cost columns)
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = true)
AS
SELECT 
  id, name, slug, short_description, full_description,
  price, promotional_price, cover_image, gallery_images,
  category_id, sku, stock, status, is_featured, tags, attributes,
  weight_kg, length_cm, width_cm, height_cm,
  created_at, updated_at
FROM public.products
WHERE status = 'active' AND deleted_at IS NULL;

-- Reviews public view (hide customer_email)
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = true)
AS
SELECT 
  id, product_slug, customer_name, rating, title, comment,
  images, is_verified_purchase, created_at, updated_at
FROM public.reviews
WHERE is_approved = true;

-- Coupons public view (only checkout-needed fields)
CREATE OR REPLACE VIEW public.coupons_public
WITH (security_invoker = true)
AS
SELECT 
  id, code, type, value, min_order_value, max_discount, 
  start_date, end_date
FROM public.coupons
WHERE is_active = true;

-- =============================================
-- PHASE 6: Fix company_info_public view  
-- =============================================

-- Recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.company_info_public;

CREATE OR REPLACE VIEW public.company_info_public
WITH (security_invoker = true)
AS
SELECT 
  id, company_name, cnpj, address, phone, whatsapp, email,
  business_hours, social_instagram, social_facebook, social_tiktok,
  social_youtube, social_linkedin, social_pinterest,
  copyright_text, privacy_policy, terms_of_service, returns_policy,
  footer_logo, header_logo, free_shipping_minimum, free_shipping_message,
  installments, production_time, warranty,
  seo_title, seo_description, seo_keywords, og_image, favicon_url,
  primary_color, secondary_color, accent_color, dark_mode_enabled, custom_css,
  products_per_page, show_product_ratings, show_product_stock,
  enable_wishlist, enable_compare_products, show_recently_viewed,
  min_order_value, max_order_value, abandoned_cart_reminder_hours,
  enable_guest_checkout, require_phone_on_checkout, checkout_success_message,
  low_stock_threshold, enable_stock_alerts, enable_order_notifications,
  notification_email,
  ai_assistant_enabled, ai_assistant_name, ai_assistant_greeting, ai_assistant_avatar,
  ai_external_enabled, ai_external_provider, ai_external_model,
  quantity_discount_10, quantity_discount_20, quantity_discount_50, quantity_discount_100,
  enable_coupon_codes, shipping_origin_cep, shipping_calculation_method,
  fixed_shipping_value, express_shipping_multiplier,
  maintenance_mode, maintenance_message, store_status, store_closed_message,
  cookie_consent_enabled, cookie_consent_message, lgpd_contact_email,
  google_analytics_id, facebook_pixel_id, google_tag_manager_id,
  whatsapp_message_template, enable_reviews_auto_approve, reviews_min_rating_to_show,
  payment_gateway_primary, mercadopago_enabled, efi_enabled, pagseguro_enabled,
  stripe_enabled, asaas_enabled, payment_methods_enabled,
  pix_discount_percent, boleto_extra_days, max_installments, min_installment_value,
  why_choose_us_config,
  logo_sidebar_size, logo_header_size, logo_mobile_size,
  header_logo_height, header_logo_mobile_height, footer_logo_height
FROM public.company_info;

-- Grant SELECT on public views to anon and authenticated
GRANT SELECT ON public.company_info_public TO anon, authenticated;
GRANT SELECT ON public.products_public TO anon, authenticated;
GRANT SELECT ON public.reviews_public TO anon, authenticated;
GRANT SELECT ON public.coupons_public TO anon, authenticated;

-- =============================================
-- PHASE 7: Fix order-files storage policies
-- =============================================

-- Remove public read access from order-files
DROP POLICY IF EXISTS "Anyone can view order files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload order files" ON storage.objects;

-- Only admins can view order files
CREATE POLICY "Admins can view order files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'order-files' AND has_admin_access(auth.uid()));

-- Only authenticated users can upload order files
CREATE POLICY "Authenticated users can upload order files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');
