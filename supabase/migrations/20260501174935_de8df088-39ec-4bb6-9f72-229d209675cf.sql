DELETE FROM public.login_attempts WHERE created_at > now() - interval '7 days' AND success = false;
DELETE FROM public.ip_blocklist WHERE permanent = false;