# yigitaltuntas.me — MURYOKUSHO (Sonsuz Boşluk)

> *"İzler bırakılır. Bazıları senindir. Hiçlikle şaka yapılır."*

**Canlı Site:** [https://yigitaltuntas.me](https://yigitaltuntas.me)  
**Sahip:** Yiğit Efe Altuntaş (Bilgisayar Mühendisi Adayı — Ondokuz Mayıs Üniversitesi · Kurucu @ ChatStats · Kurucu Ortak @ Sınavİzcisi)

Bu depo standart bir kurumsal portfolyo değil; atmosferik bir kişisel dijital evrendir. WebGL yıldız alanı, ay ve takımyıldızı izleri, uçan karakterler (`FlyingBeggar`, `FlyingSage`, `FlyingPen`, `FlyingMusic`, `SocialDrifters`), ziyaretçi not duvarı, kontrollü kaos olayları ve `/miras` altında sessiz bir Cumhuriyet anıt odası barındırır.

Tasarım felsefesi, ses tonu ve korunması gereken kanon kuralları için:
- [`SITE_BRIEF.md`](./SITE_BRIEF.md) — Mimari ve ürün referansı
- [`SITE_CANON.md`](./SITE_CANON.md) — Atmosfer, metin sesi ve karakter kanonu

---

## Teknoloji Yığını

- **İstemci:** React 19, TypeScript 5.8, Vite 8, React Router v7
- **3B & Hareket:** Three.js, `@react-three/fiber`, `@react-three/drei`, Framer Motion, GSAP (`ScrollTrigger`), Lenis (`@studio-freight/react-lenis`)
- **Sunucu & Veri:** Vercel Serverless Functions (`api/*`), Neon Serverless Postgres (`@neondatabase/serverless`), Vercel Blob (`@vercel/blob`)
- **Kalite & Test:** Vitest, Oxlint, TypeScript (`tsc -b`)

---

## Mimari Özeti

```text
├── api/                    # Vercel Serverless uç noktaları (notes, photos, photo, upload, wreaths, admin/*)
├── server/                 # Sunucu yardımcıları (db, auth, validate, rateLimit, image, blobUrl, http)
├── public/                 # Statik varlıklar, sitemap.xml, robots.txt, site.webmanifest
└── src/
    ├── components/
    │   ├── canvas/         # WebGL sahnesi (Muryokusho, DesktopBackground, WireframePyramid)
    │   ├── events/         # Uçan karakterler ve kaos sistemi (FlyingPen, FlyingMusic, FlyingBeggar, FlyingSage, SocialDrifters, ChaosManager, IdleWhispers, EasterEggs)
    │   ├── layout/         # Navigation (Anıtkabir merkezli), Footer (world-flip tetikleyici)
    │   ├── sections/       # Sayfa bölümleri (Hero, About, Projects, Thoughts, Studio, Contact, Memorial, WreathOffering, SilentGuardians, NotFound)
    │   └── ui/             # CustomCursor, FakeMenu, PageTransition, ThemeSelector
    ├── context/            # ThemeContext (3 domain), MemorialContext (/miras sessiz oda)
    ├── data/               # Statik veri modelleri (projects, thoughts, notes)
    ├── hooks/              # useIsMobilePerf, useAtmosphereStage, usePrefersReducedMotion, useDocumentVisible, uçuş hook'ları
    ├── pages/              # NotesWall (Ana sayfa iz duvarı)
    ├── seo/                # SEOHead + JSON-LD şemaları ve sayfa bazlı meta yapılandırması
    ├── themes/             # Domain renk/atmosfer belirteçleri (Muryokusho, FukumaMizushi, KangoAneitei)
    └── utils/              # notesStore (rotalar arası iz senkronizasyonu), events, motion, flightPath, flyerDialogue, samsunTime
```

### Masaüstü ve Mobil Ayrımı (`useIsMobilePerf`)
Mobil görünüm masaüstünün daraltılmış hali değildir; bilinçli olarak ayrı bir performans ve deneyim katmanıdır:
- **Masaüstü:** Tam WebGL yıldız/ay/takımyıldızı sahnesi, kutsal tel kafes piramit (`WireframePyramid`), Lenis yumuşak kaydırma, sürüklenebilir uçan karakterler, özel imleç (`CustomCursor`) ve sinematik 404 çöküş sekansı.
- **Mobil (`<= 860px` veya `pointer: coarse`):** Saf CSS yıldız alanı (`.mobile-starfield`), sıfır WebGL/Three.js/GSAP yükü, sağ altta sabitlenmiş `FlyingPen` ve `FlyingMusic` düğmeleri, iki sütunlu okunaklı not duvarı.

---

## Kurulum ve Geliştirme

### Gereksinimler
- Node.js `>= 20`
- npm

### Bağımlılıkları Yükleme
```bash
npm ci
```

### Ortam Değişkenleri (`.env`)
Sunucu uç noktaları (`api/*`) için `.env.example` dosyasını temel alarak ortam değişkenlerini tanımlayın:
- `DATABASE_URL` veya `POSTGRES_URL` — Neon Postgres bağlantı dizesi
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob okuma/yazma anahtarı
- `ADMIN_IDENTITY` — Yönetici kimliği (yalnızca sunucu tarafında)
- `ADMIN_PASSPHRASE` — Yönetici parolası (yalnızca sunucu tarafında)
- `ADMIN_SESSION_SECRET` — En az 16 karakterli HMAC oturum anahtarı

> **Güvenlik Notu:** Hiçbir yönetici sırrı veya veritabanı anahtarı `VITE_*` önekiyle istemci paketine sızdırılmamalıdır.

### Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Statik kod analizi (Oxlint)
npm run lint

# Birim ve entegrasyon testleri (Vitest)
npm test

# Tip kontrolü ve üretim derlemesi
npm run build
```
