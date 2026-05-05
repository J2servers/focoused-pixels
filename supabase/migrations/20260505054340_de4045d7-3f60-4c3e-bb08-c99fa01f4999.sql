CREATE TABLE IF NOT EXISTS public.system_alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text,
  cron_failure_enabled boolean NOT NULL DEFAULT true,
  pending_notification_enabled boolean NOT NULL DEFAULT true,
  pending_threshold_minutes integer NOT NULL DEFAULT 30,
  cooldown_minutes integer NOT NULL DEFAULT 60,
  last_cron_alert_at timestamptz,
  last_pending_alert_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage alert settings"
  ON public.system_alert_settings
  FOR ALL
  USING (has_admin_access(auth.uid()))
  WITH CHECK (has_admin_access(auth.uid()));

CREATE TRIGGER trg_alert_settings_updated_at
  BEFORE UPDATE ON public.system_alert_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.system_alert_settings (recipient_email)
SELECT NULL
WHERE NOT EXISTS (SELECT 1 FROM public.system_alert_settings);