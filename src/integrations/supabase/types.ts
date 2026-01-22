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
          address: string | null
          business_hours: string | null
          cnpj: string | null
          company_name: string
          copyright_text: string | null
          email: string | null
          footer_logo: string | null
          free_shipping_message: string | null
          free_shipping_minimum: number | null
          header_logo: string | null
          id: string
          installments: number | null
          phone: string | null
          privacy_policy: string | null
          production_time: string | null
          returns_policy: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_tiktok: string | null
          social_youtube: string | null
          terms_of_service: string | null
          updated_at: string
          warranty: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          cnpj?: string | null
          company_name: string
          copyright_text?: string | null
          email?: string | null
          footer_logo?: string | null
          free_shipping_message?: string | null
          free_shipping_minimum?: number | null
          header_logo?: string | null
          id?: string
          installments?: number | null
          phone?: string | null
          privacy_policy?: string | null
          production_time?: string | null
          returns_policy?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          terms_of_service?: string | null
          updated_at?: string
          warranty?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          cnpj?: string | null
          company_name?: string
          copyright_text?: string | null
          email?: string | null
          footer_logo?: string | null
          free_shipping_message?: string | null
          free_shipping_minimum?: number | null
          header_logo?: string | null
          id?: string
          installments?: number | null
          phone?: string | null
          privacy_policy?: string | null
          production_time?: string | null
          returns_policy?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          terms_of_service?: string | null
          updated_at?: string
          warranty?: string | null
          whatsapp?: string | null
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
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
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
          quote_id: string | null
          shipping_cost: number | null
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
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
          quote_id?: string | null
          shipping_cost?: number | null
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
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
          quote_id?: string | null
          shipping_cost?: number | null
          subtotal?: number
          total?: number
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
          id: string
          is_featured: boolean | null
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
          id?: string
          is_featured?: boolean | null
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
          id?: string
          is_featured?: boolean | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
