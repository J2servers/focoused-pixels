
-- 1. Tighten system_errors insert policy
DROP POLICY IF EXISTS "Anyone can insert errors" ON public.system_errors;
CREATE POLICY "Public can insert sanitized errors"
ON public.system_errors
FOR INSERT
TO public
WITH CHECK (
  length(message) BETWEEN 1 AND 4000
  AND (stack IS NULL OR length(stack) <= 8000)
  AND (url IS NULL OR length(url) <= 2000)
  AND (user_agent IS NULL OR length(user_agent) <= 1000)
  AND (fingerprint IS NULL OR length(fingerprint) <= 200)
  AND occurrences >= 1 AND occurrences <= 1
  AND resolved = false
  AND resolved_by IS NULL
  AND resolved_at IS NULL
  AND (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  )
);

-- 2. Tracking events: allow customers to view tracking for their own orders
CREATE POLICY "Customers view tracking for own orders"
ON public.tracking_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = tracking_events.order_id
      AND o.customer_email = (auth.jwt() ->> 'email')
  )
);
