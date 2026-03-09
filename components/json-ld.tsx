export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BioJalisco',
    url: 'https://biojalisco-species-id.vercel.app',
    logo: 'https://biojalisco-species-id.vercel.app/images/logo.webp',
    description: 'AI-powered species identification platform for Jalisco biodiversity research, verified against GBIF, iNaturalist, and CONABIO databases.',
    foundingDate: '2026',
    parentOrganization: {
      '@type': 'Organization',
      name: 'CushLabs AI Services',
      url: 'https://cushlabs.ai',
    },
    partner: [
      {
        '@type': 'EducationalOrganization',
        name: 'Universidad de Guadalajara (CUCBA)',
        url: 'https://www.cucba.udg.mx',
      },
      {
        '@type': 'GovernmentOrganization',
        name: 'CONABIO',
        url: 'https://www.gob.mx/conabio',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BioJalisco Species Identifier',
    url: 'https://biojalisco-species-id.vercel.app',
    description: 'AI-powered species identification for Jalisco biodiversity research.',
    publisher: {
      '@type': 'Organization',
      name: 'CushLabs AI Services',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQPageJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
