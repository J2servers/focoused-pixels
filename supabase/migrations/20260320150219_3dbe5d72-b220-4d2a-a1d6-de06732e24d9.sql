
DROP POLICY IF EXISTS "Authenticated users can view own orders by email" ON public.orders;

CREATE POLICY "Authenticated users can view own orders by email"
ON public.orders
FOR SELECT
TO authenticated
USING (
  customer_email = (auth.jwt() ->> 'email')
);
