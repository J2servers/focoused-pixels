
CREATE TABLE public.video_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  duration_seconds INT,
  tags TEXT[],
  cta_text TEXT,
  cta_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active video stories"
  ON public.video_stories FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage video stories"
  ON public.video_stories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
