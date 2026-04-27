
-- Restrict whatsapp_templates public read
DROP POLICY IF EXISTS "Anyone can read active whatsapp templates" ON public.whatsapp_templates;

-- Restrict workflow_executions inserts to admins (system uses service role which bypasses RLS)
DROP POLICY IF EXISTS "System can insert executions" ON public.workflow_executions;
CREATE POLICY "Admins can insert workflow executions"
  ON public.workflow_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_access(auth.uid()));

-- Allow customers to read their own order files
CREATE POLICY "Customers can view own order files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'order-files'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.customer_email = (auth.jwt() ->> 'email')
        AND position(o.id::text in storage.objects.name) > 0
    )
  );

-- Tighten review-images uploads: require path prefix with user id
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
CREATE POLICY "Users upload review images under own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'review-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
