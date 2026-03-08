
-- ============================================
-- PARTE 1: Tabela payment_credentials + RLS + dados + função + policies
-- ============================================

-- Criar tabela segura para credenciais de pagamento
CREATE TABLE public.payment_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_gateway_primary text DEFAULT 'mercadopago',
  mercadopago_enabled boolean DEFAULT false,
  mercadopago_public_key text,
  mercadopago_access_token text,
  mercadopago_sandbox boolean DEFAULT true,
  efi_enabled boolean DEFAULT false,
  efi_client_id text,
  efi_client_secret text,
  efi_sandbox boolean DEFAULT true,
  efi_pix_key text,
  pagseguro_enabled boolean DEFAULT false,
  pagseguro_email text,
  pagseguro_token text,
  pagseguro_sandbox boolean DEFAULT true,
  stripe_enabled boolean DEFAULT false,
  stripe_public_key text,
  stripe_secret_key text,
  stripe_sandbox boolean DEFAULT true,
  asaas_enabled boolean DEFAULT false,
  asaas_api_key text,
  asaas_sandbox boolean DEFAULT true,
  payment_methods_enabled text[] DEFAULT ARRAY['pix','credit_card','boleto'],
  pix_discount_percent numeric DEFAULT 5,
  boleto_extra_days integer DEFAULT 3,
  max_installments integer DEFAULT 12,
  min_installment_value numeric DEFAULT 50,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.payment_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment credentials"
  ON public.payment_credentials FOR ALL
  USING (is_admin_or_editor(auth.uid()));

-- Migrar dados existentes
INSERT INTO public.payment_credentials (
  payment_gateway_primary, mercadopago_enabled, mercadopago_public_key, mercadopago_access_token,
  mercadopago_sandbox, efi_enabled, efi_client_id, efi_client_secret, efi_sandbox, efi_pix_key,
  pagseguro_enabled, pagseguro_email, pagseguro_token, pagseguro_sandbox,
  stripe_enabled, stripe_public_key, stripe_secret_key, stripe_sandbox,
  asaas_enabled, asaas_api_key, asaas_sandbox,
  payment_methods_enabled, pix_discount_percent, boleto_extra_days, max_installments, min_installment_value
)
SELECT
  payment_gateway_primary, mercadopago_enabled, mercadopago_public_key, mercadopago_access_token,
  mercadopago_sandbox, efi_enabled, efi_client_id, efi_client_secret, efi_sandbox, efi_pix_key,
  pagseguro_enabled, pagseguro_email, pagseguro_token, pagseguro_sandbox,
  stripe_enabled, stripe_public_key, stripe_secret_key, stripe_sandbox,
  asaas_enabled, asaas_api_key, asaas_sandbox,
  payment_methods_enabled, pix_discount_percent, boleto_extra_days, max_installments, min_installment_value
FROM public.company_info
ORDER BY updated_at DESC
LIMIT 1;

-- Limpar dados sensíveis da tabela pública
UPDATE public.company_info SET
  mercadopago_access_token = NULL,
  efi_client_id = NULL,
  efi_client_secret = NULL,
  efi_pix_key = NULL,
  pagseguro_token = NULL,
  stripe_secret_key = NULL,
  asaas_api_key = NULL;

-- Corrigir função has_admin_access
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor', 'support')
  )
$$;

-- Policies para reviews (admin UPDATE/DELETE)
CREATE POLICY "Admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (has_admin_access(auth.uid()));

-- Policies para quotes (admin UPDATE/DELETE)
CREATE POLICY "Admins can update quotes"
  ON public.quotes FOR UPDATE
  USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins can delete quotes"
  ON public.quotes FOR DELETE
  USING (has_admin_access(auth.uid()));
