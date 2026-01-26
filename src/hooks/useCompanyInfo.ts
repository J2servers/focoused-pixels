import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyInfo {
  id: string;
  company_name: string;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  business_hours: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_pinterest: string | null;
  copyright_text: string | null;
  privacy_policy: string | null;
  terms_of_service: string | null;
  returns_policy: string | null;
  footer_logo: string | null;
  header_logo: string | null;
  free_shipping_minimum: number | null;
  free_shipping_message: string | null;
  installments: number | null;
  production_time: string | null;
  warranty: string | null;
  // SEO & Metadata
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
  favicon_url: string | null;
  // Appearance
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  dark_mode_enabled: boolean | null;
  custom_css: string | null;
  // Layout & UX
  products_per_page: number | null;
  show_product_ratings: boolean | null;
  show_product_stock: boolean | null;
  enable_wishlist: boolean | null;
  enable_compare_products: boolean | null;
  show_recently_viewed: boolean | null;
  // Checkout & Cart
  min_order_value: number | null;
  max_order_value: number | null;
  abandoned_cart_reminder_hours: number | null;
  enable_guest_checkout: boolean | null;
  require_phone_on_checkout: boolean | null;
  checkout_success_message: string | null;
  // Notifications & Alerts
  low_stock_threshold: number | null;
  enable_stock_alerts: boolean | null;
  enable_order_notifications: boolean | null;
  notification_email: string | null;
  // AI Assistant
  ai_assistant_enabled: boolean | null;
  ai_assistant_name: string | null;
  ai_assistant_greeting: string | null;
  ai_assistant_avatar: string | null;
  // Discounts & Promotions
  quantity_discount_10: number | null;
  quantity_discount_20: number | null;
  quantity_discount_50: number | null;
  quantity_discount_100: number | null;
  enable_coupon_codes: boolean | null;
  // Shipping
  shipping_origin_cep: string | null;
  shipping_calculation_method: string | null;
  fixed_shipping_value: number | null;
  express_shipping_multiplier: number | null;
  // Maintenance & Status
  maintenance_mode: boolean | null;
  maintenance_message: string | null;
  store_status: string | null;
  store_closed_message: string | null;
  // Legal & Compliance
  cookie_consent_enabled: boolean | null;
  cookie_consent_message: string | null;
  lgpd_contact_email: string | null;
  // Analytics & Tracking
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
  google_tag_manager_id: string | null;
  // Integrations
  whatsapp_message_template: string | null;
  enable_reviews_auto_approve: boolean | null;
  reviews_min_rating_to_show: number | null;
  // Payment Gateways
  payment_gateway_primary: string | null;
  mercadopago_enabled: boolean | null;
  mercadopago_public_key: string | null;
  mercadopago_access_token: string | null;
  mercadopago_sandbox: boolean | null;
  efi_enabled: boolean | null;
  efi_client_id: string | null;
  efi_client_secret: string | null;
  efi_sandbox: boolean | null;
  efi_pix_key: string | null;
  pagseguro_enabled: boolean | null;
  pagseguro_email: string | null;
  pagseguro_token: string | null;
  pagseguro_sandbox: boolean | null;
  stripe_enabled: boolean | null;
  stripe_public_key: string | null;
  stripe_secret_key: string | null;
  stripe_sandbox: boolean | null;
  asaas_enabled: boolean | null;
  asaas_api_key: string | null;
  asaas_sandbox: boolean | null;
  payment_methods_enabled: string[] | null;
  pix_discount_percent: number | null;
  boleto_extra_days: number | null;
  max_installments: number | null;
  min_installment_value: number | null;
}

// Default fallback values when no data is in the database
const defaultCompanyInfo: Omit<CompanyInfo, 'id'> = {
  company_name: 'Pincel de Luz Personalizados',
  cnpj: '00.000.000/0001-00',
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  email: 'contato@pinceldluz.com.br',
  business_hours: 'Seg-Sex 9h às 18h',
  social_instagram: 'https://instagram.com/pinceldluz',
  social_facebook: 'https://facebook.com/pinceldluz',
  social_tiktok: 'https://tiktok.com/@pinceldluz',
  social_youtube: 'https://youtube.com/@pinceldluz',
  social_linkedin: null,
  social_pinterest: 'https://pinterest.com/pinceldluz',
  copyright_text: '© 2025 Pincel de Luz Personalizados. Todos os direitos reservados.',
  privacy_policy: null,
  terms_of_service: null,
  returns_policy: null,
  footer_logo: null,
  header_logo: null,
  free_shipping_minimum: 159,
  free_shipping_message: 'Frete grátis em compras acima de R$ 159',
  installments: 12,
  production_time: '4 a 10 dias úteis',
  warranty: '3 meses',
  // SEO & Metadata
  seo_title: 'Pincel de Luz Personalizados',
  seo_description: 'Produtos personalizados em acrílico, MDF e LED. Letreiros, displays, crachás e muito mais.',
  seo_keywords: 'acrílico personalizado, letreiro neon, display qr code, crachás personalizados',
  og_image: null,
  favicon_url: null,
  // Appearance
  primary_color: '#7c3aed',
  secondary_color: '#10b981',
  accent_color: '#f59e0b',
  dark_mode_enabled: true,
  custom_css: null,
  // Layout & UX
  products_per_page: 12,
  show_product_ratings: true,
  show_product_stock: false,
  enable_wishlist: true,
  enable_compare_products: false,
  show_recently_viewed: true,
  // Checkout & Cart
  min_order_value: 0,
  max_order_value: null,
  abandoned_cart_reminder_hours: 24,
  enable_guest_checkout: true,
  require_phone_on_checkout: true,
  checkout_success_message: 'Seu orçamento foi enviado com sucesso! Entraremos em contato em breve.',
  // Notifications & Alerts
  low_stock_threshold: 5,
  enable_stock_alerts: true,
  enable_order_notifications: true,
  notification_email: null,
  // AI Assistant
  ai_assistant_enabled: true,
  ai_assistant_name: 'Luna',
  ai_assistant_greeting: 'Olá! Sou a Luna, assistente virtual da Pincel de Luz. Como posso ajudar?',
  ai_assistant_avatar: null,
  // Discounts & Promotions
  quantity_discount_10: 5,
  quantity_discount_20: 10,
  quantity_discount_50: 15,
  quantity_discount_100: 20,
  enable_coupon_codes: true,
  // Shipping
  shipping_origin_cep: null,
  shipping_calculation_method: 'fixed',
  fixed_shipping_value: 15,
  express_shipping_multiplier: 2,
  // Maintenance & Status
  maintenance_mode: false,
  maintenance_message: 'Estamos em manutenção. Voltamos em breve!',
  store_status: 'open',
  store_closed_message: 'Nossa loja está temporariamente fechada.',
  // Legal & Compliance
  cookie_consent_enabled: true,
  cookie_consent_message: 'Utilizamos cookies para melhorar sua experiência.',
  lgpd_contact_email: null,
  // Analytics & Tracking
  google_analytics_id: null,
  facebook_pixel_id: null,
  google_tag_manager_id: null,
  // Integrations
  whatsapp_message_template: 'Olá! Gostaria de saber mais sobre os produtos da Pincel de Luz.',
  enable_reviews_auto_approve: false,
  reviews_min_rating_to_show: 1,
  // Payment Gateways
  payment_gateway_primary: 'mercadopago',
  mercadopago_enabled: false,
  mercadopago_public_key: null,
  mercadopago_access_token: null,
  mercadopago_sandbox: true,
  efi_enabled: false,
  efi_client_id: null,
  efi_client_secret: null,
  efi_sandbox: true,
  efi_pix_key: null,
  pagseguro_enabled: false,
  pagseguro_email: null,
  pagseguro_token: null,
  pagseguro_sandbox: true,
  stripe_enabled: false,
  stripe_public_key: null,
  stripe_secret_key: null,
  stripe_sandbox: true,
  asaas_enabled: false,
  asaas_api_key: null,
  asaas_sandbox: true,
  payment_methods_enabled: ['pix', 'credit_card', 'boleto'],
  pix_discount_percent: 5,
  boleto_extra_days: 3,
  max_installments: 12,
  min_installment_value: 50,
};

export function useCompanyInfo() {
  return useQuery({
    queryKey: ['company-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching company info:', error);
      }

      // Merge database data with defaults
      if (data) {
        return {
          ...defaultCompanyInfo,
          ...data,
        } as CompanyInfo;
      }

      return { id: '', ...defaultCompanyInfo } as CompanyInfo;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useUpdateCompanyInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: Partial<CompanyInfo> }) => {
      // Ensure company_name is present for insert operations
      const insertData = { company_name: data.company_name || 'Pincel de Luz Personalizados', ...data };
      
      if (id) {
        const { error } = await supabase
          .from('company_info')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_info')
          .insert([insertData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-info'] });
    },
  });
}
