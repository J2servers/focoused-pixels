CREATE OR REPLACE FUNCTION public.check_admin_email_access(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE lower(u.email) = lower(_email)
      AND ur.role IN ('admin', 'editor')
  )
$$;

REVOKE ALL ON FUNCTION public.check_admin_email_access(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_email_access(text) TO service_role;
