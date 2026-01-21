-- Add cost fields to products table for profit margin calculation
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cost_material numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_labor numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_shipping numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 5;

-- Create orders table for confirmed sales tracking
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id uuid REFERENCES public.quotes(id),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order_items table for individual product sales tracking
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  cost_material numeric DEFAULT 0,
  cost_labor numeric DEFAULT 0,
  cost_shipping numeric DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create company tax settings table
CREATE TABLE public.company_tax_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj text,
  cnae_primary text,
  cnae_secondary text[] DEFAULT '{}',
  tax_regime text DEFAULT 'simples_nacional',
  simples_anexo text DEFAULT 'III',
  simples_faixa integer DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default tax settings
INSERT INTO public.company_tax_settings (cnpj, cnae_primary, tax_regime, simples_anexo, simples_faixa)
VALUES ('', '1813-0/01', 'simples_nacional', 'III', 1);

-- Enable RLS on new tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tax_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can manage orders" 
ON public.orders 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- RLS policies for order_items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can manage order items" 
ON public.order_items 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- RLS policies for company_tax_settings
CREATE POLICY "Admins can view tax settings" 
ON public.company_tax_settings 
FOR SELECT 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can manage tax settings" 
ON public.company_tax_settings 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_products_stock ON public.products(stock);