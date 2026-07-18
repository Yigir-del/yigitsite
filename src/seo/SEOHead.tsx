import { Helmet } from 'react-helmet-async';
import { SITE, PAGE_SEO, type PageKey } from './config';

interface JsonLdPersonProps {
  canonical: string;
}

/** Person + WebSite JSON-LD schema — Google Rich Results için */
function JsonLdSchemas({ canonical }: JsonLdPersonProps) {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Yiğit Efe Altuntaş',
    alternateName: 'Yigit Efe Altuntas',
    url: SITE.url,
    image: `${SITE.url}/og-image.png`,
    jobTitle: 'Software Developer',
    description:
      'Computer Engineering student at Ondokuz Mayıs Üniversitesi, Software Developer, Founder of ChatStats, Co-Founder of Sınavızcisi.com.',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Ondokuz Mayıs Üniversitesi',
      url: 'https://www.omu.edu.tr',
    },
    knowsAbout: [
      'Software Development',
      'Data Science',
      'Computer Engineering',
      'Machine Learning',
      'Web Development',
    ],
    sameAs: ['https://github.com/Yigir-del'],
    founder: [
      {
        '@type': 'Organization',
        name: 'ChatStats',
        description: 'WhatsApp sohbet analiz uygulaması',
      },
    ],
    memberOf: {
      '@type': 'Organization',
      name: 'Sınavızcisi.com',
      description: 'Sınav rehberi platformu',
      roleName: 'Co-Founder',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.defaultDescription,
    author: {
      '@type': 'Person',
      name: 'Yiğit Efe Altuntaş',
    },
    potentialAction: {
      '@type': 'ReadAction',
      target: SITE.url,
    },
    inLanguage: 'tr-TR',
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: canonical,
    isPartOf: {
      '@type': 'WebSite',
      url: SITE.url,
      name: SITE.name,
    },
    author: {
      '@type': 'Person',
      name: 'Yiğit Efe Altuntaş',
    },
    inLanguage: 'tr-TR',
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webpageSchema)}
      </script>
    </Helmet>
  );
}

interface SEOHeadProps {
  /** Hangi sayfa için SEO uygulanacak */
  page: PageKey;
}

/**
 * Her sayfa component'ine eklenen SEO başlığı.
 * Kullanım: `<SEOHead page="about" />`
 */
export default function SEOHead({ page }: SEOHeadProps) {
  const seo = PAGE_SEO[page];
  const fullTitle = SITE.titleTemplate.replace('%s', seo.title);
  const ogImage = seo.ogImage ?? SITE.ogImage;
  const keywords = seo.keywords ?? SITE.keywords;

  return (
    <>
      <Helmet>
        {/* ── Primary ── */}
        <title>{fullTitle}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={SITE.author} />
        <meta name="creator" content={SITE.author} />
        <meta name="publisher" content={SITE.author} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />

        {/* ── Canonical ── */}
        <link rel="canonical" href={seo.canonical} />

        {/* ── Open Graph ── */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={SITE.locale} />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={SITE.ogImageAlt} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content={SITE.ogImageWidth} />
        <meta property="og:image:height" content={SITE.ogImageHeight} />
        <meta property="article:author" content="https://yigitaltuntas.me" />

        {/* ── Twitter Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={SITE.ogImageAlt} />

        {/* ── Theme / PWA ── */}
        <meta name="theme-color" content={SITE.themeColor} />
        <meta name="apple-mobile-web-app-title" content={SITE.name} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content={SITE.name} />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ── Manifest & Icons ── */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title={SITE.name} href={`${SITE.url}/sitemap.xml`} />
      </Helmet>

      {/* JSON-LD schema her sayfada tekrar edilir — Google için OK */}
      <JsonLdSchemas canonical={seo.canonical} />
    </>
  );
}
