/**
 * SEO content generators — produce unique titles & meta descriptions for
 * categories and products, ensuring no duplicates across the catalog.
 *
 * Rules:
 *  - Title <60 chars (truncated at word boundary)
 *  - Description <160 chars (rich, action-oriented, includes price/category)
 *  - Brand suffix appended when there is room
 */

const BRAND = 'Pincel de Luz';
const MAX_TITLE = 60;
const MAX_DESC = 158;

function clampWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const last = cut.lastIndexOf(' ');
  return (last > max * 0.6 ? cut.slice(0, last) : cut).trimEnd() + '…';
}

function priceBR(value?: number | null): string {
  if (!value || value <= 0) return '';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export interface SeoCategoryInput {
  name: string;
  description?: string | null;
  productCount?: number;
  minPrice?: number;
  maxPrice?: number;
}

export function buildCategorySeo(input: SeoCategoryInput) {
  const { name, description, productCount = 0, minPrice = 0, maxPrice = 0 } = input;

  const titleBase = `${name} Personalizados`;
  const titleWithBrand = `${titleBase} | ${BRAND}`;
  const title = clampWord(titleWithBrand.length <= MAX_TITLE ? titleWithBrand : titleBase, MAX_TITLE);

  const priceRange = minPrice && maxPrice
    ? `Preços de ${priceBR(minPrice)} a ${priceBR(maxPrice)}.`
    : '';
  const stock = productCount > 0
    ? `${productCount} ${productCount === 1 ? 'modelo' : 'modelos'} em estoque.`
    : '';
  const intro = (description?.trim()) ||
    `Confira nossa linha de ${name.toLowerCase()} com qualidade ${BRAND}, frete para todo o Brasil e produção rápida.`;

  const description_ = clampWord(`${intro} ${stock} ${priceRange} Frete grátis acima de R$ 159.`.replace(/\s+/g, ' ').trim(), MAX_DESC);
  const h1 = name;
  return { title, description: description_, h1 };
}

export interface SeoProductInput {
  name: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  price?: number | null;
  promotionalPrice?: number | null;
  categoryName?: string | null;
  inStock?: boolean;
}

export function buildProductSeo(input: SeoProductInput) {
  const { name, shortDescription, fullDescription, price, promotionalPrice, categoryName, inStock = true } = input;

  const finalPrice = promotionalPrice && promotionalPrice > 0 ? promotionalPrice : price;
  const titleParts = [name];
  if (categoryName) titleParts.push(categoryName);
  const titleBase = titleParts.join(' · ');
  const titleWithBrand = `${titleBase} | ${BRAND}`;
  const title = clampWord(titleWithBrand.length <= MAX_TITLE ? titleWithBrand : titleBase, MAX_TITLE);

  const lead = (shortDescription || fullDescription || `${name} personalizado com acabamento premium.`)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const pricePart = finalPrice ? `A partir de ${priceBR(finalPrice)}.` : '';
  const stockPart = inStock ? 'Em estoque, envio rápido.' : 'Sob encomenda.';
  const cta = '12x sem juros e frete para todo o Brasil.';

  const description = clampWord(`${lead} ${pricePart} ${stockPart} ${cta}`.replace(/\s+/g, ' ').trim(), MAX_DESC);
  const h1 = name;
  return { title, description, h1 };
}
