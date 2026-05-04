REVOKE EXECUTE ON FUNCTION public.validate_order_totals() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.adjust_stock_on_order_item() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.restore_stock_on_order_cancel() FROM anon, authenticated, PUBLIC;