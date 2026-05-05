import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PixelConfig {
  platform: string;
  pixel_id: string | null;
  measurement_id: string | null;
  conversion_id: string | null;
  conversion_label: string | null;
  domain_verification_id: string | null;
  config: Record<string, unknown> | null;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { load: (id: string) => void; page: () => void; track: (e: string, p?: unknown) => void; instance: (id: string) => unknown };
    pintrk?: (...args: unknown[]) => void;
    kwaiq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    AwinChannelData?: unknown;
    awin_account_id?: string;
    _fbq?: unknown;
  }
}

function loadScript(src: string, id: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id; s.async = true; s.src = src;
  document.head.appendChild(s);
}

function injectMeta(pixelId: string): void {
  if (window.fbq) return;
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return; const n: any = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement; t.async = true; t.src = v;
    const s = b.getElementsByTagName(e)[0]; s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');
}

function injectGA4(measurementId: string): void {
  if (window.gtag) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`, 'ga4-script');
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); } as typeof window.gtag;
  window.gtag?.('js', new Date());
  window.gtag?.('config', measurementId);
}

function injectGoogleAds(conversionId: string): void {
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${conversionId}`, `gads-${conversionId}`);
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) window.gtag = function () { window.dataLayer!.push(arguments); } as typeof window.gtag;
  window.gtag?.('config', conversionId);
}

function injectTikTok(pixelId: string): void {
  if (window.ttq) return;
  /* eslint-disable */
  (function (w: any, d: Document, t: string) {
    w.TiktokAnalyticsObject = t; const ttq: any = w[t] = w[t] || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
    ttq.setAndDefer = function (t: any, e: string) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t: string) { const e = ttq._i[t] || []; for (let n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
    ttq.load = function (e: string) { const n = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); ttq._o = ttq._o || {}; ttq._o[e] = {}; const o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = n + '?sdkid=' + e + '&lib=' + t; const a = d.getElementsByTagName('script')[0]; a.parentNode?.insertBefore(o, a); };
    ttq.load(pixelId); ttq.page();
  })(window, document, 'ttq');
  /* eslint-enable */
}

function injectPinterest(pixelId: string): void {
  if (window.pintrk) return;
  /* eslint-disable */
  (function (e: any, t: string) { if (!e.pintrk) { e.pintrk = function () { e.pintrk.queue.push(Array.prototype.slice.call(arguments)); }; const n = e.pintrk; n.queue = []; n.version = '3.0'; const r = document.createElement('script'); r.async = !0; r.src = t; const i = document.getElementsByTagName('script')[0]; i.parentNode?.insertBefore(r, i); } })(window, 'https://s.pinimg.com/ct/core.js');
  /* eslint-enable */
  window.pintrk?.('load', pixelId);
  window.pintrk?.('page');
}

function injectKwai(pixelId: string): void {
  if (window.kwaiq) return;
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.kwaiq) return; const n: any = f.kwaiq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    n.push = n; n.loaded = !0; n.version = '1.0'; n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement; t.async = !0; t.src = v;
    const s = b.getElementsByTagName(e)[0]; s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://s1.kwai.net/kos/s101/nlav11187/pixel/events.js');
  /* eslint-enable */
  window.kwaiq?.('init', pixelId);
  window.kwaiq?.('track', 'PageView');
}

function injectAwin(advertiserId: string): void {
  window.awin_account_id = advertiserId;
  loadScript(`https://www.dwin1.com/${advertiserId}.js`, 'awin-mastertag');
}

function injectHotmart(_id: string): void {
  loadScript('https://static.hotmart.com/checkout/widget.min.js', 'hotmart-widget');
}

export default function AdsPixelManager() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('ads_pixels_public').select('*');
      if (cancelled || !data) return;

      for (const p of data as PixelConfig[]) {
        try {
          switch (p.platform) {
            case 'meta': if (p.pixel_id) injectMeta(p.pixel_id); break;
            case 'ga4': if (p.measurement_id) injectGA4(p.measurement_id); break;
            case 'google_ads': if (p.conversion_id) injectGoogleAds(p.conversion_id); break;
            case 'tiktok': if (p.pixel_id) injectTikTok(p.pixel_id); break;
            case 'pinterest': if (p.pixel_id) injectPinterest(p.pixel_id); break;
            case 'kwai': if (p.pixel_id) injectKwai(p.pixel_id); break;
            case 'awin': if (p.account_id ?? p.pixel_id) injectAwin((p as unknown as { account_id?: string }).account_id || p.pixel_id || ''); break;
            case 'hotmart': if (p.pixel_id) injectHotmart(p.pixel_id); break;
          }
        } catch (err) {
          console.warn(`[AdsPixel] Falha ao injetar ${p.platform}:`, err);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return null;
}
