UPDATE public.email_credentials
SET smtp_username = 'vendas@pinceldeluz.store',
    business_email = 'vendas@pinceldeluz.store',
    smtp_host = 'smtp.hostinger.com',
    smtp_port = 465,
    smtp_secure = true,
    email_enabled = true,
    sender_name = 'Pincel de Luz',
    test_mode = false,
    updated_at = now()
WHERE id = (SELECT id FROM public.email_credentials ORDER BY updated_at DESC LIMIT 1);