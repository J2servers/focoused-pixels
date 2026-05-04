-- =========================================================================
-- WAVE 1 — CRITICAL HARDENING
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1) PRICE VALIDATION TRIGGER on orders
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_subtotal numeric := 0;
  expected_total numeric;
  item jsonb;
  item_qty numeric;
  item_price numeric;
BEGIN
  -- Skip if items array is empty (admin manual orders)
  IF NEW.items IS NULL OR jsonb_array_length(NEW.items) = 0 THEN
    RETURN NEW;
  END IF;

  -- Recompute subtotal from items[]
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    item_qty := COALESCE((item->>'quantity')::numeric, 1);
    item_price := COALESCE((item->>'price')::numeric, 0);
    IF item_qty <= 0 OR item_price < 0 THEN
      RAISE EXCEPTION 'Invalid item in order: quantity=%, price=%', item_qty, item_price
        USING ERRCODE = 'check_violation';
    END IF;
    computed_subtotal := computed_subtotal + (item_qty * item_price);
  END LOOP;

  -- Tolerance R$ 0.01 for rounding
  IF ABS(computed_subtotal - COALESCE(NEW.subtotal, 0)) > 0.01 THEN
    RAISE EXCEPTION 'Order subtotal mismatch: client sent %, computed %', NEW.subtotal, computed_subtotal
      USING ERRCODE = 'check_violation';
  END IF;

  expected_total := computed_subtotal + COALESCE(NEW.shipping_cost, 0) - COALESCE(NEW.discount, 0);
  IF ABS(expected_total - COALESCE(NEW.total, 0)) > 0.01 THEN
    RAISE EXCEPTION 'Order total mismatch: client sent %, expected %', NEW.total, expected_total
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_order_totals_trigger ON public.orders;
CREATE TRIGGER validate_order_totals_trigger
  BEFORE INSERT OR UPDATE OF subtotal, total, items, shipping_cost, discount ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_totals();

-- -------------------------------------------------------------------------
-- 2) STOCK MANAGEMENT TRIGGERS (operates on order_items — canonical source)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.adjust_stock_on_order_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock integer;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.product_id IS NOT NULL THEN
    SELECT stock INTO current_stock FROM public.products WHERE id = NEW.product_id FOR UPDATE;
    IF current_stock IS NULL THEN
      RETURN NEW;
    END IF;
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %: have %, need %',
        NEW.product_id, current_stock, NEW.quantity
        USING ERRCODE = 'check_violation';
    END IF;
    UPDATE public.products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' AND OLD.product_id IS NOT NULL THEN
    UPDATE public.products SET stock = stock + OLD.quantity WHERE id = OLD.product_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS adjust_stock_on_order_item_trigger ON public.order_items;
CREATE TRIGGER adjust_stock_on_order_item_trigger
  AFTER INSERT OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.adjust_stock_on_order_item();

-- Restore stock when order is cancelled/refunded
CREATE OR REPLACE FUNCTION public.restore_stock_on_order_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
BEGIN
  IF NEW.order_status IN ('cancelled', 'refunded')
     AND OLD.order_status NOT IN ('cancelled', 'refunded') THEN
    FOR rec IN SELECT product_id, quantity FROM public.order_items
               WHERE order_id = NEW.id AND product_id IS NOT NULL
    LOOP
      UPDATE public.products SET stock = stock + rec.quantity WHERE id = rec.product_id;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restore_stock_on_order_cancel_trigger ON public.orders;
CREATE TRIGGER restore_stock_on_order_cancel_trigger
  AFTER UPDATE OF order_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_order_cancel();

-- -------------------------------------------------------------------------
-- 3) LOGIN ATTEMPTS — secure RPC + policy fix
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  _email_hash text,
  _ip_hash text,
  _user_agent_hash text,
  _success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email_hash, ip_hash, user_agent_hash, success)
  VALUES (
    LEFT(COALESCE(_email_hash, ''), 128),
    LEFT(COALESCE(_ip_hash, ''), 128),
    LEFT(COALESCE(_user_agent_hash, ''), 128),
    COALESCE(_success, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_login_attempt(text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, text, text, boolean) TO anon, authenticated, service_role;

-- -------------------------------------------------------------------------
-- 4) Fix Security Definer View — recreate login_page_settings with security_invoker
-- -------------------------------------------------------------------------
DROP VIEW IF EXISTS public.login_page_settings;
CREATE VIEW public.login_page_settings
WITH (security_invoker = true)
AS SELECT login_logo, login_bg_image, login_title, login_subtitle,
          login_logo_height, login_title_size, login_subtitle_size,
          login_brand_text, company_name, header_logo
   FROM public.company_info
   ORDER BY updated_at DESC, id DESC
   LIMIT 1;
GRANT SELECT ON public.login_page_settings TO anon, authenticated;

-- Also harden the other public views with security_invoker
DROP VIEW IF EXISTS public.products_public CASCADE;
CREATE VIEW public.products_public
WITH (security_invoker = true)
AS SELECT id, name, slug, short_description, full_description, price, promotional_price,
          stock, sku, status, cover_image, gallery_images, category_id, tags, is_featured,
          attributes, deleted_at, created_at, updated_at, min_stock,
          weight_kg, length_cm, width_cm, height_cm
   FROM public.products
   WHERE status = 'active' AND deleted_at IS NULL;
GRANT SELECT ON public.products_public TO anon, authenticated;

DROP VIEW IF EXISTS public.reviews_public CASCADE;
CREATE VIEW public.reviews_public
WITH (security_invoker = true)
AS SELECT id, product_slug, customer_name, rating, title, comment, images,
          is_verified_purchase, created_at, updated_at
   FROM public.reviews
   WHERE is_approved = true;
GRANT SELECT ON public.reviews_public TO anon, authenticated;

DROP VIEW IF EXISTS public.coupons_public CASCADE;
CREATE VIEW public.coupons_public
WITH (security_invoker = true)
AS SELECT id, code, type, value, min_order_value, max_discount, start_date, end_date
   FROM public.coupons
   WHERE is_active = true;
GRANT SELECT ON public.coupons_public TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 5) REVOKE EXECUTE on internal SECURITY DEFINER functions
-- -------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.refresh_company_info_public() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_action() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_reviews_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- Keep public access only on safe lookups
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_access(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_tracking(text) TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 6) FIX permissive WITH CHECK(true) policy on webhook_logs
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;
CREATE POLICY "Service role and admins insert webhook logs"
  ON public.webhook_logs
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    auth.role() = 'service_role' OR public.has_admin_access(auth.uid())
  );