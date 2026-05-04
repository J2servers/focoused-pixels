import type { CompanyInfo } from '../useCompanyInfo';
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from '@/lib/whatsapp';

const DEFAULT_WHATSAPP_MSG = 'Olá! Gostaria de saber mais sobre os produtos.';

export function buildSiteSettings(settings: Partial<CompanyInfo> | undefined) {
  const s = settings ?? {};
  return {
    // SEO
    seoTitle: s.seo_title || 'Pincel de Luz Personalizados',
    seoDescription: s.seo_description || 'Produtos personalizados em acrílico, MDF e LED.',
    seoKeywords: s.seo_keywords || '',
    ogImage: s.og_image || null,
    faviconUrl: s.favicon_url || s.header_logo || s.footer_logo || null,

    // Appearance
    primaryColor: s.primary_color || '#7c3aed',
    secondaryColor: s.secondary_color || '#10b981',
    accentColor: s.accent_color || '#f59e0b',
    darkModeEnabled: s.dark_mode_enabled ?? true,
    customCss: s.custom_css || '',

    // Layout
    productsPerPage: s.products_per_page || 12,
    showProductRatings: s.show_product_ratings ?? true,
    showProductStock: s.show_product_stock ?? false,
    enableWishlist: s.enable_wishlist ?? true,
    enableCompareProducts: s.enable_compare_products ?? false,
    showRecentlyViewed: s.show_recently_viewed ?? true,

    // Checkout
    minOrderValue: s.min_order_value || 0,
    maxOrderValue: s.max_order_value || null,
    abandonedCartReminderHours: s.abandoned_cart_reminder_hours || 24,
    enableGuestCheckout: s.enable_guest_checkout ?? true,
    requirePhoneOnCheckout: s.require_phone_on_checkout ?? true,
    checkoutSuccessMessage: s.checkout_success_message || 'Seu orçamento foi enviado com sucesso!',

    // Notifications
    lowStockThreshold: s.low_stock_threshold || 5,
    enableStockAlerts: s.enable_stock_alerts ?? true,
    enableOrderNotifications: s.enable_order_notifications ?? true,
    notificationEmail: s.notification_email || null,

    // AI Assistant
    aiAssistantEnabled: s.ai_assistant_enabled ?? true,
    aiAssistantName: s.ai_assistant_name || 'Luna',
    aiAssistantGreeting: s.ai_assistant_greeting || 'Olá! Como posso ajudar?',
    aiAssistantAvatar: s.ai_assistant_avatar || null,

    // Discounts
    quantityDiscount10: s.quantity_discount_10 || 5,
    quantityDiscount20: s.quantity_discount_20 || 10,
    quantityDiscount50: s.quantity_discount_50 || 15,
    quantityDiscount100: s.quantity_discount_100 || 20,
    enableCouponCodes: s.enable_coupon_codes ?? true,
    enableReviewsAutoApprove: s.enable_reviews_auto_approve ?? false,
    reviewsMinRatingToShow: s.reviews_min_rating_to_show || 1,

    // Shipping
    shippingOriginCep: s.shipping_origin_cep || null,
    shippingCalculationMethod: s.shipping_calculation_method || 'fixed',
    fixedShippingValue: s.fixed_shipping_value || 15,
    expressShippingMultiplier: s.express_shipping_multiplier || 2,

    // Maintenance
    maintenanceMode: s.maintenance_mode ?? false,
    maintenanceMessage: s.maintenance_message || 'Estamos em manutenção. Voltamos em breve!',
    storeStatus: s.store_status || 'open',
    storeClosedMessage: s.store_closed_message || 'Nossa loja está temporariamente fechada.',

    // Legal
    cookieConsentEnabled: s.cookie_consent_enabled ?? true,
    cookieConsentMessage: s.cookie_consent_message || 'Utilizamos cookies para melhorar sua experiência.',
    lgpdContactEmail: s.lgpd_contact_email || null,

    // Analytics
    googleAnalyticsId: s.google_analytics_id || null,
    facebookPixelId: s.facebook_pixel_id || null,
    googleTagManagerId: s.google_tag_manager_id || null,

    // Integrations / WhatsApp
    whatsappMessageTemplate: s.whatsapp_message_template || DEFAULT_WHATSAPP_MSG,
    whatsapp: s.whatsapp || '',
    whatsappNumber: normalizeWhatsAppNumber(s.whatsapp),
    whatsappLink: buildWhatsAppUrl(s.whatsapp, s.whatsapp_message_template || DEFAULT_WHATSAPP_MSG),
    email: s.email || '',
    phone: s.phone || '',
    freeShippingMinimum: s.free_shipping_minimum || 159,
    freeShippingMessage: s.free_shipping_message || '',

    // Store info
    companyName: s.company_name || 'Pincel de Luz Personalizados',
    warranty: s.warranty || '3 meses',
    productionTime: s.production_time || '4 a 10 dias úteis',
    installments: s.installments || 12,
    cnpj: s.cnpj || '',
    address: s.address || '',
    businessHours: s.business_hours || '',
    copyrightText: s.copyright_text || '',

    // Social
    socialInstagram: s.social_instagram || '',
    socialFacebook: s.social_facebook || '',
    socialTiktok: s.social_tiktok || '',
    socialYoutube: s.social_youtube || '',
    socialLinkedin: s.social_linkedin || '',
    socialPinterest: s.social_pinterest || '',

    // Logos
    headerLogo: s.header_logo || '',
    footerLogo: s.footer_logo || '',
    headerLogoHeight: s.header_logo_height || 64,
    footerLogoHeight: s.footer_logo_height || 48,
    headerLogoMobileHeight: s.header_logo_mobile_height || 36,

    // Policies
    privacyPolicy: s.privacy_policy || '',
    termsOfService: s.terms_of_service || '',
    returnsPolicy: s.returns_policy || '',
  };
}

export type SiteSettingsValues = ReturnType<typeof buildSiteSettings>;
