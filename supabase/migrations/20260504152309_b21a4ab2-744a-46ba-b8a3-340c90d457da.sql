-- 1) reviews_public: switch to SECURITY DEFINER view (no security_invoker)
-- The view already excludes customer_email; making it definer ensures
-- anonymous readers cannot bypass it to reach the base table.
ALTER VIEW public.reviews_public SET (security_invoker = false);
REVOKE ALL ON public.reviews FROM anon, authenticated;
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- 2) Tighten storage policy for customer order files: require strict
-- folder prefix orders/<order_id>/ instead of POSITION substring match.
DROP POLICY IF EXISTS "Customers can view own order files" ON storage.objects;
CREATE POLICY "Customers can view own order files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-files'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.customer_email = (auth.jwt() ->> 'email')
      AND (storage.foldername(storage.objects.name))[1] = 'orders'
      AND (storage.foldername(storage.objects.name))[2] = o.id::text
  )
);

-- 3) Reaffirm has_admin_access excludes 'support' (idempotent)
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$function$;