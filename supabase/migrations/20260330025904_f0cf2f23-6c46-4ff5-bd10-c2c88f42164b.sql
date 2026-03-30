
-- Fix RLS: restrict management to admins only
DROP POLICY IF EXISTS "Authenticated users can manage video stories" ON public.video_stories;
CREATE POLICY "Admins can manage video stories"
  ON public.video_stories FOR ALL
  TO authenticated
  USING (has_admin_access(auth.uid()))
  WITH CHECK (has_admin_access(auth.uid()));

-- Create storage bucket for video stories
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-stories', 'video-stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: anyone can view, admins can upload/delete
CREATE POLICY "Anyone can view video stories files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'video-stories');

CREATE POLICY "Admins can upload video stories files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'video-stories' AND has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete video stories files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'video-stories' AND has_admin_access(auth.uid()));
