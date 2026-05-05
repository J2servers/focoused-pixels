import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = (Deno.env.get('PUBLIC_SITE_URL') || 'https://focoused-pixels.lovable.app').replace(/\/$/, '');

const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/produtos', priority: '0.9', changefreq: 'daily' },
  { path: '/sobre', priority: '0.6', changefreq: 'monthly' },
  { path: '/contato', priority: '0.6', changefreq: 'monthly' },
  { path: '/avaliacoes', priority: '0.7', changefreq: 'weekly' },
  { path: '/politica-de-privacidade', priority: '0.3', changefreq: 'yearly' },
  { path: '/termos-de-uso', priority: '0.3', changefreq: 'yearly' },
  { path: '/trocas-e-devolucoes', priority: '0.3', changefreq: 'yearly' },
];

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function buildSitemap(urls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }>): string {
  const items = urls.map(u => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</urlset>`;
}

function buildRobots(): string {
  return `# robots.txt — Pincel de Luz Personalizados
# Gerado automaticamente em ${new Date().toISOString()}

User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /carrinho
Disallow: /checkout
Disallow: /pagamento
Disallow: /pagamento/
Disallow: /minha-conta
Disallow: /login
Disallow: /cadastro
Disallow: /*?*utm_
Disallow: /*?*fbclid
Disallow: /*?*gclid

# Bots de IA generativa — bloqueados (conteúdo proprietário)
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Google-Extended
Disallow: /

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /pagamento

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /checkout

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

async function generateAndStore(sb: ReturnType<typeof createClient>) {
  const [{ data: prods }, { data: cats }] = await Promise.all([
    sb.from('products').select('slug, updated_at').limit(5000),
    sb.from('categories').select('slug, updated_at').limit(500),
  ]);

  const urls: Array<{ loc: string; lastmod?: string; priority: string; changefreq: string }> = [];
  STATIC_PAGES.forEach(p => urls.push({ loc: `${SITE_URL}${p.path}`, priority: p.priority, changefreq: p.changefreq }));
  cats?.forEach((c: { slug?: string; updated_at?: string }) => {
    if (c.slug) urls.push({ loc: `${SITE_URL}/categoria/${c.slug}`, lastmod: c.updated_at, priority: '0.8', changefreq: 'weekly' });
  });
  prods?.forEach((p: { slug?: string; updated_at?: string }) => {
    if (p.slug) urls.push({ loc: `${SITE_URL}/produto/${p.slug}`, lastmod: p.updated_at, priority: '0.7', changefreq: 'weekly' });
  });

  const sitemap = buildSitemap(urls);
  const robots = buildRobots();
  const productCount = prods?.length || 0;
  const categoryCount = cats?.length || 0;

  await sb.from('seo_cache').upsert([
    { cache_key: 'sitemap.xml', content: sitemap, url_count: urls.length, product_count: productCount, category_count: categoryCount, generated_at: new Date().toISOString() },
    { cache_key: 'robots.txt', content: robots, url_count: 0, product_count: 0, category_count: 0, generated_at: new Date().toISOString() },
  ], { onConflict: 'cache_key' });

  return { url_count: urls.length, product_count: productCount, category_count: categoryCount };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const url = new URL(req.url);

  // GET /functions/v1/sitemap-generator?file=sitemap.xml|robots.txt — serve cached file
  const file = url.searchParams.get('file');
  if (req.method === 'GET' && file) {
    const { data } = await sb.from('seo_cache').select('content, generated_at').eq('cache_key', file).maybeSingle();
    if (!data) {
      // Generate on demand if missing
      await generateAndStore(sb);
      const { data: fresh } = await sb.from('seo_cache').select('content').eq('cache_key', file).maybeSingle();
      if (!fresh) return new Response('Not found', { status: 404, headers: corsHeaders });
      return new Response(fresh.content as string, {
        headers: { ...corsHeaders, 'Content-Type': file.endsWith('.xml') ? 'application/xml' : 'text/plain', 'Cache-Control': 'public, max-age=3600' },
      });
    }
    return new Response(data.content as string, {
      headers: { ...corsHeaders, 'Content-Type': file.endsWith('.xml') ? 'application/xml' : 'text/plain', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  // POST — regenerate (admin or cron)
  try {
    const result = await generateAndStore(sb);
    return new Response(JSON.stringify({ success: true, ...result, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
