// Cron diário: puxa métricas (spend, impressões, cliques, conversões) das
// plataformas com API REST simples (Meta, TikTok, Pinterest) e salva em ads_metrics.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

interface MetricRow {
  platform: string; metric_date: string; campaign_id: string | null; campaign_name: string | null;
  spend: number; impressions: number; clicks: number; conversions: number; conversion_value: number;
  raw: unknown;
}

async function syncMeta(account_id: string, token: string, date: string): Promise<MetricRow[]> {
  const url = `https://graph.facebook.com/v19.0/act_${account_id}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,clicks,actions,action_values&time_range[since]=${date}&time_range[until]=${date}&access_token=${token}`;
  const r = await fetch(url);
  const j = await r.json() as { data?: Array<Record<string, unknown>>; error?: unknown };
  if (j.error) throw new Error(JSON.stringify(j.error));
  return (j.data || []).map(d => {
    const purchases = ((d.actions as Array<{ action_type: string; value: string }>) || []).find(a => a.action_type === 'purchase');
    const purchaseValues = ((d.action_values as Array<{ action_type: string; value: string }>) || []).find(a => a.action_type === 'purchase');
    return {
      platform: 'meta', metric_date: date,
      campaign_id: d.campaign_id as string, campaign_name: d.campaign_name as string,
      spend: parseFloat(d.spend as string || '0'),
      impressions: parseInt(d.impressions as string || '0'),
      clicks: parseInt(d.clicks as string || '0'),
      conversions: purchases ? parseInt(purchases.value) : 0,
      conversion_value: purchaseValues ? parseFloat(purchaseValues.value) : 0,
      raw: d,
    };
  });
}

async function syncTikTok(advertiser_id: string, token: string, date: string): Promise<MetricRow[]> {
  const body = {
    advertiser_id, report_type: 'BASIC', data_level: 'AUCTION_CAMPAIGN',
    dimensions: ['campaign_id'], metrics: ['campaign_name', 'spend', 'impressions', 'clicks', 'conversion', 'total_purchase_value'],
    start_date: date, end_date: date, page_size: 200,
  };
  const r = await fetch('https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Access-Token': token }, body: JSON.stringify(body),
  });
  const j = await r.json() as { data?: { list?: Array<{ dimensions: Record<string, string>; metrics: Record<string, string> }> }; message?: string; code?: number };
  if (j.code !== 0) throw new Error(j.message || 'TikTok API error');
  return (j.data?.list || []).map(d => ({
    platform: 'tiktok', metric_date: date,
    campaign_id: d.dimensions.campaign_id, campaign_name: d.metrics.campaign_name,
    spend: parseFloat(d.metrics.spend || '0'), impressions: parseInt(d.metrics.impressions || '0'),
    clicks: parseInt(d.metrics.clicks || '0'), conversions: parseInt(d.metrics.conversion || '0'),
    conversion_value: parseFloat(d.metrics.total_purchase_value || '0'), raw: d,
  }));
}

async function syncPinterest(ad_account_id: string, token: string, date: string): Promise<MetricRow[]> {
  const url = `https://api.pinterest.com/v5/ad_accounts/${ad_account_id}/campaigns/analytics?start_date=${date}&end_date=${date}&columns=SPEND_IN_DOLLAR,IMPRESSION_1,CLICKTHROUGH_1,CHECKOUT_ROAS,TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR&granularity=DAY`;
  const r = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const j = await r.json() as Record<string, Array<Record<string, unknown>>>;
  const out: MetricRow[] = [];
  for (const [campaign_id, rows] of Object.entries(j)) {
    if (!Array.isArray(rows)) continue;
    for (const d of rows) {
      out.push({
        platform: 'pinterest', metric_date: date, campaign_id, campaign_name: null,
        spend: Number(d.SPEND_IN_DOLLAR) || 0, impressions: Number(d.IMPRESSION_1) || 0,
        clicks: Number(d.CLICKTHROUGH_1) || 0, conversions: 0,
        conversion_value: (Number(d.TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR) || 0) / 1_000_000, raw: d,
      });
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const date = new URL(req.url).searchParams.get('date') || yesterday();
  const { data: integrations } = await sb.from('ads_integrations')
    .select('platform, account_id, api_token_secret_name')
    .eq('enabled', true).eq('metrics_sync_enabled', true);

  const summary: Record<string, { rows?: number; error?: string }> = {};
  for (const it of integrations || []) {
    const token = it.api_token_secret_name ? Deno.env.get(it.api_token_secret_name) : null;
    if (!token || !it.account_id) { summary[it.platform] = { error: 'missing token or account_id' }; continue; }
    try {
      let rows: MetricRow[] = [];
      if (it.platform === 'meta') rows = await syncMeta(it.account_id, token, date);
      else if (it.platform === 'tiktok') rows = await syncTikTok(it.account_id, token, date);
      else if (it.platform === 'pinterest') rows = await syncPinterest(it.account_id, token, date);
      else { summary[it.platform] = { error: 'platform not implemented for metrics sync' }; continue; }

      if (rows.length > 0) {
        await sb.from('ads_metrics').upsert(rows, { onConflict: 'platform,metric_date,campaign_id' });
      }
      await sb.from('ads_integrations').update({ last_metrics_sync_at: new Date().toISOString() }).eq('platform', it.platform);
      summary[it.platform] = { rows: rows.length };
    } catch (e) {
      summary[it.platform] = { error: (e as Error).message };
    }
  }

  return new Response(JSON.stringify({ success: true, date, summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
