import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: 'duplicate' | 'canonical' | 'robots' | '404' | 'redirect' | 'metadata' | 'sitemap';
  url: string;
  message: string;
  details?: string;
}

const SITE_URL = (Deno.env.get('PUBLIC_SITE_URL') || 'https://focoused-pixels.lovable.app').replace(/\/$/, '');

async function fetchHead(url: string, redirects = 0): Promise<{ status: number; finalUrl: string; redirectChain: string[]; html?: string }> {
  const chain: string[] = [];
  let current = url;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': 'SEO-Audit-Bot/1.0' } });
    if ([301, 302, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) break;
      chain.push(`${res.status} → ${loc}`);
      current = new URL(loc, current).toString();
      continue;
    }
    let html: string | undefined;
    if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
      html = await res.text();
    }
    return { status: res.status, finalUrl: current, redirectChain: chain, html };
  }
  return { status: 0, finalUrl: current, redirectChain: chain };
}

function extract(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m?.[1]?.trim() || null;
}

function auditMeta(url: string, html: string, issues: Issue[], titleMap: Map<string, string[]>, descMap: Map<string, string[]>) {
  const title = extract(html, /<title[^>]*>([^<]+)<\/title>/i);
  const desc = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;

  if (!title) issues.push({ severity: 'critical', category: 'metadata', url, message: 'Sem <title>' });
  else {
    if (title.length > 60) issues.push({ severity: 'warning', category: 'metadata', url, message: `Título longo (${title.length} chars)`, details: title });
    if (title.length < 20) issues.push({ severity: 'warning', category: 'metadata', url, message: `Título curto (${title.length} chars)`, details: title });
    titleMap.set(title, [...(titleMap.get(title) || []), url]);
  }
  if (!desc) issues.push({ severity: 'critical', category: 'metadata', url, message: 'Sem meta description' });
  else {
    if (desc.length > 160) issues.push({ severity: 'warning', category: 'metadata', url, message: `Description longa (${desc.length} chars)` });
    if (desc.length < 50) issues.push({ severity: 'warning', category: 'metadata', url, message: `Description curta (${desc.length} chars)` });
    descMap.set(desc, [...(descMap.get(desc) || []), url]);
  }
  if (!canonical) issues.push({ severity: 'warning', category: 'canonical', url, message: 'Sem tag canonical' });
  else if (!canonical.startsWith('http')) issues.push({ severity: 'warning', category: 'canonical', url, message: 'Canonical não absoluta', details: canonical });

  if (h1Count === 0) issues.push({ severity: 'warning', category: 'metadata', url, message: 'Sem H1' });
  else if (h1Count > 1) issues.push({ severity: 'info', category: 'metadata', url, message: `Múltiplos H1 (${h1Count})` });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const t0 = Date.now();
  const issues: Issue[] = [];
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  const checked: string[] = [];

  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // 1. robots.txt
    const robots = await fetch(`${SITE_URL}/robots.txt`);
    if (!robots.ok) issues.push({ severity: 'critical', category: 'robots', url: '/robots.txt', message: `robots.txt retornou ${robots.status}` });
    else {
      const txt = await robots.text();
      if (!/sitemap/i.test(txt)) issues.push({ severity: 'warning', category: 'robots', url: '/robots.txt', message: 'robots.txt sem referência ao sitemap' });
      if (/Disallow:\s*\/\s*$/m.test(txt)) issues.push({ severity: 'critical', category: 'robots', url: '/robots.txt', message: 'robots.txt bloqueia o site inteiro' });
    }

    // 2. sitemap.xml
    const smRes = await fetch(`${SITE_URL}/sitemap.xml`);
    let urls: string[] = [`${SITE_URL}/`];
    if (!smRes.ok) issues.push({ severity: 'critical', category: 'sitemap', url: '/sitemap.xml', message: `sitemap.xml retornou ${smRes.status}` });
    else {
      const xml = await smRes.text();
      urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);
      if (urls.length === 0) issues.push({ severity: 'warning', category: 'sitemap', url: '/sitemap.xml', message: 'Sitemap vazio' });
    }

    // 3. Inclui produtos e categorias do banco
    const [{ data: prods }, { data: cats }] = await Promise.all([
      sb.from('products').select('slug').limit(50),
      sb.from('categories').select('slug').limit(50),
    ]);
    prods?.forEach(p => p.slug && urls.push(`${SITE_URL}/produto/${p.slug}`));
    cats?.forEach(c => c.slug && urls.push(`${SITE_URL}/categoria/${c.slug}`));

    // Dedup + limite
    urls = Array.from(new Set(urls)).slice(0, 80);

    // 4. Crawl em paralelo (lotes de 8)
    for (let i = 0; i < urls.length; i += 8) {
      const batch = urls.slice(i, i + 8);
      const results = await Promise.allSettled(batch.map(u => fetchHead(u)));
      results.forEach((r, idx) => {
        const u = batch[idx];
        checked.push(u);
        if (r.status === 'rejected') {
          issues.push({ severity: 'critical', category: '404', url: u, message: `Falha ao acessar: ${r.reason}` });
          return;
        }
        const { status, redirectChain, html, finalUrl } = r.value;
        if (status === 404) issues.push({ severity: 'critical', category: '404', url: u, message: 'Página não encontrada (404)' });
        else if (status >= 500) issues.push({ severity: 'critical', category: '404', url: u, message: `Erro servidor ${status}` });
        else if (status >= 400) issues.push({ severity: 'warning', category: '404', url: u, message: `Status ${status}` });

        if (redirectChain.length > 0) {
          issues.push({
            severity: redirectChain.length > 1 ? 'warning' : 'info',
            category: 'redirect',
            url: u,
            message: `${redirectChain.length} redirect(s) → ${finalUrl}`,
            details: redirectChain.join(' → '),
          });
        }
        if (html) auditMeta(u, html, issues, titleMap, descMap);
      });
    }

    // 5. Duplicatas
    titleMap.forEach((pages, title) => {
      if (pages.length > 1) issues.push({
        severity: 'critical', category: 'duplicate', url: pages[0],
        message: `Título duplicado em ${pages.length} páginas`, details: `"${title}" → ${pages.join(', ')}`,
      });
    });
    descMap.forEach((pages, desc) => {
      if (pages.length > 1) issues.push({
        severity: 'critical', category: 'duplicate', url: pages[0],
        message: `Description duplicada em ${pages.length} páginas`, details: `${pages.join(', ')}`,
      });
    });

    const summary = {
      site_url: SITE_URL,
      pages_checked: checked.length,
      sitemap_urls: urls.length,
      unique_titles: titleMap.size,
      unique_descriptions: descMap.size,
    };
    const critical_count = issues.filter(i => i.severity === 'critical').length;
    const warning_count = issues.filter(i => i.severity === 'warning').length;
    const info_count = issues.filter(i => i.severity === 'info').length;

    const { data: report, error } = await sb.from('seo_audit_reports').insert({
      summary, issues, total_issues: issues.length,
      critical_count, warning_count, info_count,
      duration_ms: Date.now() - t0,
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
