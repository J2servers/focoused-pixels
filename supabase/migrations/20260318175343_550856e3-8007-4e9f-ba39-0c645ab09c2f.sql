ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_files text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_text text DEFAULT NULL;

-- Create bucket for customer order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-files', 'order-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to order-files bucket
CREATE POLICY "Anyone can upload order files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'order-files');

-- Allow anyone to read order files
CREATE POLICY "Anyone can view order files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'order-files');