-- Create leads table for newsletter and promotions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  tags TEXT[] DEFAULT '{}',
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can subscribe (insert), only admins can view/manage
CREATE POLICY "Anyone can subscribe as lead"
ON public.leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (has_admin_access(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_reviews_updated_at();

-- Create index for email lookups
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_is_subscribed ON public.leads(is_subscribed);