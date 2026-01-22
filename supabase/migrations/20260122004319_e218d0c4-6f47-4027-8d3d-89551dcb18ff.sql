-- Add missing fields for site customization
ALTER TABLE public.company_info
ADD COLUMN IF NOT EXISTS header_logo text,
ADD COLUMN IF NOT EXISTS free_shipping_minimum numeric DEFAULT 159,
ADD COLUMN IF NOT EXISTS free_shipping_message text DEFAULT 'Frete grátis em compras acima de R$ 159',
ADD COLUMN IF NOT EXISTS social_pinterest text,
ADD COLUMN IF NOT EXISTS installments integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS production_time text DEFAULT '4 a 10 dias úteis',
ADD COLUMN IF NOT EXISTS warranty text DEFAULT '3 meses';