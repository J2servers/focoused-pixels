/**
 * Hook centralizado para acessar configurações do site
 * 
 * DOCUMENTAÇÃO DE ONDE CADA CONFIGURAÇÃO É USADA:
 * 
 * SEO & Metadata:
 * - seo_title: Título da aba do navegador (index.html via SiteSettingsProvider)
 * - seo_description: Meta description para buscadores
 * - seo_keywords: Meta keywords para SEO
 * - og_image: Imagem de compartilhamento em redes sociais
 * - favicon_url: Ícone do site na aba do navegador
 * 
 * Aparência:
 * - primary_color: Cor principal do tema (botões, links, destaques)
 * - secondary_color: Cor secundária do tema
 * - accent_color: Cor de destaque (badges, alertas)
 * - dark_mode_enabled: Se permite alternar modo escuro
 * - custom_css: CSS adicional injetado no site
 * 
 * Layout & UX:
 * - products_per_page: Quantidade de produtos por página em listagens
 * - show_product_ratings: Exibir/ocultar estrelas de avaliação nos cards
 * - show_product_stock: Exibir quantidade em estoque nos cards
 * - enable_wishlist: Habilitar botão de favoritos
 * - enable_compare_products: Habilitar comparação de produtos
 * - show_recently_viewed: Exibir seção "Vistos recentemente"
 * 
 * Checkout & Cart:
 * - min_order_value: Valor mínimo para finalizar pedido
 * - max_order_value: Valor máximo permitido por pedido
 * - abandoned_cart_reminder_hours: Horas até lembrete de carrinho abandonado
 * - enable_guest_checkout: Permitir compra sem login
 * - require_phone_on_checkout: Exigir telefone no checkout
 * - checkout_success_message: Mensagem exibida após envio do orçamento
 * 
 * Notificações:
 * - low_stock_threshold: Limite para alertar estoque baixo no admin
 * - enable_stock_alerts: Ativar alertas de estoque no admin
 * - enable_order_notifications: Ativar notificações de novos pedidos
 * - notification_email: Email que recebe as notificações
 * 
 * Assistente IA:
 * - ai_assistant_enabled: Mostrar/ocultar chatbot no site
 * - ai_assistant_name: Nome exibido no chatbot
 * - ai_assistant_greeting: Mensagem inicial do chatbot
 * - ai_assistant_avatar: Avatar do chatbot
 * 
 * Descontos:
 * - quantity_discount_10/20/50/100: % desconto por quantidade
 * - enable_coupon_codes: Habilitar campo de cupom no checkout
 * - enable_reviews_auto_approve: Aprovar avaliações automaticamente
 * - reviews_min_rating_to_show: Nota mínima para exibir avaliação
 * 
 * Frete:
 * - shipping_origin_cep: CEP de origem para cálculo
 * - shipping_calculation_method: Método de cálculo (fixo, peso, distância)
 * - fixed_shipping_value: Valor fixo do frete
 * - express_shipping_multiplier: Multiplicador para frete expresso
 * 
 * Manutenção:
 * - maintenance_mode: Ativar modo manutenção (bloqueia site)
 * - maintenance_message: Mensagem exibida na página de manutenção
 * - store_status: Status da loja (open, closed, vacation)
 * - store_closed_message: Mensagem quando loja fechada
 * 
 * LGPD:
 * - cookie_consent_enabled: Exibir banner de cookies
 * - cookie_consent_message: Mensagem do banner
 * - lgpd_contact_email: Email do DPO
 * 
 * Analytics:
 * - google_analytics_id: ID do Google Analytics
 * - facebook_pixel_id: ID do Facebook Pixel
 * - google_tag_manager_id: ID do Google Tag Manager
 * 
 * Integrações:
 * - whatsapp_message_template: Mensagem pré-preenchida do WhatsApp
 */

import { useCompanyInfo } from './useCompanyInfo';

export function useSiteSettings() {
  const { data: settings, isLoading } = useCompanyInfo();

  // Derived values with defaults
  const siteSettings = {
    // SEO
    seoTitle: settings?.seo_title || 'Pincel de Luz Personalizados',
    seoDescription: settings?.seo_description || 'Produtos personalizados em acrílico, MDF e LED.',
    seoKeywords: settings?.seo_keywords || '',
    ogImage: settings?.og_image || null,
    faviconUrl: settings?.favicon_url || null,

    // Appearance
    primaryColor: settings?.primary_color || '#7c3aed',
    secondaryColor: settings?.secondary_color || '#10b981',
    accentColor: settings?.accent_color || '#f59e0b',
    darkModeEnabled: settings?.dark_mode_enabled ?? true,
    customCss: settings?.custom_css || '',

    // Layout
    productsPerPage: settings?.products_per_page || 12,
    showProductRatings: settings?.show_product_ratings ?? true,
    showProductStock: settings?.show_product_stock ?? false,
    enableWishlist: settings?.enable_wishlist ?? true,
    enableCompareProducts: settings?.enable_compare_products ?? false,
    showRecentlyViewed: settings?.show_recently_viewed ?? true,

    // Checkout
    minOrderValue: settings?.min_order_value || 0,
    maxOrderValue: settings?.max_order_value || null,
    abandonedCartReminderHours: settings?.abandoned_cart_reminder_hours || 24,
    enableGuestCheckout: settings?.enable_guest_checkout ?? true,
    requirePhoneOnCheckout: settings?.require_phone_on_checkout ?? true,
    checkoutSuccessMessage: settings?.checkout_success_message || 'Seu orçamento foi enviado com sucesso!',

    // Notifications
    lowStockThreshold: settings?.low_stock_threshold || 5,
    enableStockAlerts: settings?.enable_stock_alerts ?? true,
    enableOrderNotifications: settings?.enable_order_notifications ?? true,
    notificationEmail: settings?.notification_email || null,

    // AI Assistant
    aiAssistantEnabled: settings?.ai_assistant_enabled ?? true,
    aiAssistantName: settings?.ai_assistant_name || 'Luna',
    aiAssistantGreeting: settings?.ai_assistant_greeting || 'Olá! Como posso ajudar?',
    aiAssistantAvatar: settings?.ai_assistant_avatar || null,

    // Discounts
    quantityDiscount10: settings?.quantity_discount_10 || 5,
    quantityDiscount20: settings?.quantity_discount_20 || 10,
    quantityDiscount50: settings?.quantity_discount_50 || 15,
    quantityDiscount100: settings?.quantity_discount_100 || 20,
    enableCouponCodes: settings?.enable_coupon_codes ?? true,
    enableReviewsAutoApprove: settings?.enable_reviews_auto_approve ?? false,
    reviewsMinRatingToShow: settings?.reviews_min_rating_to_show || 1,

    // Shipping
    shippingOriginCep: settings?.shipping_origin_cep || null,
    shippingCalculationMethod: settings?.shipping_calculation_method || 'fixed',
    fixedShippingValue: settings?.fixed_shipping_value || 15,
    expressShippingMultiplier: settings?.express_shipping_multiplier || 2,

    // Maintenance
    maintenanceMode: settings?.maintenance_mode ?? false,
    maintenanceMessage: settings?.maintenance_message || 'Estamos em manutenção. Voltamos em breve!',
    storeStatus: settings?.store_status || 'open',
    storeClosedMessage: settings?.store_closed_message || 'Nossa loja está temporariamente fechada.',

    // Legal
    cookieConsentEnabled: settings?.cookie_consent_enabled ?? true,
    cookieConsentMessage: settings?.cookie_consent_message || 'Utilizamos cookies para melhorar sua experiência.',
    lgpdContactEmail: settings?.lgpd_contact_email || null,

    // Analytics
    googleAnalyticsId: settings?.google_analytics_id || null,
    facebookPixelId: settings?.facebook_pixel_id || null,
    googleTagManagerId: settings?.google_tag_manager_id || null,

    // Integrations
    whatsappMessageTemplate: settings?.whatsapp_message_template || 'Olá! Gostaria de saber mais sobre os produtos.',
    whatsapp: settings?.whatsapp || '',
    freeShippingMinimum: settings?.free_shipping_minimum || 159,
    
    // Store info
    companyName: settings?.company_name || 'Pincel de Luz Personalizados',
    warranty: settings?.warranty || '3 meses',
    productionTime: settings?.production_time || '4 a 10 dias úteis',
    installments: settings?.installments || 12,
  };

  // Helper to calculate quantity discount
  const getQuantityDiscount = (quantity: number): number => {
    if (quantity >= 100) return siteSettings.quantityDiscount100;
    if (quantity >= 50) return siteSettings.quantityDiscount50;
    if (quantity >= 20) return siteSettings.quantityDiscount20;
    if (quantity >= 10) return siteSettings.quantityDiscount10;
    return 0;
  };

  // Helper to check if store is operational
  const isStoreOpen = (): boolean => {
    if (siteSettings.maintenanceMode) return false;
    return siteSettings.storeStatus === 'open';
  };

  return {
    ...siteSettings,
    isLoading,
    getQuantityDiscount,
    isStoreOpen,
    raw: settings,
  };
}

// Export type for use in components
export type SiteSettings = ReturnType<typeof useSiteSettings>;
