
-- Cadência de lembretes em carrinhos
ALTER TABLE public.abandoned_cart_sessions
  ADD COLUMN IF NOT EXISTS reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS browser_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Cadência para pedidos aguardando pagamento
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reminder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_reminder_at timestamptz;

-- Browser metadata para leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS browser_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Auditoria de execuções de cron
CREATE TABLE IF NOT EXISTS public.system_cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running',
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text
);
CREATE INDEX IF NOT EXISTS idx_cron_runs_job_started ON public.system_cron_runs(job_name, started_at DESC);
ALTER TABLE public.system_cron_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage cron runs" ON public.system_cron_runs;
CREATE POLICY "Admins manage cron runs" ON public.system_cron_runs
  FOR ALL USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

-- Falhas de notificação para retry
CREATE TABLE IF NOT EXISTS public.notification_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  event_name text NOT NULL,
  recipient text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_fail_pending ON public.notification_failures(resolved, next_retry_at);
ALTER TABLE public.notification_failures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage failures" ON public.notification_failures;
CREATE POLICY "Admins manage failures" ON public.notification_failures
  FOR ALL USING (has_admin_access(auth.uid())) WITH CHECK (has_admin_access(auth.uid()));

-- Índices úteis para cron
CREATE INDEX IF NOT EXISTS idx_orders_pending_payment
  ON public.orders(payment_status, created_at)
  WHERE payment_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_abandoned_active
  ON public.abandoned_cart_sessions(recovered, last_activity_at)
  WHERE recovered = false;
