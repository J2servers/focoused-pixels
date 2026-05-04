-- Restore base table grants; RLS still constrains row access.
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;