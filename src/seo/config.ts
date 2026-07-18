/**
 * Merkezi SEO konfigürasyonu — tüm sayfa meta verileri buradan yönetilir.
 * Yeni sayfa eklenince bu dosyaya bir `PageKey` satırı eklenmesi yeterlidir.
 */

export const SITE = {
  url: 'https://yigitaltuntas.me',
  name: 'Yiğit Altuntaş',
  titleTemplate: '%s | Yiğit Altuntaş',
  defaultTitle: 'Yiğit Altuntaş | Portfolio',
  description:
    'Yiğit Efe Altuntaş kişisel portfolio sitesi. Bilgisayar Mühendisliği öğrencisi, yazılım geliştirici, ChatStats kurucusu ve Sınavızcisi.com eş-kurucusu.',
  defaultDescription:
    'Personal portfolio of Yiğit Altuntaş. Computer Engineering student, Software Developer, Founder of ChatStats, Co-Founder of Sinavizcisi.com.',
  keywords: [
    'Yiğit Altuntaş',
    'Yigit Altuntas',
    'Yiğit Efe Altuntaş',
    'Portfolio',
    'Computer Engineering',
    'Software Developer',
    'Data Science',
    'ChatStats',
    'Sınavızcisi',
    'Sinavizcisi',
    'yigitaltuntas.me',
    'Ondokuz Mayıs Üniversitesi',
  ].join(', '),
  author: 'Yiğit Efe Altuntaş',
  locale: 'tr_TR',
  ogImage: 'https://yigitaltuntas.me/og-image.png',
  ogImageAlt: 'Yiğit Altuntaş Portfolio',
  ogImageWidth: '1536',
  ogImageHeight: '1024',
  themeColor: '#050508',
  twitterHandle: '@yigitaltuntas',
} as const;

/** Tanımlı sayfa anahtarları */
export type PageKey =
  | 'home'
  | 'about'
  | 'projects'
  | 'thoughts'
  | 'studio'
  | 'contact';

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  /** Sayfaya özel OG image varsa kullan, yoksa site geneli kullanılır */
  ogImage?: string;
}

/**
 * Her rota için SEO verisi.
 * `title` → `titleTemplate` içindeki `%s` yerine geçer.
 */
export const PAGE_SEO: Record<PageKey, PageSEO> = {
  home: {
    title: 'Ana Sayfa',
    description:
      'İzler burada kalır. Yiğit Efe Altuntaş kişisel portfolio sitesi — yazılım, veri bilimi ve düşünceler.',
    keywords: SITE.keywords,
    canonical: `${SITE.url}/`,
  },
  about: {
    title: 'Hakkımda',
    description:
      'Yiğit Efe Altuntaş hakkında. Ondokuz Mayıs Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisi, Software Developer ve veri meraklısı.',
    keywords: [
      'Yiğit Altuntaş hakkında',
      'Bilgisayar Mühendisliği öğrencisi',
      'Ondokuz Mayıs Üniversitesi',
      'Software Developer Samsun',
    ].join(', '),
    canonical: `${SITE.url}/hakkimda`,
  },
  projects: {
    title: 'Projeler — İnşa Ettiklerim',
    description:
      'ChatStats, Sınavızcisi.com ve daha fazlası. Yiğit Altuntaş\'ın geliştirdiği yazılım projeleri ve ürünler.',
    keywords: [
      'ChatStats',
      'Sınavızcisi',
      'projeler',
      'portfolio projeleri',
      'yazılım projeleri',
      'Yiğit Altuntaş projeleri',
    ].join(', '),
    canonical: `${SITE.url}/projeler`,
  },
  thoughts: {
    title: 'Düşünceler',
    description:
      'Yiğit Altuntaş\'ın kısa notları, gözlemleri ve düşünceleri. "Bazen bir şeyler yazarım, genelde mantıklı olmazlar."',
    keywords: [
      'Yiğit Altuntaş düşünceler',
      'blog notları',
      'yazılar',
      'gözlemler',
    ].join(', '),
    canonical: `${SITE.url}/dusunceler`,
  },
  studio: {
    title: 'Stüdyom',
    description:
      'Yiğit Altuntaş\'ın çalışma ortamı, kullandığı araçlar ve kurulum detayları.',
    keywords: [
      'setup',
      'stüdyo',
      'çalışma ortamı',
      'araçlar',
      'Yiğit Altuntaş setup',
    ].join(', '),
    canonical: `${SITE.url}/studyom`,
  },
  contact: {
    title: 'İletişim',
    description:
      'Yiğit Altuntaş ile iletişime geç. E-posta: 81altuntas38@gmail.com',
    keywords: [
      'Yiğit Altuntaş iletişim',
      'email',
      '81altuntas38@gmail.com',
      'contact',
    ].join(', '),
    canonical: `${SITE.url}/iletisim`,
  },
};
