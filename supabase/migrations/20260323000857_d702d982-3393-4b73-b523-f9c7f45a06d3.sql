-- Fix cron job to use service_role key instead of anon key
SELECT cron.unschedule('process-workflow-executions');

SELECT cron.schedule(
  'process-workflow-executions',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/execute-workflow',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
    ),
    body := '{"action": "process"}'::jsonb
  ) as request_id;
  $$
);

-- Insert missing suggested WhatsApp templates
INSERT INTO public.whatsapp_templates (name, category, channel, message_text, variables, is_active)
VALUES
  ('Boas-vindas com cupom', 'promocao', 'whatsapp',
   'Olá {{customer_name}}! Seja bem-vinda à {{company_name}}. Para sua primeira compra, ative o cupom {{coupon_code}} e garanta {{discount_percent}} OFF até {{expires_at}}.',
   ARRAY['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'], true),

  ('Lembrete de carrinho com urgência', 'recuperacao', 'whatsapp',
   'Oi {{customer_name}}, seus {{cart_items}} ainda estão reservados no carrinho. Posso liberar agora o cupom {{coupon_code}} com {{discount_percent}} OFF, válido até {{expires_at}}.',
   ARRAY['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'], true),

  ('Produção iniciada', 'transacional', 'whatsapp',
   'Seu pedido {{order_number}} entrou em produção. Status atual: {{production_status}}. Assim que avançar para a próxima etapa, eu te aviso por aqui.',
   ARRAY['{{order_number}}', '{{production_status}}'], true),

  ('Pedido enviado com rastreio', 'transacional', 'whatsapp',
   'Pedido {{order_number}} enviado com sucesso. Total: {{total}}. Seu código de rastreio é {{tracking_code}}. Se quiser, posso te explicar como acompanhar a entrega.',
   ARRAY['{{order_number}}', '{{total}}', '{{tracking_code}}'], true),

  ('Pós-venda com avaliação', 'pos_venda', 'whatsapp',
   'Olá {{customer_name}}, seu pedido {{order_number}} já foi entregue. Como foi sua experiência com a {{company_name}}? Sua avaliação ajuda muito e posso te enviar um benefício na próxima compra.',
   ARRAY['{{customer_name}}', '{{order_number}}', '{{company_name}}'], true),

  ('PIX confirmado', 'transacional', 'whatsapp',
   'Olá {{customer_name}}! Seu pagamento via PIX de {{amount}} foi confirmado. Pedido {{order_number}} já está sendo processado. ✨',
   ARRAY['{{customer_name}}', '{{amount}}', '{{order_number}}'], true),

  ('Pedido criado', 'transacional', 'whatsapp',
   'Olá {{customer_name}}! Seu pedido {{order_number}} no valor de {{amount}} foi registrado com sucesso. Acompanhe pelo nosso site ou aqui pelo WhatsApp. 🎉',
   ARRAY['{{customer_name}}', '{{order_number}}', '{{amount}}'], true),

  ('PIX Gerado', 'transacional', 'whatsapp',
   '💳 *PIX Gerado*\n\nOlá {{customer_name}}! Seu pagamento via PIX foi gerado.\n\n💰 Valor: {{amount}}\n⏰ Expira em: {{expiration_date}}\n\nApós o pagamento, você receberá a confirmação automaticamente. ✨',
   ARRAY['{{customer_name}}', '{{amount}}', '{{expiration_date}}'], true)
ON CONFLICT (name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  variables = EXCLUDED.variables,
  category = EXCLUDED.category;

-- Add missing email templates for workflow presets
INSERT INTO public.email_templates (name, subject, body, variables, is_active)
VALUES
  ('Carrinho abandonado', 'Você esqueceu algo no carrinho! 🛒', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fff7ed;"><div style="background:#fff;border:1px solid #fed7aa;border-radius:16px;padding:24px;"><h2 style="color:#9a3412;">Oi {{customer_name}}! 🛒</h2><p>Você deixou itens no carrinho: {{cart_items}}</p><p>Se precisar de ajuda, estamos aqui. Use o cupom <strong>{{coupon_code}}</strong> para {{discount_percent}} de desconto até {{expires_at}}.</p></div></div>', ARRAY['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'], true),

  ('Pagamento confirmado', 'Pagamento confirmado! ✅ Pedido {{order_number}}', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#f0fdf4;"><div style="background:#fff;border:1px solid #86efac;border-radius:16px;padding:24px;"><h2 style="color:#166534;">Pagamento Confirmado ✅</h2><p>Olá {{customer_name}}, seu pagamento de {{amount}} para o pedido {{order_number}} foi confirmado.</p><p>Seu pedido será produzido e enviado para: {{shipping_address}}, {{shipping_city}}/{{shipping_state}} - {{shipping_cep}}</p><p>Prazo estimado: {{delivery_estimate}}</p></div></div>', ARRAY['{{customer_name}}', '{{amount}}', '{{order_number}}', '{{shipping_address}}', '{{shipping_city}}', '{{shipping_state}}', '{{shipping_cep}}', '{{delivery_estimate}}'], true),

  ('Pedido criado', 'Pedido {{order_number}} recebido! 🎉', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fff7ed;"><div style="background:#fff;border:1px solid #fed7aa;border-radius:16px;padding:24px;"><h2 style="color:#9a3412;">Pedido Recebido 🎉</h2><p>Olá {{customer_name}}, seu pedido {{order_number}} no valor de {{amount}} foi registrado com sucesso.</p><p>Você receberá atualizações sobre o status do pedido.</p></div></div>', ARRAY['{{customer_name}}', '{{order_number}}', '{{amount}}'], true),

  ('PIX confirmado', 'PIX confirmado! ✅ Pedido {{order_number}}', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#f0fdf4;"><div style="background:#fff;border:1px solid #86efac;border-radius:16px;padding:24px;"><h2 style="color:#166534;">PIX Confirmado ✅</h2><p>Olá {{customer_name}}, seu pagamento via PIX de {{amount}} foi confirmado para o pedido {{order_number}}.</p></div></div>', ARRAY['{{customer_name}}', '{{amount}}', '{{order_number}}'], true),

  ('Pedido enviado', 'Pedido {{order_number}} enviado! 📦', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#eff6ff;"><div style="background:#fff;border:1px solid #93c5fd;border-radius:16px;padding:24px;"><h2 style="color:#1e40af;">Pedido Enviado 📦</h2><p>Olá {{customer_name}}, seu pedido {{order_number}} foi enviado!</p><p>Código de rastreio: <strong>{{tracking_code}}</strong></p><p>Destino: {{shipping_address}}, {{shipping_city}}/{{shipping_state}} - {{shipping_cep}}</p><p>Prazo estimado: {{delivery_estimate}}</p></div></div>', ARRAY['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{shipping_address}}', '{{shipping_city}}', '{{shipping_state}}', '{{shipping_cep}}', '{{delivery_estimate}}'], true),

  ('Solicitar avaliação', 'Como foi sua experiência? ⭐', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fdf4ff;"><div style="background:#fff;border:1px solid #e9d5ff;border-radius:16px;padding:24px;"><h2 style="color:#7e22ce;">Conte-nos sua experiência ⭐</h2><p>Olá {{customer_name}}, esperamos que esteja aproveitando seu pedido {{order_number}}!</p><p>Sua avaliação é muito importante para nós. Que tal deixar um comentário?</p></div></div>', ARRAY['{{customer_name}}', '{{order_number}}'], true),

  ('Recompra VIP', 'Oferta exclusiva para você! 🎁', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fffbeb;"><div style="background:#fff;border:1px solid #fde68a;border-radius:16px;padding:24px;"><h2 style="color:#92400e;">Oferta VIP 🎁</h2><p>Olá {{customer_name}}, preparamos uma condição especial para você!</p><p>Use o cupom <strong>{{coupon_code}}</strong> para {{discount_percent}} de desconto. Válido até {{expires_at}}.</p></div></div>', ARRAY['{{customer_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'], true),

  ('Boas-vindas', 'Bem-vindo à Pincel de Luz! ✨', '<div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;background:#fff7ed;"><div style="background:#fff;border:1px solid #fed7aa;border-radius:16px;padding:24px;"><h2 style="color:#9a3412;">Bem-vindo! ✨</h2><p>Olá {{customer_name}}, seja bem-vindo à {{company_name}}!</p><p>Use o cupom <strong>{{coupon_code}}</strong> para {{discount_percent}} na sua primeira compra.</p></div></div>', ARRAY['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}'], true)
ON CONFLICT (name) DO UPDATE SET
  subject = EXCLUDED.subject,
  body = EXCLUDED.body,
  variables = EXCLUDED.variables;