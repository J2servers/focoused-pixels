
CREATE TABLE IF NOT EXISTS public.seo_cache (
  cache_key TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  url_count INTEGER NOT NULL DEFAULT 0,
  product_count INTEGER NOT NULL DEFAULT 0,
  category_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read seo cache"
ON public.seo_cache FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can upsert seo cache"
ON public.seo_cache FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can update seo cache"
ON public.seo_cache FOR UPDATE
TO authenticated
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));
