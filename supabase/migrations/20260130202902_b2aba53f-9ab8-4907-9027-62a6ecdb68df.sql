-- =============================================
-- FUNÇÃO DE ATUALIZAÇÃO AUTOMÁTICA DE UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- CUPONS DE DESCONTO
-- =============================================
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category_ids UUID[],
  product_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons" 
ON public.coupons FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coupons" 
ON public.coupons FOR ALL USING (public.has_admin_access(auth.uid()));

-- =============================================
-- ESTOQUE DE MATÉRIA-PRIMA
-- =============================================
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50),
  unit VARCHAR(20) NOT NULL DEFAULT 'un',
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_quantity DECIMAL(10, 2) DEFAULT 0,
  cost_per_unit DECIMAL(10, 2),
  supplier VARCHAR(255),
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage raw materials" 
ON public.raw_materials FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- =============================================
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste')),
  quantity DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage stock movements" 
ON public.stock_movements FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- TEMPLATES DE EMAIL
-- =============================================
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates" 
ON public.email_templates FOR ALL USING (public.has_admin_access(auth.uid()));

-- =============================================
-- POPUPS PROMOCIONAIS
-- =============================================
CREATE TABLE public.promo_popups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url VARCHAR(500),
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  trigger_type VARCHAR(50) DEFAULT 'time' CHECK (trigger_type IN ('time', 'scroll', 'exit')),
  trigger_value INTEGER DEFAULT 5,
  show_once BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active popups" 
ON public.promo_popups FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage popups" 
ON public.promo_popups FOR ALL USING (public.has_admin_access(auth.uid()));

-- =============================================
-- STATUS DE PRODUÇÃO NOS PEDIDOS
-- =============================================
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS production_status VARCHAR(50) DEFAULT 'pending';

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS production_notes TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS production_started_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS production_completed_at TIMESTAMP WITH TIME ZONE;

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at
BEFORE UPDATE ON public.raw_materials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_popups_updated_at
BEFORE UPDATE ON public.promo_popups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TEMPLATES DE EMAIL PADRÃO
-- =============================================
INSERT INTO public.email_templates (name, subject, body, variables) VALUES
('order_confirmation', 'Pedido #{order_number} confirmado!', 'Olá {customer_name}, seu pedido #{order_number} foi confirmado! Valor: R$ {total}', ARRAY['customer_name', 'order_number', 'total']),
('order_shipped', 'Seu pedido #{order_number} foi enviado!', 'Olá {customer_name}, seu pedido foi enviado! Rastreio: {tracking_code}', ARRAY['customer_name', 'order_number', 'tracking_code', 'shipping_company']),
('production_started', 'Produção iniciada!', 'Olá {customer_name}, a produção do pedido #{order_number} começou!', ARRAY['customer_name', 'order_number'])
ON CONFLICT (name) DO NOTHING;