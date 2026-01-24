-- ========================================
-- SITE SETTINGS EXPANSION - 30+ NEW CONTROLS
-- ========================================

-- Add new columns to company_info for advanced site control
ALTER TABLE public.company_info

-- =============== SEO & METADATA ===============
ADD COLUMN IF NOT EXISTS seo_title text DEFAULT 'Pincel de Luz Personalizados',
ADD COLUMN IF NOT EXISTS seo_description text DEFAULT 'Produtos personalizados em acrílico, MDF e LED. Letreiros, displays, crachás e muito mais.',
ADD COLUMN IF NOT EXISTS seo_keywords text DEFAULT 'acrílico personalizado, letreiro neon, display qr code, crachás personalizados',
ADD COLUMN IF NOT EXISTS og_image text,
ADD COLUMN IF NOT EXISTS favicon_url text,

-- =============== APPEARANCE ===============
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#7c3aed',
ADD COLUMN IF NOT EXISTS secondary_color text DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#f59e0b',
ADD COLUMN IF NOT EXISTS dark_mode_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_css text,

-- =============== LAYOUT & UX ===============
ADD COLUMN IF NOT EXISTS products_per_page integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS show_product_ratings boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_product_stock boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_wishlist boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_compare_products boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_recently_viewed boolean DEFAULT true,

-- =============== CHECKOUT & CART ===============
ADD COLUMN IF NOT EXISTS min_order_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_order_value numeric,
ADD COLUMN IF NOT EXISTS abandoned_cart_reminder_hours integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS enable_guest_checkout boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS require_phone_on_checkout boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_success_message text DEFAULT 'Seu orçamento foi enviado com sucesso! Entraremos em contato em breve.',

-- =============== NOTIFICATIONS & ALERTS ===============
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS enable_stock_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_order_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_email text,

-- =============== AI ASSISTANT ===============
ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS ai_assistant_name text DEFAULT 'Luna',
ADD COLUMN IF NOT EXISTS ai_assistant_greeting text DEFAULT 'Olá! Sou a Luna, assistente virtual da Pincel de Luz. Como posso ajudar?',
ADD COLUMN IF NOT EXISTS ai_assistant_avatar text,

-- =============== DISCOUNTS & PROMOTIONS ===============
ADD COLUMN IF NOT EXISTS quantity_discount_10 numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS quantity_discount_20 numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS quantity_discount_50 numeric DEFAULT 15,
ADD COLUMN IF NOT EXISTS quantity_discount_100 numeric DEFAULT 20,
ADD COLUMN IF NOT EXISTS enable_coupon_codes boolean DEFAULT true,

-- =============== SHIPPING ===============
ADD COLUMN IF NOT EXISTS shipping_origin_cep text,
ADD COLUMN IF NOT EXISTS shipping_calculation_method text DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS fixed_shipping_value numeric DEFAULT 15,
ADD COLUMN IF NOT EXISTS express_shipping_multiplier numeric DEFAULT 2,

-- =============== MAINTENANCE & STATUS ===============
ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_message text DEFAULT 'Estamos em manutenção. Voltamos em breve!',
ADD COLUMN IF NOT EXISTS store_status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS store_closed_message text DEFAULT 'Nossa loja está temporariamente fechada.',

-- =============== LEGAL & COMPLIANCE ===============
ADD COLUMN IF NOT EXISTS cookie_consent_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cookie_consent_message text DEFAULT 'Utilizamos cookies para melhorar sua experiência.',
ADD COLUMN IF NOT EXISTS lgpd_contact_email text,

-- =============== ANALYTICS & TRACKING ===============
ADD COLUMN IF NOT EXISTS google_analytics_id text,
ADD COLUMN IF NOT EXISTS facebook_pixel_id text,
ADD COLUMN IF NOT EXISTS google_tag_manager_id text,

-- =============== INTEGRATIONS ===============
ADD COLUMN IF NOT EXISTS whatsapp_message_template text DEFAULT 'Olá! Gostaria de saber mais sobre os produtos da Pincel de Luz.',
ADD COLUMN IF NOT EXISTS enable_reviews_auto_approve boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reviews_min_rating_to_show integer DEFAULT 1;

-- Add comment for documentation
COMMENT ON TABLE public.company_info IS 'Complete site configuration including SEO, appearance, checkout, notifications, AI assistant, shipping, maintenance mode, legal compliance, and analytics integrations.';