# yigitaltuntas.me — Tam Site Brief (AI / Refactor)

Bu dosya, **yigitaltuntas.me** sitesini başka bir yapay zekâyla konuşmak veya refactor planlamak için yazıldı.

- Ses / motto / karakter kuralları: `SITE_CANON.md` (kısa kanon).
- Bu dosya: kanon + **teknik gerçekler + dosya haritası + borçlar + dokunulmazlar**.
- Konuşurken bu dosyayı ver. “Modernleştir / sadeleştir / Next’e geç” diye genel prompt atma.

Canlı site: https://yigitaltuntas.me  
Repo: `yigitsite` (iç isim, marka değil)  
Kod yolu (bu makine): `C:\Users\altun\yigitsite`  
Deploy: Vercel, `main` push otomatik.

---

## 0. Bu site nedir / nedir değil

**Nedir:** Kişisel evren. CV vitrini değil, “mekan”. Karanlık yıldızlı bir odada iz bırakılır; ziyaretçi kraldır; dilenci ve bilge uçar; müzikte demokrasi yoktur.

**Değildir:**
- Kurumsal landing
- Generic AI purple/gradient portfolio
- “Her cihaz aynı deneyim” ürünü
- Feature factory

Tek cümle: *Yıldızlı bir alanda iz bırakan, dilenciyle bilgeyi uçuran, müziğe demokrasi tanımayan, CV’den çok mekan gibi duran bir portfolyo.*

---

## 1. Kimlik

| Alan | Değer |
|------|--------|
| Kişi | Yiğit Efe Altuntaş |
| Marka | Yiğit Altuntaş |
| Site | https://yigitaltuntas.me |
| Evren adı | **MURYOKUSHO** (atmosfer/domain; marka değil) |
| Evren etiketi | **RYOIKI TENKAI** (sağ üst watermark eyebrow) |
| Okul | Ondokuz Mayıs Üniversitesi, Bilgisayar Mühendisliği (4. sınıf) |
| Ürünler | ChatStats (kurucu), Sınavızcisi.com (eş-kurucu) |
| GitHub | https://github.com/Yigir-del |
| Mail | 81altuntas38@gmail.com |
| GA4 | `G-7J6EVCM1BV` |
| Dil | UI + diyalog **Türkçe**; SEO description İngilizce olabilir |

MURYOKUSHO ≠ Yiğit Altuntaş. Biri evren, biri kişi.

---

## 2. Motto ve ses

Motto:

> İzler bırakılır. Bazıları senindir. Hiçlikle şaka yapılır. Kural koyan kraldır — ama herkes uçabilir.

Kurallar:
1. **İz** — not, düşünce, proje, easter egg.
2. **Ziyaretçi = kral** — Dilenci kraldan bağış ister.
3. **Absürt ciddiyet** — felsefe + dilenci + Spotify diktatörlüğü yan yana.
4. **Hiçlik** — sağ tık menüsü, idle sözler, footer.
5. **Kontrollü kaos** — masaüstü zengin, mobil hafif. Desktop’ı bozma.
6. **Türkçe konuşur gibi** — kısa, hafif alay, hafif melankoli.

Yaz: “iz”, “kral”, “hiçlik”, “frekans”, “defter”.  
Yazma: LinkedIn dili, onboarding, emoji yağmuru, mor neon landing, “mobil için her şeyi kes” refaktörü.

Kanon hero cümleleri (değiştirme):
- “İzler burada kalır.”
- “Bazıları senin olabilir.”
- “(aşağıda bir defter var)”

---

## 3. Refactor dokunulmazları

Bunları “temizlik” diye silme / yeniden yazma:

1. **Masaüstü atmosfer** — uçan karakterler, Lenis, WebGL yıldız, custom cursor, noise, chaos, world-flip.
2. **Mobil ayrı yol** — `useIsMobilePerf` (`max-width: 860px` VEYA `pointer: coarse`). Mobilde WebGL / Lenis / drag-fırlatma / custom cursor kesilir. Masaüstü bozulmaz.
3. **Miras odası** (`/miras`) — sessiz oda. Kaos, FakeMenu, uçan karakterler kapanır (`isQuiet`). Dilenci/Bilge buraya **SilentGuardians** olarak saygılı girer. Çelenk kalır.
4. **Nav’daki Anıtkabir silüeti** — ortada, label’sız. Tıklayınca `/miras`.
5. **Not defteri** — ziyaretçi iz bırakır. Kalem + duvar. Admin pin/sil.
6. **Müzik kutusu** — “Senin Frekansın”. İstek parça reddedilir. `–` küçültür (müzik devam), `✕` durdurur.
7. **Domain watermark** — tıklayınca domain değişir (JJK esintili). Varsayılan Muryokusho lacivert-gri. Mor/kırmızı domain **easter**; varsayılan marka değil.
8. **World-flip** — footer’a ~18 tıklama → `world-flip` event → sahne 180°. Arka plan (yıldız) sabit kalır.
9. **Türkçe rota isimleri** — `/hakkimda`, `/projeler`, `/dusunceler`, `/studyom`, `/iletisim`, `/miras`. İngilizce alias’lar redirect.
10. **LoL sayfası yok.** `/league` 2026-09-02 kaldırıldı. Geri ekleme.

İzinli refactor örnekleri: ölü dosyaları silmek, inline style’ları CSS’e almak, auth’suz DELETE’leri sıkılaştırmak, `pages/` vs `sections/` çiftini sadeleştirmek, Thoughts’u gerçek veri kaynağına bağlamak — **görünümü bozmadan**.

---

## 4. Sayfa haritası

| Rota | Nav’da | Dosya | İş |
|------|--------|-------|----|
| `/` | Ana Sayfa | `Hero` + `pages/NotesWall` | Hero copy + dağınık not duvarı |
| `/hakkimda` | Hakkımda | `sections/About` | Kişisel anlatı, GSAP stagger (desktop) |
| `/projeler` | Projeler | `sections/Projects` + `data/projects.ts` | Hikâye + ders; kurumsal liste değil |
| `/dusunceler` | **Nav’da gizli** | `sections/Thoughts` | Kartlar; admin `localStorage` ile ekler |
| `/studyom` | **Nav’da gizli** | `sections/Studio` | Foto ızgara, lightbox, admin upload |
| `/iletisim` | İletişim | `sections/Contact` | Yeşil terminal form → Gmail; admin kapısı |
| `/miras` | Anıtkabir ikonu | `sections/Memorial` | Atatürk + Gençliğe Hitabe + çelenk |
| `/atam` | — | aynı Memorial | Context içinde `/miras`’a replace |
| `/portfolio`, `/portfolyo`, `/about`, `/projects`, `/contact` | — | `<Navigate>` | Eski İngilizce URL’ler |
| `*` | — | `sections/NotFound` | 404; karakterler/chaos kapanır |

Nav (`Navigation.tsx`): sol Ana Sayfa / Hakkımda · orta Anıtkabir · sağ Projeler / İletişim.  
Düşünceler ve Stüdyom **kasıtlı gizli** (yorum satırı). Route duruyor; nav’a geri koyma kararı ürün kararı.

---

## 5. Karakterler (uçan pantheon)

Hepsi `src/components/events/`. Masaüstünde kenardan kenara uçar (`flightPath.ts`); ortada doğup yok olmaz.

| Bileşen | Kim | Davranış |
|---------|-----|----------|
| `FlyingBeggar` | Dilenci | Kraldan bağış. Nadiren bilgeye laf. `useThrowableEdgeFlight` — sürüklenebilir. |
| `FlyingSage` | Bilge | Özlü söz. Nadiren dilenciye iğne. Sürüklenebilir. |
| `FlyingPen` | Kalem | Tıklayınca not modalı. `add-note` custom event → NotesWall. Mobilde uçar ama drag yok. |
| `FlyingMusic` | DJ | Spotify embed playlist. Arama troll. Mobilde de var (uçuş kesik). |
| `SocialDrifters` | GitHub / LinkedIn | Kenardan uçar, tıklayınca dış link. Miras’ta da (sessiz). |
| `ChaosManager` | UFO / sahte popup / achievement / idle | Desktop 20sn sonra rastgele; mobilde sadece idle söz. |
| `EasterEggs` | Konsole | Klavye buffer: `sudo` tam ekran yeşil terminal, `yardim`/`help`/`42` alert. |
| `SilentGuardians` | Bilge+Dilenci (Miras) | Uçmaz. Portre yanında saygılı replik. |
| `FakeMenu` | Sağ tık | Native menü yok. “Gerçekliği inceliyorum…” |
| `CustomCursor` | Glow cursor | Sadece desktop + quiet değil. `has-custom-cursor` class. |

Diyalog: `utils/flyerDialogue.ts`. ~%15 jab, geri kalan kendi işi. Miras’ta ayrı havuz (`SilentGuardians`).

**Kaldırıldı:** `FlyingLoL` + `/league`. Geri getirme.

---

## 6. Stack

**Frontend**
- React 19 + TypeScript + Vite 8
- React Router 7 (`BrowserRouter` in `main.tsx`)
- Framer Motion (page transition, uçuş, not drag)
- GSAP + ScrollTrigger (About / Projects / Thoughts — **desktop only**)
- Lenis (`@studio-freight/react-lenis`) — **desktop only**, root scroll
- Three.js + R3F + Drei — desktop yıldız alanı
- lucide-react (ikon)
- react-helmet-async (SEO)
- oxlint

**Backend (Vercel serverless, `api/`)**
- `@vercel/node` handlers
- `@vercel/postgres` (`POSTGRES_URL` / `DATABASE_URL`)
- `@vercel/blob` (stüdyo foto)

**Yok:** Next.js, Tailwind, Redux, gerçek auth, i18n, test suite.

`vercel.json`: SPA rewrite (`/((?!api/).*)` → `index.html`). Asset cache immutable. HTML no-cache.

---

## 7. Klasör haritası

```
yigitsite/
├── api/                      Vercel functions
│   ├── notes.ts              GET/POST/DELETE notlar
│   ├── photos.ts             GET/DELETE stüdyo meta
│   ├── photo.ts              Blob proxy (private → stream)
│   ├── upload.ts             POST raw body → Blob + Postgres
│   ├── wreaths.ts            GET/POST çelenk (1/gün/ziyaretçi)
│   └── initDb.ts             CREATE TABLE IF NOT EXISTS
├── public/                   sitemap.xml, favicon, og-image, Ataturk1930s.jpg
├── src/
│   ├── main.tsx              StrictMode + Helmet + Router
│   ├── App.tsx               SHELL. Rotalar, atmosfer, world-flip
│   ├── App.css               ÖLÜ Vite şablonu — import edilmiyor
│   ├── index.css             Asıl tasarım sistemi (~1300 satır)
│   ├── components/
│   │   ├── canvas/           Background, DesktopBackground, Muryokusho, WireframePyramid
│   │   ├── events/           Uçanlar, chaos, easter, FakeMenu değil (ui’da)
│   │   ├── layout/           Navigation, Footer
│   │   ├── sections/         Sayfa gövdeleri (App bunları lazy import eder)
│   │   └── ui/               FakeMenu, ThemeSelector, PageTransition, CustomCursor
│   ├── pages/                ÇOĞU ÖLÜ WRAPPER. App sadece NotesWall kullanır
│   ├── context/              ThemeContext, MemorialContext
│   ├── hooks/                useIsMobilePerf, useAtmosphereStage, uçuş hook’ları
│   ├── data/                 projects.ts (canlı), notes.ts (tip + unused seed), thoughts.ts (unused)
│   ├── seo/                  config.ts + SEOHead.tsx
│   ├── themes/domains.ts     3 domain CSS token seti
│   └── utils/                flightPath, flyerDialogue, analytics
├── SITE_CANON.md             Kısa ses kanonu
└── SITE_BRIEF.md             Bu dosya
```

**App.tsx gerçeği:** `pages/Home.tsx`, `About.tsx`, `Projects.tsx`, `Contact.tsx`, `Thoughts.tsx` **kullanılmıyor**. Rota doğrudan `components/sections/*` lazy load. `NotesWall` istisna — `pages/` altında ve App onu kullanıyor.

---

## 8. Runtime mimari (App shell)

`App` iki katman:

```
ThemeProvider
  MemorialProvider
    AppShell
      atmosphere-fill
      Background (mobile CSS starfield / desktop WebGL)
      WireframePyramid (küçük 3D piramit, tıklayınca inspect)
      ThemeSelector (RYOIKI TENKAI watermark)
      Shell = Lenis (desktop) veya fragment (mobile)
        ScrollToTop + Analytics + ScrollTriggerSync
        .app-container[.is-quiet][.world-flipped]
          Chaos + EasterEggs          (quiet değil, 404 değil, stage>=chaos)
          FakeMenu                    (quiet değil)
          FlyingPen + FlyingMusic     (quiet değil, 404 değil, stage>=characters)
          Beggar + Sage + Drifters    (üsttekiler + desktop)
          SocialDrifters              (quiet iken de, desktop)
          Navigation
          <main> AnimatedRoutes
          Footer
      CustomCursor + noise-overlay    (desktop; cursor ayrıca quiet değil)
```

**Atmosphere boot** (`useAtmosphereStage`):
- `critical` → `atmosphere` (idle ~0–200ms) → `characters` (+450ms) → `chaos` (+1100ms)
- İlk boya ağır karakter/chaos ile şişmesin diye kademeli.

**Quiet (Miras):**
- `html.scene-quiet` + `scene-memorial`
- Kaos, FakeMenu, Pen/Music/Beggar/Sage kapalı
- World-flip iptal
- Cursor kapalı
- Background `hushed`
- Drifters açık (sosyal ikonlar)

**404:** `KNOWN_ROUTES` listesinde yoksa karakter + chaos yok.

**World-flip:** `.app-container` 180° CSS transform. Origin viewport ortası. Yıldız canvas container’ın dışında kaldığı için dönmez.

**Sayfa geçişi:** `AnimatePresence mode="wait"` + `PageTransition`. Lenis scroll sıfırlanır; `history.scrollRestoration = 'manual'`.

---

## 9. Tasarım sistemi

Tek kaynak: `src/index.css` + `src/themes/domains.ts`.

**Fontlar (Google Fonts, index.html):**
- Başlık: Playfair Display
- Gövde: Inter (300/400/600)
- Fısıltı: Caveat (`.handwriting`)

**Token’lar (`:root` / domain css vars):**
`--bg-deep-charcoal`, `--bg-dark-navy`, `--text-main`, `--text-muted`, `--accent-muted-blue`, `--glass-bg`, `--glass-border`, `--card-bg`, `--glow`, `--blur-amount`, `--noise-opacity`, …

**Yüzey sınıfları:** `.glass`, `.card-surface`, `.glitch` (`data-text` ile RGB kayması).

**Domain’ler** (watermark tıklama, 2sn cinematic swap, 900ms’de CSS değişir):

| id | Label | Palet |
|----|--------|--------|
| `Muryokusho` | MURYOKUSHO | Varsayılan. Soğuk lacivert-gri, soluk yıldız. **Marka bu.** |
| `FukumaMizushi` | FUKUMA MIZUSHI | Kırmızı. Easter. |
| `KangoAneitei` | KANGO AN'EITEI | Mor. Easter. Canon’daki “mor yok” **varsayılan** için; bu domain bilinçli sapma. |

WebGL yıldız (`Muryokusho.tsx`) domain’e göre fog/particle rengi alır. Piramit stroke/glow da.

**Scrollbar gizli.** Selection token’lı. Mobilde `.mobile-starfield` CSS.

Birçok sayfa hâlâ **inline style** (Contact terminal yeşili, About padding, Projects layout). Görsel borç; CSS’e almak OK, görünümü değiştirmek değil.

---

## 10. Sayfa detayları

### Ana sayfa `/`
- `Hero`: glitch başlık + handwriting ipucu. Görünür H1 gizli (“Yiğit Altuntaş”); görsel cümle “İzler burada kalır.”
- `NotesWall`: Postgres’ten `/api/notes`. Yeni notlar `window` `add-note` event’i (kalem). Desktop: dağınık + sürüklenebilir, 4.5sn sonra yavaşça ev konumuna döner. Mobil: 2 kolon, drag yok. Boş: “Henüz iz yok.” Admin: kırmızı sil + pin 📌. Seed `data/notes.ts` **fetch başarısız olunca kullanılmıyor** — catch boş dizi.

### Hakkımda `/hakkimda`
- Uzun birinci şahıs metin. Desktop GSAP children stagger.

### Projeler `/projeler`
- `data/projects.ts`: Sınavizcisi, ChatStats, TÜBİTAK 2209-A.
- Alanlar: title, role, description (hikâye), technologies, timeline, lessonsLearned, link, images.
- “İnşa Ettiklerim” / “Zamanımı harcadığım karanlık köşeler.”

### Düşünceler `/dusunceler`
- Nav’da yok. Admin `localStorage yigit_thoughts` JSON (`parseStoredThoughts`).
- Tip alanı serbest string (`GÜNLÜK` vs.).

### Stüdyom `/studyom`
- Nav’da yok. GET `/api/photos` → ızgara (size: small/medium/large). Lightbox Escape.
- Admin: dosya seç → önizle → onayla. Max 4.5MB. Header’larla raw POST `/api/upload`. Sil: Blob + Postgres.

### İletişim `/iletisim`
- Yeşil monospace terminal. Kimlik + mesaj → Gmail compose (`81altuntas38@gmail.com`).
- **Admin kapısı:** iletişim terminali → `POST /api/admin/login` (env: `ADMIN_IDENTITY` + `ADMIN_PASSPHRASE`). Başarıda httpOnly `yigit_session` cookie. `localStorage yigit_admin` yalnızca UI önbelleği.
- Sırlar kaynakta yok. Gizli bilgi; refactor’da istemeden UI’ya yazma.

### Miras `/miras`
- Portre `/Ataturk1930s.jpg` (preload + idle prefetch).
- Gençliğe Hitabe tam metin (TDK hizalı, 3 paragraf).
- `WreathOffering`: GET/POST `/api/wreaths`. İstanbul günü, ziyaretçi başına 1. IP hash + localStorage `yigit_wreath_day`.
- Layout: cam portre + metin. Sessizlik kasıtlı.

### 404
- Ayrı CSS (`NotFound.css`). Karakter yok.

---

## 11. Backend / veri

### Postgres tabloları (`server/db.ts` → `ensureSchema()`)

**notes**
- `id UUID PK`, `text`, `author`, `date VARCHAR`, `"isAdmin" BOOLEAN`, `created_at`
- index: `notes_created_at_idx`

**studio_photos**
- `id UUID PK`, `url`, `size`, `date`, `created_at`

**wreath_meta**
- tek satır `id=1`, `total BIGINT`

**wreath_daily**
- `(visitor_key, day_key DATE)` PK — 1 çelenk / gün / ziyaretçi

### API

| Endpoint | Metod | Auth | Not |
|----------|-------|------|-----|
| `/api/notes` | GET | yok | LIMIT 200, yeni→eski |
| `/api/notes` | POST | yok | validation + 8/saat/IP; `isAdmin` cookie’den |
| `/api/notes?id=` | DELETE | session cookie | UUID zorunlu |
| `/api/photos` | GET | yok | yalnızca proxy `src`; ham blob url yok |
| `/api/photos?id=` | DELETE | session cookie | UUID; blob cleanup |
| `/api/upload` | POST | session cookie | magic bytes, 4.5MB, rollback |
| `/api/photo?url=` | GET | yok | yalnızca `*.blob.vercel-storage.com` HTTPS |
| `/api/wreaths` | GET | yok | total + alreadyLeft |
| `/api/wreaths` | POST | IP hash + gün PK | atomic claim+bump; 12/saat |
| `/api/admin/login` | POST | identity+passphrase env | httpOnly cookie; 8/saat |
| `/api/admin/session` | GET | cookie | `{ admin: boolean }` |

Env: `.env.example` — Blob + Postgres + `ADMIN_IDENTITY` / `ADMIN_PASSPHRASE` / `ADMIN_SESSION_SECRET` (server-only, asla `VITE_*` değil). `DATABASE_URL` fallback var.

`/api/initDb` **yok**. Şema ilk API çağrısında `ensureSchema()` ile kurulur.

---

## 12. Admin

Tek kapı: İletişim terminali → `POST /api/admin/login` (Vercel env sırları). httpOnly `yigit_session`.

Açar:
- Not silme
- Stüdyo yükleme/silme
- Düşünce ekleme (sadece local, DB yok)

`localStorage.yigit_admin` UI önbelleği; sunucu cookie’yi doğrular.

---

## 13. Uçuş sistemi

`utils/flightPath.ts`:
- `randomOffscreenStart` — kenar dışı spawn
- `planWanderHop` / `planCrossFlight` — kenar→kenar
- Ekranın *içinde* belirme yok

Hook’lar:
- `useEdgeFlight` — basit
- `useThrowableEdgeFlight` — motion values + drag (ilk yakalama donmasın diye)

Pen/Music hop timer; Beggar/Sage throwable.

---

## 14. SEO / analytics

- `src/seo/config.ts` — `SITE` + `PAGE_SEO` + `PageKey`
- `SEOHead` her sayfada `page="..."`. JSON-LD Person/WebSite/WebPage
- `public/sitemap.xml` — `/league` yok
- `index.html` — statik fallback meta + GA4 `send_page_view: false`
- Router değişiminde `trackPageView` (idle)
- Canonical yalnızca `https://yigitaltuntas.me`

Yeni sayfa: rota + `PageKey` + sitemap. Nav isteğe bağlı.

---

## 15. Performans kuralları

`useIsMobilePerf` true ise:
- CSS starfield, WebGL yok
- Lenis yok
- GSAP ScrollTrigger yok
- Custom cursor / noise overlay yok
- Beggar, Sage, SocialDrifters (normal sahnede) yok — Pen ve Music kalır ama hop kısıtlı
- Chaos sadece idle quote
- Not duvarında drag yok

Desktop:
- Canvas `frameloop` tab gizliyse `never` (`useDocumentVisible`)
- Three chunk ayrı (`vite` manualChunks: three / motion / gsap / lenis)
- Memorial JPEG idle prefetch
- Karakterler kademeli mount

---

## 16. Bilinen borç / tuzaklar (refactor listesi)

Öncelik “görünümü bozmadan temizlik”:

1. **Inline style yoğunluğu** — Contact/About/Projects/Footer/FakeMenu/EasterEggs.
2. **Düşünceler localStorage; notlar Postgres** — kasıtlı çift kaynak.
3. **In-memory rate limit** isolate reset olur (serverless).
4. **Çelenk visitor_key** IP+UA hash; paylaşılmış NAT’ta çakışabilir.
5. **CSP** `unsafe-inline` (gtag + inline style). Sıkı nonce’a geçmek siteyi kırabilir.
6. **`.agents/AGENTS.md`** her işten sonra commit+push der. Kullanıcı kuralı: commit ancak istenince. Çakışırsa kullanıcı kuralı kazanır.
7. **README** hâlâ Vite şablonu; siteyi anlatmıyor.
8. **Piramit** (`WireframePyramid`) ~500+ satır raw Three, R3F değil. Dokunulmaz değil ama “sessiz keşif” objesi; silme.

---

## 17. Kasıtlı ürün kararları (bug sanma)

- Düşünceler / Stüdyom nav’da gizli ama URL çalışır.
- Notlar herkese açık yazılır; silme “admin”.
- Müzik istekleri **asla** çalmaz. Troll copy kanon.
- Sağ tık gerçek menü değil.
- Footer tıklama zinciri dünya çevirir; chaos’taki `gravity` event tipi kodda var ama trigger listesinde yok (`ufo|popup|achievement`).
- `/dusunceler` ve `/studyom` KNOWN_ROUTES’ta; 404 değiller, karakterler uçar.
- Mobil ≠ küçültülmüş desktop.

---

## 18. LoL (kaldırıldı)

2026-09-02: `/league` sayfası, FlyingLoL, Riot/OP.GG API, SEO, sitemap, Vercel function include **kasıtlı kaldırıldı**.

Refactor sırasında:
- Rota ekleme
- Nav’a League koyma
- Uçan LoL ikonu
- `RIOT_API_KEY` bağımlılığı

Eski URL 404 olmalı.

---

## 19. Başka AI’ya prompt şablonu

```
Bu repo yigitsite — canlı: https://yigitaltuntas.me (Yiğit Altuntaş).

Önce SITE_BRIEF.md oku. Ses için SITE_CANON.md.

Bu bir mekan, CV değil. MURYOKUSHO: karanlık yıldız, glitch, absürt-samimi Türkçe.
Masaüstü zengin (uçanlar, WebGL, Lenis). Mobil ayrı, hafif. Desktop’ı sadeleştirme.
Miras (/miras) sessiz oda. LoL yok.

Dokunulmazlar: hero copy, Anıtkabir nav, not defteri, müzik diktatörlüğü,
dilenci/bilge, world-flip, domain watermark, Türkçe rotalar.

İstediğim: [BURAYA]
Mevcut görünümü bozma. Ölü kod silinebilir. Yeni soyutlama uydurma.
```

---

## 20. Hızlı dosya → sorumluluk

| Dosya | Sorumluluk |
|-------|------------|
| `src/App.tsx` | Shell, rota, kim ne zaman mount |
| `src/index.css` | Token + layout + memorial + nav |
| `src/themes/domains.ts` | 3 domain paleti |
| `src/context/MemorialContext.tsx` | quiet, respectful navigate, prefetch |
| `src/hooks/useIsMobilePerf.ts` | tek performans kapısı |
| `src/hooks/useAtmosphereStage.ts` | kademeli boot |
| `src/utils/flightPath.ts` | kenar uçuş matematiği |
| `src/utils/flyerDialogue.ts` | Dilenci/Bilge sözleri |
| `src/data/projects.ts` | proje içerik |
| `src/seo/config.ts` | meta |
| `api/*` | not, foto, çelenk |
| `SITE_CANON.md` | ses |
| `SITE_BRIEF.md` | her şey (bu dosya) |

---

## 21. Tek paragraf özet (modele yapıştır)

yigitaltuntas.me, React 19 + Vite + Vercel Postgres/Blob kişisel evren sitesi. Varsayılan domain MURYOKUSHO: lacivert yıldız, cam, glitch, Caveat fısıltı. Ziyaretçi kral; not bırakır; dilenci bağış ister; bilge öğüt verir; müzik kutusu istek reddeder. Nav Türkçe; ortada Anıtkabir `/miras` sessiz oda (Hitabe + çelenk). Desktop’ta Lenis, WebGL, sürüklenebilir uçanlar, custom cursor, chaos, footer world-flip. Mobilde bunlar kesilir veya sadeleşir (`useIsMobilePerf`, 860px/coarse). Admin = iletişim terminali + httpOnly session cookie (env sırları); localStorage yalnızca UI. Düşünceler ve Stüdyom nav’da gizli. `/league` yok. Gerçek sayfalar `components/sections`. Refactor görünümü ve atmosferi korur; kurumsal sadeleştirme yapmaz.
