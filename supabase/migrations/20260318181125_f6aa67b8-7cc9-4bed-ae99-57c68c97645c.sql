
-- Table to store multiple WhatsApp instances (up to 2 numbers)
CREATE TABLE public.whatsapp_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  phone_number text,
  status text NOT NULL DEFAULT 'disconnected',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 1,
  last_connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp instances" ON public.whatsapp_instances
  FOR ALL TO public USING (has_admin_access(auth.uid()));

-- Table to log all sent WhatsApp messages
CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL,
  recipient_phone text NOT NULL,
  recipient_name text,
  message_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  order_number text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view whatsapp messages" ON public.whatsapp_messages
  FOR SELECT TO public USING (has_admin_access(auth.uid()));

CREATE POLICY "System can insert whatsapp messages" ON public.whatsapp_messages
  FOR INSERT TO public WITH CHECK (true);

-- Trigger to update updated_at on whatsapp_instances
CREATE TRIGGER update_whatsapp_instances_updated_at
  BEFORE UPDATE ON public.whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default instances
INSERT INTO public.whatsapp_instances (instance_name, display_name, priority)
VALUES 
  ('pinceldeluz1', 'WhatsApp Principal', 1),
  ('pinceldeluz2', 'WhatsApp Secundário', 2);
