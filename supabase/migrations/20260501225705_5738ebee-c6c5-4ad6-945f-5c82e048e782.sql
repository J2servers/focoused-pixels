-- Restaurar EXECUTE nas funções usadas por policies RLS de tabelas públicas
GRANT EXECUTE ON FUNCTION public.has_admin_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;