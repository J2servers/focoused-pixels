
-- Abandoned cart sessions table
CREATE TABLE IF NOT EXISTS public.abandoned_cart_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_email text,
  user_name text,
  user_phone text,
  cart_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  cart_total numeric NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  recovered boolean NOT NULL DEFAULT false,
  recovered_at timestamptz,
  reminder_sent boolean NOT NULL DEFAULT false,
  reminder_sent_at timestamptz,
  coupon_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_cart_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage abandoned carts" ON public.abandoned_cart_sessions
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE POLICY "Anyone can insert abandoned cart sessions" ON public.abandoned_cart_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own session" ON public.abandoned_cart_sessions
  FOR UPDATE USING (true);

-- Abandoned cart reminders table
CREATE TABLE IF NOT EXISTS public.abandoned_cart_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.abandoned_cart_sessions(id) ON DELETE CASCADE NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  message_text text,
  coupon_code text,
  coupon_discount numeric,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  opened_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_cart_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminders" ON public.abandoned_cart_reminders
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE POLICY "System can insert reminders" ON public.abandoned_cart_reminders
  FOR INSERT WITH CHECK (true);

-- WhatsApp templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  category varchar NOT NULL DEFAULT 'custom',
  channel varchar NOT NULL DEFAULT 'whatsapp',
  message_text text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage whatsapp templates" ON public.whatsapp_templates
  FOR ALL USING (has_admin_access(auth.uid()));

CREATE POLICY "Anyone can read active whatsapp templates" ON public.whatsapp_templates
  FOR SELECT USING (is_active = true);

-- Hostinger email credentials table
CREATE TABLE IF NOT EXISTS public.hostinger_email_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host text NOT NULL DEFAULT 'smtp.hostinger.com',
  smtp_port integer NOT NULL DEFAULT 465,
  smtp_user text,
  smtp_password text,
  reply_to text,
  test_email text,
  test_mode boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hostinger_email_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email credentials" ON public.hostinger_email_credentials
  FOR ALL USING (has_admin_access(auth.uid()));

-- Add why_choose_us_config and logo size columns to company_info
ALTER TABLE public.company_info 
  ADD COLUMN IF NOT EXISTS why_choose_us_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS logo_sidebar_size integer DEFAULT 120,
  ADD COLUMN IF NOT EXISTS logo_header_size integer DEFAULT 160,
  ADD COLUMN IF NOT EXISTS logo_mobile_size integer DEFAULT 100;

-- Seed default WhatsApp templates
INSERT INTO public.whatsapp_templates (name, category, channel, message_text, variables) VALUES
  ('Boas-vindas', 'welcome', 'both', 'Olá {{nome}}! 🎉 Bem-vindo(a) à Pincel de Luz! Use o cupom {{cupom}} e ganhe desconto na primeira compra!', ARRAY['{{nome}}', '{{cupom}}']),
  ('Carrinho Abandonado', 'abandoned_cart', 'both', 'Oi {{nome}}, você esqueceu itens no carrinho! 🛒 Finalize sua compra com {{cupom}} e ganhe desconto especial!', ARRAY['{{nome}}', '{{cupom}}']),
  ('Boleto Emitido', 'boleto', 'both', 'Olá {{nome}}! Seu boleto no valor de R$ {{valor}} foi emitido. Prazo: até {{prazo}}. Após confirmação, iniciaremos a produção!', ARRAY['{{nome}}', '{{valor}}', '{{prazo}}']),
  ('Pagamento Confirmado', 'payment_confirmed', 'both', '✅ {{nome}}, pagamento confirmado! Pedido #{{pedido}} no valor de R$ {{valor}}. Produção iniciará em breve!', ARRAY['{{nome}}', '{{pedido}}', '{{valor}}']),
  ('Pedido em Produção', 'production', 'whatsapp', '🔧 {{nome}}, seu pedido #{{pedido}} está em produção! Prazo estimado: {{prazo}}.', ARRAY['{{nome}}', '{{pedido}}', '{{prazo}}']),
  ('Pedido Enviado', 'shipped', 'both', '📦 {{nome}}, seu pedido #{{pedido}} foi enviado! Rastreio: {{rastreio}}. Acompanhe em nosso site!', ARRAY['{{nome}}', '{{pedido}}', '{{rastreio}}']),
  ('Pós-Venda', 'post_sale', 'both', '{{nome}}, como foi sua experiência com a Pincel de Luz? ⭐ Avalie seu pedido #{{pedido}} e ganhe um cupom especial!', ARRAY['{{nome}}', '{{pedido}}']),
  ('Recompra VIP', 'vip', 'both', '👑 {{nome}}, como cliente especial, preparamos uma oferta exclusiva! Use {{cupom}} para um desconto imperdível!', ARRAY['{{nome}}', '{{cupom}}'])
ON CONFLICT DO NOTHING;

-- Insert default email credential row
INSERT INTO public.hostinger_email_credentials (smtp_host, smtp_port, test_mode)
VALUES ('smtp.hostinger.com', 465, true)
ON CONFLICT DO NOTHING;
