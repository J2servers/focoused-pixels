-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'support');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'support',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    promotional_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    sku TEXT UNIQUE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
    cover_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    attributes JSONB DEFAULT '{}',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotions table
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    rule TEXT NOT NULL CHECK (rule IN ('category', 'product', 'general')),
    product_ids UUID[] DEFAULT '{}',
    category_ids UUID[] DEFAULT '{}',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
    priority INTEGER DEFAULT 0,
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_percentage CHECK (type != 'percentage' OR (value >= 1 AND value <= 100))
);

-- Create hero_slides table
CREATE TABLE public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    desktop_image TEXT NOT NULL,
    mobile_image TEXT,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company_info table (singleton pattern)
CREATE TABLE public.company_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    cnpj TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    business_hours TEXT,
    social_instagram TEXT,
    social_facebook TEXT,
    social_tiktok TEXT,
    social_youtube TEXT,
    social_linkedin TEXT,
    copyright_text TEXT,
    privacy_policy TEXT,
    terms_of_service TEXT,
    returns_policy TEXT,
    footer_logo TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- Function to check if user has any admin panel access
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (only admins)
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Admin panel users can view logs" ON public.audit_logs
FOR SELECT USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admin panel users can insert logs" ON public.audit_logs
FOR INSERT WITH CHECK (public.has_admin_access(auth.uid()));

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories
FOR SELECT USING (status = 'active' OR public.has_admin_access(auth.uid()));

CREATE POLICY "Admins and editors can manage categories" ON public.categories
FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
FOR SELECT USING ((status = 'active' AND deleted_at IS NULL) OR public.has_admin_access(auth.uid()));

CREATE POLICY "Admins and editors can manage products" ON public.products
FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Promotions policies
CREATE POLICY "Anyone can view active promotions" ON public.promotions
FOR SELECT USING (status = 'active' OR public.has_admin_access(auth.uid()));

CREATE POLICY "Admins and editors can manage promotions" ON public.promotions
FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Hero slides policies
CREATE POLICY "Anyone can view active hero slides" ON public.hero_slides
FOR SELECT USING (status = 'active' OR public.has_admin_access(auth.uid()));

CREATE POLICY "Admins and editors can manage hero slides" ON public.hero_slides
FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Company info policies
CREATE POLICY "Anyone can view company info" ON public.company_info
FOR SELECT USING (true);

CREATE POLICY "Admins and editors can update company info" ON public.company_info
FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', true);

CREATE POLICY "Admin users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'admin-uploads' AND public.has_admin_access(auth.uid()));

CREATE POLICY "Admin users can update uploads" ON storage.objects
FOR UPDATE USING (bucket_id = 'admin-uploads' AND public.has_admin_access(auth.uid()));

CREATE POLICY "Admin users can delete uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'admin-uploads' AND public.has_admin_access(auth.uid()));

CREATE POLICY "Anyone can view admin uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-uploads');

-- Function for audit logging
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create audit triggers
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_promotions AFTER INSERT OR UPDATE OR DELETE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_hero_slides AFTER INSERT OR UPDATE OR DELETE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

-- Update timestamp triggers
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

CREATE TRIGGER update_promotions_timestamp BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

CREATE TRIGGER update_hero_slides_timestamp BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.update_reviews_updated_at();

-- Insert default company info
INSERT INTO public.company_info (company_name, copyright_text)
VALUES ('Goat Comunicação Visual', '© 2024 Goat Comunicação Visual. Todos os direitos reservados.');