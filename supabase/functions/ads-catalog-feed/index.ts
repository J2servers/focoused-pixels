// Feed de catálogo: serve produtos no formato exigido por cada plataforma.
// GET ?format=google_xml | meta_csv | tiktok_json | pinterest_csv
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE = (Deno.env.get('PUBLIC_SITE_URL') || 'https://focoused-pixels.lovable.app').replace(/\/$/, '');

interface Product {
  id: string; slug: string; name: string; description?: string | null;
  short_description?: string | null; price: number; promotional_price?: number | null;
  stock?: number | null; main_image?: string | null; images?: string[] | null;
  category_name?: string | null; brand?: string | null; sku?: string | null;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildGoogleXml(products: Product[]): string {
  const items = products.map(p => `    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title>${xmlEscape(p.name.slice(0, 150))}</g:title>
      <g:description>${xmlEscape((p.short_description || p.description || p.name).replace(/<[^>]+>/g, '').slice(0, 5000))}</g:description>
      <g:link>${SITE}/produto/${xmlEscape(p.slug)}</g:link>
      <g:image_link>${xmlEscape(p.main_image || '')}</g:image_link>
      <g:availability>${(p.stock ?? 1) > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${(p.price).toFixed(2)} BRL</g:price>${p.promotional_price ? `\n      <g:sale_price>${p.promotional_price.toFixed(2)} BRL</g:sale_price>` : ''}
      <g:brand>${xmlEscape(p.brand || 'Pincel de Luz')}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Arts &amp; Entertainment</g:google_product_category>
      <g:product_type>${xmlEscape(p.category_name || '')}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Pincel de Luz Personalizados</title>
    <link>${SITE}</link>
    <description>Catálogo completo</description>
${items}
  </channel>
</rss>`;
}

function buildMetaCsv(products: Product[]): string {
  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'sale_price', 'link', 'image_link', 'brand', 'google_product_category'];
  const rows = products.map(p => [
    p.id, p.name.slice(0, 150),
    (p.short_description || p.description || p.name).replace(/<[^>]+>/g, '').slice(0, 9999),
    (p.stock ?? 1) > 0 ? 'in stock' : 'out of stock', 'new',
    `${p.price.toFixed(2)} BRL`,
    p.promotional_price ? `${p.promotional_price.toFixed(2)} BRL` : '',
    `${SITE}/produto/${p.slug}`, p.main_image || '',
    p.brand || 'Pincel de Luz', 'Arts & Entertainment',
  ].map(v => csvEscape(String(v))).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function buildTikTokJson(products: Product[]): string {
  return JSON.stringify({
    catalog: products.map(p => ({
      sku_id: p.id, title: p.name, description: (p.short_description || p.name).replace(/<[^>]+>/g, ''),
      availability: (p.stock ?? 1) > 0 ? 'in_stock' : 'out_of_stock',
      condition: 'new', price: { amount: p.price.toFixed(2), currency: 'BRL' },
      sale_price: p.promotional_price ? { amount: p.promotional_price.toFixed(2), currency: 'BRL' } : undefined,
      link: `${SITE}/produto/${p.slug}`, image_link: p.main_image,
      brand: p.brand || 'Pincel de Luz',
      additional_image_links: p.images || [],
    })),
  }, null, 2);
}

function buildPinterestCsv(products: Product[]): string {
  // Pinterest usa o mesmo schema do Google Shopping (TSV)
  const headers = ['id', 'title', 'description', 'link', 'image_link', 'price', 'availability', 'condition', 'brand'];
  const rows = products.map(p => [
    p.id, p.name, (p.short_description || p.name).replace(/<[^>]+>/g, ''),
    `${SITE}/produto/${p.slug}`, p.main_image || '',
    `${p.price.toFixed(2)} BRL`, (p.stock ?? 1) > 0 ? 'in stock' : 'out of stock',
    'new', p.brand || 'Pincel de Luz',
  ].map(v => csvEscape(String(v))).join('\t'));
  return [headers.join('\t'), ...rows].join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const format = new URL(req.url).searchParams.get('format') || 'google_xml';
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data, error } = await sb
    .from('products')
    .select('id, slug, name, description, short_description, price, promotional_price, stock, main_image, images, sku, brand, category:categories(name)')
    .limit(5000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const products: Product[] = (data || []).map((p: Record<string, unknown>) => ({
    id: p.id as string, slug: p.slug as string, name: p.name as string,
    description: p.description as string | null, short_description: p.short_description as string | null,
    price: Number(p.price), promotional_price: p.promotional_price ? Number(p.promotional_price) : null,
    stock: p.stock as number | null, main_image: p.main_image as string | null,
    images: p.images as string[] | null, sku: p.sku as string | null,
    brand: p.brand as string | null,
    category_name: (p.category as { name?: string } | null)?.name || null,
  }));

  let body: string; let contentType: string;
  switch (format) {
    case 'meta_csv':
      body = buildMetaCsv(products); contentType = 'text/csv'; break;
    case 'tiktok_json':
      body = buildTikTokJson(products); contentType = 'application/json'; break;
    case 'pinterest_csv':
      body = buildPinterestCsv(products); contentType = 'text/tab-separated-values'; break;
    case 'google_xml':
    default:
      body = buildGoogleXml(products); contentType = 'application/xml';
  }

  return new Response(body, {
    headers: { ...corsHeaders, 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
  });
});
