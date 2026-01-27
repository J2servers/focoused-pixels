-- Add tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_code text,
ADD COLUMN IF NOT EXISTS shipping_company text DEFAULT 'correios';

-- Create tracking_events table for storing tracking history
CREATE TABLE public.tracking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_code text NOT NULL,
  status text NOT NULL,
  description text,
  location text,
  event_date timestamp with time zone,
  raw_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_tracking_events_tracking_code ON public.tracking_events(tracking_code);
CREATE INDEX idx_tracking_events_order_id ON public.tracking_events(order_id);
CREATE INDEX idx_orders_tracking_code ON public.orders(tracking_code);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tracking events (public tracking)
CREATE POLICY "Anyone can view tracking events"
ON public.tracking_events
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage tracking events"
ON public.tracking_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  )
);