DO $$
DECLARE
  v_key text;
BEGIN
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets
  WHERE name IN ('cron_service_role_key','service_role_key','email_queue_service_role_key')
  ORDER BY name LIMIT 1;

  IF v_key IS NULL THEN
    RAISE NOTICE 'No service_role key in vault; skipping cron schedule. Add it later and re-run.';
    RETURN;
  END IF;

  PERFORM cron.unschedule('system-alerts-monitor')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='system-alerts-monitor');

  PERFORM cron.schedule(
    'system-alerts-monitor',
    '*/10 * * * *',
    format($cron$
      SELECT net.http_post(
        url := 'https://uhjamkueajhzsvcefgtp.supabase.co/functions/v1/system-alerts-monitor',
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer %s'),
        body := '{}'::jsonb
      ) AS request_id;
    $cron$, v_key)
  );
END $$;