-- Foreign Keys (with safe NOT VALID then VALIDATE pattern to avoid blocking)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey') THEN
    -- Clean orphans first
    DELETE FROM public.order_items WHERE order_id NOT IN (SELECT id FROM public.orders);
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey') THEN
    UPDATE public.order_items SET product_id = NULL WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM public.products);
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_quote_id_fkey') THEN
    UPDATE public.orders SET quote_id = NULL WHERE quote_id IS NOT NULL AND quote_id NOT IN (SELECT id FROM public.quotes);
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_quote_id_fkey
      FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_parent_id_fkey') THEN
    UPDATE public.categories SET parent_id = NULL WHERE parent_id IS NOT NULL AND parent_id NOT IN (SELECT id FROM public.categories);
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_hash ON public.login_attempts(ip_hash);
CREATE INDEX IF NOT EXISTS idx_abandoned_sessions_session_id ON public.abandoned_cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_sessions_last_activity ON public.abandoned_cart_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_failures_resolved ON public.notification_failures(resolved, next_retry_at);

-- Retention function
CREATE OR REPLACE FUNCTION public.cleanup_old_telemetry()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.page_views WHERE created_at < now() - interval '7 days';
  DELETE FROM public.audit_logs WHERE created_at < now() - interval '90 days';
  DELETE FROM public.notification_failures WHERE resolved = true AND updated_at < now() - interval '30 days';
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_telemetry() FROM public, anon, authenticated;