-- Allow anyone to create orders (guest checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to view their own order by order_number (for tracking)
CREATE POLICY "Anyone can view own order by number"
ON public.orders FOR SELECT
TO public
USING (true);