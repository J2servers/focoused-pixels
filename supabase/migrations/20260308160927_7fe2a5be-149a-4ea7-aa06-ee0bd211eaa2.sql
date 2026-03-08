
-- Triggers de auditoria (com IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_quotes') THEN
    CREATE TRIGGER audit_quotes
      AFTER INSERT OR UPDATE OR DELETE ON public.quotes
      FOR EACH ROW EXECUTE FUNCTION log_audit_action();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_coupons') THEN
    CREATE TRIGGER audit_coupons
      AFTER INSERT OR UPDATE OR DELETE ON public.coupons
      FOR EACH ROW EXECUTE FUNCTION log_audit_action();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_user_roles') THEN
    CREATE TRIGGER audit_user_roles
      AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
      FOR EACH ROW EXECUTE FUNCTION log_audit_action();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_payment_credentials') THEN
    CREATE TRIGGER audit_payment_credentials
      AFTER INSERT OR UPDATE OR DELETE ON public.payment_credentials
      FOR EACH ROW EXECUTE FUNCTION log_audit_action();
  END IF;
END;
$$;
