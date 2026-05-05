// CAPI server-side dispatcher — envia eventos (Purchase, Lead, AddToCart) para
// Meta, TikTok, Pinterest, Kwai e GA4 Measurement Protocol.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

import { authorizeAdminOrService } from '../_shared/edge-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CapiPayload {
  event_name: 'Purchase' | 'Lead' | 'AddToCart' | 'InitiateCheckout' | 'ViewContent';
  event_id: string;
  order_id?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  client_user_agent?: string;
  client_ip?: string;
  fbp?: string;
  fbc?: string;
  ttclid?: string;
  source_url?: string;
  contents?: Array<{ id: string; quantity: number; price: number }>;
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function dispatchMeta(cfg: { pixel_id: string; token: string; test_event_code?: string }, p: CapiPayload) {
  const userData: Record<string, string | string[]> = {};
  if (p.email) userData.em = [await sha256(p.email)];
  if (p.phone) userData.ph = [await sha256(p.phone.replace(/\D/g, ''))];
  if (p.client_ip) userData.client_ip_address = p.client_ip;
  if (p.client_user_agent) userData.client_user_agent = p.client_user_agent;
  if (p.fbp) userData.fbp = p.fbp;
  if (p.fbc) userData.fbc = p.fbc;

  const body = {
    data: [{
      event_name: p.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: p.event_id,
      action_source: 'website',
      event_source_url: p.source_url,
      user_data: userData,
      custom_data: {
        currency: p.currency || 'BRL',
        value: p.value || 0,
        contents: p.contents,
      },
    }],
    test_event_code: cfg.test_event_code,
  };
  const r = await fetch(`https://graph.facebook.com/v19.0/${cfg.pixel_id}/events?access_token=${cfg.token}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json() };
}

async function dispatchTikTok(cfg: { pixel_id: string; token: string }, p: CapiPayload) {
  const body = {
    event_source: 'web',
    event_source_id: cfg.pixel_id,
    data: [{
      event: p.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: p.event_id,
      user: {
        email: p.email ? await sha256(p.email) : undefined,
        phone: p.phone ? await sha256(p.phone.replace(/\D/g, '')) : undefined,
        ip: p.client_ip, user_agent: p.client_user_agent, ttclid: p.ttclid,
      },
      properties: { currency: p.currency || 'BRL', value: p.value || 0, contents: p.contents },
      page: { url: p.source_url },
    }],
  };
  const r = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Access-Token': cfg.token },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json() };
}

async function dispatchPinterest(cfg: { ad_account_id: string; token: string }, p: CapiPayload) {
  const body = {
    data: [{
      event_name: p.event_name === 'Purchase' ? 'checkout' : p.event_name === 'AddToCart' ? 'add_to_cart' : 'lead',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: p.event_id,
      event_source_url: p.source_url,
      user_data: {
        em: p.email ? [await sha256(p.email)] : undefined,
        ph: p.phone ? [await sha256(p.phone.replace(/\D/g, ''))] : undefined,
        client_ip_address: p.client_ip, client_user_agent: p.client_user_agent,
      },
      custom_data: { currency: p.currency || 'BRL', value: String(p.value || 0) },
    }],
  };
  const r = await fetch(`https://api.pinterest.com/v5/ad_accounts/${cfg.ad_account_id}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.token}` },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json() };
}

async function dispatchKwai(cfg: { pixel_id: string; token: string }, p: CapiPayload) {
  const body = {
    pixelId: cfg.pixel_id, accessToken: cfg.token,
    testFlag: false,
    data: [{
      eventName: p.event_name === 'Purchase' ? 'purchase' : p.event_name.toLowerCase(),
      eventTime: Math.floor(Date.now() / 1000),
      eventId: p.event_id,
      contextInfo: { ip: p.client_ip, userAgent: p.client_user_agent, content: p.source_url },
      properties: {
        currency: p.currency || 'BRL', value: p.value || 0,
        emailHash: p.email ? await sha256(p.email) : undefined,
        phoneHash: p.phone ? await sha256(p.phone.replace(/\D/g, '')) : undefined,
      },
    }],
  };
  const r = await fetch('https://www.adsnebula.com/log/common/api', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}

async function dispatchGA4(cfg: { measurement_id: string; api_secret: string }, p: CapiPayload, client_id: string) {
  const body = {
    client_id,
    events: [{
      name: p.event_name === 'Purchase' ? 'purchase' : p.event_name.toLowerCase(),
      params: {
        transaction_id: p.event_id, currency: p.currency || 'BRL', value: p.value || 0,
        items: p.contents?.map(c => ({ item_id: c.id, quantity: c.quantity, price: c.price })),
      },
    }],
  };
  const r = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${cfg.measurement_id}&api_secret=${cfg.api_secret}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, body: r.status === 204 ? { ok: true } : await r.json().catch(() => ({})) };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json() as CapiPayload & { client_id?: string };
    if (!payload.event_name || !payload.event_id) {
      return new Response(JSON.stringify({ error: 'event_name and event_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Authorization: service-role / admin user OR (for browser checkout flow) the
    // event must reference a real order_id that exists in the database. This
    // prevents anonymous attackers from injecting arbitrary fake conversions.
    const authCtx = await authorizeAdminOrService(req);
    if (!authCtx.ok) {
      if (!payload.order_id) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: order } = await sb.from('orders')
        .select('id, total, customer_email')
        .eq('id', payload.order_id)
        .maybeSingle();
      if (!order) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      // Force value/currency to the trusted DB value to prevent inflation attacks.
      payload.value = Number(order.total ?? payload.value ?? 0);
    }

    const { data: integrations } = await sb.from('ads_integrations')
      .select('platform, pixel_id, account_id, measurement_id, capi_token_secret_name, config')
      .eq('enabled', true).eq('capi_enabled', true);

    const results: Record<string, unknown> = {};

    for (const it of integrations || []) {
      const token = it.capi_token_secret_name ? Deno.env.get(it.capi_token_secret_name) : null;
      try {
        let res;
        if (it.platform === 'meta' && it.pixel_id && token) {
          res = await dispatchMeta({ pixel_id: it.pixel_id, token, test_event_code: (it.config as Record<string, string>)?.test_event_code }, payload);
        } else if (it.platform === 'tiktok' && it.pixel_id && token) {
          res = await dispatchTikTok({ pixel_id: it.pixel_id, token }, payload);
        } else if (it.platform === 'pinterest' && it.account_id && token) {
          res = await dispatchPinterest({ ad_account_id: it.account_id, token }, payload);
        } else if (it.platform === 'kwai' && it.pixel_id && token) {
          res = await dispatchKwai({ pixel_id: it.pixel_id, token }, payload);
        } else if (it.platform === 'ga4' && it.measurement_id && token) {
          res = await dispatchGA4({ measurement_id: it.measurement_id, api_secret: token }, payload, payload.client_id || payload.event_id);
        } else {
          continue;
        }
        results[it.platform] = res;
        await sb.from('ads_events_log').insert({
          platform: it.platform, event_name: payload.event_name, event_id: payload.event_id,
          order_id: payload.order_id, status: res.status < 400 ? 'sent' : 'error',
          http_status: res.status, response: res.body as Record<string, unknown>,
        });
      } catch (err) {
        const msg = (err as Error).message;
        results[it.platform] = { error: msg };
        await sb.from('ads_events_log').insert({
          platform: it.platform, event_name: payload.event_name, event_id: payload.event_id,
          order_id: payload.order_id, status: 'error', error_message: msg,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
