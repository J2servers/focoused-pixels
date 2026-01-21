-- Create storage bucket for quote attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-attachments', 'quote-attachments', true);

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload quote attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'quote-attachments');

-- Allow anyone to view quote attachments
CREATE POLICY "Anyone can view quote attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-attachments');

-- Create quotes table to store quote requests
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_company TEXT,
  customer_cnpj TEXT,
  
  -- Delivery info
  delivery_address TEXT,
  delivery_cep TEXT,
  delivery_deadline DATE,
  shipping_method TEXT,
  
  -- Product details
  product_types TEXT[] NOT NULL,
  led_option TEXT,
  qr_code_count INTEGER,
  broche_style TEXT,
  other_product_description TEXT,
  
  -- Specifications
  custom_text TEXT,
  logo_url TEXT,
  preferred_colors TEXT,
  dimensions TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  material TEXT,
  thickness TEXT,
  border_finish TEXT,
  qr_code_links TEXT[],
  qr_code_type TEXT,
  
  -- Style references
  reference_links TEXT,
  style_preference TEXT,
  visual_notes TEXT,
  
  -- Commercial
  max_budget DECIMAL(10,2),
  payment_method TEXT,
  request_volume_discount BOOLEAN DEFAULT false,
  request_prototype BOOLEAN DEFAULT false,
  accept_warranty BOOLEAN DEFAULT true,
  want_whatsapp_confirmation BOOLEAN DEFAULT true,
  
  -- Additional
  purpose TEXT,
  additional_notes TEXT,
  
  -- Cart items (JSON)
  cart_items JSONB,
  cart_total DECIMAL(10,2),
  
  -- Metadata
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert quotes (public form)
CREATE POLICY "Anyone can create quotes"
ON public.quotes FOR INSERT
WITH CHECK (true);

-- Only allow reading own quotes by email (for future tracking)
CREATE POLICY "Anyone can read quotes"
ON public.quotes FOR SELECT
USING (true);