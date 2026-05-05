
CREATE TABLE IF NOT EXISTS public.seo_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_by UUID,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_issues INTEGER NOT NULL DEFAULT 0,
  critical_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  info_count INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER
);

ALTER TABLE public.seo_audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view seo audit reports"
ON public.seo_audit_reports FOR SELECT
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can insert seo audit reports"
ON public.seo_audit_reports FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete seo audit reports"
ON public.seo_audit_reports FOR DELETE
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_seo_audit_reports_created_at ON public.seo_audit_reports (created_at DESC);
