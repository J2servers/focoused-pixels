-- =============================================
-- SECURITY HARDENING MIGRATION
-- =============================================

-- 1. FIX PUBLIC_DATA_EXPOSURE: Restrict quotes table to admins only
-- =============================================
DROP POLICY IF EXISTS "Anyone can read quotes" ON public.quotes;

CREATE POLICY "Admins can view all quotes" ON public.quotes
FOR SELECT USING (has_admin_access(auth.uid()));

-- 2. FIX STORAGE_EXPOSURE: Secure storage buckets
-- =============================================

-- Make quote-attachments bucket private (contains sensitive customer data)
UPDATE storage.buckets SET public = false WHERE id = 'quote-attachments';

-- Drop any existing permissive storage policies
DROP POLICY IF EXISTS "Anyone can view quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view admin uploads" ON storage.objects;

-- Quote attachments: Only admins can access
CREATE POLICY "Admins can view quote attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'quote-attachments' AND has_admin_access(auth.uid()));

CREATE POLICY "Admins can upload quote attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'quote-attachments' AND has_admin_access(auth.uid()));

CREATE POLICY "Admins can update quote attachments" ON storage.objects
FOR UPDATE USING (bucket_id = 'quote-attachments' AND has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete quote attachments" ON storage.objects
FOR DELETE USING (bucket_id = 'quote-attachments' AND has_admin_access(auth.uid()));

-- Review images: Public read, authenticated upload only
CREATE POLICY "Anyone can view review images" ON storage.objects
FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

-- Admin uploads: Public read, admin/editor upload only
CREATE POLICY "Anyone can view admin uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-uploads');

CREATE POLICY "Admins and editors can manage admin uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'admin-uploads' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update admin uploads" ON storage.objects
FOR UPDATE USING (bucket_id = 'admin-uploads' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete admin uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'admin-uploads' AND is_admin_or_editor(auth.uid()));

-- 3. FIX DEFINER_OR_RPC_BYPASS: Add validation to audit function
-- =============================================
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate operation context
  IF TG_OP NOT IN ('INSERT', 'UPDATE', 'DELETE') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  
  -- Only log if user is authenticated and has admin access
  IF auth.uid() IS NOT NULL AND has_admin_access(auth.uid()) THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data, ip_address)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
      current_setting('request.headers', true)::json->>'x-real-ip'
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;