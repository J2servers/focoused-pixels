ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0.5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS length_cm numeric DEFAULT 20;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS width_cm numeric DEFAULT 15;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS height_cm numeric DEFAULT 10;