export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_cart_reminders: {
        Row: {
          channel: string
          converted_at: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          id: string
          message_text: string | null
          opened_at: string | null
          sent_at: string | null
          session_id: string
          status: string
        }
        Insert: {
          channel?: string
          converted_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          id?: string
          message_text?: string | null
          opened_at?: string | null
          sent_at?: string | null
          session_id: string
          status?: string
        }
        Update: {
          channel?: string
          converted_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          id?: string
          message_text?: string | null
          opened_at?: string | null
          sent_at?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_cart_reminders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "abandoned_cart_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      abandoned_cart_sessions: {
        Row: {
          cart_items: Json
          cart_total: number
          coupon_code: string | null
          created_at: string
          id: string
          last_activity_at: string
          recovered: boolean
          recovered_at: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
          session_id: string
          user_email: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          cart_items?: Json
          cart_total?: number
          coupon_code?: string | null
          created_at?: string
          id?: string
          last_activity_at?: string
          recovered?: boolean
          recovered_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          session_id: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          cart_items?: Json
          cart_total?: number
          coupon_code?: string | null
          created_at?: string
          id?: string
          last_activity_at?: string
          recovered?: boolean
          recovered_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          session_id?: string
          user_email?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: string[]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          run_count: number
          steps: Json
          trigger_delay_minutes: number
          trigger_event: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          run_count?: number
          steps?: Json
          trigger_delay_minutes?: number
          trigger_event?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          run_count?: number
          steps?: Json
          trigger_delay_minutes?: number
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_info: {
        Row: {
          abandoned_cart_reminder_hours: number | null
          accent_color: string | null
          address: string | null
          ai_assistant_avatar: string | null
          ai_assistant_enabled: boolean | null
          ai_assistant_greeting: string | null
          ai_assistant_name: string | null
          ai_external_api_key: string | null
          ai_external_api_url: string | null
          ai_external_enabled: boolean | null
          ai_external_model: string | null
          ai_external_provider: string | null
          asaas_enabled: boolean | null
          asaas_sandbox: boolean | null
          boleto_extra_days: number | null
          business_hours: string | null
          checkout_success_message: string | null
          cnpj: string | null
          company_name: string
          cookie_consent_enabled: boolean | null
          cookie_consent_message: string | null
          copyright_text: string | null
          custom_css: string | null
          dark_mode_enabled: boolean | null
          efi_enabled: boolean | null
          efi_sandbox: boolean | null
          email: string | null
          enable_compare_products: boolean | null
          enable_coupon_codes: boolean | null
          enable_guest_checkout: boolean | null
          enable_order_notifications: boolean | null
          enable_reviews_auto_approve: boolean | null
          enable_stock_alerts: boolean | null
          enable_wishlist: boolean | null
          express_shipping_multiplier: number | null
          facebook_pixel_id: string | null
          favicon_url: string | null
          fixed_shipping_value: number | null
          footer_logo: string | null
          footer_logo_height: number | null
          free_shipping_message: string | null
          free_shipping_minimum: number | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          header_logo: string | null
          header_logo_height: number | null
          header_logo_mobile_height: number | null
          id: string
          installments: number | null
          lgpd_contact_email: string | null
          login_bg_image: string | null
          login_brand_text: string | null
          login_logo: string | null
          login_logo_height: number | null
          login_subtitle: string | null
          login_subtitle_size: number | null
          login_title: string | null
          login_title_size: number | null
          logo_header_size: number | null
          logo_mobile_size: number | null
          logo_sidebar_size: number | null
          low_stock_threshold: number | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          max_installments: number | null
          max_order_value: number | null
          mercadopago_enabled: boolean | null
          mercadopago_sandbox: boolean | null
          min_installment_value: number | null
          min_order_value: number | null
          notification_email: string | null
          og_image: string | null
          pagseguro_enabled: boolean | null
          pagseguro_sandbox: boolean | null
          payment_gateway_primary: string | null
          payment_methods_enabled: string[] | null
          phone: string | null
          pix_discount_percent: number | null
          primary_color: string | null
          privacy_policy: string | null
          production_time: string | null
          products_per_page: number | null
          quantity_discount_10: number | null
          quantity_discount_100: number | null
          quantity_discount_20: number | null
          quantity_discount_50: number | null
          require_phone_on_checkout: boolean | null
          returns_policy: string | null
          reviews_min_rating_to_show: number | null
          secondary_color: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          shipping_calculation_method: string | null
          shipping_origin_cep: string | null
          show_product_ratings: boolean | null
          show_product_stock: boolean | null
          show_recently_viewed: boolean | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_tiktok: string | null
          social_youtube: string | null
          store_closed_message: string | null
          store_status: string | null
          stripe_enabled: boolean | null
          stripe_sandbox: boolean | null
          terms_of_service: string | null
          updated_at: string
          warranty: string | null
          whatsapp: string | null
          whatsapp_message_template: string | null
          why_choose_us_config: Json | null
        }
        Insert: {
          abandoned_cart_reminder_hours?: number | null
          accent_color?: string | null
          address?: string | null
          ai_assistant_avatar?: string | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_greeting?: string | null
          ai_assistant_name?: string | null
          ai_external_api_key?: string | null
          ai_external_api_url?: string | null
          ai_external_enabled?: boolean | null
          ai_external_model?: string | null
          ai_external_provider?: string | null
          asaas_enabled?: boolean | null
          asaas_sandbox?: boolean | null
          boleto_extra_days?: number | null
          business_hours?: string | null
          checkout_success_message?: string | null
          cnpj?: string | null
          company_name: string
          cookie_consent_enabled?: boolean | null
          cookie_consent_message?: string | null
          copyright_text?: string | null
          custom_css?: string | null
          dark_mode_enabled?: boolean | null
          efi_enabled?: boolean | null
          efi_sandbox?: boolean | null
          email?: string | null
          enable_compare_products?: boolean | null
          enable_coupon_codes?: boolean | null
          enable_guest_checkout?: boolean | null
          enable_order_notifications?: boolean | null
          enable_reviews_auto_approve?: boolean | null
          enable_stock_alerts?: boolean | null
          enable_wishlist?: boolean | null
          express_shipping_multiplier?: number | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          fixed_shipping_value?: number | null
          footer_logo?: string | null
          footer_logo_height?: number | null
          free_shipping_message?: string | null
          free_shipping_minimum?: number | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          header_logo?: string | null
          header_logo_height?: number | null
          header_logo_mobile_height?: number | null
          id?: string
          installments?: number | null
          lgpd_contact_email?: string | null
          login_bg_image?: string | null
          login_brand_text?: string | null
          login_logo?: string | null
          login_logo_height?: number | null
          login_subtitle?: string | null
          login_subtitle_size?: number | null
          login_title?: string | null
          login_title_size?: number | null
          logo_header_size?: number | null
          logo_mobile_size?: number | null
          logo_sidebar_size?: number | null
          low_stock_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_installments?: number | null
          max_order_value?: number | null
          mercadopago_enabled?: boolean | null
          mercadopago_sandbox?: boolean | null
          min_installment_value?: number | null
          min_order_value?: number | null
          notification_email?: string | null
          og_image?: string | null
          pagseguro_enabled?: boolean | null
          pagseguro_sandbox?: boolean | null
          payment_gateway_primary?: string | null
          payment_methods_enabled?: string[] | null
          phone?: string | null
          pix_discount_percent?: number | null
          primary_color?: string | null
          privacy_policy?: string | null
          production_time?: string | null
          products_per_page?: number | null
          quantity_discount_10?: number | null
          quantity_discount_100?: number | null
          quantity_discount_20?: number | null
          quantity_discount_50?: number | null
          require_phone_on_checkout?: boolean | null
          returns_policy?: string | null
          reviews_min_rating_to_show?: number | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          shipping_calculation_method?: string | null
          shipping_origin_cep?: string | null
          show_product_ratings?: boolean | null
          show_product_stock?: boolean | null
          show_recently_viewed?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          store_closed_message?: string | null
          store_status?: string | null
          stripe_enabled?: boolean | null
          stripe_sandbox?: boolean | null
          terms_of_service?: string | null
          updated_at?: string
          warranty?: string | null
          whatsapp?: string | null
          whatsapp_message_template?: string | null
          why_choose_us_config?: Json | null
        }
        Update: {
          abandoned_cart_reminder_hours?: number | null
          accent_color?: string | null
          address?: string | null
          ai_assistant_avatar?: string | null
          ai_assistant_enabled?: boolean | null
          ai_assistant_greeting?: string | null
          ai_assistant_name?: string | null
          ai_external_api_key?: string | null
          ai_external_api_url?: string | null
          ai_external_enabled?: boolean | null
          ai_external_model?: string | null
          ai_external_provider?: string | null
          asaas_enabled?: boolean | null
          asaas_sandbox?: boolean | null
          boleto_extra_days?: number | null
          business_hours?: string | null
          checkout_success_message?: string | null
          cnpj?: string | null
          company_name?: string
          cookie_consent_enabled?: boolean | null
          cookie_consent_message?: string | null
          copyright_text?: string | null
          custom_css?: string | null
          dark_mode_enabled?: boolean | null
          efi_enabled?: boolean | null
          efi_sandbox?: boolean | null
          email?: string | null
          enable_compare_products?: boolean | null
          enable_coupon_codes?: boolean | null
          enable_guest_checkout?: boolean | null
          enable_order_notifications?: boolean | null
          enable_reviews_auto_approve?: boolean | null
          enable_stock_alerts?: boolean | null
          enable_wishlist?: boolean | null
          express_shipping_multiplier?: number | null
          facebook_pixel_id?: string | null
          favicon_url?: string | null
          fixed_shipping_value?: number | null
          footer_logo?: string | null
          footer_logo_height?: number | null
          free_shipping_message?: string | null
          free_shipping_minimum?: number | null
          google_analytics_id?: string | null
          google_tag_manager_id?: string | null
          header_logo?: string | null
          header_logo_height?: number | null
          header_logo_mobile_height?: number | null
          id?: string
          installments?: number | null
          lgpd_contact_email?: string | null
          login_bg_image?: string | null
          login_brand_text?: string | null
          login_logo?: string | null
          login_logo_height?: number | null
          login_subtitle?: string | null
          login_subtitle_size?: number | null
          login_title?: string | null
          login_title_size?: number | null
          logo_header_size?: number | null
          logo_mobile_size?: number | null
          logo_sidebar_size?: number | null
          low_stock_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          max_installments?: number | null
          max_order_value?: number | null
          mercadopago_enabled?: boolean | null
          mercadopago_sandbox?: boolean | null
          min_installment_value?: number | null
          min_order_value?: number | null
          notification_email?: string | null
          og_image?: string | null
          pagseguro_enabled?: boolean | null
          pagseguro_sandbox?: boolean | null
          payment_gateway_primary?: string | null
          payment_methods_enabled?: string[] | null
          phone?: string | null
          pix_discount_percent?: number | null
          primary_color?: string | null
          privacy_policy?: string | null
          production_time?: string | null
          products_per_page?: number | null
          quantity_discount_10?: number | null
          quantity_discount_100?: number | null
          quantity_discount_20?: number | null
          quantity_discount_50?: number | null
          require_phone_on_checkout?: boolean | null
          returns_policy?: string | null
          reviews_min_rating_to_show?: number | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          shipping_calculation_method?: string | null
          shipping_origin_cep?: string | null
          show_product_ratings?: boolean | null
          show_product_stock?: boolean | null
          show_recently_viewed?: boolean | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          store_closed_message?: string | null
          store_status?: string | null
          stripe_enabled?: boolean | null
          stripe_sandbox?: boolean | null
          terms_of_service?: string | null
          updated_at?: string
          warranty?: string | null
          whatsapp?: string | null
          whatsapp_message_template?: string | null
          why_choose_us_config?: Json | null
        }
        Relationships: []
      }
      company_tax_settings: {
        Row: {
          cnae_primary: string | null
          cnae_secondary: string[] | null
          cnpj: string | null
          id: string
          simples_anexo: string | null
          simples_faixa: number | null
          tax_regime: string | null
          updated_at: string
        }
        Insert: {
          cnae_primary?: string | null
          cnae_secondary?: string[] | null
          cnpj?: string | null
          id?: string
          simples_anexo?: string | null
          simples_faixa?: number | null
          tax_regime?: string | null
          updated_at?: string
        }
        Update: {
          cnae_primary?: string | null
          cnae_secondary?: string[] | null
          cnpj?: string | null
          id?: string
          simples_anexo?: string | null
          simples_faixa?: number | null
          tax_regime?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          category_ids: string[] | null
          code: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          product_ids: string[] | null
          start_date: string | null
          type: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          value: number
        }
        Insert: {
          category_ids?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          product_ids?: string[] | null
          start_date?: string | null
          type: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          value: number
        }
        Update: {
          category_ids?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          product_ids?: string[] | null
          start_date?: string | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      customer_checkout_profiles: {
        Row: {
          address: string | null
          cep: string | null
          cnpj: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          shipping_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          shipping_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          cnpj?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          shipping_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_credentials: {
        Row: {
          business_email: string | null
          email_enabled: boolean | null
          id: string
          reply_to_email: string | null
          sender_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          test_mode: boolean | null
          test_recipient: string | null
          updated_at: string
        }
        Insert: {
          business_email?: string | null
          email_enabled?: boolean | null
          id?: string
          reply_to_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          test_mode?: boolean | null
          test_recipient?: string | null
          updated_at?: string
        }
        Update: {
          business_email?: string | null
          email_enabled?: boolean | null
          id?: string
          reply_to_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          test_mode?: boolean | null
          test_recipient?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          desktop_image: string
          display_order: number | null
          end_date: string | null
          id: string
          mobile_image: string | null
          start_date: string | null
          status: string | null
          subtitle: string | null
          theme: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          desktop_image: string
          display_order?: number | null
          end_date?: string | null
          id?: string
          mobile_image?: string | null
          start_date?: string | null
          status?: string | null
          subtitle?: string | null
          theme?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          desktop_image?: string
          display_order?: number | null
          end_date?: string | null
          id?: string
          mobile_image?: string | null
          start_date?: string | null
          status?: string | null
          subtitle?: string | null
          theme?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hostinger_email_credentials: {
        Row: {
          id: string
          is_active: boolean
          reply_to: string | null
          smtp_host: string
          smtp_password: string | null
          smtp_port: number
          smtp_user: string | null
          test_email: string | null
          test_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          reply_to?: string | null
          smtp_host?: string
          smtp_password?: string | null
          smtp_port?: number
          smtp_user?: string | null
          test_email?: string | null
          test_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          is_active?: boolean
          reply_to?: string | null
          smtp_host?: string
          smtp_password?: string | null
          smtp_port?: number
          smtp_user?: string | null
          test_email?: string | null
          test_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ip_blocklist: {
        Row: {
          blocked_until: string | null
          created_at: string
          created_by: string | null
          id: string
          ip_hash: string
          permanent: boolean | null
          reason: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_hash: string
          permanent?: boolean | null
          reason?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          ip_hash?: string
          permanent?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          is_subscribed: boolean | null
          name: string
          phone: string | null
          source: string
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_subscribed?: boolean | null
          name: string
          phone?: string | null
          source?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_subscribed?: boolean | null
          name?: string
          phone?: string | null
          source?: string
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email_hash: string
          id: string
          ip_hash: string
          success: boolean
          user_agent_hash: string | null
        }
        Insert: {
          created_at?: string
          email_hash: string
          id?: string
          ip_hash: string
          success?: boolean
          user_agent_hash?: string | null
        }
        Update: {
          created_at?: string
          email_hash?: string
          id?: string
          ip_hash?: string
          success?: boolean
          user_agent_hash?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cost_labor: number | null
          cost_material: number | null
          cost_shipping: number | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          cost_labor?: number | null
          cost_material?: number | null
          cost_shipping?: number | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          cost_labor?: number | null
          cost_material?: number | null
          cost_shipping?: number | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          custom_text: string | null
          customer_email: string
          customer_files: string[] | null
          customer_name: string
          customer_phone: string
          discount: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          production_completed_at: string | null
          production_notes: string | null
          production_started_at: string | null
          production_status: string | null
          quote_id: string | null
          shipping_address: string | null
          shipping_cep: string | null
          shipping_city: string | null
          shipping_company: string | null
          shipping_cost: number | null
          shipping_method: string | null
          shipping_state: string | null
          subtotal: number
          total: number
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_text?: string | null
          customer_email: string
          customer_files?: string[] | null
          customer_name: string
          customer_phone: string
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          production_completed_at?: string | null
          production_notes?: string | null
          production_started_at?: string | null
          production_status?: string | null
          quote_id?: string | null
          shipping_address?: string | null
          shipping_cep?: string | null
          shipping_city?: string | null
          shipping_company?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shipping_state?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_text?: string | null
          customer_email?: string
          customer_files?: string[] | null
          customer_name?: string
          customer_phone?: string
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          production_completed_at?: string | null
          production_notes?: string | null
          production_started_at?: string | null
          production_status?: string | null
          quote_id?: string | null
          shipping_address?: string | null
          shipping_cep?: string | null
          shipping_city?: string | null
          shipping_company?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shipping_state?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_credentials: {
        Row: {
          asaas_api_key: string | null
          asaas_enabled: boolean | null
          asaas_sandbox: boolean | null
          boleto_extra_days: number | null
          efi_client_id: string | null
          efi_client_secret: string | null
          efi_enabled: boolean | null
          efi_pix_key: string | null
          efi_sandbox: boolean | null
          id: string
          max_installments: number | null
          mercadopago_access_token: string | null
          mercadopago_enabled: boolean | null
          mercadopago_public_key: string | null
          mercadopago_sandbox: boolean | null
          min_installment_value: number | null
          pagseguro_email: string | null
          pagseguro_enabled: boolean | null
          pagseguro_sandbox: boolean | null
          pagseguro_token: string | null
          payment_gateway_primary: string | null
          payment_methods_enabled: string[] | null
          pix_discount_percent: number | null
          stripe_enabled: boolean | null
          stripe_public_key: string | null
          stripe_sandbox: boolean | null
          stripe_secret_key: string | null
          updated_at: string
        }
        Insert: {
          asaas_api_key?: string | null
          asaas_enabled?: boolean | null
          asaas_sandbox?: boolean | null
          boleto_extra_days?: number | null
          efi_client_id?: string | null
          efi_client_secret?: string | null
          efi_enabled?: boolean | null
          efi_pix_key?: string | null
          efi_sandbox?: boolean | null
          id?: string
          max_installments?: number | null
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          mercadopago_sandbox?: boolean | null
          min_installment_value?: number | null
          pagseguro_email?: string | null
          pagseguro_enabled?: boolean | null
          pagseguro_sandbox?: boolean | null
          pagseguro_token?: string | null
          payment_gateway_primary?: string | null
          payment_methods_enabled?: string[] | null
          pix_discount_percent?: number | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_sandbox?: boolean | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Update: {
          asaas_api_key?: string | null
          asaas_enabled?: boolean | null
          asaas_sandbox?: boolean | null
          boleto_extra_days?: number | null
          efi_client_id?: string | null
          efi_client_secret?: string | null
          efi_enabled?: boolean | null
          efi_pix_key?: string | null
          efi_sandbox?: boolean | null
          id?: string
          max_installments?: number | null
          mercadopago_access_token?: string | null
          mercadopago_enabled?: boolean | null
          mercadopago_public_key?: string | null
          mercadopago_sandbox?: boolean | null
          min_installment_value?: number | null
          pagseguro_email?: string | null
          pagseguro_enabled?: boolean | null
          pagseguro_sandbox?: boolean | null
          pagseguro_token?: string | null
          payment_gateway_primary?: string | null
          payment_methods_enabled?: string[] | null
          pix_discount_percent?: number | null
          stripe_enabled?: boolean | null
          stripe_public_key?: string | null
          stripe_sandbox?: boolean | null
          stripe_secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          attributes: Json | null
          category_id: string | null
          cost_labor: number | null
          cost_material: number | null
          cost_shipping: number | null
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          full_description: string | null
          gallery_images: string[] | null
          height_cm: number | null
          id: string
          is_featured: boolean | null
          length_cm: number | null
          min_stock: number | null
          name: string
          price: number
          promotional_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          status: string | null
          stock: number | null
          tags: string[] | null
          updated_at: string
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          attributes?: Json | null
          category_id?: string | null
          cost_labor?: number | null
          cost_material?: number | null
          cost_shipping?: number | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          height_cm?: number | null
          id?: string
          is_featured?: boolean | null
          length_cm?: number | null
          min_stock?: number | null
          name: string
          price: number
          promotional_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          attributes?: Json | null
          category_id?: string | null
          cost_labor?: number | null
          cost_material?: number | null
          cost_shipping?: number | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          height_cm?: number | null
          id?: string
          is_featured?: boolean | null
          length_cm?: number | null
          min_stock?: number | null
          name?: string
          price?: number
          promotional_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_popups: {
        Row: {
          content: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          show_once: boolean | null
          start_date: string | null
          title: string
          trigger_type: string | null
          trigger_value: number | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          show_once?: boolean | null
          start_date?: string | null
          title: string
          trigger_type?: string | null
          trigger_value?: number | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          show_once?: boolean | null
          start_date?: string | null
          title?: string
          trigger_type?: string | null
          trigger_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          banner_url: string | null
          category_ids: string[] | null
          created_at: string
          end_date: string
          id: string
          name: string
          priority: number | null
          product_ids: string[] | null
          rule: string
          start_date: string
          status: string | null
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          banner_url?: string | null
          category_ids?: string[] | null
          created_at?: string
          end_date: string
          id?: string
          name: string
          priority?: number | null
          product_ids?: string[] | null
          rule: string
          start_date: string
          status?: string | null
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          banner_url?: string | null
          category_ids?: string[] | null
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          priority?: number | null
          product_ids?: string[] | null
          rule?: string
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accept_warranty: boolean | null
          additional_notes: string | null
          border_finish: string | null
          broche_style: string | null
          cart_items: Json | null
          cart_total: number | null
          created_at: string
          custom_text: string | null
          customer_cnpj: string | null
          customer_company: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_cep: string | null
          delivery_deadline: string | null
          dimensions: string | null
          id: string
          led_option: string | null
          logo_url: string | null
          material: string | null
          max_budget: number | null
          other_product_description: string | null
          payment_method: string | null
          preferred_colors: string | null
          product_types: string[]
          purpose: string | null
          qr_code_count: number | null
          qr_code_links: string[] | null
          qr_code_type: string | null
          quantity: number
          reference_links: string | null
          request_prototype: boolean | null
          request_volume_discount: boolean | null
          shipping_method: string | null
          status: string | null
          style_preference: string | null
          thickness: string | null
          updated_at: string
          visual_notes: string | null
          want_whatsapp_confirmation: boolean | null
        }
        Insert: {
          accept_warranty?: boolean | null
          additional_notes?: string | null
          border_finish?: string | null
          broche_style?: string | null
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string
          custom_text?: string | null
          customer_cnpj?: string | null
          customer_company?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          delivery_cep?: string | null
          delivery_deadline?: string | null
          dimensions?: string | null
          id?: string
          led_option?: string | null
          logo_url?: string | null
          material?: string | null
          max_budget?: number | null
          other_product_description?: string | null
          payment_method?: string | null
          preferred_colors?: string | null
          product_types: string[]
          purpose?: string | null
          qr_code_count?: number | null
          qr_code_links?: string[] | null
          qr_code_type?: string | null
          quantity?: number
          reference_links?: string | null
          request_prototype?: boolean | null
          request_volume_discount?: boolean | null
          shipping_method?: string | null
          status?: string | null
          style_preference?: string | null
          thickness?: string | null
          updated_at?: string
          visual_notes?: string | null
          want_whatsapp_confirmation?: boolean | null
        }
        Update: {
          accept_warranty?: boolean | null
          additional_notes?: string | null
          border_finish?: string | null
          broche_style?: string | null
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string
          custom_text?: string | null
          customer_cnpj?: string | null
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          delivery_cep?: string | null
          delivery_deadline?: string | null
          dimensions?: string | null
          id?: string
          led_option?: string | null
          logo_url?: string | null
          material?: string | null
          max_budget?: number | null
          other_product_description?: string | null
          payment_method?: string | null
          preferred_colors?: string | null
          product_types?: string[]
          purpose?: string | null
          qr_code_count?: number | null
          qr_code_links?: string[] | null
          qr_code_type?: string | null
          quantity?: number
          reference_links?: string | null
          request_prototype?: boolean | null
          request_volume_discount?: boolean | null
          shipping_method?: string | null
          status?: string | null
          style_preference?: string | null
          thickness?: string | null
          updated_at?: string
          visual_notes?: string | null
          want_whatsapp_confirmation?: boolean | null
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string
          id: string
          min_quantity: number | null
          name: string
          notes: string | null
          quantity: number
          sku: string | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          min_quantity?: number | null
          name: string
          notes?: string | null
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          min_quantity?: number | null
          name?: string
          notes?: string | null
          quantity?: number
          sku?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_slug: string
          rating: number
          title: string | null
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_slug: string
          rating: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_slug?: string
          rating?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          material_id: string | null
          order_id: string | null
          quantity: number
          reason: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          material_id?: string | null
          order_id?: string | null
          quantity: number
          reason?: string | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          material_id?: string | null
          order_id?: string | null
          quantity?: number
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          order_id: string | null
          raw_data: Json | null
          status: string
          tracking_code: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          order_id?: string | null
          raw_data?: Json | null
          status: string
          tracking_code: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          order_id?: string | null
          raw_data?: Json | null
          status?: string
          tracking_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_stories: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          display_order: number | null
          duration_seconds: number | null
          id: string
          likes_count: number | null
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          id?: string
          likes_count?: number | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          id?: string
          likes_count?: number | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          direction: string
          endpoint: string
          error_message: string | null
          event_type: string | null
          id: string
          method: string
          processed: boolean
          request_body: Json | null
          response_body: Json | null
          source: string | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          direction?: string
          endpoint: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          method?: string
          processed?: boolean
          request_body?: Json | null
          response_body?: Json | null
          source?: string | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          direction?: string
          endpoint?: string
          error_message?: string | null
          event_type?: string | null
          id?: string
          method?: string
          processed?: boolean
          request_body?: Json | null
          response_body?: Json | null
          source?: string | null
          status_code?: number | null
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          created_at: string
          display_name: string
          id: string
          instance_name: string
          is_active: boolean
          last_connected_at: string | null
          phone_number: string | null
          priority: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          instance_name: string
          is_active?: boolean
          last_connected_at?: string | null
          phone_number?: string | null
          priority?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          instance_name?: string
          is_active?: boolean
          last_connected_at?: string | null
          phone_number?: string | null
          priority?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          instance_name: string
          message_text: string
          order_number: string | null
          recipient_name: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name: string
          message_text: string
          order_number?: string | null
          recipient_name?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          instance_name?: string
          message_text?: string
          order_number?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          category: string
          channel: string
          created_at: string
          id: string
          is_active: boolean
          message_text: string
          name: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          category?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message_text: string
          name: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          category?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message_text?: string
          name?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step_index: number
          error_message: string | null
          id: string
          next_run_at: string
          started_at: string
          status: string
          step_results: Json
          trigger_data: Json
          updated_at: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step_index?: number
          error_message?: string | null
          id?: string
          next_run_at?: string
          started_at?: string
          status?: string
          step_results?: Json
          trigger_data?: Json
          updated_at?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step_index?: number
          error_message?: string | null
          id?: string
          next_run_at?: string
          started_at?: string
          status?: string
          step_results?: Json
          trigger_data?: Json
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      company_info_public: {
        Row: {
          abandoned_cart_reminder_hours: number | null
          accent_color: string | null
          address: string | null
          ai_assistant_avatar: string | null
          ai_assistant_enabled: boolean | null
          ai_assistant_greeting: string | null
          ai_assistant_name: string | null
          ai_external_enabled: boolean | null
          ai_external_model: string | null
          ai_external_provider: string | null
          asaas_enabled: boolean | null
          boleto_extra_days: number | null
          business_hours: string | null
          checkout_success_message: string | null
          cnpj: string | null
          company_name: string | null
          cookie_consent_enabled: boolean | null
          cookie_consent_message: string | null
          copyright_text: string | null
          custom_css: string | null
          dark_mode_enabled: boolean | null
          efi_enabled: boolean | null
          email: string | null
          enable_compare_products: boolean | null
          enable_coupon_codes: boolean | null
          enable_guest_checkout: boolean | null
          enable_order_notifications: boolean | null
          enable_reviews_auto_approve: boolean | null
          enable_stock_alerts: boolean | null
          enable_wishlist: boolean | null
          express_shipping_multiplier: number | null
          facebook_pixel_id: string | null
          favicon_url: string | null
          fixed_shipping_value: number | null
          footer_logo: string | null
          footer_logo_height: number | null
          free_shipping_message: string | null
          free_shipping_minimum: number | null
          google_analytics_id: string | null
          google_tag_manager_id: string | null
          header_logo: string | null
          header_logo_height: number | null
          header_logo_mobile_height: number | null
          id: string | null
          installments: number | null
          lgpd_contact_email: string | null
          logo_header_size: number | null
          logo_mobile_size: number | null
          logo_sidebar_size: number | null
          low_stock_threshold: number | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          max_installments: number | null
          max_order_value: number | null
          mercadopago_enabled: boolean | null
          min_installment_value: number | null
          min_order_value: number | null
          notification_email: string | null
          og_image: string | null
          pagseguro_enabled: boolean | null
          payment_gateway_primary: string | null
          payment_methods_enabled: string[] | null
          phone: string | null
          pix_discount_percent: number | null
          primary_color: string | null
          privacy_policy: string | null
          production_time: string | null
          products_per_page: number | null
          quantity_discount_10: number | null
          quantity_discount_100: number | null
          quantity_discount_20: number | null
          quantity_discount_50: number | null
          require_phone_on_checkout: boolean | null
          returns_policy: string | null
          reviews_min_rating_to_show: number | null
          secondary_color: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          shipping_calculation_method: string | null
          shipping_origin_cep: string | null
          show_product_ratings: boolean | null
          show_product_stock: boolean | null
          show_recently_viewed: boolean | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_tiktok: string | null
          social_youtube: string | null
          store_closed_message: string | null
          store_status: string | null
          stripe_enabled: boolean | null
          terms_of_service: string | null
          updated_at: string | null
          warranty: string | null
          whatsapp: string | null
          whatsapp_message_template: string | null
          why_choose_us_config: Json | null
        }
        Relationships: []
      }
      coupons_public: {
        Row: {
          code: string | null
          end_date: string | null
          id: string | null
          max_discount: number | null
          min_order_value: number | null
          start_date: string | null
          type: string | null
          value: number | null
        }
        Insert: {
          code?: string | null
          end_date?: string | null
          id?: string | null
          max_discount?: number | null
          min_order_value?: number | null
          start_date?: string | null
          type?: string | null
          value?: number | null
        }
        Update: {
          code?: string | null
          end_date?: string | null
          id?: string | null
          max_discount?: number | null
          min_order_value?: number | null
          start_date?: string | null
          type?: string | null
          value?: number | null
        }
        Relationships: []
      }
      login_page_settings: {
        Row: {
          company_name: string | null
          header_logo: string | null
          login_bg_image: string | null
          login_brand_text: string | null
          login_logo: string | null
          login_logo_height: number | null
          login_subtitle: string | null
          login_subtitle_size: number | null
          login_title: string | null
          login_title_size: number | null
        }
        Relationships: []
      }
      products_public: {
        Row: {
          attributes: Json | null
          category_id: string | null
          cover_image: string | null
          created_at: string | null
          deleted_at: string | null
          full_description: string | null
          gallery_images: string[] | null
          height_cm: number | null
          id: string | null
          is_featured: boolean | null
          length_cm: number | null
          min_stock: number | null
          name: string | null
          price: number | null
          promotional_price: number | null
          short_description: string | null
          sku: string | null
          slug: string | null
          status: string | null
          stock: number | null
          tags: string[] | null
          updated_at: string | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          attributes?: Json | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          height_cm?: number | null
          id?: string | null
          is_featured?: boolean | null
          length_cm?: number | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          promotional_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          attributes?: Json | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_description?: string | null
          gallery_images?: string[] | null
          height_cm?: number | null
          id?: string | null
          is_featured?: boolean | null
          length_cm?: number | null
          min_stock?: number | null
          name?: string | null
          price?: number | null
          promotional_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string | null
          id: string | null
          images: string[] | null
          is_verified_purchase: boolean | null
          product_slug: string | null
          rating: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean | null
          product_slug?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string | null
          id?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean | null
          product_slug?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "support"],
    },
  },
} as const
