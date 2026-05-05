
-- Plataformas suportadas
CREATE TYPE public.ads_platform AS ENUM (
  'meta', 'google_ads', 'ga4', 'tiktok', 'kwai', 'pinterest',
  'awin', 'hotmart', 'eduzz', 'shopee_ads', 'mercado_livre_ads'
);

-- Configuração por plataforma
CREATE TABLE public.ads_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.ads_platform NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  -- IDs públicos (seguros para frontend)
  pixel_id TEXT,
  account_id TEXT,
  measurement_id TEXT,
  conversion_id TEXT,
  conversion_label TEXT,
  domain_verification_id TEXT,
  -- Flags de capacidade
  pixel_enabled BOOLEAN NOT NULL DEFAULT true,
  capi_enabled BOOLEAN NOT NULL DEFAULT false,
  catalog_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  metrics_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  -- Refs a secrets do Vault (nomes apenas, valores ficam fora do banco)
  capi_token_secret_name TEXT,
  api_token_secret_name TEXT,
  -- Configuração JSON livre (test_event_code, custom_audiences etc)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_metrics_sync_at TIMESTAMPTZ,
  last_catalog_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Métricas históricas (1 linha por dia × plataforma × campanha)
CREATE TABLE public.ads_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.ads_platform NOT NULL,
  metric_date DATE NOT NULL,
  campaign_id TEXT,
  campaign_name TEXT,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, metric_date, campaign_id)
);

-- Log de eventos CAPI enviados
CREATE TABLE public.ads_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.ads_platform NOT NULL,
  event_name TEXT NOT NULL,
  event_id TEXT,
  order_id UUID,
  status TEXT NOT NULL,
  http_status INTEGER,
  request_payload JSONB,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ads_metrics_date ON public.ads_metrics (metric_date DESC, platform);
CREATE INDEX idx_ads_events_log_created ON public.ads_events_log (created_at DESC);
CREATE INDEX idx_ads_events_log_order ON public.ads_events_log (order_id);

-- View pública somente com flags + IDs públicos (seguro para o frontend ler sem auth)
CREATE OR REPLACE VIEW public.ads_pixels_public AS
SELECT platform, display_name, pixel_id, measurement_id, conversion_id, conversion_label, domain_verification_id, config
FROM public.ads_integrations
WHERE enabled = true AND pixel_enabled = true;

ALTER TABLE public.ads_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_events_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ads integrations"
ON public.ads_integrations FOR ALL TO authenticated
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins read ads metrics"
ON public.ads_metrics FOR SELECT TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins read ads events log"
ON public.ads_events_log FOR SELECT TO authenticated
USING (public.has_admin_access(auth.uid()));

-- Trigger updated_at
CREATE TRIGGER update_ads_integrations_updated_at
BEFORE UPDATE ON public.ads_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed das 10 plataformas (todas desabilitadas, admin habilita conforme conecta)
INSERT INTO public.ads_integrations (platform, display_name, capi_token_secret_name, api_token_secret_name) VALUES
  ('meta', 'Meta Ads (Facebook/Instagram)', 'META_CAPI_TOKEN', 'META_CAPI_TOKEN'),
  ('google_ads', 'Google Ads', NULL, 'GOOGLE_ADS_DEVELOPER_TOKEN'),
  ('ga4', 'Google Analytics 4', 'GA4_API_SECRET', 'GA4_API_SECRET'),
  ('tiktok', 'TikTok Ads', 'TIKTOK_CAPI_TOKEN', 'TIKTOK_API_TOKEN'),
  ('kwai', 'Kwai for Business', 'KWAI_CAPI_TOKEN', 'KWAI_CAPI_TOKEN'),
  ('pinterest', 'Pinterest Ads', 'PINTEREST_CAPI_TOKEN', 'PINTEREST_API_TOKEN'),
  ('awin', 'Awin (Afiliados)', NULL, 'AWIN_API_TOKEN'),
  ('hotmart', 'Hotmart', NULL, 'HOTMART_API_TOKEN'),
  ('eduzz', 'Eduzz', NULL, 'EDUZZ_API_TOKEN'),
  ('shopee_ads', 'Shopee Ads', NULL, NULL),
  ('mercado_livre_ads', 'Mercado Livre Ads', NULL, 'ML_ADS_API_TOKEN');
