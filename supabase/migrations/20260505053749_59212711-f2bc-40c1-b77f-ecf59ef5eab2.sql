-- ============ system_errors ============
CREATE TABLE IF NOT EXISTS public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT 'error' CHECK (level IN ('fatal','error','warning','info')),
  source text NOT NULL DEFAULT 'frontend' CHECK (source IN ('frontend','edge_function','database','cron','webhook','payment')),
  message text NOT NULL,
  stack text,
  context jsonb DEFAULT '{}'::jsonb,
  url text,
  user_agent text,
  user_id uuid,
  fingerprint text,
  occurrences integer NOT NULL DEFAULT 1,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON public.system_errors (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_level ON public.system_errors (level) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_system_errors_fingerprint ON public.system_errors (fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_errors_source ON public.system_errors (source);

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert errors" ON public.system_errors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view errors" ON public.system_errors
  FOR SELECT USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins update errors" ON public.system_errors
  FOR UPDATE USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins delete errors" ON public.system_errors
  FOR DELETE USING (public.has_admin_access(auth.uid()));

CREATE TRIGGER trg_system_errors_updated_at
  BEFORE UPDATE ON public.system_errors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ system_metrics ============
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  rating text CHECK (rating IN ('good','needs-improvement','poor')),
  url text,
  user_agent text,
  device_type text,
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name_created ON public.system_metrics (metric_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON public.system_metrics (created_at DESC);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view metrics" ON public.system_metrics
  FOR SELECT USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins delete metrics" ON public.system_metrics
  FOR DELETE USING (public.has_admin_access(auth.uid()));

-- ============ atualizar cleanup ============
CREATE OR REPLACE FUNCTION public.cleanup_old_telemetry()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.page_views WHERE created_at < now() - interval '7 days';
  DELETE FROM public.audit_logs WHERE created_at < now() - interval '90 days';
  DELETE FROM public.notification_failures WHERE resolved = true AND updated_at < now() - interval '30 days';
  DELETE FROM public.system_errors WHERE resolved = true AND updated_at < now() - interval '30 days';
  DELETE FROM public.system_metrics WHERE created_at < now() - interval '14 days';
$$;