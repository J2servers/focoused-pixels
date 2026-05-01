-- 1) Hardenize INSERT policies WITH CHECK(true) com validações mínimas

-- abandoned_cart_sessions: limita tamanho do session_id e cart_total razoável
DROP POLICY IF EXISTS "Anyone can insert abandoned cart sessions" ON public.abandoned_cart_sessions;
CREATE POLICY "Anyone can insert abandoned cart sessions"
ON public.abandoned_cart_sessions FOR INSERT TO public
WITH CHECK (
  length(session_id) BETWEEN 8 AND 128
  AND cart_total >= 0
  AND cart_total < 1000000
);

-- leads: valida email/nome
DROP POLICY IF EXISTS "Anyone can subscribe as lead" ON public.leads;
CREATE POLICY "Anyone can subscribe as lead"
ON public.leads FOR INSERT TO public
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

-- page_views: limita path
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT TO public
WITH CHECK (
  length(page_path) BETWEEN 1 AND 2048
  AND (referrer IS NULL OR length(referrer) <= 2048)
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
);

-- 2) Revogar EXECUTE público de funções SECURITY DEFINER que NÃO devem ser chamadas pelo cliente
-- Mantemos: lookup_tracking (público intencional para rastreio anônimo)
-- has_role / has_admin_access / is_admin_or_editor: usadas DENTRO de policies; RLS roda com owner, então podemos revogar de anon/authenticated sem quebrar
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_admin_access(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_audit_action() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;