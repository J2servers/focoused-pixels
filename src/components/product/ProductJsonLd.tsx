/**
 * ProductJsonLd - SEO structured data (JSON-LD) for product pages
 * Improvements: #4 JSON-LD Product schema, #5 BreadcrumbList schema, #6 AggregateRating
 */
import { Helmet } from 'react-helmet-async';

interface ProductJsonLdProps {
  product: {
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    rating: number;
    reviews: number;
    inStock: boolean;
    category?: string;
  };
  category?: {
    name: string;
    slug: string;
  } | null;
  url: string;
}

export function ProductJsonLd({ product, category, url }: ProductJsonLdProps) {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.length ? product.images : [product.image],
    url,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Pincel de Luz',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'BRL',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Pincel de Luz Personalizados',
      },
      ...(product.originalPrice && {
        priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      }),
    },
    ...(product.reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviews,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: url.split('/produto')[0] },
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: category.name,
              item: `${url.split('/produto')[0]}/categoria/${category.slug}`,
            },
          ]
        : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: product.name },
    ],
  };

  return (
    <Helmet>
      <title>{product.name} | Pincel de Luz</title>
      <meta name="description" content={product.description.slice(0, 160)} />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description.slice(0, 160)} />
      <meta property="og:image" content={product.image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={product.price.toFixed(2)} />
      <meta property="product:price:currency" content="BRL" />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
  );
}
