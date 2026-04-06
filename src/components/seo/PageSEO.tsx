/**
 * PageSEO - Dynamic SEO meta tags for all pages
 * Implements: canonical URLs, Open Graph, Twitter Cards, JSON-LD
 */
import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  children?: React.ReactNode;
}

const BASE_URL = 'https://focoused-pixels.lovable.app';

export function PageSEO({ title, description, path, image, type = 'website', noindex = false, children }: PageSEOProps) {
  const fullTitle = title.includes('Pincel de Luz') ? title : `${title} | Pincel de Luz`;
  const url = `${BASE_URL}${path}`;
  const ogImage = image || `${BASE_URL}/og-default.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description.slice(0, 160)} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description.slice(0, 160)} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Pincel de Luz Personalizados" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description.slice(0, 160)} />
      <meta name="twitter:image" content={ogImage} />
      
      {children}
    </Helmet>
  );
}

/** JSON-LD WebSite schema with SearchAction for sitelinks */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pincel de Luz Personalizados',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/** JSON-LD LocalBusiness schema */
export function LocalBusinessSchema({ company }: { company: any }) {
  if (!company) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.company_name || 'Pincel de Luz Personalizados',
    url: BASE_URL,
    ...(company.phone && { telephone: company.phone }),
    ...(company.email && { email: company.email }),
    ...(company.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address,
        addressCountry: 'BR',
      },
    }),
    ...(company.social_instagram && {
      sameAs: [
        company.social_instagram,
        company.social_facebook,
        company.social_youtube,
      ].filter(Boolean),
    }),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/** JSON-LD FAQPage schema */
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/** JSON-LD BreadcrumbList */
export function BreadcrumbSchema({ items }: { items: { name: string; url?: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

/** Visual breadcrumb component */
export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="text-sm text-muted-foreground py-3">
      <ol className="flex flex-wrap items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            {item.href ? (
              <a href={item.href} itemProp="item" className="hover:text-primary transition-colors">
                <span itemProp="name">{item.name}</span>
              </a>
            ) : (
              <span itemProp="name" className="text-foreground font-medium">{item.name}</span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
            {i < items.length - 1 && <span aria-hidden="true" className="text-muted-foreground/50">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
