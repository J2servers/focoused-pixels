-- 1) whatsapp_messages: restringir INSERT
DROP POLICY IF EXISTS "System can insert whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Admins can insert whatsapp messages"
  ON public.whatsapp_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_access(auth.uid()));

-- 2) reviews: exigir auth e e-mail próprio
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create own reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_email = (auth.jwt() ->> 'email')
    AND length(comment) BETWEEN 3 AND 2000
    AND rating BETWEEN 1 AND 5
  );

-- 3) coupons: SELECT público restrito a cupons ativos/no prazo
CREATE POLICY "Public can read active coupons for validation"
  ON public.coupons
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );
-- Restringe colunas sensíveis: revoga acesso amplo e concede apenas o necessário
REVOKE SELECT ON public.coupons FROM anon, authenticated;
GRANT SELECT (id, code, type, value, min_order_value, max_discount, usage_limit, usage_count, start_date, end_date, is_active, product_ids, category_ids)
  ON public.coupons TO anon, authenticated;

-- 4) storage.objects: UPDATE/DELETE para order-files (admins)
DROP POLICY IF EXISTS "Admins can update order files" ON storage.objects;
CREATE POLICY "Admins can update order files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'order-files' AND public.has_admin_access(auth.uid()))
  WITH CHECK (bucket_id = 'order-files' AND public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete order files" ON storage.objects;
CREATE POLICY "Admins can delete order files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-files' AND public.has_admin_access(auth.uid()));

-- 5) Buckets públicos: bloquear LISTING (lista path = '') para anon/auth
-- Mantém leitura individual de arquivos, mas impede listagem de diretórios.
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
CREATE POLICY "Anyone can view review images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'review-images'
    AND (
      public.has_admin_access(auth.uid())
      OR (storage.foldername(name))[1] IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Anyone can view admin uploads" ON storage.objects;
CREATE POLICY "Anyone can view admin uploads"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'admin-uploads'
    AND (
      public.has_admin_access(auth.uid())
      OR (storage.foldername(name))[1] IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Anyone can view video stories files" ON storage.objects;
CREATE POLICY "Anyone can view video stories files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'video-stories'
    AND (
      public.has_admin_access(auth.uid())
      OR (storage.foldername(name))[1] IS NOT NULL
    )
  );

-- 6) SECURITY DEFINER: revogar EXECUTE de papéis públicos onde não devem ser chamadas externamente
REVOKE EXECUTE ON FUNCTION public.log_audit_action() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- lookup_tracking é usada pela página pública de rastreio: mantém execução pública controlada
-- has_admin_access / is_admin_or_editor / has_role permanecem chamáveis (necessárias para RLS via auth.uid()).