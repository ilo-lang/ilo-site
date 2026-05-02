export const SITE_URL = 'https://ilo-lang.ai';

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ilo',
  alternateName: 'ilo-lang',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'macOS, Linux, Windows',
  description:
    'Token-optimised programming language for AI agents. Prefix notation, strongly typed, verified before execution.',
  url: SITE_URL,
  downloadUrl: 'https://github.com/ilo-lang/ilo/releases',
  codeRepository: 'https://github.com/ilo-lang/ilo',
  programmingLanguage: 'Rust',
  license: 'https://github.com/ilo-lang/ilo/blob/main/LICENSE',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
    '@type': 'Person',
    name: 'Daniel John Morris',
    url: 'https://danieljohnmorris.com',
    sameAs: [
      'https://github.com/danieljohnmorris',
      'https://x.com/danielmorris',
      'https://linkedin.com/in/danieljohnmorris',
    ],
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ilo',
  url: SITE_URL,
  description: 'Token-optimised programming language for AI agents.',
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact - ilo',
  url: `${SITE_URL}/contact/`,
  description: 'Get in touch with the ilo team.',
  about: { '@id': SITE_URL },
};
