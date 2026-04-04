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
    name: 'card_pending',
    subject: '⏳ Pagamento em Análise — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#f59e0b;">⏳ Pagamento em Análise</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pagamento do pedido <strong>{{order_number}}</strong> está sendo analisado pela operadora do cartão.</p>
<p><strong>Valor:</strong> {{total}}</p>
<p style="background:#fef3c7;padding:12px;border-radius:8px;color:#92400e;font-size:13px;">⏱️ A análise leva normalmente até 48 horas. Você será notificado assim que houver uma resposta.</p>
<p>Se tiver alguma dúvida, entre em contato conosco.</p>
<p>Equipe {{company_name}}</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{total}}', '{{order_number}}', '{{company_name}}'],
  },
  {
    name: 'order_shipped',
    subject: '📦 Pedido Enviado — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;">📦 Seu Pedido Foi Enviado!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu pedido <strong>{{order_number}}</strong> acaba de ser enviado.</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Rastreio:</strong></td><td style="padding:8px;font-family:monospace;">{{tracking_code}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Previsão:</strong></td><td style="padding:8px;">{{delivery_estimate}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Destino:</strong></td><td style="padding:8px;">{{shipping_address}}, {{shipping_city}}/{{shipping_state}} — {{shipping_cep}}</td></tr>
</table>
<p><a href="https://rastreamento.correios.com.br/app/index.php" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Rastrear Pedido</a></p>
</div></div>`,
    variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{delivery_estimate}}', '{{shipping_address}}', '{{shipping_city}}', '{{shipping_state}}', '{{shipping_cep}}'],
  },
  {
    name: 'abandoned_cart',
    subject: '🛒 Você esqueceu algo no carrinho!',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;">🛒 Seu carrinho está te esperando!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Notamos que você deixou <strong>{{cart_items}}</strong> no seu carrinho.</p>
<p>Seus itens estão reservados por tempo limitado.</p>
<div style="background:#ede9fe;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
<p style="margin:0;font-size:18px;font-weight:bold;color:#7c3aed;">Use o cupom: {{coupon_code}}</p>
<p style="margin:4px 0 0;color:#6d28d9;">e ganhe {{discount_percent}} de desconto!</p>
<p style="margin:4px 0 0;font-size:12px;color:#8b5cf6;">Válido até {{expires_at}}</p>
</div>
<p><a href="#" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Finalizar Compra</a></p>
<p style="color:#6c757d;font-size:13px;">Se já finalizou, desconsidere este e-mail.</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'],
  },
  {
    name: 'new_lead',
    subject: '👋 Bem-vindo(a) à {{company_name}}!',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#7c3aed;">👋 Bem-vindo(a)!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Que bom ter você por aqui! Somos a <strong>{{company_name}}</strong> e estamos prontos para criar algo especial para você.</p>
<p>Para sua primeira compra, use o cupom abaixo:</p>
<div style="background:#ede9fe;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
<p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed;letter-spacing:2px;">{{coupon_code}}</p>
<p style="margin:4px 0 0;color:#6d28d9;">{{discount_percent}} de desconto na primeira compra</p>
</div>
<p>Explore nossos produtos e encontre a peça perfeita para você. ✨</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}'],
  },
  {
    name: 'review_received',
    subject: '⭐ Obrigado pela sua avaliação!',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#f59e0b;">⭐ Avaliação Recebida!</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Muito obrigado pela sua avaliação! Sua opinião é fundamental para continuarmos melhorando nossos produtos e serviços.</p>
<p>Como agradecimento, aqui vai um cupom especial para sua próxima compra:</p>
<div style="background:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
<p style="margin:0;font-size:20px;font-weight:bold;color:#b45309;">{{coupon_code}}</p>
<p style="margin:4px 0 0;color:#92400e;">{{discount_percent}} OFF válido até {{expires_at}}</p>
</div>
<p>Obrigado por fazer parte da {{company_name}}! 💜</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}', '{{company_name}}'],
  },
  {
    name: 'boleto_reminder',
    subject: '🔔 Lembrete: Seu boleto vence em breve — {{order_number}}',
    body: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:20px;">
<div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e9ecef;">
<h2 style="color:#f59e0b;">🔔 Lembrete de Boleto</h2>
<p>Olá <strong>{{customer_name}}</strong>,</p>
<p>Seu boleto do pedido <strong>{{order_number}}</strong> vence em <strong>{{expiration_date}}</strong>.</p>
<table style="width:100%;margin:16px 0;border-collapse:collapse;">
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Valor:</strong></td><td style="padding:8px;">{{total}}</td></tr>
<tr><td style="padding:8px;background:#f8f9fa;border-radius:4px;"><strong>Vencimento:</strong></td><td style="padding:8px;">{{expiration_date}}</td></tr>
</table>
<p style="background:#f0f0f0;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;word-break:break-all;">{{barcode}}</p>
<p><a href="{{boleto_url}}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Pagar Agora</a></p>
<p style="color:#6c757d;font-size:13px;">Se já efetuou o pagamento, desconsidere este lembrete.</p>
</div></div>`,
    variables: ['{{customer_name}}', '{{order_number}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'],
  },
];

export const SUGGESTED_WHATSAPP_TEMPLATES = [
  { name: 'pix_generated', category: 'transacional', content: '💳 *PIX Gerado*\n\nOlá {{customer_name}}! Seu PIX de {{total}} foi gerado.\n\n⏰ Expira em: {{expiration_date}}\n🔗 Link: {{payment_link}}\n\nApós o pagamento, você receberá a confirmação. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{payment_link}}'] },
  { name: 'boleto_generated', category: 'transacional', content: '🧾 *Boleto Emitido*\n\nOlá {{customer_name}}! Seu boleto de {{total}} foi gerado.\n\n📅 Vencimento: {{expiration_date}}\n📋 Código: {{barcode}}\n🔗 Link: {{boleto_url}}\n\nApós compensação, confirmaremos. ✨', variables: ['{{customer_name}}', '{{total}}', '{{expiration_date}}', '{{barcode}}', '{{boleto_url}}'] },
  { name: 'payment_confirmed', category: 'transacional', content: '✅ *Pagamento Confirmado!*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} para o pedido {{order_number}} foi confirmado.\n\nSeu pedido já está sendo preparado! 🎨✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'card_approved', category: 'transacional', content: '✅ *Pagamento Aprovado*\n\nOlá {{customer_name}}! Seu pagamento de {{total}} foi aprovado.\n\nPedido: {{order_number}}\nSeu pedido já está em processamento! ✨', variables: ['{{customer_name}}', '{{total}}', '{{order_number}}'] },
  { name: 'card_pending', category: 'transacional', content: '⏳ *Pagamento em Análise*\n\nOlá {{customer_name}}, seu pagamento do pedido {{order_number}} está sendo analisado.\n\n💰 Valor: {{total}}\n\nA análise leva até 48 horas. Você será notificado assim que houver resposta. 🙏', variables: ['{{customer_name}}', '{{order_number}}', '{{total}}'] },
  { name: 'order_shipped', category: 'transacional', content: '📦 *Pedido Enviado!*\n\nOlá {{customer_name}}, seu pedido {{order_number}} foi enviado!\n\n🔍 Rastreio: {{tracking_code}}\n🏠 Destino: {{shipping_city}}/{{shipping_state}}\n📅 Previsão: {{delivery_estimate}}', variables: ['{{customer_name}}', '{{order_number}}', '{{tracking_code}}', '{{shipping_city}}', '{{shipping_state}}', '{{delivery_estimate}}'] },
  { name: 'boleto_reminder', category: 'recuperacao', content: '🔔 *Lembrete de Boleto*\n\nOlá {{customer_name}}, seu boleto do pedido {{order_number}} vence em {{expiration_date}}.\n\n💰 Valor: {{total}}\n🔗 Link: {{boleto_url}}\n\nNão perca o prazo!', variables: ['{{customer_name}}', '{{order_number}}', '{{expiration_date}}', '{{total}}', '{{boleto_url}}'] },
  { name: 'abandoned_cart', category: 'recuperacao', content: '🛒 *Esqueceu algo no carrinho?*\n\nOlá {{customer_name}}, seus {{cart_items}} ainda estão reservados!\n\n🎟️ Use o cupom *{{coupon_code}}* e ganhe *{{discount_percent}} OFF*\n⏰ Válido até: {{expires_at}}\n\nNão perca essa oportunidade! 🏃‍♀️', variables: ['{{customer_name}}', '{{cart_items}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}'] },
  { name: 'new_lead', category: 'promocao', content: '👋 *Bem-vindo(a) à {{company_name}}!*\n\nOlá {{customer_name}}! Que bom ter você por aqui.\n\n🎁 Para sua primeira compra, use o cupom:\n*{{coupon_code}}* — {{discount_percent}} OFF\n\nExplore nossos produtos e encontre algo especial! ✨', variables: ['{{customer_name}}', '{{company_name}}', '{{coupon_code}}', '{{discount_percent}}'] },
  { name: 'review_received', category: 'pos_venda', content: '⭐ *Obrigado pela avaliação!*\n\nOlá {{customer_name}}, sua avaliação é muito importante para nós.\n\nComo agradecimento, ganhe *{{discount_percent}} OFF* na próxima compra:\n🎟️ Cupom: *{{coupon_code}}*\n⏰ Válido até: {{expires_at}}\n\nObrigado por fazer parte da {{company_name}}! 💜', variables: ['{{customer_name}}', '{{coupon_code}}', '{{discount_percent}}', '{{expires_at}}', '{{company_name}}'] },
];
