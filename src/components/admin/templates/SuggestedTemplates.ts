export const SUGGESTED_EMAIL_TEMPLATES = [
  {
    name: 'pix_generated',
    subject: '💳 PIX Gerado — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;margin:0 0 16px;">💳 PIX Gerado</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pagamento via PIX foi gerado com sucesso!</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Valor:</strong></td><td style="padding:8px;">{{total}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Pedido:</strong></td><td style="padding:8px;">{{order_number}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Expira em:</strong></td><td style="padding:8px;">{{expiration_date}}</td></tr>
</table>
<p><a href="{{payment_link}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Pagar com PIX</a></p>
<p style="color:#6c757d;font-size:13px;">Após o pagamento, você receberá a confirmação automaticamente.</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}', '{{expiration_date}}', '{{payment_link}}'],
  },
  {
    name: 'boleto_generated',
    subject: '🧾 Boleto Emitido — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;margin:0 0 16px;">🧾 Boleto Emitido</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu boleto foi gerado com sucesso.</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Valor:</strong></td><td style="padding:8px;">{{total}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Vencimento:</strong></td><td style="padding:8px;">{{expiration_date}}</td></tr>
</table>
<p style="background:#f0f0f0;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;word-break:break-all;">{{barcode}}</p>
<p><a href="{{boleto_url}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Abrir Boleto</a></p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'],
  },
  {
    name: 'payment_confirmed',
    subject: '✅ Pagamento Confirmado — Pedido {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#10b981;margin:0 0 16px;">✅ Pagamento Confirmado!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Ótimas notícias! Seu pagamento de <strong>{{total}}</strong> para o pedido <strong>{{order_number}}</strong> foi confirmado.</p>
<p>Seu pedido já está sendo preparado com todo carinho pela nossa equipe.</p>
<p style="color:#6c757d;font-size:13px;">Você receberá atualizações sobre o status da produção e envio por aqui.</p>
<p>Obrigado por escolher a {{company_name}}! 💜</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}', '{{company_name}}'],
  },
  {
    name: 'card_approved',
    subject: '✅ Pagamento com Cartão Aprovado — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#10b981;">✅ Pagamento Aprovado</h2>
<p>Olá <strong>{{customer_name}}</strong>, seu pagamento foi aprovado!</p>
<p><strong>Valor:</strong> {{total}}</p>
<p><strong>Pedido:</strong> {{order_number}}</p>
<p>Seu pedido já está em processamento. ✨</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'],
  },
  {
    name: 'order_shipped',
    subject: '📦 Pedido Enviado — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;">📦 Seu Pedido Foi Enviado!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pedido <strong>{{order_number}}</strong> acaba de ser enviado.</p>
<p><strong>Código de rastreio:</strong> {{tracking_code}}</p>
<p><strong>Entrega estimada:</strong> {{delivery_estimate}}</p>
<p><strong>Destino:</strong> {{shipping_address}}, {{shipping_city}} - {{shipping_state}}, {{shipping_cep}}</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{delivery_estimate}}', '{{shipping_address}}', '{{shipping_city}}', '{{shipping_state}}', '{{shipping_cep}}'],
  },
];

export const SUGGESTED_WHATSAPP_TEMPLATES = [
  { name: 'pix_generated', category: 'transacional', content: '💳 *PIX Gerado*\n\nOlá {{customer_name}}! Seu PIX de {{total}} foi gerado.\n\n⏰ Expira em: {{expiration_date}}\n🔗 Link: {{payment_link}}\n\nApós o pagamento, você receberá a confirmação. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{payment_link}}'] },
  { name: 'boleto_generated', category: 'transacional', content: '🧾 *Boleto Emitido*\n\nOlá {{customer_name}}! Seu boleto de {{total}} foi gerado.\n\n📅 Vencimento: {{expiration_date}}\n📋 Código: {{barcode}}\n🔗 Link: {{boleto_url}}\n\nApós compensação, confirmaremos. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'] },
  { name: 'payment_confirmed', category: 'transacional', content: '✅ *Pagamento Confirmado!*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} para o pedido {{order_number}} foi confirmado.\n\nSeu pedido já está sendo preparado! 🎨✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'card_approved', category: 'transacional', content: '✅ *Pagamento Aprovado*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} foi aprovado.\n\nPedido: {{order_number}}\nSeu pedido já está em processamento! ✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'order_shipped', category: 'transacional', content: '📦 *Pedido Enviado!*\n\nOlá {{customer_name}}, seu pedido {{order_number}} foi enviado!\n\n🔍 Rastreio: {{tracking_code}}\n🏠 Destino: {{shipping_city}}/{{shipping_state}}\n📅 Previsão: {{delivery_estimate}}', variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{shipping_city}}', '{{shipping_state}}', '{{delivery_estimate}}'] },
  { name: 'boleto_reminder', category: 'recuperacao', content: '🔔 *Lembrete de Boleto*\n\nOlá {{customer_name}}, seu boleto do pedido {{order_number}} vence em {{expiration_date}}.\n\n💰 Valor: {{total}}\n🔗 Link: {{boleto_url}}\n\nNão perca o prazo!', variables: ['{{customer_name}}', '{{order_number}}', '{{expiration_date}}', '{{total}}', '{{boleto_url}}'] },
  { name: 'Boas-vindas com cupom', category: 'promocao', content: 'Olá {{customer_name}}! Seja bem-vinda à {{company_name}}. Para sua primeira compra, ative o cupom {{coupon_code}} e garanta {{discount_percent}} OFF até {{expires_at}}.', variables: ['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'] },
  { name: 'Lembrete de carrinho com urgência', category: 'recuperacao', content: 'Oi {{customer_name}}, seus {{cart_items}} ainda estão reservados no carrinho. Posso liberar agora o cupom {{coupon_code}} com {{discount_percent}} OFF, válido até {{expires_at}}.', variables: ['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'] },
];
